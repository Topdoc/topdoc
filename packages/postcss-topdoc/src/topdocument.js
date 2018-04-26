import utils from './utils';

/**
 *  Private: gets the filename from a file path.
 *
 *  * `path` {String} the filepath that contains the filename.
 *
 *  Returns {String} filename.
 */
function _getFilename(path) {
  if (!path) return false;
  return path.split(/\/|\\/).pop();
}

/**
 *  TopDocument Class
 */
export default class TopDocument {
  /**
   *  Public: constructor for TopDocument.
   *
   *  * `properties` {Object} can be anything, must have a title, filename, or sourcePath.
   *    * `title` (Optional) {String} document title.
   *    * `filename` (Optional) {String} name of the original css file.
   *      Will be used to create `title` if it is not set.
   *    * `sourcePath` (Optional) {String} path to the original css file.
   *      Will be used to create `filename` if it is not set.
   *
   *  ## Examples
   *
   *  ```js
   *  const document = new TopDocument({
   *    title: 'document title',
   *    filename: 'main.css',
   *    sourcePath: 'css/main.css',
   *  });
   *  ```
   */
  constructor(properties) {
    if (!utils.hasOwnProperties(['title', 'filename', 'sourcePath'], properties, false)) {
      throw new Error('A topdocument has to at least have a title or filename.');
    }
    Object.assign(this, properties);
    this.filename = this.filename || _getFilename(this.sourcePath) || undefined;
    this.title = (this.title) ? this.title : utils.titlify(this.filename);
    this.components = [];
  }
}
