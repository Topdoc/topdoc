import postcss from 'postcss';
import test from 'ava';
import fs from 'fs';
import path from 'path';
import topdoc from '../src/';
import TopdocParser from '../src/topdoc-parser';

function read(file) {
  return fs.readFileSync(file, 'utf8').trim();
}
function clean(obj) {
  return JSON.parse(JSON.stringify(obj));
}

test('Should generate Topdoc Object', (t) => {
  const input = read('./test/fixtures/button.css');
  const output = JSON.parse(read('./test/expected/button.json'));
  return postcss([topdoc({
    fileData: {
      sourcePath: './test/fixtures/button.css',
      template: 'lib/template.jade',
    },
  })])
    .process(input, { from: './test/fixtures/button.css' })
    .then((result) => {
      t.deepEqual(clean(result.topdoc), output);
    });
});

test('Should accept title in fileData', (t) => {
  const input = read('./test/fixtures/button.css');
  const output = JSON.parse(read('./test/expected/button-title.json'));
  return postcss([topdoc({
    fileData: {
      sourcePath: './test/fixtures/button.css',
      template: 'lib/template.jade',
      title: 'lalala',
    },
  })])
    .process(input, { from: './test/fixtures/button.css' })
    .then((result) => {
      t.deepEqual(clean(result.topdoc), output);
    });
});

test('Should throw an error if `name` is missing', t => {
  const input = read('./test/fixtures/missing-name.css');
  return postcss([topdoc({
    fileData: {
      template: 'lib/template.jade',
    },
  })]).process(input, { from: undefined })
  .then((result) => {
    t.is(result.topdoc.title, 'Unnamed');
  })
});

test('Should work even if no sourcePath is set', (t) => {
  const input = read('./test/fixtures/button.css');
  const output = JSON.parse(read('./test/expected/button.json'));
  return postcss([topdoc({
    fileData: {
      template: 'lib/template.jade',
    },
  })])
    .process(input, { from: './test/fixtures/button.css' })
    .then((result) => {
      output.sourcePath = path.resolve('./test/fixtures/button.css');
      t.deepEqual(clean(result.topdoc), output);
    });
});

test('Should be able to TopdocParser as a non plugin.', (t) => {
  const input = read('./test/fixtures/button.css');
  return postcss()
    .process(input, { from: './test/fixtures/button.css' })
    .then((result) => {
      const topdocParser = new TopdocParser(result.root, result);
      t.is(topdocParser.topdoc.components.length, 2);
    });
});

test('Should be able to parse multiple css files in parallel.', async t => {
  const button = read('./test/fixtures/button.css');
  const select = read('./test/fixtures/select.css');
  const buttonResult = await postcss([topdoc()]).process(button, { from: './test/fixtures/button.css' });
  const selectResult = await postcss([topdoc()]).process(select, { from: './test/fixtures/select.css' });
  const result = [
    buttonResult.topdoc.filename,
    selectResult.topdoc.filename,
  ];
  const expected = [
    'button.css',
    'select.css',
  ];
  return t.deepEqual(result, expected);
});

test('Should include nodes with the correct options.', (t) => {
  const input = read('./test/fixtures/button.css');
  return postcss([topdoc({ includeNodes: true })]).process(input, { from: './test/fixtures/button.css' })
  .then((result) => {
    t.is(result.topdoc.components[0].nodes.length, 3);
  });
});
