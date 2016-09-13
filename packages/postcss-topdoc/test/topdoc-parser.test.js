import postcss from 'postcss';
import test from 'ava';
import fs from 'fs';
import topdoc from '../src/';

function read(file) {
  return fs.readFileSync(file, 'utf8').trim();
}

test('Should generate Topdoc Object', (t) => {
  const input = read('./fixtures/button.css');
  const output = read('./expected/button.json');
  return postcss([topdoc({
    fileData: {
      title: 'Button',
      source: 'test/fixtures/button.css',
      filename: 'button.css',
      template: 'lib/template.jade',
    },
  })])
    .process(input, { from: './fixtures/button.css' })
    .then((result) => {
      fs.writeFileSync('../test.json', JSON.stringify(result.topdoc, null, 2), 'utf-8');
      t.deepEqual(JSON.stringify(result.topdoc), output);
    });
});
