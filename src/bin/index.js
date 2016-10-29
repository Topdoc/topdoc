#!/usr/bin/env node
import path from 'path';
import fs from 'fs-extra';
import program from 'commander';
import pkginfo from 'pkginfo';
import resolve from 'resolve';
import loadConfig from 'config-attendant';
import argParser from 'commander-rc-adapter';
import glob from 'glob';
import postcss from 'postcss';
import topdoc from 'postcss-topdoc';

pkginfo(module, 'description', 'version');

/**
 *  Private: Coercion for comma delimited lists
 *
 *  * `val` {String} a string or comma delimited list.
 *
 *  Returns {Array} of strings
 */
function _list(val) {
  return val.split(',');
}
/**
 *  Private: Coercion for false string to false boolean
 *
 *  * `val` {String}
 *
 *  Returns {String} when `val` is not a Boolean.
 *  Returns {Bool} when `val` is Boolean or Boolean String like 'false'.
 */
function _valOrFalse(val) {
  if (val === 'false' || !val) return false;
  return val;
}

program
  .description(module.exports.description)
  .usage('topdoc [<css-file> | <directory> [default: src]] [options]')
  .option('-d, --destination <directory> [default: docs]',
    `directory where the usage guides will be written.
    Like all the options, source can be definied in the config or package.json file.`)
  .option('-s, --stdout', 'outputs the parsed topdoc information as json in the console.', true)
  .option('-t, --template <directory> | <npm-package-name> [default: topdoc-default-template]',
    `path to template directory or package name.
    Note: Template argument is resolved using the 'resolve' package.`, 'topdoc-default-template')
  .option('-p, --project <title> [default: <cwd name>]', 'title for your project.')
  .option('-c, --clobber', 'Deletes destination directory before running.', true)
  .option('-i, --ignore-assets [<file> | <list of files>]',
    `A file or comma delimeted list of files in the asset directory that should be
    ignored when copying them over.`, _list, [/^\./, /\.pug/, /\.jade/, '/**/*.json'])
  .option('-a, --asset-directory <path>',
    `Path to directory of assets to copy to destination. Defaults to template directory.
    Set to false to not copy any assets.`, _valOrFalse, true)
  .version(module.exports.version)
  .parse(process.argv);

if (program.assetDirectory === true) program.assetDirectory = program.template;

const options = loadConfig('topdoc', {
  title: program.project || false,
  source: program.source || program.args[0] || 'src',
  destination: program.destination || path.resolve(process.cwd(), 'docs'),
  template: program.template,
  templateData: null, // only added via config file (rc or package.json).
  clobber: program.clobber || false,
  version: module.exports.version,
  ignoreAssets: program.ignoreAssets,
  assetDirectory: program.assetDirectory || false,
  stdout: program.stdout || false,
}, argParser(program));

const template = require(resolve.sync(options.template, { basedir: process.cwd() }));
if (options.assetDirectory && !path.isAbsolute(options.assetDirectory)) {
  try {
    if (fs.statSync(options.assetDirectory).isDirectory()) {
      options.assetDirectory = path.resolve(options.assetDirectory);
    } else {
      options.assetDirectory = path.dirname(options.assetDirectory);
    }
  } catch (err) {
    try {
      let templateDirectory = false;
      const mainFile = resolve.sync(options.assetDirectory, {
        basedir: process.cwd(),
        packageFilter: (pkg, resolvePath) => {
          templateDirectory = resolvePath;
          return pkg;
        },
      });
      options.assetDirectory = templateDirectory || path.dirname(mainFile);
    } catch (e) {
      console.error(new Error(`Can't resolve path to ${options.assetDirectory}`));
    }
  }
} else if (options.assetDirectory) {
  if (fs.statSync(options.assetDirectory).isFile()) {
    options.assetDirectory = path.dirname(options.assetDirectory);
  }
}

/**
 *  Private: Deletes the destination directory first before regenerating it.
 *
 *  * `destination` {String} to the options hash.
 */
function _clobber(destination) {
  console.log(`because you said so, clobbering ${destination}`);
  fs.removeSync(destination, (err) => {
    console.log(`cowardly gave up trying to rm' ${destination}`);
    console.error(err);
  });
}

/**
 *  Private: copies documentation dependency files to a directory.
 *   Assumes *.pug should not get copied.
 *
 *  * `assetDirectory` {String} path to asset directory to copy files.
 *  * `destPath` {String} path to copy files to.
 *  * `ignoreAssets` {Array} of file {String}s to ignore while copying.
 */
function _copyDependencies(assetDirectory, destPath, ignoreAssets) {
  const files = [];
  const regexs = [];
  ignoreAssets.forEach((val) => {
    if (!(val instanceof RegExp)) {
      if (glob.hasMagic(val)) {
        const globFiles = glob.sync(val, { root: assetDirectory });
        files.push(...globFiles);
      } else if (path.isAbsolute(val)) {
        files.push(val);
      } else {
        files.push(path.resolve(assetDirectory, val));
      }
    } else {
      regexs.push(val);
    }
  });
  /**
   *  Private: filters out files that should be ignored when copying assets.
   *
   *  * `file` {String} path to file.
   *
   *  Returns {Bool} true if it should be included, otherwise false.
   */
  function filter(file) {
    if (files.indexOf(file) !== -1) return false;
    let include = true;
    regexs.forEach((regex) => {
      if (file.search(regex) !== -1) include = false;
    });
    return include;
  }
  fs.copySync(assetDirectory, destPath, filter, (err) => {
    console.log('[topdoc] Copy failed;', err);
  });
}

try {
  const stats = fs.lstatSync(options.source);
  if (stats.isDirectory()) options.source = `${options.source}/**/*.css`;
} catch (err) { /* oh shzt */ }

const pattern = options.source;
delete options.source;

glob(pattern, {}, (er, cssFiles) => {
  if (cssFiles.length === 0) {
    console.log('no files');
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
      ({
        title: result.topdoc.title,
        filename: result.topdoc.filename,
        first: result.topdoc.first,
        current: false,
      })
    );
    if (options.stdout) {
      results.forEach((result) => {
        delete result.topdoc.ignoreAssets;
        delete result.topdoc.version;
        delete result.topdoc.assetDirectory;
        delete result.topdoc.clobber;
        delete result.topdoc.stdout;
        delete result.topdoc._;
        delete result.topdoc.packageFile;
        delete result.topdoc.first;
        delete result.topdoc.sourcePath;
        delete result.topdoc.destination;
        if (!result.topdoc.templateData) delete result.topdoc.templateData;
        console.log(JSON.stringify(result.topdoc, null, 2));
      });
      process.exit(1);
    }
    if (options.clobber) {
      _clobber(options.destination);
    }
    results.forEach((result, index) => {
      files.forEach((file, fileIndex) => {
        file.current = Boolean(index === fileIndex);
      });
      template(Object.assign({}, result.topdoc, { files }));
    });

    const destPath = path.resolve(options.destination);
    if (options.assetDirectory) {
      _copyDependencies(options.assetDirectory, destPath, options.ignoreAssets);
    }
  }).catch(console.log);
});
