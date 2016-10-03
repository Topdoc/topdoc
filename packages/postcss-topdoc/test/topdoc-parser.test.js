import postcss from 'postcss';
import test from 'ava';
import fs from 'fs';
import path from 'path';
import topdoc from '../src/';

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
