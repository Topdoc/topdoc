Topdoc = require '../src/topdoc'
path = require('path')
fs = require('fs')
read = fs.readFileSync

deleteFolderRecursive = (path) ->
  files = []
  if fs.existsSync(path)
    files = fs.readdirSync(path)
    for file in files
      curPath = path + "/" + file
      if fs.statSync(curPath).isDirectory() # recurse
        deleteFolderRecursive curPath
      else # delete file
        fs.unlinkSync curPath
    fs.rmdirSync path

describe 'Topdoc', ->
  before ->
    @srcDir = path.join('test', 'cases')
    @outputDir = path.join('test', 'docs')
  
  after ->
    if(fs.existsSync(@outputDir))
      deleteFolderRecursive(@outputDir)


  it 'exists', ->
    Topdoc.should.be.ok
    topdoc = new Topdoc
    topdoc.should.be.instanceOf Topdoc
  it 'should accept a source in the constructor', ->
    topdoc = new Topdoc @srcDir
    topdoc.source.should.equal @srcDir
  it 'should accept a destination in the constructor', ->
    topdoc = new Topdoc @srcDir, @outputDir
    topdoc.destination.should.equal @outputDir
  it 'should find all the css files in a directory', ->
    topdoc = new Topdoc @srcDir, @outputDir
    topdoc.files[0].should.equal 'test/cases/button.css'
  it 'should ignore .min.css files in directory', ->
    topdoc = new Topdoc @srcDir, @outputDir
    topdoc.files.length.should.equal 2
  it 'should generate an index.html', ->
    topdoc = new Topdoc @srcDir, @outputDir
    topdoc.generate()
    generatedDoc = read(path.join(@outputDir, 'index.html'), 'utf8')
    generatedDoc.should.be.ok
  it 'should find all the css documents', ->
    topdoc = new Topdoc @srcDir, @outputDir
    topdoc.files.should.be.ok