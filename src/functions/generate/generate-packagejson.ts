// Native modules
const path = require('path');

// Third party modules
import { concat } from 'rxjs';
import { share } from 'rxjs/operators';
import { mkdir, writeFile } from '@rxnode/fs';
import { isUndefined } from 'is-what';

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

interface GeneratePackageJsonOptions {
  folderName: string;
}

export function generatePackageJson(options: GeneratePackageJsonOptions) {
  const { folderName } = options;
  const normalizedFolder = isUndefined(folderName) || folderName?.length === 0 ?
    'New Folder' : folderName;
  const executionPath = process.cwd();

  // Create project folder
  const createProjectFolder$ = mkdir(path.join(executionPath,
    '/', normalizedFolder))
    .pipe(share());
  const createPackageJSON$ = writeFile(path.join(executionPath,
    '/', normalizedFolder, '/', 'package.json'),
    JSON.stringify(new ProjectPackageJson(), null, 4))
    .pipe(share());

  // Create package.json
  const generatePackageJSON$ = concat(
    createProjectFolder$,
    createPackageJSON$
  );

  createProjectFolder$
    .subscribe({
      error: (e: any) => {
        console.log(`Error: Did not create folder as it already exists`);
      }
    });

  generatePackageJSON$
    .subscribe({
      error: (e: any) => {
        // Ignore the error logging here as this is an
        // aggregate
      },
      complete: () => {
        console.log(`Create project folder: ${normalizedFolder}`);
      }
    });

  return generatePackageJSON$;
}