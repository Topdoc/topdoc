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
  .parse(process.argv)

class Topdoc
  parse: ->
    return 'Topdoc'

module.exports = Topdoc