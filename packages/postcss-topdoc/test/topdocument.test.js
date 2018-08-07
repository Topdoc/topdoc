import test from 'ava';
import TopDocument from '../src/topdocument';

test('Should use unnamed if `name` is missing', (t) => {
  // eslint-disable-next-line no-unused-vars
  const topdoc = new TopDocument({});
  t.is(topdoc.title, 'Unnamed')
});

test('Should set title when provided even if filename is undefined', (t) => {
  const topdoc = new TopDocument({ title: 'foo' });
  t.is(topdoc.filename, undefined);
});
