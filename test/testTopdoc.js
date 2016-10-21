import test from 'ava';
import path from 'path';
import fs from 'fs-extra';
import nixt from 'nixt';
import randomstring from 'randomstring';

const baseDestination = path.resolve(__dirname, 'docs');
let destination;

function read(filepath) {
  return fs.readFileSync(filepath, 'utf-8');
}

test.beforeEach(() => {
  destination = path.resolve(baseDestination, randomstring.generate());
});

test.after.always(() => {
  fs.removeSync(baseDestination);
});

test.cb('should error out if pattern doesn\'t match', t => {
  fs.ensureDirSync(destination);
  nixt()
  .expect((result) => {
    t.regex(result.stderr, /Error: No files match 'nothing\.css'/);
  })
  .run('topdoc nothing.css')
  .end(t.end);
});

test.cb('should write basic docs from single file', t => {
  const newDestination = baseDestination;
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const expected = read(path.resolve(__dirname, 'expected', 'button.index.html'));
  nixt()
  .expect(() => {
    const docFile = read(path.resolve(newDestination, 'index.html'));
    t.is(docFile.trim(), expected.trim());
  })
  .run(`topdoc ${source}`)
  .end(t.end);
});

test.cb('should accept new destination location', t => {
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  const expected = read(path.resolve(__dirname, 'expected', 'button.index.html'));
  nixt()
  .expect(() => {
    const docFile = read(path.resolve(destination, 'index.html'));
    t.is(docFile.trim(), expected.trim());
  })
  .run(`topdoc -d ${destination} ${source}`)
  .end(t.end);
});

test.cb('should allow for a project title', t => {
  const source = path.resolve(__dirname, 'fixtures', 'button.css');
  nixt()
  .expect(() => {
    const docFile = read(path.resolve(destination, 'index.html'));
    console.log(docFile);
    // t.is(docFile.trim());
  })
  .run(`topdoc -p='lalala' ${source}`)
  .end(t.end);
});

