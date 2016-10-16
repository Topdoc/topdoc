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

pkginfo(module, 'description');

program
  .description(module.exports.description)
  .usage('<file>')
  .option('-d, --destination <directory>',
    'The destination directory where the usage guides will be written.')
  .option('-t, --template <template directory/package name>',
    'The path to the template directory or package name.  Resolved using the `resolve` package.')
  .option('-p, --project <title>', 'The title for your project.  Defaults to the directory name.')
  .option('-c, --commentsoff', 'Remove comments from the css in the demo pages')
  .parse(process.argv);

const options = loadConfig('topdoc', {
  source: program.args[0] || 'src',
  destination: program.destination || path.resolve(process.cwd(), 'docs'),
  // template: program.template || 'topdoc-default-theme',
  template: program.template || false,
  templateData: null,
});

const template = (!options.template) ?
  require(resolve.sync('./default-template', {
    basedir: path.resolve(__dirname, '..'),
  })) :
  require(resolve.sync(options.template, { basedir: process.cwd() }));

try {
  const stats = fs.lstatSync(options.source);
  if (stats.isDirectory()) options.source = `${options.source}/**/*.css`;
} catch (err) { /* */ }

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
      template.before(options.destination);
    }
    results.forEach((result, index) => {
      files.forEach((file, fileIndex) => {
        file.current = Boolean(index === fileIndex);
      });
      template(Object.assign({}, result.topdoc, { files }));
    });
  }).catch(console.log);
});
