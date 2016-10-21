#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import program from 'commander';
import pkginfo from 'pkginfo';
import resolve from 'resolve';
import loadConfig from 'config-attendant';
import glob from 'glob';
import postcss from 'postcss';
import topdoc from 'postcss-topdoc';

pkginfo(module, 'description', 'version');

program
  .description(module.exports.description)
  .usage('[<file> | <path> [default: src]] [options]')
  .option('-d, --destination <directory> [default: docs]',
    'directory where the usage guides will be written.')
  .option('-t, --template <directory>|<package name>',
    'path to template directory or package name.\n' +
      '           Note: Template argument is resolved using the `resolve` package.')
  .option('-p, --project <title> [default: cwd name]', 'title for your project.')
  .option('-c, --commentsoff', 'remove comments from the css in the demo pages.')
  .option('-cl, --clobber <truthy> [default: false]', 'tries to rm destination before running.')
  // .option('-s, --source',
  // 'WARNING: The switch for source is deprecated. Pass source as the first argument, or use .topdocrc or package.json to configure.')
  // .
  .version(module.exports.version)
  .parse(process.argv);

const options = loadConfig('topdoc', {
  source: program.args[0] || 'src',
  destination: program.destination || path.resolve(process.cwd(), 'docs'),
  template: program.template || false,
  templateData: null,
  clobber: program.clobber || false,
  version: module.exports.version
});

const template = (!options.template) ?
  require(resolve.sync('./default-template', {
    basedir: path.resolve(__dirname, '..'),
  })) :
  require(resolve.sync(options.template, { basedir: process.cwd() }));

try {
  const stats = fs.lstatSync(options.source);
  if (stats.isDirectory()) options.source = `${options.source}/**/*.css`;
} catch (err) { /* oh shzt */ }

const pattern = options.source;
delete options.source;

glob(pattern, {}, (er, cssFiles) => {
  if (cssFiles.length === 0) {
    console.error(new Error(`No files match '${pattern}'`));
    process.exit(1);
  }
  Promise.all(cssFiles.map((filepath, index) => {
    const first = Boolean(index === 0);
    const opt = Object.assign({}, options, { first });
    const content = fs.readFileSync(filepath);
    opt.source = filepath;
    return postcss([topdoc({ fileData: opt })]).process(content, { from: filepath });
  })).then((results) => {
    const files = results.map((result) =>
      Object.assign({
        title: result.topdoc.title,
        filename: result.topdoc.filename,
        first: result.topdoc.first,
        current: false,
      })
    );
    if (template.before) {
      template.before(options);
    }
    if (template.after) {
      template.after(options);
    }
    results.forEach((result, index) => {
      files.forEach((file, fileIndex) => {
        file.current = Boolean(index === fileIndex);
      });
      template(Object.assign({}, result.topdoc, { files }));
    });
  }).catch(console.log);
});
