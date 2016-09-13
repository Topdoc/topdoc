import yaml from 'js-yaml';
// const debug = require('debug')('postcss-topdoc');

function _parseTopdocComment(node, regex, includeNodes) {
  const content = node.text.replace(regex, '');
  const yamlContent = yaml.safeLoad(content);
  if (includeNodes) yamlContent.nodes = [];
  yamlContent.css = '';
  return yamlContent;
}

function _findTopdocComments(css, regex, includeNodes) {
  const components = [];
  let currentComponentIndex;
  css.walk((node) => {
    if (node.type === 'comment' && node.text.match(regex)) {
      components.push(_parseTopdocComment(node, regex, includeNodes));
      currentComponentIndex = components.length - 1;
    } else if (components.length) {
      if (includeNodes) components[currentComponentIndex].nodes.push(node);
      components[currentComponentIndex].css += node.toString();
    }
  });
  return components;
}

/**
 *  Topdoc Parser Class
 */
export default class TopdocParser {
  constructor(css, results, opts = {}) {
    this.root = css;
    this.includeNodes = opts.includeNodes || false;
    this.commentRegExp = opts.commentRegExp || /^(?:\s)*(topdoc)/;
    const result = (opts.fileData) ? Object.assign({}, opts.fileData) : {};
    result.components = _findTopdocComments(this.root, this.commentRegExp, this.includeNodes);
    results.topdoc = result;
  }
}
