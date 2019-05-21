const path = require('path');
const fs = require('fs-extra');
const loadConfig = require('config-attendant');
const resolve = require('resolve');

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

function loadOptions(opts = {}, sourceOverride = false) {
  const optionDefaults = {};
  // defaults set here can be overridden by rc files and command line
  optionDefaults.ignoreAssets = [/^\./, /^node_modules/, /\.pug/, /\.jade/, '/**/*.json'];
  optionDefaults.source = 'src';
  optionDefaults.destination = path.resolve(process.cwd(), 'docs');
  optionDefaults.template = 'topdoc-default-template';
  optionDefaults.templateData = null;
  optionDefaults.clobber = false;
  optionDefaults.stdout = false;

  const options = loadConfig('topdoc', optionDefaults, opts);

  // if assets copy is enabled but no directory was defined be sure to use template
  if (!options.assetDirectory) {
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
  if (sourceOverride) {
    options.source = sourceOverride;
  }

  // this hack will fix options that got set by rc
  // and didn't have the transform called on them
  options.assetDirectory = _booleanOrValue(options.assetDirectory);
  options.ignoreAssets = _toList(options.ignoreAssets);

  return options;
}

function resolveAssetDirectory(dir) {
  let assetDirectory = dir;
  if (assetDirectory && !path.isAbsolute(assetDirectory)) {
    try {
      if (fs.statSync(assetDirectory).isDirectory()) {
        assetDirectory = path.resolve(assetDirectory);
      } else {
        assetDirectory = path.resolve(path.dirname(assetDirectory));
      }
    } catch (err) {
      try {
        let templateDirectory = false;
        const mainFile = resolve.sync(assetDirectory, {
          basedir: process.cwd(),
          packageFilter: (pkg, resolvePath) => {
            templateDirectory = path.resolve(resolvePath, 'lib');
            return pkg;
          },
        });
        assetDirectory = templateDirectory || path.dirname(mainFile);
      } catch (e) {
        return new Error(`Can't resolve path to ${assetDirectory}`);
      }
    }
  } else if (assetDirectory) {
    if (fs.statSync(assetDirectory).isFile()) {
      assetDirectory = path.dirname(assetDirectory);
    }
  }
  return assetDirectory;
}
module.exports = {_toList, _booleanOrValue, loadOptions, resolveAssetDirectory};
