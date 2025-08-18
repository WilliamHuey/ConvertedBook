// Third party module
import { firstValueFrom } from 'rxjs';
import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import { deleteAsync } from 'del';

// Native modules
import * as fs from 'fs/promises';

// Library modules
import build from '../../src/commands/build.js';
import generate from '../../src/commands/generate.js';
import { baseTempFolder } from '../commands/test-utilities.js';

// Command line usage:
// convertedbook generate my_project --npm-project-name=my_project_name
const npmProjectName = 'my_project_name';

const baseTempDownloadFolder = `${baseTempFolder}downloads/build/`;

beforeAll(async () => {

  // Ensure directories are available before running the tests
  fs.mkdir(`${baseTempDownloadFolder}`, { recursive: true });
});

// Remove generated content during the tests
afterAll(async () => {
  console.log("Clean up - Deleting generated folders", baseTempDownloadFolder);
  await deleteAsync([`${baseTempDownloadFolder}*`], { force: true });
});

describe('Actual download npm modules and build', async () => {

  // Folder paths for generation tests
  const generationPathProjectGenerate = `${baseTempDownloadFolder}project-generate-and-build`;

  // Most of the test below will run sequentially because
  // the test cases will take turns using the generated project folder.
  // It take time to decent amount of time to download npm modules
  test('only pdf build command without other inputs', async () => {
    const fileFolderPath = `${generationPathProjectGenerate}-pdf`;
    const { projectFolderWithContents$ } = await generate.run([fileFolderPath, '--npm-project-name', npmProjectName])
    await firstValueFrom(projectFolderWithContents$);
    process.chdir(fileFolderPath);
    const buildPdf = await build.run(['pdf']);
    const { docsGenerated$ } = buildPdf;
    const docGenResults = await firstValueFrom(docsGenerated$);

    expect(docGenResults)
      .contain('Created following: pdf');
  });

  test('only epub build command without other inputs', async () => {
    const fileFolderPath = `${generationPathProjectGenerate}-epub`;
    const { projectFolderWithContents$ } = await generate.run([fileFolderPath, '--npm-project-name', npmProjectName])
    await firstValueFrom(projectFolderWithContents$);
    process.chdir(fileFolderPath);
    const buildEpub = await build.run(['epub']);
    const { docsGenerated$ } = buildEpub;
    const docGenResults = await firstValueFrom(docsGenerated$);

    expect(docGenResults)
      .contain('Created following: epub');
  });

  test('only html build command without other inputs', async () => {
    const fileFolderPath = `${generationPathProjectGenerate}-html`;
    const { projectFolderWithContents$ } = await generate.run([fileFolderPath, '--npm-project-name', npmProjectName])
    await firstValueFrom(projectFolderWithContents$);
    process.chdir(fileFolderPath);
    const buildHtml = await build.run(['html']);
    const { docsGenerated$ } = buildHtml;
    const docGenResults = await firstValueFrom(docsGenerated$);

    expect(docGenResults)
      .contain('Created following: html');
  });

  test('html build command with incorrect paths should error out', async () => {
    const fileFolderPath = `${generationPathProjectGenerate}-html-incorrect-inputs`;
    const { projectFolderWithContents$ } = await generate.run([fileFolderPath, '--npm-project-name', npmProjectName])
    await firstValueFrom(projectFolderWithContents$);
    process.chdir(fileFolderPath);
    const buildEpub = await build.run(['html', '--input', 'invalid']);
    const { asyncResultsLog$ } = buildEpub;
    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: Invalid input file');
  });

  test('html build command with no output path should be respected', async () => {
    const fileFolderPath = `${generationPathProjectGenerate}-html-no-output-path`;
    const { projectFolderWithContents$ } = await generate.run([fileFolderPath, '--npm-project-name', npmProjectName])
    await firstValueFrom(projectFolderWithContents$);
    process.chdir(fileFolderPath);
    const buildHtml = await build.run([
      'html',
      '--input=',
      './src/index.tex',
      '--force'
    ]);
    const { asyncResultsLog$ } = buildHtml;
    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: Invalid input file');
  });

  test('output path should be respected if provided', async () => {
    const fileFolderPath = `${generationPathProjectGenerate}-html-output-path-respected`;
    const { projectFolderWithContents$ } = await generate.run([fileFolderPath, '--npm-project-name', npmProjectName])
    await firstValueFrom(projectFolderWithContents$);
    process.chdir(fileFolderPath);
    const buildHtml = await build.run([
      'html',
      '--input=',
      './src/index.tex',
      '--output',
      './different-output.html'
    ]);
    const { asyncResultsLog$ } = buildHtml;
    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: Invalid input file');
  });

});