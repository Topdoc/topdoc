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
function _toList(val) {
  if (typeof val === 'string') {
    return val.split(',');
  }
  return val;
}
/**
 *  Private: Coercion for false string to false boolean
 *
 *  * `val` {String}
 *
 *  Returns {String} when `val` is not a Boolean.
 *  Returns {Bool} when `val` is Boolean or Boolean String like 'false'.
 */
function _booleanOrValue(val) {
  if (val === 'false' || !val) return false;
  if (val === 'true') return true;
  return val;
}

// defaults defined here cannot be overridden by rc file
program
  .description(module.exports.description)
  .usage('topdoc [<css-file> | <directory> [default: src]] [options]')
  .option('-d, --destination <directory> [default: docs]',
    `directory where the usage guides will be written.
    Like all the options, source can be definied in the config or package.json file.`)
  .option('-s, --stdout', 'outputs the parsed topdoc information as json in the console.')
  .option('-t, --template <directory> | <npm-package-name> [default: topdoc-default-template]',
    `path to template directory or package name.
    Note: Template argument is resolved using the 'resolve' package.`)
  .option('-p, --project <title> | true ', `title for your project.
    Passing 'true' will set the title to name of cwd`, _booleanOrValue)
  .option('-c, --clobber', 'Deletes destination directory before running. Optional.')
  .option('-i, --ignore-assets [<value> | <list of values>]',
    `A file or comma delimeted list of files in the asset directory that should be
    ignored when copying them over.`, _toList)
  .option('-a, --asset-directory [<path> | false]',
    `Path to directory of assets to copy to destination. Defaults to template directory.
    Set to false to not copy any assets.`, _booleanOrValue)
  .version(module.exports.version)
  .parse(process.argv);

// defaults set here can be overridden by rc files and command line
const optionDefaults = {};
optionDefaults.ignoreAssets = [/^\./, /^node_modules/, /\.pug/, /\.jade/, '/**/*.json'];
optionDefaults.source = 'src';
optionDefaults.destination = path.resolve(process.cwd(), 'docs');
optionDefaults.template = 'topdoc-default-template';
optionDefaults.templateData = null;
optionDefaults.clobber = false;
optionDefaults.stdout = false;

const options = loadConfig('topdoc', optionDefaults, argParser(program));

// if assets copy is enabled but no directory was defined be sure to use template
if (!options.assetDirectory && options.assetDirectory !== false) {
  options.assetDirectory = options.template;
}

// project is actually used for title by topdoc to template parser
if (options.project) {
  // if it got passed as boolean in the rc we need to transform it
  if (_booleanOrValue(options.project) === true) {
    options.title = process.cwd().match(/([^/]*)\/*$/)[1];
  } else {
    options.title = options.project;
  }
}

// this is the only way to make the first command line arg override any
// config that is set elsewhere
if (program.args[0]) {
  options.source = program.args[0];
}

// this hack will fix options that got set by rc
// and didn't have the transform called on them
options.assetDirectory = _booleanOrValue(options.assetDirectory);
options.ignoreAssets = _toList(options.ignoreAssets);

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
          templateDirectory = path.resolve(resolvePath, 'lib');
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
  fs.remove(destination, (err) => {
    if (err) return console.error(`cowardly gave up trying to rm' ${destination}`);
    else console.log(`because you said so, clobbering ${destination}`);
    return destination;
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
      console.log(result.topdoc)
      template(Object.assign({}, result.topdoc, { files }));
    });

    const destPath = path.resolve(options.destination);
    if (options.assetDirectory) {
      _copyDependencies(options.assetDirectory, destPath, options.ignoreAssets);
    }
  }).catch(console.log);
});
