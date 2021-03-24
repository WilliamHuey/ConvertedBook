const childProcess = require('child_process'),
  path = require('path'),
  { spawn } = childProcess;

const textExtWithDot = '.tex',
  html5ExtWithDot = '.html5';

const extGroupAllowChange = [textExtWithDot, html5ExtWithDot];

const hasExtInGroup = (filePath) => {
  let validFileChange = false;
  extGroupAllowChange.forEach(function(extPath) {
    const lastCharIndex = filePath.length - 1,
    extIndex = filePath.lastIndexOf(extPath),
    fileChange = (lastCharIndex - extPath.length + 1) ===
      extIndex;
    validFileChange = fileChange ? true : false;
  })
  return validFileChange
}

module.exports = function (_snowpackConfig, _pluginOptions) {
  return {
    name: 'latex',
    load() { },
    resolve: { input: [textExtWithDot], output: ['.html'] },
    onChange: ({ filePath }) => {
      const acceptedFileChange = hasExtInGroup(filePath);

      // Only allow changes from .tex and template files to be made or else html
      // and otherunrelated changes will get pick up causing an endless loop
      if (!acceptedFileChange) return;

      const cwd = process.cwd();

      const ls = spawn('convertedbook',
        ['build', 'html', '-i',
          path.join(cwd, '/content/index.tex'), '-o',
          path.join(cwd, '/index.html')]);

      ls.stdout.on('error', (error) => {
        console.log(error);
      });
    }
  };
};