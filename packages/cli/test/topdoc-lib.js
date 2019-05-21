const test = require('ava');
const path = require('path');
const topdocLib = require('../topdoc-lib');

test.before(t => {
  process.chdir(path.resolve(__dirname, '../'));
});

test('load Topdoc config', t => {
  const options = topdocLib.loadOptions();
  const expected = {
    ignoreAssets: [/^\./, /^node_modules/, /\.pug/, /\.jade/, '/**/*.json'],
    source: 'src',
    destination: path.resolve(__dirname, '../', 'docs'),
    template: 'topdoc-default-template',
    templateData: null,
    clobber: false,
    stdout: false,
    packageFile: path.resolve(__dirname, '../', 'package.json'),
    assetDirectory: 'topdoc-default-template',
  };
  t.deepEqual(options, expected);
});

test('load Topdoc config with project String', t => {
  const options = topdocLib.loadOptions({project: 'Ding'});
  const expected = {
    ignoreAssets: [/^\./, /^node_modules/, /\.pug/, /\.jade/, '/**/*.json'],
    source: 'src',
    destination: path.resolve(__dirname, '../', 'docs'),
    template: 'topdoc-default-template',
    templateData: null,
    clobber: false,
    stdout: false,
    packageFile: path.resolve(__dirname, '../', 'package.json'),
    project: 'Ding',
    assetDirectory: 'topdoc-default-template',
    title: 'Ding',
  };
  t.deepEqual(options, expected);
});

test('load Topdoc config with project Boolean', t => {
  const options = topdocLib.loadOptions({project: true});
  const expected = {
    ignoreAssets: [/^\./, /^node_modules/, /\.pug/, /\.jade/, '/**/*.json'],
    source: 'src',
    destination: path.resolve(__dirname, '../', 'docs'),
    template: 'topdoc-default-template',
    templateData: null,
    clobber: false,
    stdout: false,
    packageFile: path.resolve(__dirname, '../', 'package.json'),
    project: true,
    assetDirectory: 'topdoc-default-template',
    title: 'cli',
  };
  t.deepEqual(options, expected);
});

test('load Topdoc config with source override', t => {
  const options = topdocLib.loadOptions({}, 'source-override');
  const expected = {
    ignoreAssets: [/^\./, /^node_modules/, /\.pug/, /\.jade/, '/**/*.json'],
    source: 'source-override',
    destination: path.resolve(__dirname, '../', 'docs'),
    template: 'topdoc-default-template',
    templateData: null,
    clobber: false,
    stdout: false,
    packageFile: path.resolve(__dirname, '../', 'package.json'),
    assetDirectory: 'topdoc-default-template',
  };
  t.deepEqual(options, expected);
});

test('load Topdoc config with assetDirectory set to false', t => {
  const options = topdocLib.loadOptions({assetDirectory: false});
  const expected = {
    ignoreAssets: [/^\./, /^node_modules/, /\.pug/, /\.jade/, '/**/*.json'],
    source: 'src',
    destination: path.resolve(__dirname, '../', 'docs'),
    template: 'topdoc-default-template',
    templateData: null,
    clobber: false,
    stdout: false,
    packageFile: path.resolve(__dirname, '../', 'package.json'),
    assetDirectory: 'topdoc-default-template',
  };
  t.deepEqual(options, expected);
});

test('load Topdoc config with assetDirectory set to String', t => {
  const options = topdocLib.loadOptions({assetDirectory: 'assets'});
  const expected = {
    ignoreAssets: [/^\./, /^node_modules/, /\.pug/, /\.jade/, '/**/*.json'],
    source: 'src',
    destination: path.resolve(__dirname, '../', 'docs'),
    template: 'topdoc-default-template',
    templateData: null,
    clobber: false,
    stdout: false,
    packageFile: path.resolve(__dirname, '../', 'package.json'),
    assetDirectory: 'assets',
  };
  t.deepEqual(options, expected);
});

test('_toList converts string to array', t => {
  const result = topdocLib._toList('this,is,a,list');
  t.deepEqual(result, ['this', 'is', 'a', 'list']);
});

test('_toList converts string to false boolean', t => {
  t.false(topdocLib._booleanOrValue('false'));
});

test('_toList converts null to false boolean', t => {
  t.false(topdocLib._booleanOrValue(null));
});

test('_toList converts string to true boolean', t => {
  t.true(topdocLib._booleanOrValue('true'));
});

test('_toList returns string', t => {
  const expected = 'A String';
  t.is(topdocLib._booleanOrValue(expected), expected);
});

test('resolveAssetDirectory resolves absolute directory', t => {
  const assetDirectory = path.resolve(
    __dirname,
    'fixtures',
    'template',
    'assets'
  );
  t.is(topdocLib.resolveAssetDirectory(assetDirectory), assetDirectory);
});

test('resolveAssetDirectory resolves relative directory', t => {
  const assetDirectory = path.join('test', 'fixtures', 'template', 'assets');
  t.is(
    topdocLib.resolveAssetDirectory(assetDirectory),
    path.resolve(assetDirectory)
  );
});

test('resolveAssetDirectory resolves absolute package', t => {
  const assetDirectory = path.resolve(__dirname, 'fixtures', 'template');
  t.is(topdocLib.resolveAssetDirectory(assetDirectory), assetDirectory);
});

test('resolveAssetDirectory resolves relative package', t => {
  const absAssetDirectory = path.resolve(__dirname, 'fixtures', 'template');
  const assetDirectory = path.join('test', 'fixtures', 'template');
  t.is(topdocLib.resolveAssetDirectory(assetDirectory), absAssetDirectory);
});

test('resolveAssetDirectory resolves to directory name when given file', t => {
  const absAssetDirectory = path.resolve(__dirname, 'fixtures', 'template');
  const assetDirectory = path.join('test', 'fixtures', 'template', 'index.js');
  t.is(topdocLib.resolveAssetDirectory(assetDirectory), absAssetDirectory);
});
