// Native modules
const path = require('path');

// Third party modules
import { concat } from 'rxjs';
import { mkdir, writeFile } from '@rxnode/fs';
import Generate from '../../commands/generate';

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

export function generatePackageJson(this: Generate) {
  const executionPath = process.cwd();

  // Create project folder
  const createProjectFolder$ = mkdir(path.join(executionPath,
    '/', 'folder'));
  const createPackageJSON$ = writeFile(path.join(executionPath,
    '/', 'folder', '/', 'package.json'),
    JSON.stringify(new ProjectPackageJson(), null, 4));

  // Create package.json
  const generatePackageJSON$ = concat(
    createProjectFolder$,
    createPackageJSON$
  );

  generatePackageJSON$
    .subscribe({
      error: (e: any) => {
        console.log(`Error: Did not create folder as it already exists`, e.errno);
      },
      complete: () => {
        console.log('Complete finished creating project folder');
      }
    });


}