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
  var Topdoc, Topdocument, fs, jade, mkdirp, path, read;

  fs = require('fs');

  path = require('path');

  read = fs.readFileSync;

  Topdocument = require('./topdocument');

  jade = require('jade');

  mkdirp = require('mkdirp');

  Topdoc = (function() {
    function Topdoc(source, destination, template) {
      if (source == null) {
        source = null;
      }
      if (destination == null) {
        destination = null;
      }
      if (template == null) {
        template = null;
      }
      this.source = source != null ? source : 'src';
      this.destination = destination != null ? destination : 'src';
      this.files = this.findCSSFiles(this.source);
      this.template = template != null ? template : path.join(__dirname, 'template.jade');
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

    Topdoc.prototype.generate = function() {
      var filename, fn, htmloutput, i, nav, navItem, result, results, _i, _j, _len, _len1;
      fn = jade.compile(read(path.join(this.template), 'utf8'), {
        pretty: true
      });
      nav = [];
      results = this.parseFiles();
      if (results.length > 0) {
        mkdirp.sync(this.destination);
      }
      for (i = _i = 0, _len = results.length; _i < _len; i = ++_i) {
        result = results[i];
        filename = i >= 1 ? this.outputUrlify(result.filename) : 'index.html';
        navItem = {
          title: result.title,
          url: filename
        };
        nav.push(navItem);
      }
      for (i = _j = 0, _len1 = results.length; _j < _len1; i = ++_j) {
        result = results[i];
        htmloutput = fn({
          document: result,
          nav: nav
        });
        fs.writeFileSync(path.join(this.destination, nav[i].url), htmloutput);
      }
      return true;
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
