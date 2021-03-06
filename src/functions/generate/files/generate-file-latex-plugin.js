const childProcess = require('child_process'),
  path = require('path'),
  { spawn } = childProcess;

const textExtWithDot = '.tex';

module.exports = function (_snowpackConfig, _pluginOptions) {
  return {
    name: 'latex',
    load() { },
    resolve: { input: [textExtWithDot], output: ['.html'] },
    onChange: ({ filePath }) => {
      const lastCharIndex = filePath.length - 1,
        texExtIndex = filePath.lastIndexOf(textExtWithDot),
        texFileChange = (lastCharIndex - textExtWithDot.length + 1) ===
          texExtIndex;

      // Only allow changes from .tex file to be made or else html
      // and other changes will get pick up causing an endless loop
      if (!texFileChange) return;

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