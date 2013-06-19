fs = require('fs')
program = require('commander')
exec = require('child_process').exec

program
  .option('-s, --source <directory>', 'The css source directory')
  .parse(process.argv)