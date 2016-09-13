import postcss from 'postcss';
import TopdocParser from './topdoc-parser';
/**
 * Public: PostCSS plugin allows you to inherit all the rules associated with a given selector.
 *
 * Returns a [PostCSS Plugin](http://api.postcss.org/postcss.html#.plugin) {Function}
 */
export default postcss.plugin('postcss-topdoc',
  (opts = {}) =>
    (css, results) =>
      new TopdocParser(css, results, opts)
);
