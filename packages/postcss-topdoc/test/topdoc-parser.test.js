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
  const input = read('./fixtures/button.css');
  const output = JSON.parse(read('./expected/button.json'));
  return postcss([topdoc({
    fileData: {
      sourcePath: 'fixtures/button.css',
      template: 'lib/template.jade',
    },
  })])
    .process(input, { from: 'fixtures/button.css' })
    .then((result) => {
      t.deepEqual(clean(result.topdoc), output);
    });
});

test('Should throw an error if `name` is missing', (t) => {
  const input = read('./fixtures/missing-name.css');
  t.throws(
    postcss([topdoc({
      fileData: {
        sourcePath: 'fixtures/missing-name.css',
        template: 'lib/template.jade',
      },
    })]).process(input, { from: 'fixtures/missing-name.css' }),
    /A component has to at least have a name\./
  );
});

test('Should work even if no sourcePath is set', (t) => {
  const input = read('./fixtures/button.css');
  const output = JSON.parse(read('./expected/button.json'));
  return postcss([topdoc({
    fileData: {
      template: 'lib/template.jade',
    },
  })])
    .process(input, { from: 'fixtures/button.css' })
    .then((result) => {
      output.sourcePath = path.resolve('fixtures/button.css');
      t.deepEqual(clean(result.topdoc), output);
    });
});

test('Should be able to TopdocParser as a non plugin.', (t) => {
  const input = read('./fixtures/button.css');
  return postcss()
    .process(input, { from: 'fixtures/button.css' })
    .then((result) => {
      const topdocParser = new TopdocParser(result.root, result);
      t.is(topdocParser.topdoc.components.length, 2);
    });
});

test('Should be able to parse multiple css files in parallel.', (t) => {
  const button = read('./fixtures/button.css');
  const select = read('./fixtures/select.css');
  return Promise.all([
    postcss([topdoc()]).process(button, { from: 'fixtures/button.css' }),
    postcss([topdoc()]).process(select, { from: 'fixtures/select.css' }),
  ]).then((results) => {
    const result = [
      results[0].topdoc.filename,
      results[1].topdoc.filename,
    ];
    const expected = [
      'button.css',
      'select.css',
    ];
    t.deepEqual(result, expected);
  });
});

test('Should include nodes with the correct options.', (t) => {
  const input = read('./fixtures/button.css');
  return postcss([topdoc({ includeNodes: true })]).process(input, { from: 'fixtures/button.css' })
  .then((result) => {
    t.is(result.topdoc.components[0].nodes.length, 3);
  });
});
