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

test.cb('should error if pointed at directory with no files', t => {
  const wrongPath = path.resolve(baseDestination, 'empty');
  nixt()
    .cwd(cwd)
    .expect((result) => {
      t.is(result.stderr.includes('Error: No files match'), true);
    })
    .run(`node ../../../bin/index.js ${wrongPath}`)
    .end(t.end);
});


test.cb('should build docs based on rc file config', t => {
  const randomPath = randomstring.generate();
  const destination = path.resolve(baseDestination, randomPath);
  const expected = `${path.relative(cwd, destination)}/index.html
because you said so, clobbering ${destination}`;
  nixt()
  .cwd(cwd)
  .expect((result) => {
    t.is(String(result.stdout).trim(), String(expected).trim());
  })
  .run(`node ../../../bin/index.js --destination ${destination}`)
  .end(t.end);
});

test.cb('should build docs with short name flag overridding rc file', t => {
  const randomPath = randomstring.generate();
  const destination = path.resolve(baseDestination, randomPath);
  const expected = `demo/${randomPath}/index.html\nbecause you said so, clobbering ${destination}`;
  nixt()
  .cwd(cwd)
  .expect((result) => {
    t.is(result.stdout, expected);
  })
  .run(`node ../../../bin/index.js -d ${destination}`)
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
  .run(`node ../../../bin/index.js -d ${destination}`)
  .end(t.end);
});
