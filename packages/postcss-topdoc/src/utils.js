export default {
  /**
   *  Public: turns strings into slug strings
   *
   *  * `title` Any {String} to turn into a slug.
   *
   *  ## Examples
   *
   *  ```js
   *  slugify('This is a title');
   *  //returns 'this-is-a-title'
   *  ```
   *
   *  Returns {String} slug.
   */
  slugify: function slugify(title) {
    let slug = title.toLowerCase();
    const spaceRegex = /\s/g;
    slug = slug.replace(spaceRegex, '-');
    const nonWordRegex = /([^\w-]+)/;
    slug = slug.replace(nonWordRegex, '');
    return slug;
  },
  /**
   *  Public: turns strings into titles. (Title case-ish)
   *
   *  * `slug` Any {String} to turn into a title.
   *
   *  ## Examples
   *
   *  ```js
   *  titlify('this-is-a-button.css');
   *  //returns 'This Is A Button'
   *  ```
   *
   *  Returns {String} title.
   */
  titlify: function titlify(slug) {
    let title = slug.replace(/-/g, ' ');
    if (title.indexOf('.css') === title.length - 4) {
      title = title.replace('.css', '');
    }
    title = title.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    return title;
  },
  /**
   *  Public: checks if obj has a list (array) of properties
   *
   *  * `propertNames` {Array} of property name {String}s.
   *  * `obj` {Object} that might contain the properties.
   *  * `all` (optional) {Boolean} check if all property names are defined. Defaults to true.
   *
   *  ## Examples
   *
   *  ```js
   *  const obj = { ding: true, poop: false, dang: 'yup' };
   *  utils.hasOwnProperties(['ding', 'poop'], obj); // returns true
   *  utils.hasOwnProperties(['ding', 'doop'], obj, true) // returns false
   *  ```
   *
   *  Returns {Boolean} representing if object has all or some of the properties,
   *  depending on `all` param.
   */
  hasOwnProperties: function hasOwnProperties(propertNames, obj, all = false) {
    if (all) {
      return propertNames.every(prop => Object.hasOwnProperty.call(obj, prop));
    }
    return propertNames.some(prop => Object.hasOwnProperty.call(obj, prop));
  },
};
