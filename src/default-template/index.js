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
    fs.mkdirsSync(path.resolve(topDocument.destination, 'css', path.delimiter));
    const cssDestination = path.resolve(topDocument.destination, 'css', topDocument.filename);
    fs.copySync(topDocument.source, cssDestination);
    const newFileName = topDocument.first ?
      'index.html' : _replaceExt(topDocument.filename, '.html');
    fs.writeFileSync(path.resolve(topDocument.destination, newFileName), content);
    console.log(path.relative(process.cwd(), path.resolve(topDocument.destination, newFileName)));
  } catch (err) {
    console.log(err);
  }
}

/**
 *  Public: function to run before generating the docs. In this case it deletes
 *  the destination directory first before regenerating it.
 *
 *  * `destination` {String} path to destination.
 *
 *  ## Examples
 *
 *  ```js
 *  var template = require('default-template');
 *  if (template.before) {
 *    template.before(options.destination);
 *  }
 *  ```
 */
defaultTemplate.before = (destination) => {
  if (fs.ensureDirSync(destination)) fs.removeSync(destination);
};

export default defaultTemplate;
