import yaml from 'js-yaml';
import utils from 'taborlin-utils';
import CleanCSS from 'clean-css';

import TopComponent from './topcomponent';
import TopDocument from './topdocument';

const debug = require('debug')('postcss-topdoc');

/**
 *  Private: parses the values of a TopDoc comment.
 *
 *  * `node` {Object} PostCSS node.
 *  * `regex` {RegExp} used to identify TopDoc comments.
 *  * `includeNodes` {Boolean} will include the nodes in the component if true.
 *
 *  Returns {Object} Component
 */
function _parseTopdocComment(node, regex, includeNodes) {
  const content = node.text.replace(regex, '');
  const component = new TopComponent(yaml.safeLoad(content));
  if (includeNodes) component.nodes = [];
  component.css = '';
  return component;
}

/**
 *  Private: goes through each css node and finds Topdoc comments.
 *
 *  * `css` {Object} PostCSS root node object.
 *  * `regex` {RegExp} used to identify TopDoc comments.
 *  * `includeNodes` {Boolean} will include the nodes in the component if true.
 *
 *  Returns {Array} of Component {Object}s
 */
function _findTopdocComments(css, regex, includeNodes) {
  const components = [];
  let currentComponentIndex;
  css.walk((node) => {
    if (node.type === 'comment' && node.text.match(regex)) {
      components.push(_parseTopdocComment(node, regex, includeNodes));
      currentComponentIndex = components.length - 1;
      debug(`Started adding ${components[currentComponentIndex].name}`);
    } else if (components.length && node.type !== 'decl') {
      if (includeNodes) components[currentComponentIndex].nodes.push(node);
      components[currentComponentIndex].css += node.toString();
      debug(`Added ${node.type} to ${components[currentComponentIndex].name}`);
    }
  });
  return components;
}

/**
 *  TopdocParser Class
 */
export default class TopdocParser {
  /**
   *  Public: really just meant to be used as a part of the plugin.
   *
   *  * `css` PostCSS {Root} node object.
   *  * `results` PostCSS {Result} object.
   *  * `opts` (optional) {Object} plugin options.
   *    * `commentRegExp` (optional) {RegExp} used to identify TopDoc comments;
   *      defaults /^(?:\s)*(topdoc)/
   *    * `fileData` (optional) {Object} passed through to the template.
   *      * `title` (optional) {String} document title.
   *      * `filename` (optional) {String} name of the original css file.
   *        Will be used to create `title` if it is not set.
   *      * `sourcePath` (optional) {String} path to the original css file.
   *        Will be used to create `filename` if it is not set.
   *      * `includeNodes` {Boolean} If `true` the components in the results will
   *        include an array of the corresponding PostCSS {Node}s as the `nodes` property.
   *
   *  ## Examples
   *
   *  ```js
   *  export default postcss.plugin('postcss-topdoc',
   *    (opts = {}) =>
   *      (css, results) =>
   *        new TopdocParser(css, results, opts)
   *  );
   *  ```
   */
  constructor(css, results, opts = {}) {
    this.root = css;
    this.results = results;
    this.includeNodes = opts.includeNodes || false;
    this.commentRegExp = opts.commentRegExp || /^(?:\s)*(topdoc)/;
    opts.fileData = opts.fileData || {};
    if (!utils.hasOwnProperties(['filename', 'sourcePath'], opts.fileData, false)) {
      opts.fileData.sourcePath = this.root.source.input.file;
    }
    const document = new TopDocument(opts.fileData);
    document.minified = new CleanCSS({ restructuring: false }).minify(this.root.toString()).styles;
    document.components = _findTopdocComments(this.root, this.commentRegExp, this.includeNodes);
    results.topdoc = document;
  }
  /**
   *  Public: since topdoc is a dynamically generated property this is a getter
   *  to make it easier to access it.
   *
   *  ## Examples
   *
   *  ```js
   *  const input = read('./fixtures/button.css');
   *  postcss()
   *    .process(input, { from: 'fixtures/button.css' })
   *    .then((result) => {
   *      const opts = {
   *        fileData: {
   *          sourcePath: 'fixtures/button.css',
   *          template: 'lib/template.jade',
   *      } };
   *      const topdocParser = new TopdocParser(result.root, result, opts);
   *      topdocParser.topdoc; // this is the {TopDocument}
   *    });
   *  ```
   *
   *  Returns {TopDocument}
   */
  get topdoc() {
    return this.results.topdoc;
  }
}
