/* eslint-disable no-console */
import pug from 'pug';
import path from 'path';
import fs from 'fs-extra';

/**
 *  Private: replaces the extension of a file path string with a new one.
 *
 *  * `npath` {String} path to file.
 *  * `ext` {String} new extension to replace the old one.
 *
 *  Returns {String} with replaced extension
 */
function _replaceExt(npath, ext) {
  if (typeof npath !== 'string') {
    return npath;
  }
  if (npath.length === 0) {
    return npath;
  }
  const nFileName = path.basename(npath, path.extname(npath)) + ext;
  return path.join(path.dirname(npath), nFileName);
}


/**
 *  Private: copies documentation dependency files to a directory.
 *   Assumes *.pug should not get copied.
 *
 *  * `destPath` {String} path to copy files to.
 *  *  TODO:` exclude` {Array} Array of globbing patterns to not copy.
 *
 *  Returns {String} with replaced extension
 */
function _copyDependencies(templateDir, destPath) {
  const filter = /^(?!(.*index\.js|.*\.pug))/; // todo: could pass regex in options?
  fs.copySync(templateDir, destPath, filter, (err) => {
    console.log('[topdoc] Copy failed;', err);
  });
}

/**
 *  Public: creates docs using topDocument data with a pug template.
 *
 *  * `topDocument` {TopDocument} result from topdoc parsing.
 *
 *  ## Examples
 *
 *  ```js
 *  var template = require('default-template');
 *  postcss([topdoc({ fileData: opt })]).process(content, { from: filepath })
 *    .then((result) => {
 *      template(result);
 *    });
 *  ```
 */
function defaultTemplate(topDocument) {
  try {
    topDocument.files.forEach((file) => {
      file.filename = _replaceExt(file.filename, '.html');
    });
    const content = pug.renderFile(
      path.resolve(__dirname, 'template.pug'),
      { document: topDocument }
    );
    fs.mkdirsSync(path.resolve(topDocument.destination, 'css'));
    const cssDestination = path.resolve(topDocument.destination, 'css', topDocument.filename);
    fs.copySync(topDocument.source, cssDestination);
    const newFileName = topDocument.first ?
      'index.html' : _replaceExt(topDocument.filename, '.html');
    fs.writeFileSync(path.resolve(topDocument.destination, newFileName), content);
    console.log('[topdoc template] generated',
      path.relative(process.cwd(),
        path.resolve(topDocument.destination,
          newFileName
        )
      )
    );
  } catch (err) {
    console.log(err);
  }
}

/**
 *  Public: function to run before generating the docs. In this case it deletes
 *  the destination directory first before regenerating it.
 *
 *  * `options` {Object} the options hash.
 *
 *  ## Examples
 *
 *  ```js
 *  var template = require('default-template');
 *  if (template.before) {
 *    template.before(options);
 *  }
 *  ```
 */
defaultTemplate.before = (options) => {
  if (options.clobber && options.destination) {
    console.log('[topdoc template.before] because you said so, clobbering', options.destination);
    fs.removeSync(options.destination, (err) => {
      console.log('[topdoc template.before] cowardly gave up trying to rm', options.destination);
      console.log('[topdoc template.before] Error:', err);
    });
  }
};

/**
 *  Public: function to run after generating the docs. In this case it copies other
 *  docs html dependencies to the destination
 *
 *  * `options` {Object} hash of current options.
 *
 *  ## Examples
 *
 *  ```js
 *  var template = require('default-template');
 *  if (template.after) {
 *    template.after(options);
 *  }
 *  ```
 */
defaultTemplate.after = (options) => {
  const destPath = path.resolve(options.destination);
  const templateDir = path.dirname(options.template);
  console.log('[topdoc template.after] trying to copy dependencies');
  console.log('[topdoc template.after] something like cp -r', templateDir);
  console.log('[topdoc template.after] copying mostly everything to', destPath);
  fs.ensureDirSync(destPath);
  _copyDependencies(templateDir, destPath);
};

export default defaultTemplate;
