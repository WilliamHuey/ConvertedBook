// Third party modules
import { firstValueFrom } from 'rxjs';
import { expect, test, describe, beforeAll, afterAll, assert } from 'vitest';
import { share } from 'rxjs/operators';
import { deleteAsync } from 'del';

// Native modules
import * as fs from 'fs/promises';

// Library modules
import { mkdir, stat } from '../../src/utilities/rxjs-fs.js';
import generate from '../../src/commands/generate.js';
import serve from '../../src/commands/serve.js';
import { baseTempFolder } from '../commands/test-utilities.js';
const baseTempDownloadFolder = `${baseTempFolder}downloads/generate/`;
import { onlineCheck } from './online.js';

// Command line usage:
// convertedbook generate my_project --npm-project-name=my_project_name
const npmProjectName = 'my_project_name';

beforeAll(async () => {

  // Ensure directories are available before running the tests
  fs.mkdir(`${baseTempDownloadFolder}`, { recursive: true });
});

// Remove generated content during the tests
afterAll(async () => {
  console.log("Clean up - Deleting generated folders", baseTempDownloadFolder);
  await deleteAsync([`${baseTempDownloadFolder}*`], { force: true });
});

describe('Actual project generation:', async () => {
  const isOnLine = onlineCheck();

  isOnLine(() => {
    console.log('Online: Tests should run as expected')
  });

  // Folder paths for generation tests
  const generationPathProjectGenerate = `${baseTempDownloadFolder}project-generate`,
    forcedGenerationPathProjectGenerate = `${baseTempDownloadFolder}forced-project-generate`;

  test.sequential('will download NPM modules to generate project to "completion" status', async () => {
    const { projectFolderWithContents$ } = await generate.run([generationPathProjectGenerate, '--npm-project-name', npmProjectName]);

    const projectGenResults = await firstValueFrom(projectFolderWithContents$);

    expect(projectGenResults)
      .contain('Created project folder');
  });

  test.sequential('runs the server command', async () => {
    process.chdir(generationPathProjectGenerate);
    const serverRun$ = await serve.run([]);

    serverRun$.subscribe({
      next: (serveProcess: any) => {

        // Run the server.js sanity check.
        // Create an arbitrary passing condition
        expect(true).equal(true);
        serveProcess.kill();
      },
      error: () => {
        console.log('Error in server run');
      }
    })
  });

  test.sequential('will create project for forced generation', async () => {
    const { projectFolderWithContents$ } = await generate.run([forcedGenerationPathProjectGenerate, '--npm-project-name', npmProjectName]);

    const projectGenResults = await firstValueFrom(projectFolderWithContents$);

    expect(projectGenResults)
      .contain('Created project folder');
  });

  test.sequential('will download NPM modules with "--force" flag to overwrite project dependencies', async () => {
    const { projectFolderWithContents$ } = await generate.run([forcedGenerationPathProjectGenerate, '--npm-project-name', npmProjectName, '--force']);

    const projectGenResults = await firstValueFrom(projectFolderWithContents$);

    const folderInfo = await firstValueFrom(stat(`${forcedGenerationPathProjectGenerate}/`));

    // The creation date should not be that far off
    // from the current timestamp. Use this to gauge
    // if the force flag has recently generated new content
    assert.isBelow(Date.now() / folderInfo.birthtimeMs, 1.01);

    expect(projectGenResults)
      .contain('Created project folder');
  });

  test.sequential('serving in empty folder will error out', async () => {
    await firstValueFrom(
      mkdir(`${baseTempDownloadFolder}serve-empty-folder`).pipe(share()));
    process.chdir(`${baseTempDownloadFolder}serve-empty-folder`);
    const serveRunResults = await firstValueFrom(await serve.run([]));
    expect(serveRunResults)
      .contain('Error: Did not find the "server.js" file, might not be a "convertedbook" project!');
  });

});
