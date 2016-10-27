import test from 'ava';
import path from 'path';
import fs from 'fs-extra';
import nixt from 'nixt';
import randomstring from 'randomstring';

const cwd = path.resolve(__dirname, 'fixtures', 'project');
const baseDestination = path.resolve(__dirname, 'fixtures', 'project', 'demo');

test.after.always(() => {
  fs.removeSync(baseDestination);
});

test.cb('should build docs based on rc file config', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  nixt()
  .cwd(cwd)
  .expect((result) => {
    t.is(result.stdout, `because you said so, clobbering ${destination}
${path.relative(cwd, destination)}/index.html`);
  })
  .run(`topdoc --destination ${destination}`)
  .end(t.end);
});
