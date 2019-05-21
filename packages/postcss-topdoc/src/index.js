const postcss = require('postcss');
const TopdocParser = require('./topdoc-parser');
/**
 * Public: PostCSS plugin allows you to inherit all the rules associated with a given selector.
 *
 * Returns a [PostCSS Plugin](http://api.postcss.org/postcss.html#.plugin) {Function}
 */
module.exports = postcss.plugin('postcss-topdoc',
  (opts = {}) =>
    (css, results) =>
      new TopdocParser(css, results, opts)
);
