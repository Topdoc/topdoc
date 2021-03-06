const test = require('ava');
const utils = require('../src/utils');

test('Check utils hasOwnProperties', t => {
  const obj = {ding: true, poop: false, dang: 'yup'};
  t.is(utils.hasOwnProperties(['ding', 'poop'], obj), true);
});

test('Check utils hasOwnProperties all', t => {
  const obj = {ding: true, poop: false, dang: 'yup'};
  t.is(utils.hasOwnProperties(['ding', 'doop'], obj, true), false);
});
