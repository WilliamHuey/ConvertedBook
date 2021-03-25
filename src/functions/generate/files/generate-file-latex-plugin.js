const childProcess = require('child_process'),
  path = require('path'),
  { spawn } = childProcess;

// Changes from these file types will
// allow for rebuild on the change detection
const textExtWithDot = '.tex',
  html5ExtWithDot = '.html5',
  extGroupAllowChange = [textExtWithDot, html5ExtWithDot];

const hasExtInGroup = (filePath) => {
  let validFileChangeCount = 0;
  extGroupAllowChange.forEach(function(extPath) {
    const lastCharIndex = filePath.length - 1,
    extIndex = filePath.lastIndexOf(extPath),
    fileChange = (lastCharIndex - extPath.length + 1) ===
      extIndex;
    validFileChangeCount = fileChange ?
      (validFileChangeCount + 1) : validFileChangeCount;
  });
  return validFileChangeCount;
}

module.exports = function (_snowpackConfig, _pluginOptions) {
  return {
    name: 'latex',
    load() { },
    resolve: { input: [textExtWithDot], output: ['.html'] },
    onChange: ({ filePath }) => {
      const validFileChangeCount = hasExtInGroup(filePath);

      // Only allow changes from .tex and template files to be made or else html
      // and otherunrelated changes will get pick up causing an endless loop
      if (validFileChangeCount === 0) return;

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