// Native modules
const path = require('path');

// Third party modules
import { concat } from 'rxjs';
import { share } from 'rxjs/operators';
import { mkdir, writeFile } from '@rxnode/fs';
import { isUndefined } from 'is-what';

class ProjectPackageJson {
  constructor(name: string) {
    Object.assign(this, {
      "name": name || '<from cli input name>',
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "author": "",
      "license": "ISC",
      "dependencies": {
        "snowpack": "^2.17.1"
      },
      "scripts": {
        "start": "snowpack dev"
      }
    });
  }
}

interface GenerateProjectOptions {
  folderName: string;
  flags: Record<any, any>
}

export function generateProject(options: GenerateProjectOptions) {
  const { folderName, flags } = options;
  const { 'project-name': projectName } = flags;
  const normalizedFolder = isUndefined(folderName) || folderName?.length === 0 ?
    'New Folder' : folderName;
  const executionPath = process.cwd();

  // Create project folder
  /*

  /project-name
    /config
      /latex
    /content
      /site
      package.json

  */
  const createProjectFolder$ = mkdir(path.join(executionPath,
    '/', normalizedFolder))
    .pipe(share());

  const createConfigFolder$ = mkdir(path.join(executionPath,
    '/', normalizedFolder, '/config'))
    .pipe(share());

  const createConfigLatexFolder$ = mkdir(path.join(executionPath,
    '/', normalizedFolder, '/config/latex'))
    .pipe(share());

  const createContentFolder$ = mkdir(path.join(executionPath,
    '/', normalizedFolder, '/content'))
    .pipe(share());

  const createSiteFolder$ = mkdir(path.join(executionPath,
    '/', normalizedFolder, '/content/site'))
    .pipe(share());

  const createPackageJSON$ = writeFile(path.join(executionPath,
    '/', normalizedFolder, '/content/package.json'),
    JSON.stringify(new ProjectPackageJson(projectName), null, 4))
    .pipe(share());

  // Create package.json
  const generateProject$ = concat(
    createProjectFolder$,
    createConfigFolder$,
    createConfigLatexFolder$,
    createContentFolder$,
    createSiteFolder$,
    createPackageJSON$,
  );

  createProjectFolder$
    .subscribe({
      error: (e: any) => {
        console.log(`Error: Did not create folder as it already exists`);
      }
    });

  generateProject$
    .subscribe({
      error: (e: any) => {
        // Ignore the error logging here as this is an
        // aggregate
      },
      complete: () => {
        console.log(`Create project folder: ${normalizedFolder}`);
      }
    });

  return generateProject$;
}