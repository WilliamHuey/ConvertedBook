// Vendor modules
import { spawn } from "child_process";

// Native modules
import * as path from 'path';

const cwd = process.cwd();

const convertLatexToHtml = ({ localhostPort }) => {
  spawn('npx', [
    'linaria', '-o', 'build/', '-r', './src/', './src/styles/project.js'
  ]);

  const convertedBookBuild = spawn('convertedbook', [
    'build',
    'html',
    '-i',
    path.join(cwd, './src/index.tex'),
    '-o',
    path.join(cwd, './index.html'),
    '-p',
    true,
    '--port',
    localhostPort
  ]);

  convertedBookBuild.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  convertedBookBuild.stderr.on('data', (data) => {
    console.log(`Error: ${data}`);
  });

  return convertedBookBuild;
};

export default convertLatexToHtml;