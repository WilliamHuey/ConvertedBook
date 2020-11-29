// Native modules
const path = require('path');

// Third party modules
import { mkdir } from '@rxnode/fs';

class ProjectPackageJson {
  constructor() {
    Object.assign(this, {
      "name": '<from cli input name>',
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "author": "",
      "license": "ISC",
      "dependencies": {
        "snowpack": "^2.17.1"
      }
    });
  }
}

export function generatePackageJson() {
  const executionPath = process.cwd();

  // Create project folder
  mkdir(path.join(executionPath, '/', 'folder'))

    .subscribe({
      next: () => {
        console.log('Finished creating folder')
      },
      error: (e: any) => {
        console.log(`Error: Did not create folder as it already exists`);
      }
    });


  // Create package.json
}