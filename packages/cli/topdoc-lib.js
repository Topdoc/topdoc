'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._toList = _toList;
exports._booleanOrValue = _booleanOrValue;
exports.default = loadOptions;
exports.resolveAssetDirectory = resolveAssetDirectory;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _configAttendant = require('config-attendant');

var _configAttendant2 = _interopRequireDefault(_configAttendant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function loadOptions() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var sourceOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var optionDefaults = {};
  // defaults set here can be overridden by rc files and command line
  optionDefaults.ignoreAssets = [/^\./, /^node_modules/, /\.pug/, /\.jade/, '/**/*.json'];
  optionDefaults.source = 'src';
  optionDefaults.destination = _path2.default.resolve(process.cwd(), 'docs');
  optionDefaults.template = 'topdoc-default-template';
  optionDefaults.templateData = null;
  optionDefaults.clobber = false;
  optionDefaults.stdout = false;

  var options = (0, _configAttendant2.default)('topdoc', optionDefaults, opts);

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

function resolveAssetDirectory(assetDirectory) {
  if (assetDirectory && !_path2.default.isAbsolute(assetDirectory)) {
    try {
      if (_fsExtra2.default.statSync(assetDirectory).isDirectory()) {
        assetDirectory = _path2.default.resolve(assetDirectory);
      } else {
        assetDirectory = _path2.default.dirname(assetDirectory);
      }
    } catch (err) {
      try {
        var templateDirectory = false;
        var mainFile = resolve.sync(assetDirectory, {
          basedir: process.cwd(),
          packageFilter: function packageFilter(pkg, resolvePath) {
            templateDirectory = _path2.default.resolve(resolvePath, 'lib');
            return pkg;
          }
        });
        assetDirectory = templateDirectory || _path2.default.dirname(mainFile);
      } catch (e) {
        console.error(new Error('Can\'t resolve path to ' + assetDirectory));
      }
    }
  } else if (assetDirectory) {
    if (_fsExtra2.default.statSync(assetDirectory).isFile()) {
      assetDirectory = _path2.default.dirname(assetDirectory);
    }
  }
  return assetDirectory;
}