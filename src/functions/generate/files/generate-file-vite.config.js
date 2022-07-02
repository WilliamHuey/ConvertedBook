import { defineConfig } from "vite";

const childProcess = require('child_process'),
  { spawn } = childProcess,
  path = require('path');

const cwd = process.cwd();

const convertLatexToHtml = () => {
  const covertedBookBuild = spawn('convertedbook', [
    'build',
    'html',
    '-i',
    path.join(cwd, './src/index.tex'),
    '-o',
    path.join(cwd, './index.html'),
    '--p',
    process.argv[2]
  ]);

  covertedBookBuild.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  covertedBookBuild.stderr.on('data', (data) => {
    console.log(`${data}`);
  });
}

export default defineConfig({
  base: "./",
  plugins: [
    (() => ({
      name: 'configure-server',
      configureServer() {
        spawn('npx', [
          'linaria', '-o', 'build/', '-r', './src/', './src/styles/project.js'
        ]);
        convertLatexToHtml();
      }
    }))(),
    (() => ({
      name: 'handle-hot-update',
      handleHotUpdate({ file }) {
        if (file.endsWith(".tex") || file.endsWith(".html5")) {
          convertLatexToHtml();
        }
      }
    }))()
  ]
})