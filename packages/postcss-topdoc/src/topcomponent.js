import utils from 'taborlin-utils';

/**
 *  Component Class
 */
export default class TopComponent {
  /**
   *  Public: populates component instance with properties.
   *
   *  * `properties` {Object} any and all properties.
   *    * `name` A {String} of the component name is the only required property.
   *
   *  ## Examples
   *
   *  ```js
   *  const topdoc = new TopdocParser(css, results, opts);
   *  ```
   */
  constructor(properties) {
    if (!Object.hasOwnProperty.call(properties, 'name')) {
      throw new Error('A component has to at least have a name.');
    }
    Object.keys(properties).forEach((key) => {
      this[key] = properties[key];
    });
  }
  /**
   *  Public: slug getter.
   *
   *  ## Examples
   *
   *  ```js
   *  const topdoc = new TopdocParser(css, results, opts);
   *  topdoc.slug;
   *  ```
   *
   *  Returns {String} of the component's slug, made from `name`.
   */
  get slug() {
    return utils.slugify(this.name);
  }
  /**
   *  Public: converts this object instance to json when used JSON.stringify.
   *  Used to make sure slug is included in the output even though it is a dynamically
   *  generated property and only acessible via a getter method.
   *
   *  ## Examples
   *
   *  ```js
   *  const topdoc = new TopdocParser(css, results, opts);
   *  JSON.stringify(topdoc); // has slug property
   *  ```
   *
   *  Returns {Object}
   */
  toJSON() {
    return Object.assign({}, this, { slug: this.slug });
  }
}