// (function() {
//   "use strict";
//   var Topdoc, deleteFolderRecursive, fs, path, read;
//   Topdoc = require('../lib/topdoc');
//   path = require('path');
//
//   read = fs.readFileSync;
//
//   describe('Topdoc', function() {
//     before(function() {
//       this.srcDir = path.join('test', 'cases', 'simple');
//       this.outputDir = path.join('test', 'docs');
//     });
//     after(function() {
//       if (fs.existsSync(this.outputDir)) {
//         return fs.removeSync(this.outputDir);
//       }
//     });
//     it('exists', function() {
//       var topdoc;
//       Topdoc.should.be.ok;
//       topdoc = new Topdoc({source: this.srcDir});
//       topdoc.should.be.instanceOf(Topdoc);
//     });
//     it('should accept a source in the constructor', function() {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir
//       });
//       topdoc.source.should.equal(this.srcDir);
//     });
//     it('should accept a destination in the constructor', function() {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: this.outputDir
//       });
//       topdoc.destination.should.equal(this.outputDir);
//     });
//     it('should accept a project title', function() {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: this.outputDir,
//         templateData: {
//           title: 'awesomeness'
//         }
//       });
//       topdoc.projectTitle.should.equal('Awesomeness');
//     });
//     it('should pass data through to the template', function() {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: this.outputDir,
//         templateData: {
//           title: 'awesomeness'
//         }
//       });
//       JSON.stringify(topdoc.templateData, null, 2).should.equal
//         (JSON.stringify({title: 'awesomeness'}, null, 2));
//     });
//     it('should find all the css files in a directory', function() {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: this.outputDir
//       });
//       topdoc.files[0].should.equal('test/cases/simple/button.css');
//     });
//     it('should ignore .min.css files in directory', function() {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: this.outputDir
//       });
//       topdoc.files.length.should.equal(2);
//     });
//     it('should generate an index.html', function(done) {
//       var generatedDoc, topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: this.outputDir
//       });
//       topdoc.generate((function(){
//         generatedDoc = read(path.join('test', 'docs', 'index.html'), 'utf8');
//         generatedDoc.should.be.ok;
//         done();
//       }).bind(done));
//     });
//     it('should use npm installed template', function(done) {
//       var generatedDoc, topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: 'fulldocs/',
//         template: path.join("node_modules", "topdoc-theme"),
//         templateData: {
//           title: "Topcoat",
//           subtitle: "CSS for clean and fast web apps",
//           download: {
//             url: "#",
//             label: "Download version 0.4"
//             },
//           homeURL: "http://topcoat.io",
//           siteNav: [
//             {
//               url: "http://www.garthdb.com",
//               text: "Usage Guidelines"
//             },
//             {
//               url: "http://bench.topcoat.io/",
//               text: "Benchmarks"
//             },
//             {
//               url: "http://topcoat.io/blog",
//               text: "Blog"
//             }
//           ]
//         }
//       });
//       topdoc.generate(function(){
//         generatedDoc = read(path.join('fulldocs', 'index.html'), 'utf8');
//         generatedDoc.should.be.ok;
//         if(fs.existsSync('fulldocs')){
//           fs.removeSync('fulldocs');
//         }
//         done();
//       });
//     });
//     it('should not overwrite an existing README.md file', function(done) {
//       var generatedDoc, topdoc;
//       fs.createFileSync(path.join('fulldocs','README.md'));
//       fs.writeFileSync(path.join('fulldocs','README.md'), 'original readme');
//       // read(path.join('test', 'docs', 'index.html'), 'utf8');
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: 'fulldocs/',
//         template: path.join("node_modules", "topdoc-theme"),
//         templateData: {
//           title: "Topcoat",
//           subtitle: "CSS for clean and fast web apps",
//           download: {
//             url: "#",
//             label: "Download version 0.4"
//             },
//           homeURL: "http://topcoat.io",
//           siteNav: [
//             {
//               url: "http://www.garthdb.com",
//               text: "Usage Guidelines"
//             },
//             {
//               url: "http://bench.topcoat.io/",
//               text: "Benchmarks"
//             },
//             {
//               url: "http://topcoat.io/blog",
//               text: "Blog"
//             }
//           ]
//         }
//       });
//       topdoc.generate(function(){
//
//         var expectedReadme = read(path.join('fulldocs','README.md'), 'utf8');
//         expectedReadme.should.equal('original readme');
//
//         if(fs.existsSync('fulldocs')){
//           fs.removeSync('fulldocs');
//         }
//         done();
//       });
//     });
//     it('should duplicate all the contents of the template folder', function(done) {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: 'fulldocs/',
//         template: path.join("node_modules", "topdoc-theme"),
//         templateData: {
//           title: "Topcoat",
//           subtitle: "CSS for clean and fast web apps",
//           download: {
//             url: "#",
//             label: "Download version 0.4"
//             },
//           homeURL: "http://topcoat.io",
//           siteNav: [
//             {
//               url: "http://www.garthdb.com",
//               text: "Usage Guidelines"
//             },
//             {
//               url: "http://bench.topcoat.io/",
//               text: "Benchmarks"
//             },
//             {
//               url: "http://topcoat.io/blog",
//               text: "Blog"
//             }
//           ]
//         }
//        });
//       topdoc.generate(function(){
//         fs.existsSync(path.join('fulldocs','css')).should.equal(true);
//         if(fs.existsSync('fulldocs')){
//           fs.removeSync('fulldocs');
//         }
//         done();
//       });
//     });
//     it('should work with defaults and no stuff', function(done) {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: 'fulldocs/',
//         template: path.join("node_modules", "topdoc-theme"),
//         templateData: {}
//        });
//       topdoc.generate(function(){
//         fs.existsSync(path.join('fulldocs','css')).should.equal(true);
//         if(fs.existsSync('fulldocs')){
//           fs.removeSync('fulldocs');
//         }
//         done();
//       });
//     });
//     it('should find all the css documents', function() {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: this.outputDir
//       });
//       topdoc.generate(function(){
//         return topdoc.files.should.be.ok;
//       });
//     });
//     it('should return an error when template is missing', function(done) {
//       var topdoc;
//       topdoc = new Topdoc({
//         source: this.srcDir,
//         destination: this.outputDir,
//         template: './'
//       });
//       try {
//         topdoc.generate(function(){
//         });
//       } catch (err) {
//         done();
//       }
//     });
//     it('should generate iframe html files', function(done){
//       var topdoc;
//       topdoc = new Topdoc({
//         source: path.join('test', 'cases', 'iframe'),
//         destination: 'fulldocs/',
//         template: path.join("node_modules", "topdoc-theme")
//       });
//       topdoc.generate((function(){
//         var caseTopdociFrame, resultiFrame;
//         caseTopdociFrame = read(path.join('test', 'cases', 'iframe',
//           'overlay.overlay.html'), 'utf8');
//         resultiFrame = read(path.join('fulldocs/', 'overlay.overlay.html'), 'utf8');
//         resultiFrame.should.equal(caseTopdociFrame);
//         if(fs.existsSync('fulldocs')){
//           fs.removeSync('fulldocs');
//         }
//         done();
//       }).bind(done));
//     });
//   });
//
// }).call(this);
