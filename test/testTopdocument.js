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

  var Topdocument, fs, path, read, should;

  Topdocument = require('../lib/topdocument');

  path = require('path');

  fs = require('fs');

  read = fs.readFileSync;

  describe('Topdocument', function() {
    before(function() {
      this.documentSourcePath = path.join('test', 'cases', 'button.css');
      this.topdocument = new Topdocument(this.documentSourcePath);
    });
    it('exists', function() {
      Topdocument.should.be.ok;
      this.topdocument.should.be.instanceOf(Topdocument);
    });
    it('has a sourcePath css file property', function() {
      this.topdocument.sourcePath.should.equal(this.documentSourcePath);
    });
    it('should parse the css file', function() {
      var caseCSSJson, parsedJson;
      caseCSSJson = read(path.join('test', 'cases', 'button.json'), 'utf8');
      parsedJson = JSON.stringify(this.topdocument.cssParseResults, null, 2);
    });
    it('should validate topdoc comments', function () {
      var validComment = {
        'type': 'comment',
        'comment': read(path.join('test', 'cases', 'validcomment.txt'), 'utf8')
      };
      var validationResult = this.topdocument.isValidComment(validComment);
      validationResult.should.equal(true);
    });
    it('should generate json for template', function() {
      var caseTopdocJson, resultJson;
      caseTopdocJson = read(path.join('test', 'cases', 'button.topdoc.json'), 'utf8');
      resultJson = JSON.stringify(this.topdocument.results, null, 2);
      resultJson.should.equal(caseTopdocJson);
    });
    it('should parse component name for template', function() {
      this.topdocument.results.components[0].name.should.equal('Button');
    });
    it('should generate component slug for template', function() {
      this.topdocument.results.components[0].slug.should.equal('button');
    });
    it('should parse component details for template', function() {
      this.topdocument.results.components[0].details.should.equal(':active - Active state\n.is-active - Simulates an active state on mobile devices\n:disabled - Disabled state\n.is-disabled - Simulates a disabled state on mobile devices');
    });
    it('should parse example html for template', function() {
      this.topdocument.results.components[0].html.should.equal('<a class="topcoat-button">Button</a>\n<a class="topcoat-button is-active">Button</a>\n<a class="topcoat-button is-disabled">Button</a>');
    });
    it('should generate two word slugs for template', function() {
      this.topdocument.results.components[1].slug.should.equal('quiet-button');
    });
    it('should parse filename', function() {
      this.topdocument.results.filename.should.equal('button.css');
    });
  });

}).call(this);
