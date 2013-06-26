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

  fs = require('fs');

  read = fs.readFileSync;

  deleteFolderRecursive = function(path) {
    var curPath, file, files, _i, _len;
    files = [];
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      }
      return fs.rmdirSync(path);
    }
  };

  describe('Topdoc', function() {
    before(function() {
      this.srcDir = path.join('test', 'cases');
      return this.outputDir = path.join('test', 'docs');
    });
    after(function() {
      if (fs.existsSync(this.outputDir)) {
        return deleteFolderRecursive(this.outputDir);
      }
    });
    it('exists', function() {
      var topdoc;
      Topdoc.should.be.ok;
      topdoc = new Topdoc(this.srcDir);
      return topdoc.should.be.instanceOf(Topdoc);
    });
    it('should accept a source in the constructor', function() {
      var topdoc;
      topdoc = new Topdoc(this.srcDir);
      return topdoc.source.should.equal(this.srcDir);
    });
    it('should accept a destination in the constructor', function() {
      var topdoc;
      topdoc = new Topdoc(this.srcDir, this.outputDir);
      return topdoc.destination.should.equal(this.outputDir);
    });
    it('should find all the css files in a directory', function() {
      var topdoc;
      topdoc = new Topdoc(this.srcDir, this.outputDir);
      return topdoc.files[0].should.equal('test/cases/button.css');
    });
    it('should ignore .min.css files in directory', function() {
      var topdoc;
      topdoc = new Topdoc(this.srcDir, this.outputDir);
      return topdoc.files.length.should.equal(2);
    });
    it('should generate an index.html', function() {
      var generatedDoc, topdoc;
      topdoc = new Topdoc(this.srcDir, this.outputDir);
      topdoc.generate();
      generatedDoc = read(path.join(this.outputDir, 'index.html'), 'utf8');
      return generatedDoc.should.be.ok;
    });
    return it('should find all the css documents', function() {
      var topdoc;
      topdoc = new Topdoc(this.srcDir, this.outputDir);
      return topdoc.files.should.be.ok;
    });
  });

}).call(this);
