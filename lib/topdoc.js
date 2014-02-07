/**
 *
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
(function() {
  "use strict";
  var Topdoc, Topdocument, fs, jade, path, read, topdocutils, async, ncp;
  fs = require('fs-extra');
  path = require('path');
  read = fs.readFileSync;
  Topdocument = require('./topdocument');
  jade = require('jade');
  topdocutils = require('./topdocutils');
  async = require('async');
  ncp = require('ncp');

  Topdoc = (function() {
    function Topdoc(options) {
      var projectTitle;
      if (options.templateData === null || options.templateData === undefined ||options.templateData.title) {
        projectTitle = null;
      }
      this.source = options.source !== undefined ? options.source : 'src';
      this.destination = options.destination !== undefined ? options.destination : 'docs';
      this.files = this.findCSSFiles(this.source);
      this.template = options.template !== undefined ? options.template : path.join(__dirname, 'template.jade');
      this.templateData = options.templateData;
      if(options.templateData !== null && options.templateData !== undefined) {
        this.projectTitle = options.templateData.title !== undefined ? topdocutils.titlify(options.templateData.title) : 'Topdocs';
      } else {
        this.projectTitle = 'Topdocs';
      }
    }

    Topdoc.prototype.parseFiles = function() {
      var file, results, _i, _len, _ref;
      results = [];
      _ref = this.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        results.push(new Topdocument(file).results);
      }
      return results;
    };

    Topdoc.prototype.generate = function(callback) {
      this.results = this.parseFiles();
      if (this.results.length > 0) {
        fs.mkdirsSync(this.destination);
      }
      var tasks = [];
      tasks = [
        this.organizeTemplate.bind(this),
        this.writeHTMLFiles.bind(this)
      ];
      async.parallel(tasks, (function(){
        if(fs.existsSync(path.join(this.destination, 'index.jade'))){
          fs.removeSync(path.join(this.destination, 'index.jade'));
        }
        callback();
      }).bind(this, callback));
    };

    Topdoc.prototype.organizeTemplate = function(callback) {
      this.jadefile = null;
      this.iframejadefile = null;
      if(fs.statSync(this.template).isDirectory()){
        this.jadefile = path.join(this.template, 'index.jade');
        if(fs.existsSync(path.join(this.template, 'iframe.jade'))){
          this.iframejadefile = path.join(this.template, 'iframe.jade');
        }
        if(!fs.existsSync(this.jadefile)){
          return console.error('missing index.jade file');
        }
        var filter = (function (name) {
          var relative = path.relative(this.template, name);
          if(relative.match(/node_modules/)){
            return false;
          }
          if(name.match(/readme/i)){
            return false;
          }
          if(name.match(/iframe.jade/)){
            return false;
          }
          if(path.basename(name).indexOf('.') === 0) {
            return false;
          }
          if(path.basename(name) === 'package.json') {
            return false;
          }
          return true;
        }).bind(this);
        ncp(this.template, this.destination, {filter: filter}, (function(err){
          if (err) {
            return console.error(err);
          }
          callback(null, 'template directory copied');
        }).bind(callback));
      } else {
        this.jadefile = this.template;
        callback(null, 'using '+this.jadefile);
      }
    };

    Topdoc.prototype.writeHTMLFiles = function(callback) {
      var fn = jade.compile(read(path.join(this.jadefile), 'utf8'), {
        pretty: true
      });
      var nav = [];
      var result;
      for (var i = 0; i < this.results.length; i++) {
        result = this.results[i];
        var filename = i >= 1 ? this.outputUrlify(result.filename) : 'index.html';
        var navItem = {
          title: result.title,
          url: filename
        };
        for (var k = result.components.length - 1; k >= 0; k--) {
          result.iframeComponents = [];
          if(result.components[k].iframe){
            var component = result.components[k];
            var iframeFilename = component.slug+'.'+result.filename.replace('.css','.html');
            component.filename = iframeFilename;
            result.iframeComponents.push(component);
          }
          if(result.iframeComponents.length > 0){
            if(!this.iframejadefile){
              return console.error('missing iframe.jade file');
            }
          }
        }
        nav.push(navItem);
      }
      var project = {
        title: this.projectTitle
      };
      for (var j = 0; j < this.results.length; j++) {
        result = this.results[j];
        result.relativeSource = path.join(path.relative(this.destination,this.source), result.filename);
        result.url = nav[j].url;
        var htmloutput = fn({
          document: result,
          nav: nav,
          project: project,
          templateData: this.templateData
        });
        var outputFilePath = path.join(this.destination, nav[j].url);
        fs.writeFileSync(outputFilePath, htmloutput);
        if(result.iframeComponents && result.iframeComponents.length > 0) {
          for (var l = 0; l < result.iframeComponents.length; l++) {
            var iframeComponent = result.iframeComponents[l];
            var iFn = jade.compile(read(this.iframejadefile, 'utf8'), {
              pretty: true
            });
            result.relativeSource = path.join(path.relative(this.destination,this.source), result.filename);
            var iframeFilePath = path.join(this.destination, iframeComponent.filename);
            iframeComponent.filename = path.relative(outputFilePath, path.join(this.destination, iframeComponent.filename));
            var iframeoutput = iFn({
              document: result,
              component: iframeComponent,
              project: project
            });
            fs.writeFileSync(iframeFilePath, iframeoutput);
            // console.log();
          }
        }
      }
      callback(null, 'files written');
    };

    Topdoc.prototype.findCSSFiles = function(dir) {
      var file, list, results, _i, _len;
      results = [];
      list = fs.readdirSync(dir);
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        file = list[_i];
        file = path.join(dir, file);
        if (fs.statSync(file).isDirectory()) {
          results = results.concat(this.findCSSFiles(file));
        } else if (this.getExtension(file) === 'css' && file.lastIndexOf('.min.css') !== file.length - 8) {
          results.push(file);
        }
      }
      return results;
    };

    Topdoc.prototype.getExtension = function(file) {
      var ext;
      ext = path.extname(path.basename(file)).split('.');
      return ext[ext.length - 1];
    };

    Topdoc.prototype.outputUrlify = function(inputURL) {
      var url;
      url = inputURL.substring(0, inputURL.length - 4);
      url = url + '.html';
      return url;
    };

    return Topdoc;

  })();

  module.exports = Topdoc;

}).call(this);
