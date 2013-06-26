Topdocument = require '../src/topdocument'
path = require('path')
fs = require('fs')
read = fs.readFileSync

describe 'Topdocument', ->

  before ->
    @documentSourcePath = path.join('test', 'cases','button.css')
    @topdocument = new Topdocument(@documentSourcePath)

  it 'exists', ->
    Topdocument.should.be.ok
    @topdocument.should.be.instanceOf Topdocument
  it 'has a sourcePath css file property', ->
    @topdocument.sourcePath.should.equal @documentSourcePath
  it 'should parse the css file', ->
    caseCSSJson = read(path.join('test', 'cases', 'button.json'), 'utf8')
    parsedJson = JSON.stringify(@topdocument.cssParseResults,null,2)
    parsedJson.should.equal caseCSSJson
  it 'should generate json for template', ->
    caseTopdocJson = read(path.join('test', 'cases', 'button.topdoc.json'), 'utf8')
    resultJson = JSON.stringify(@topdocument.results,null,2)
    resultJson.should.equal caseTopdocJson
  it 'should parse component name for template', ->
    @topdocument.results.components[0].name.should.equal 'Button'
  it 'should generate component slug for template', ->
    @topdocument.results.components[0].slug.should.equal 'button'
  it 'should parse component details for template', ->
    @topdocument.results.components[0].details.should.equal ':active - Active state\n.is-active - Simulates an active state on mobile devices\n:disabled - Disabled state\n.is-disabled - Simulates a disabled state on mobile devices'
  it 'should parse example html for template', ->
    @topdocument.results.components[0].html.should.equal '<a class="topcoat-button">Button</a>\n<a class="topcoat-button is-active">Button</a>\n<a class="topcoat-button is-disabled">Button</a>'
  it 'should generate two word slugs for template', ->
    @topdocument.results.components[1].slug.should.equal 'quiet-button'
  it 'should parse filename', ->
    @topdocument.results.filename.should.equal 'button.css'
