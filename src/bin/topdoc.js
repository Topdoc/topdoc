#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import program from 'commander';
import pkginfo from 'pkginfo';
import resolve from 'resolve';

pkginfo(module, 'description');

const lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
const Topdoc = require(`${lib}/topdoc`);

program
  .description(module.exports.description)
  .option('-s, --source <directory>', 'The css source directory.')
  .option('-d, --destination <directory>',
    'The destination directory where the usage guides will be written.')
  .option('-t, --template <jade file/directory>',
    'The path to the jade template file.  If it is a directory it will import all the sub files')
  .option('-p, --project <title>', 'The title for your project.  Defaults to the directory name.')
  .option('-c, --commentsoff', 'Remove comments from the css in the demo pages')
  .parse(process.argv);

let source = program.source || 'src';
let destination = program.destination || 'docs';
let template = program.template || path.resolve(__dirname, '..', 'lib', 'template.jade');
let projectTitle = program.project || path.basename(process.cwd());
let templateData = null;

if (fs.existsSync('./package.json')) {
  const packageJSON = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  if (packageJSON.topdoc !== null) {
    const topdocData = packageJSON.topdoc;

    source = program.source || topdocData.source || 'src';
    destination = program.destination || topdocData.destination || 'docs';
    template = program.template || topdocData.template ||
      path.resolve(__dirname, '..', 'lib', 'template.jade');
    if (topdocData && topdocData.templateData) {
      templateData = topdocData.templateData;
    } else {
      projectTitle = program.project || path.basename(process.cwd());
      templateData = { title: projectTitle };
    }
  }
}


if (!fs.existsSync(source)) {
  console.log(`Couldn\'t seem to find a source
Specify a source with -s, --source <directory>
`);
} else {
  const options = {
    source,
    destination,
    template,
    templateData,
  };

  const topdoc = new Topdoc(options);
  topdoc.generate((() => {
    console.log(`Generated documentation in ${destination}`);
  }));
}
