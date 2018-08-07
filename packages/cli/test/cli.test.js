import test from 'ava';
import path from 'path';
import fs from 'fs-extra';
import nixt from 'nixt';
import randomstring from 'randomstring';

const baseDestination = path.resolve(__dirname, 'docs');

function read(filepath) {
  return fs.readFileSync(filepath, 'utf-8');
}

test.after.always(() => {
  fs.removeSync(baseDestination);
});

test.cb('should error out if pattern doesn\'t match', t => {
  nixt()
  .cwd(path.resolve(__dirname))
  .expect((result) => {
    t.regex(result.stderr, /Error: No files match 'nothing\.css'/);
  })
  .cwd(path.resolve(__dirname, '..'))
  .run('node bin/index.js nothing.css')
  .end(t.end);
});

test.cb('should write basic docs from single file', t => {
  const newDestination = baseDestination;
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const expected = read(path.resolve(__dirname, 'expected', 'button.index.html'));
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    const docFile = read(path.resolve(newDestination, 'index.html'));
    t.is(docFile.trim(), expected.trim());
  })
  .run(`node ../bin/index.js ${source}`)
  .end(t.end);
});

// test.cb('should write docs from directory of css files', t => {
//   const destination = path.resolve(baseDestination, randomstring.generate());
//   const source
// })

test.cb('should accept new destination location', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const expected = read(path.resolve(__dirname, 'expected', 'button.index.html'));
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    const docFile = read(path.resolve(destination, 'index.html'));
    t.is(docFile.trim(), expected.trim());
  })
  .run(`node ../bin/index.js ${source} -d ${destination}`)
  .end(t.end);
});

test.cb('should change project name if passed a string', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    const docFile = read(path.resolve(destination, 'index.html'));
    t.regex(docFile, /<title>lalala<\/title>/);
  })
  .run(`node ../bin/index.js ${source} -d ${destination} -p 'lalala'`)
  .end(t.end);
});


test.cb('should use cwd for project name if passed true', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    const docFile = read(path.resolve(destination, 'index.html'));
    t.regex(docFile, /<title>test<\/title>/);
  })
  .run(`node ../bin/index.js ${source} -d ${destination} -p true`)
  .end(t.end);
});

test.cb('should copy assets from absolute directory path', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const assetDirectory = path.resolve(__dirname, 'fixtures', 'template', 'assets');
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    const anotherFile = read(path.resolve(destination, 'css', 'another.css'));
    t.regex(anotherFile, /content: 'yup';/);
  })
  .run(`node ../bin/index.js ${source} -d ${destination} -a ${assetDirectory}`)
  .end(t.end);
});

test.cb('should copy assets from relative directory path', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const assetDirectory = path.resolve(__dirname, 'fixtures', 'template', 'assets');
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    const anotherFile = read(path.resolve(destination, 'css', 'another.css'));
    t.regex(anotherFile, /content: 'yup';/);
  })
  .run(`node ../bin/index.js ${source} -d ${destination} -a ${assetDirectory}`)
  .end(t.end);
});

test.cb('should copy assets from absolute package path', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const assetDirectory = path.resolve(__dirname, 'fixtures', 'template');
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    const anotherFile = read(path.resolve(destination, 'assets', 'css', 'another.css'));
    t.regex(anotherFile, /content: 'yup';/);
  })
  .run(`node ../bin/index.js ${source} -d ${destination} -a ${assetDirectory}`)
  .end(t.end);
});

test.cb('should copy assets from relative package path', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const absAssetDirectory = path.resolve(__dirname, 'fixtures', 'template');
  const assetDirectory = `./${path.relative(__dirname, absAssetDirectory)}`;
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    const anotherFile = read(path.resolve(destination, 'assets', 'css', 'another.css'));
    t.regex(anotherFile, /content: 'yup';/);
  })
  .run(`node ../bin/index.js ${source} -d ${destination} -a ${assetDirectory}`)
  .end(t.end);
});

test.cb('should ignore assets when specified', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const assetDirectory = path.resolve(__dirname, 'fixtures', 'template');
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    t.throws(() => {
      read(path.resolve(destination, 'index.js'));
    });
  })
  .run(`node ../bin/index.js ${source} -d ${destination} -a ${assetDirectory} -i index.js`)
  .end(t.end);
});

test.cb('should ignore absolute assets when specified', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const assetDirectory = path.resolve(__dirname, 'fixtures', 'template');
  const ignore = path.resolve(assetDirectory, 'index.js');
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    t.throws(() => {
      read(path.resolve(destination, 'index.js'));
    });
  })
  .run(`node ../bin/index.js ${source} -d ${destination} -a ${assetDirectory} -i ${ignore}`)
  .end(t.end);
});

test.cb('should ignore all assets when asset directory is false', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const assetDirectory = 'false';
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    t.throws(() => {
      read(path.resolve(destination, 'index.js'));
    });
  })
  .run(`node ../bin/index.js ${source} -d ${destination} -a ${assetDirectory} -i index.js`)
  .end(t.end);
});

test.cb('should not clobber docs when flag is not included', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const newFile = path.resolve(destination, 'delete-me.js');
  fs.ensureFileSync(newFile);
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    t.is(read(newFile), '');
  })
  .run(`node ../bin/index.js ${source}  -d ${destination}`)
  .end(t.end);
});

test.cb('should clobber docs when flag is included', t => {
  const destination = path.resolve(baseDestination, randomstring.generate());
  const newFile = path.resolve(destination, 'delete-me.js');
  fs.ensureFileSync(newFile);
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  nixt()
  .cwd(path.resolve(__dirname))
  .expect(() => {
    t.throws(() => {
      read(newFile);
    });
  })
  .run(`node ../bin/index.js ${source}  -d ${destination} -c`)
  .end(t.end);
});

test.cb('should output json stdout upon request', t => {
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const expected = JSON.parse(read(path.resolve(__dirname, 'expected', 'button.topdoc.json')));
  nixt()
  .cwd(path.resolve(__dirname))
  .expect((results) => {
    const result = JSON.parse(results.stdout);
    delete result.source;
    t.deepEqual(result, expected);
  })
  .run(`node ../bin/index.js ${source} -s`)
  .end(t.end);
});
