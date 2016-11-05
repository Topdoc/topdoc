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

function read(filepath) {
  return fs.readFileSync(filepath, 'utf-8');
}


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

test.cb('should build docs with short name flag overridding rc file', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  nixt()
  .cwd(cwd)
  .expect((result) => {
    t.is(result.stdout, `because you said so, clobbering ${destination}
${path.relative(cwd, destination)}/index.html`);
  })
  .run(`topdoc -d ${destination}`)
  .end(t.end);
});

test.cb('should include assets from asset directory in rc file', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const expected = read(path.resolve(__dirname,
    'fixtures', 'project', 'passets', 'css', 'pass.css'));
  nixt()
  .cwd(cwd)
  .expect(() => {
    const anotherFile = read(path.resolve(destination, 'css', 'pass.css'));
    t.is(expected, anotherFile);
  })
  .run(`topdoc -d ${destination}`)
  .end(t.end);
});
