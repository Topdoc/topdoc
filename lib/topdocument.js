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
  var Topdocument, cssParse, fs, path, read, topdocutils;

  fs = require('fs');

  cssParse = require('css-parse');

  path = require('path');

  read = fs.readFileSync;

  topdocutils = require('./topdocutils');

  Topdocument = (function() {
    function Topdocument(sourcePath, template) {
      if (template == null) {
        template = null;
      }
      this.sourcePath = sourcePath;
      this.template = template != null ? template : path.join('lib', 'template.jade');
      this.cssParseResults = this.cssParse();
      this.results = this.topdocParse();
    }

    Topdocument.prototype.cssParse = function() {
      this.source = read(this.sourcePath, 'utf8');
      return cssParse(read(this.sourcePath, 'utf8'), {
        position: true
      });
    };

    Topdocument.prototype.topdocParse = function() {
      var component, css, cssLines, details, endCSSPos, example, examples, html, i, listItem, name, nextItem, results, rules, sourceLines, startCSSPos, _i, _j, _k, _len, _len1, _ref, _ref1;
      sourceLines = this.source.split(/\n/g);
      this.validRegEx = /^\n*\s*((?:\w| )*)\n\s*-{2,}\s/;
      results = {
        title: topdocutils.titlify(path.basename(this.sourcePath)),
        filename: path.basename(this.sourcePath),
        source: this.sourcePath,
        template: this.template,
        components: []
      };
      rules = this.cssParseResults.stylesheet.rules;
      for (i = _i = 0, _len = rules.length; _i < _len; i = ++_i) {
        listItem = rules[i];
        if (this.isValidComment(listItem)) {
          startCSSPos = listItem.position.end;
          endCSSPos = null;
          for (nextItem = _j = _ref = i + 1, _ref1 = rules.length; _j <= _ref1; nextItem = _j += 1) {
            if (this.isValidComment(rules[nextItem])) {
              endCSSPos = rules[nextItem].position.start;
              break;
            }
          }
          if (endCSSPos) {
            cssLines = sourceLines.slice(startCSSPos.line, endCSSPos.line - 1);
          } else {
            cssLines = sourceLines.slice(startCSSPos.line);
          }
          css = cssLines.join('\n');
          name = this.validRegEx.exec(listItem.comment)[1].trim();
          details = listItem.comment.replace(this.validRegEx, '');
          details = details.substring(0, details.indexOf('  ')).trim();
          details = details.replace(/(\n)+ ?/g, '\n');
          examples = listItem.comment.split('  ').slice(1);
          html = '';
          for (_k = 0, _len1 = examples.length; _k < _len1; _k++) {
            example = examples[_k];
            html += example;
          }
          component = {
            name: name,
            slug: topdocutils.slugify(name),
            details: details,
            html: html.trim(),
            css: css
          };
          results.components.push(component);
        }
      }
      return results;
    };

    Topdocument.prototype.isValidComment = function(comment) {
      var commentMatch;
      if (comment && comment.type === "comment") {
        commentMatch = this.validRegEx.exec(comment.comment);
        if (commentMatch) {
          return true;
        }
      }
      return false;
    };

    return Topdocument;

  })();

  module.exports = Topdocument;

}).call(this);
