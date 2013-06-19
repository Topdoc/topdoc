fs = require('fs')
program = require('commander')
exec = require('child_process').exec

program
  .option('-s, --source <directory>', 'The css source directory')
  .version(
    JSON.parse(
      fs.readFileSync(
        __dirname + '/../package.json', 'utf8'
        )
      ).version
    )

class Topdoc
  parse: ->
    return 'Topdoc'

root = exports ? window
root.Topdoc = Topdoc
