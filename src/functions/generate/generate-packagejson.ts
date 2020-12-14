// Native modules
const path = require('path');

// Third party modules
import { concat } from 'rxjs';
import { share } from 'rxjs/operators';
import { mkdir, writeFile } from '@rxnode/fs';

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

  console.log("🚀 ~ file: generate-packagejson.ts ~ line 33 ~ generatePackageJson ~ options", options)
  const executionPath = process.cwd();

  // Create project folder
  const createProjectFolder$ = mkdir(path.join(executionPath,
    '/', 'folder'))
    .pipe(share());
  const createPackageJSON$ = writeFile(path.join(executionPath,
    '/', 'folder', '/', 'package.json'),
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
        console.log('Create project folder');
      }
    });

  return generatePackageJSON$;
}