const TopdocParser = require('./topdoc-parser');
/**
 * Public: PostCSS plugin allows you to inherit all the rules associated with a given selector.
 *
 * Returns a [PostCSS Plugin](http://api.postcss.org/postcss.html#.plugin) {Function}
 */
module.exports = (opts = {}) => (css, results) =>
  new TopdocParser(css, results, opts);
module.exports.postcss = true;
