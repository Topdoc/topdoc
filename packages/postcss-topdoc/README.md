# PostCSS Topdoc

[![Build Status](https://travis-ci.org/GarthDB/postcss-topdoc.svg?branch=master)](https://travis-ci.org/GarthDB/postcss-topdoc) [![codecov](https://codecov.io/gh/GarthDB/postcss-topdoc/branch/master/graph/badge.svg)](https://codecov.io/gh/GarthDB/postcss-topdoc) [![Dependency Status](https://david-dm.org/GarthDB/postcss-topdoc.svg)](https://david-dm.org/GarthDB/postcss-topdoc) [![npm version](https://badge.fury.io/js/postcss-topdoc.svg)](https://badge.fury.io/js/postcss-topdoc)

---

<a href="http://postcss.org/"><img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg"></a>

[Topdoc](https://github.com/topcoat/topdoc) parser built in [postcss](https://github.com/postcss/postcss).

## Installation

There's a few ways to add this plugin to your project, but it's probably easiest to just use [NPM](https://www.npmjs.com/) to add `postcss-topdoc` to your dependencies.

```sh
npm install --save postcss-topdoc
```

## Basic Usage

This is an odd package, it uses the same api as the postcss plugin, but it doesn't do what a traditional plugin should do, which is to transform the css in someway. Instead it just gathers the information from the comments and turns it into a TopDocument result object and attaches it to the results as the `topdoc` property.

You can use it as a plugin like this:

```js
var postcss = require('postcss');
var topdoc = require('postcss-topdoc');

var input = "some css string";
var opts = {/* postcss-npm options */};

postcss([topdoc(opts)])
  .process(input, { from: 'fixtures/button.css' })
  .then(function(result) {
    console.log(result.topdoc); //string of resultant css
  });
```

But if you don't want to use it as a plugin you can also just use the parser:

```js
var TopdocParser = require('postcss-topdoc/lib/topdoc-parser');

var input = read('./fixtures/button.css');
postcss()
  .process(input, { from: 'fixtures/button.css' })
  .then((result) => {
    var opts = {/* postcss-npm options */};
    const topdocParser = new TopdocParser(result.root, result, opts);
    console.log(topdocParser.topdoc); // this is the {TopDocument}
  });
```

## Options

### `includeNodes`

If set to `true` the Components in the TopDocument object will be returned with an array of the corresponding [PostCSS Nodes](http://api.postcss.org/Node.html) as the `nodes` property.

```js
var TopdocParser = require('postcss-topdoc/lib/topdoc-parser');

var input = read('./fixtures/button.css');
postcss()
  .process(input, { from: 'fixtures/button.css' })
  .then((result) => {
    var opts = { includeNodes: true };
    const topdocParser = new TopdocParser(result.root, result, opts);
    console.log(topdocParser.topdoc.components[0].nodes); // these are the PostCSS {Node}s that correspond to this component.
  });
```

### `commentRegExp`

This regex is used to identify which block comments contain Topdoc data to be parsed. It defaults to `/^(?:\s)*(topdoc)/` which matches comments like this:

```css
/* topdoc
  name: Button
  description: A simple button
  modifiers:
    :active: Active state
    .is-active: Simulates an active state on mobile devices
    :disabled: Disabled state
    .is-disabled: Simulates a disabled state on mobile devices
  markup: |
    <a class="topcoat-button">Button</a>
    <a class="topcoat-button is-active">Button</a>
    <a class="topcoat-button is-disabled">Button</a>
  tags:
    - desktop
    - light
    - mobile
    - button
    - quiet
*/
```

But if you prefer to not use the keyword `topdoc` feel free to pass your regex to use as the test.

```js
var TopdocParser = require('postcss-topdoc/lib/topdoc-parser');

var input = read('./fixtures/button.css');
postcss()
  .process(input, { from: 'fixtures/button.css' })
  .then((result) => {
    var opts = { commentRegExp: /^(?:\s)*(td)/ };
    const topdocParser = new TopdocParser(result.root, result, opts);
    console.log(topdocParser.topdoc);
  });
```

The above example would match comments that start with `/* td`.

### `fileData`

There is some data that might be needed by the template that isn't defined in the individual components this can be passed to the parser as `fileData` which will all be added as properties of the resultant {TopDocument}.

It is required that it has at least a `title`, `filename`, or `sourcePath`. If given a `sourcePath` and not provided a specific `files` it will use string after the last path separator to create a `filename`, and the `filename` is used to create a `title` property if not included.

```js
postcss([topdoc({
  fileData: {
    sourcePath: 'fixtures/button.css',
    template: 'lib/template.jade',
  },
})])
  .process(input, { from: 'fixtures/button.css' })
  .then((result) => {
    console.log(result.topdoc);
  });
```

In the above example the `result.topdoc` will be:

```js
TopDocument {
  sourcePath: 'fixtures/button.css',
  template: 'lib/template.jade',
  filename: 'button.css',
  title: 'Button',
  components: [] // {TopComponent}s here
}
```

## Object Types

### {TopdocParser}

Find the definition on [GitHub](https://github.com/GarthDB/postcss-topdoc/blob/master/src/topdoc-parser.js#L56).

#### Properties

* `css` [PostCSS {Node}](http://api.postcss.org/Node.html) root node object.
* `results` [PostCSS {Result}](http://api.postcss.org/Result.html) object.
* `opts` (optional) {Object} plugin options.
  * `commentRegExp` (optional) {RegExp} used to identify TopDoc comments; defaults `/^(?:\s)*(topdoc)/`
  * `fileData` (optional) {Object} passed through to the template.
  * `title` (optional) {String} document title.
  * `filename` (optional) {String} name of the original css file. Will be used to create `title` if it is not set.
  * `sourcePath` (optional) {String} path to the original css file. Will be used to create `filename` if it is not set.
  * `includeNodes` {Bool} If `true` the components in the results will include an array of the corresponding PostCSS {Node}s as the `nodes` property.
* `topdoc` [{TopDocument}](#topdocument) the result of parsing css content with Topdoc comment blocks.

### {TopDocument}

Find the definition on [GitHub](https://github.com/GarthDB/postcss-topdoc/blob/master/src/topdocument.js#L18).

#### Properties

* `title` {String} Title of the project. Can be provided to the constructor, if not PostCSS Topdoc will generate it from `filename`.
* `filename` {String} name of the css file that contains the component definition. Can be provided to the constructor, if not PostCSS Topdoc will generate it from `sourcePath`.
* `sourcePath` {String} path to the source of the css file that contains the component definition. Can be provided to the constructor, if not PostCSS Topdoc will try to generate it from the `from` property in the [processOptions](http://api.postcss.org/global.html#processOptions).

### {TopComponent}

Find the definition on [GitHub](https://github.com/GarthDB/postcss-topdoc/blob/master/src/topcomponent.js#L6).

#### Properties

* `name` {String} (required) Components need at least a `name` property.
* `markup` {String} (optional) If the component data is being used to to generate html style guides, they should have a `markup` property.
* `commentStart` {Object} The location of the start of the Topdoc comment.
  * `line` {int} starting line number.
  * `column` {int} starting column number.
* `commentEnd` {Object} The location of the end of the Topdoc comment.
  * `line` {int} ending line number.
  * `column` {int} ending column number.
* `css` {String} (optional) If able to get css between topdoc comments it is included as the css property.
* Anything else.

TopComponents can have any additional properties needed. They are defined as [YAML](http://www.yaml.org/start.html) in a css block comment that matches the [`commentRegExp`](#commentregexp).

Most YAML syntax is pretty straight forward, just make sure to use the `|` when defining multiline strings like `markup`.

```css
/* topdoc
  name: Button
  description: A simple button
  modifiers:
    :active: Active state
    .is-active: Simulates an active state on mobile devices
    :disabled: Disabled state
    .is-disabled: Simulates a disabled state on mobile devices
  markup: |
    <a class="topcoat-button">Button</a>
    <a class="topcoat-button is-active">Button</a>
    <a class="topcoat-button is-disabled">Button</a>
  tags:
    - desktop
    - light
    - mobile
    - button
    - quiet
*/
```

Would produce the following result:

```js
TopComponent {
  name: 'Button',
  description: 'A simple button',
  modifiers:
   { ':active': 'Active state',
     '.is-active': 'Simulates an active state on mobile devices',
     ':disabled': 'Disabled state',
     '.is-disabled': 'Simulates a disabled state on mobile devices' },
  markup: '<a class="topcoat-button">Button</a>\n<a class="topcoat-button is-active">Button</a>\n<a class="topcoat-button is-disabled">Button</a>\n',
  tags: [ 'desktop', 'light', 'mobile', 'button', 'quiet' ],
  css: 'css string here'
```
