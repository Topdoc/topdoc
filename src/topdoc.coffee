fs = require('fs')
path = require('path')
read = fs.readFileSync
Topdocument = require './topdocument'
jade = require('jade')


class Topdoc
  constructor: (source=null, destination=null) ->
    @source = source ? 'src'
    @destination = destination ? 'src'
    @files = @findCSSFiles(@source)
    @template = path.join('src','template.jade')
  parseFiles: () ->
    results = []
    for file in @files
      results.push new Topdocument(file).results
    return results

  generate: () ->
    fn = jade.compile read(path.join(@template), 'utf8'), {pretty: true}
    nav = []
    for result, i in @parseFiles()
      filename = if(i >= 1) then @outputUrlify(result.filename) else 'index.html'
      navItem =
        title: result.title
        url: filename
      nav.push navItem
    for result, i in @parseFiles()
      htmloutput = fn({document: result, nav: nav})
      fs.writeFileSync(path.join(@destination, nav[i].url), htmloutput)
    return true
  findCSSFiles: (dir) ->
    results = []
    list = fs.readdirSync dir
    for file in list
      file = path.join(dir, file)
      if fs.statSync(file).isDirectory()
        results = results.concat(@findCSSFiles(file))
      else if @getExtension(file) is 'css' and file.lastIndexOf('.min.css') isnt file.length - 8
        results.push file
    return results
  getExtension: (file) ->
    ext = path.extname(path.basename(file)).split('.')
    return ext[ext.length - 1]
  outputUrlify: (inputURL) ->
    url = inputURL.substring(0, inputURL.length - 4)
    url = url+'.html'
    return url

module.exports = Topdoc