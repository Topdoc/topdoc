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
var opts = {/* postcss-npm options */}

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
    const opts = {
      fileData: {
        sourcePath: 'fixtures/button.css',
        template: 'lib/template.jade',
      }
    };
    const topdocParser = new TopdocParser(result.root, result, opts);
    topdocParser.topdoc; // this is the {TopDocument}
  });
```
