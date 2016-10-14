import pug from 'pug';
import path from 'path';
import fs from 'fs-extra';

function replaceExt(npath, ext) {
  if (typeof npath !== 'string') {
    return npath;
  }
  if (npath.length === 0) {
    return npath;
  }
  const nFileName = path.basename(npath, path.extname(npath)) + ext;
  return path.join(path.dirname(npath), nFileName);
}

function defaultTemplate(topDocument) {
  try {
    topDocument.files.forEach((file) => {
      file.filename = replaceExt(file.filename, '.html');
    });
    const content = pug.renderFile(
      path.resolve(__dirname, 'template.pug'),
      { document: topDocument }
    );
    fs.mkdirsSync(path.resolve(topDocument.destination, 'css', path.delimiter));
    const cssDestination = path.resolve(topDocument.destination, 'css', topDocument.filename);
    fs.copySync(topDocument.source, cssDestination);
    const newFileName = topDocument.first ?
      'index.html' : replaceExt(topDocument.filename, '.html');
    fs.writeFileSync(path.resolve(topDocument.destination, newFileName), content);
    console.log(path.relative(process.cwd(), path.resolve(topDocument.destination, newFileName)));
  } catch (err) {
    console.log(err);
  }
}

defaultTemplate.before = (destination) => {
  if (fs.ensureDirSync(destination)) fs.removeSync(destination);
};

export default defaultTemplate;
