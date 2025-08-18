// Third party module
import { expect, test, describe, beforeAll, afterAll } from 'vitest'
import { lastValueFrom } from 'rxjs';
import { deleteAsync } from 'del';

// Native modules
import * as fs from 'fs/promises';

// Library modules
import { dryFlag, baseTempFolder } from './test-utilities.js';
const baseTempNoDownloadFolder = `${baseTempFolder}no-downloads/generate/`;
import generate from '../../src/commands/generate.js';
import { mkdir } from '../../src/utilities/rxjs-fs.js';

// Command line usage:
// convertedbook generate my_project --npm-project-name=my_project_name
const npmProjectName = 'my_project_name',
  npmProjectFlagAndName = `--npm-project-name="${npmProjectName}"`;

beforeAll(async () => {

  // Ensure directories are available before running the tests
  fs.mkdir(`${baseTempNoDownloadFolder}`, { recursive: true });
});

afterAll(async () => {
  console.log('Cleaning up files and folders');
  await deleteAsync([`${baseTempNoDownloadFolder}*`]);
});

describe('Dry Run Generation:', async () => {
  test('dry run with valid project name and npm project name', async () => {
    // convertedbook generate thing --npm-project-name="thing" --dry-run
    const { consoleLog$ } = await generate.run([`${npmProjectName}`, npmProjectFlagAndName, ...dryFlag]);

    consoleLog$
      .subscribe((res) => {
        const logMsg = res.pop()
        expect(logMsg.info).toContain('Completed project generation')
      });
  });

  test('dry run with duplicated folder', async () => {
    await lastValueFrom(mkdir(`${baseTempNoDownloadFolder}dry-duplicate-folder`));
    const { consoleErrorLog$ } = await generate.run([`${baseTempNoDownloadFolder}dry-duplicate-folder`, npmProjectFlagAndName, ...dryFlag]);

    consoleErrorLog$
      .subscribe((res) => {
        const logErrorMsg = res.pop()
        expect(logErrorMsg.error)
          .toContain('Error: Folder already exists');
      });
  });

  test('dry run forced with existing project folder name', async () => {
    await lastValueFrom(mkdir(`${baseTempNoDownloadFolder}dry-forced-duplicate-folder`));
    const genCommand = [`${baseTempNoDownloadFolder}dry-forced-duplicate-folder`, npmProjectFlagAndName, ...dryFlag, '--force'];
    const { consoleLog$ } = await generate.run(genCommand);
    consoleLog$
      .subscribe((res) => {
        const logErrorMsg = res.pop()
        expect(logErrorMsg.info)
          .toContain('Completed project generation');
      });
  });

  // dry-run and force flag with non-existing folder
  test('dry run forced with valid project name and npm project name', async () => {
    const genCommand = [ `${baseTempNoDownloadFolder}dry-forced-folder`, npmProjectFlagAndName, ...dryFlag, '--force'];
    const { consoleLog$ } = await generate.run(genCommand);

    consoleLog$
      .subscribe((res) => {
        const logErrorMsg = res.pop()
        expect(logErrorMsg.info)
          .toContain('Completed project generation');
      });
  });
});

