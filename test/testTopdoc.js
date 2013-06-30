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
  var Topdoc, deleteFolderRecursive, fs, path, read;
  Topdoc = require('../lib/topdoc');
  path = require('path');
  fs = require('fs-extra');
  read = fs.readFileSync;

  describe('Topdoc', function() {
    before(function() {
      this.srcDir = path.join('test', 'cases');
      return this.outputDir = path.join('test', 'docs');
    });
    after(function() {
      if (fs.existsSync(this.outputDir)) {
        return fs.removeSync(this.outputDir);
      }
    });
    it('exists', function() {
      var topdoc;
      Topdoc.should.be.ok;
      topdoc = new Topdoc({source: this.srcDir});
      return topdoc.should.be.instanceOf(Topdoc);
    });
    it('should accept a source in the constructor', function() {
      var topdoc;
      topdoc = new Topdoc({
        source: this.srcDir
      });
      return topdoc.source.should.equal(this.srcDir);
    });
    it('should accept a destination in the constructor', function() {
      var topdoc;
      topdoc = new Topdoc({
        source: this.srcDir,
        destination: this.outputDir
      });
      return topdoc.destination.should.equal(this.outputDir);
    });
    it('should accept a project title', function() {
      var topdoc;
      topdoc = new Topdoc({
        source: this.srcDir, 
        destination: this.outputDir,
        templateData: {
          title: 'awesomeness'
        }
      });
      return topdoc.projectTitle.should.equal('Awesomeness');
    });
    it('should pass data through to the template', function() {
      var topdoc;
      topdoc = new Topdoc({
        source: this.srcDir, 
        destination: this.outputDir,
        templateData: {
          title: 'awesomeness'
        }
      });
      return JSON.stringify(topdoc.templateData, null, 2).should.equal(JSON.stringify({title: 'awesomeness'}, null, 2));
    });
    it('should find all the css files in a directory', function() {
      var topdoc;
      topdoc = new Topdoc({
        source: this.srcDir,
        destination: this.outputDir
      });
      return topdoc.files[0].should.equal('test/cases/button.css');
    });
    it('should ignore .min.css files in directory', function() {
      var topdoc;
      topdoc = new Topdoc({
        source: this.srcDir,
        destination: this.outputDir
      });
      return topdoc.files.length.should.equal(2);
    });
    it('should generate an index.html', function(done) {
      var generatedDoc, topdoc;
      topdoc = new Topdoc({
        source: this.srcDir,
        destination: this.outputDir
      });
      topdoc.generate((function(){
        generatedDoc = read(path.join('test', 'docs', 'index.html'), 'utf8');
        generatedDoc.should.be.ok;
        done();
      }).bind(done));
    });
    it('should download the template if it is a github url', function(done) {
      var generatedDoc, topdoc;
      topdoc = new Topdoc({
        source: this.srcDir,
        destination: 'fulldocs/',
        template: "https://github.com/topcoat/usage-guide-theme",
        templateData: {
          title: "Topcoat",
          subtitle: "CSS for clean and fast web apps",
          download: {
            url: "#",
            label: "Download version 0.4"
            },
          homeURL: "http://topcoat.io",
          siteNav: [
            {
              url: "http://www.garthdb.com", 
              text: "Usage Guidelines"
            },
            {
              url: "http://bench.topcoat.io/",
              text: "Benchmarks"
            },
            {
              url: "http://topcoat.io/blog",
              text: "Blog"
            }
          ]
        }
      });
      topdoc.generate(function(){
        generatedDoc = read(path.join('fulldocs', 'index.html'), 'utf8');
        generatedDoc.should.be.ok;
        if(fs.existsSync('fulldocs')){
          fs.removeSync('fulldocs');
        }
        done();
      });
    });
    return it('should find all the css documents', function() {
      var topdoc;
      topdoc = new Topdoc({
        source: this.srcDir,
        destination: this.outputDir
      });
      return topdoc.files.should.be.ok;
    });
  });

}).call(this);
