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
  # it 'should be able to read a whole directory', ->
  # 
  it 'should use parse css', ->
    topdoc = new Topdoc
    parsedJson = JSON.stringify(topdoc.cssToJson(path.resolve('test/cases/comment.css')),null,2)
    caseJson = read(path.join('test', 'cases', 'comment' + '.json'), 'utf8')
    parsedJson.should.equal(caseJson)