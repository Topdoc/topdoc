fs = require('fs')
exec = require('child_process').exec
cssParse= require('css-parse')
path = require('path')
read = fs.readFileSync


class Topdoc
  constructor: (source=null, destination=null) ->
    @source = source ? 'src'
    @destination = destination ? 'src'
  cssToJson: (filePath) ->
    @cssData = cssParse(read(filePath, 'utf8'), { position: true })
    return @cssData

module.exports = Topdoc
