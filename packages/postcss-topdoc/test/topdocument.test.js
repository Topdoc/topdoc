import test from 'ava';
import TopDocument from '../src/topdocument';

test('Should throw an error if `name` is missing', (t) => {
  t.throws(() => {
    // eslint-disable-next-line no-unused-vars
    const topdoc = new TopDocument({});
  },
    /A topdocument has to at least have a title or filename\./
  );
});
