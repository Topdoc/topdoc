(function() {
  var Topdocument, fs, path, read;

  Topdocument = require('../lib/topdocument');

  path = require('path');

  fs = require('fs');

  read = fs.readFileSync;

  describe('Topdocument', function() {
    before(function() {
      this.documentSourcePath = path.join('test', 'cases', 'button.css');
      return this.topdocument = new Topdocument(this.documentSourcePath);
    });
    it('exists', function() {
      Topdocument.should.be.ok;
      return this.topdocument.should.be.instanceOf(Topdocument);
    });
    it('has a sourcePath css file property', function() {
      return this.topdocument.sourcePath.should.equal(this.documentSourcePath);
    });
    it('should parse the css file', function() {
      var caseCSSJson, parsedJson;
      caseCSSJson = read(path.join('test', 'cases', 'button.json'), 'utf8');
      parsedJson = JSON.stringify(this.topdocument.cssParseResults, null, 2);
      return parsedJson.should.equal(caseCSSJson);
    });
    it('should generate json for template', function() {
      var caseTopdocJson, resultJson;
      caseTopdocJson = read(path.join('test', 'cases', 'button.topdoc.json'), 'utf8');
      resultJson = JSON.stringify(this.topdocument.results, null, 2);
      return resultJson.should.equal(caseTopdocJson);
    });
    it('should parse component name for template', function() {
      return this.topdocument.results.components[0].name.should.equal('Button');
    });
    it('should generate component slug for template', function() {
      return this.topdocument.results.components[0].slug.should.equal('button');
    });
    it('should parse component details for template', function() {
      return this.topdocument.results.components[0].details.should.equal(':active - Active state\n.is-active - Simulates an active state on mobile devices\n:disabled - Disabled state\n.is-disabled - Simulates a disabled state on mobile devices');
    });
    it('should parse example html for template', function() {
      return this.topdocument.results.components[0].html.should.equal('<a class="topcoat-button">Button</a>\n<a class="topcoat-button is-active">Button</a>\n<a class="topcoat-button is-disabled">Button</a>');
    });
    it('should generate two word slugs for template', function() {
      return this.topdocument.results.components[1].slug.should.equal('quiet-button');
    });
    return it('should parse filename', function() {
      return this.topdocument.results.filename.should.equal('button.css');
    });
  });

}).call(this);
