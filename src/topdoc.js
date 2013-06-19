(function() {
  var Topdoc, exec, fs, program;

  fs = require('fs');

  program = require('commander');

  exec = require('child_process').exec;

  program.option('-s, --source <directory>', 'The css source directory').version(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version).parse(process.argv);

  Topdoc = (function() {

    function Topdoc() {}

    Topdoc.prototype.parse = function() {
      return 'Topdoc';
    };

    return Topdoc;

  })();

  module.exports = Topdoc;

}).call(this);
