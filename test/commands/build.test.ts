// Third party module
import { firstValueFrom } from "rxjs";
import { expect, test, describe, beforeAll, afterAll } from "vitest";
import { deleteAsync } from 'del';

// Native modules
import * as path from 'path';
import * as fs from 'fs/promises';

// Library modules
import build from '../../src/commands/build.js';
import serve from '../../src/commands/serve.js';
import {
  supposedFileName,
  getFileNameFromParts,
  truncateFilePath
} from '../../src/functions/build/build-utilities.js';
import { baseTempFolder, dryFlag, testDataDirectory } from './test-utilities.js';
import { currDir } from "../../src/utilities/filesystem.js"

const __dirname = currDir(import.meta.url);
const baseTempNoDownloadFolder = `${baseTempFolder}no-downloads/build/`;

beforeAll(async () => {

  // Ensure directories are available before running the tests
  fs.mkdir(`${baseTempNoDownloadFolder}/project`, { recursive: true });
});

afterAll(async () => {

  // Have to change back into the temp/ folder for proper deleting
  process.chdir(baseTempFolder);
  await deleteAsync([
    `${baseTempNoDownloadFolder}project/*`,
    `${testDataDirectory}*.html`
  ], { force: true });
});

describe('Build: Filename Output:', async () => {

  test('file name checks with "supposed file name', () => {
    const results = supposedFileName('/a/path/stuff.js');
    expect(results).toContain('stuff')
    expect(results).toContain('js')
  })

  test('file name checks with "get file name from parts"', () => {
    const results = supposedFileName('/a/path/stuff.js');
    const firstItem = getFileNameFromParts(results);
    expect(firstItem).toContain('stuff');
  });

  test('file name checks with "truncate file path"', () => {
    const results = truncateFilePath('/a/path/stuff.js');
    expect(results.filePathSplit).toEqual(
      expect.arrayContaining([
        'stuff.js'
      ])
    );
    expect(results.filePathFolder).toContain('/a/path');
  });
});

describe('Server - Content-type check:', async () => {

  test('static server serves found html content', async () => {
    const serveRun$ = await serve.run([]);
    serveRun$
      .subscribe({
        next: (serveProcess: any) => {
          expect(serveProcess
            .includes('Error: Did not find the "server.js" file')).toBe(true);
        }
      });
  });
});

describe('Build: Project Folder', async () => {

  test('runs build pdf and html command with minimum flags', async () => {
    const { docsGenerated$ } = await build.run([
      'pdf',
      'html',
      '--input',
      path.join(__dirname, '../fixtures/io/input.tex'),
      '--output',
      path.join(__dirname, '../temp/no-downloads/build/project/pdf-html-min-output.pdf'),
    ]);

    const docGenResults = await firstValueFrom(docsGenerated$);

    expect(docGenResults)
      .contain('Created following: pdf and html');
  });

  test('runs build html command with no required flags', async () => {
    const { consoleWarningLog$ } = await build.run([
      'html'
    ]);

    const docGenResults = await firstValueFrom(consoleWarningLog$);

    expect(docGenResults[0].warning)
      .contain('Warning: Output file option is missing. The output is defaulted to the same folder level as the source file');
  });

  test('runs build html command only output flag', async () => {
    const fixtureIoFolder = `${baseTempFolder}../fixtures/io`
    process.chdir(fixtureIoFolder)

    const { asyncResultsLog$ } = await build.run([
      'html',
      '--output',
      path.join(__dirname, '../../test/temp/no-downloads/build/project/missing-input-html.html'),
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: Missing a required "--input" or "--output"');
  });

  test('runs build pdf command with html output flag', async () => {
    const fixtureIoFolder = `${baseTempFolder}../fixtures/io`
    process.chdir(fixtureIoFolder)

    const { asyncResultsLog$, docsGenerated$ } = await build.run([
      'pdf',
      '--input',
      path.join(__dirname, '../fixtures/io/input.tex'),
      '--output',
      path.join(__dirname, '../../test/temp/no-downloads/build/project/fasdfasd.html'),
    ]);

    const asyncLogs = await firstValueFrom(asyncResultsLog$);
    await firstValueFrom(docsGenerated$);

    expect(asyncLogs.msg)
      .contain('Creating output file');
  });

  test('runs build html command without output flag and exact flag', async () => {
    const { docsGenerated$ } = await build.run([
      'html',
      '--input',
      path.join(__dirname, '../fixtures/io/input.tex'),
      '--exact'
    ]);

    const docGenResults = await firstValueFrom(docsGenerated$);

    expect(docGenResults)
      .contain('Created following: html');

  });

  test('runs build pdf command with exact flag. Will ignore the exact flag.', async () => {
    const { asyncResultsLog$, docsGenerated$ } = await build.run([
      'pdf',
      '--input',
      path.join(__dirname, '../fixtures/io/input.tex'),
      '--output',
      path.join(__dirname, '../temp/no-downloads/build/project/pdf-exact-output.pdf'),
      '--exact'
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);
    await firstValueFrom(docsGenerated$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });

  test('runs build pdf command with force flags', async () => {
    const { asyncResultsLog$, docsGenerated$ } = await build.run([
      'pdf',
      '--input',
      path.join(__dirname, '../fixtures/io/input.tex'),
      '--output',
      path.join(__dirname, '../temp/no-downloads/build/project/exact-force-output.pdf'),
      '--force'
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);
    await firstValueFrom(docsGenerated$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });
});


describe('One-Off Dry Runs - Not in Project folder:', async () => {
  const invalidInputFlag = `${testDataDirectory}zz`;
  const invalidOutputFlag = `${testDataDirectory}fasdfds/sdafs`;
  const validInputFlag = `${testDataDirectory}input.tex`;
  const validOutputFlag = `${testDataDirectory}`;
  const dryFlagStr = dryFlag.join("");

  test('dry run with valid input and valid output flag', async () => {

    // Any kind of command line input can be used to test this case.
    // Wish to see the different cli apps are available in the path.
    const { consoleLog$ } = await build.run([
      "html",
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);

    const consoleResults = await firstValueFrom(consoleLog$);
    expect(consoleResults[0].info)
      .contain('Info: Dry run option provided. No actual files were generated');
  });

  test('dry run with valid input and invalid output flag', async () => {
    const { asyncResultsLog$ } = await build.run([
      "html",
      '--input',
      validInputFlag,
      '--output',
      invalidOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: Invalid output folder/file');
  });

  test('dry run with invalid input and valid output flag', async () => {
    const { asyncResultsLog$, consoleLog$, consoleWarningLog$, consoleErrorLog$, docsGenerated$ } = await build.run([
      'html',
      '--input',
      invalidInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: Invalid input file');
  });

  test('dry run with invalid input and invalid output flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'html',
      '--input',
      invalidInputFlag,
      '--output',
      invalidOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: Invalid input file and invalid output folder/file');
  });

  test('dry run with valid input and output flags', async () => {
    const { asyncResultsLog$, docsGenerated$ } = await build.run([
      'html',
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });

  test('dry run with pdf format and valid flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'pdf',
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });

  test('dry run with epub format and valid flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'epub',
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });

  test('dry run with epub and html formats and valid flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'epub',
      'html',
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });

  test('dry run with html, pdf, and epub formats and valid flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'html',
      'pdf',
      'epub',
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });

  test('dry run with multiple invalid formats and valid flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'sdaf',
      'mf',
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);
    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Did not build as there are no valid formats');
  });

  test('dry run with valid and invalid formats with valid flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'sdaf',
      'pdf',
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });

  test('dry run with no formats specified, defaults to all formats and with valid flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });

  test('dry run with no formats and empty args flag and valid input', async () => {
    const { asyncResultsLog$ } = await build.run([
      '--input',
      validInputFlag,
      dryFlagStr
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: Did not build as there are no valid formats:');

  });

  test('dry run with unknown format and valid input', async () => {
    const { asyncResultsLog$, consoleWarningLog$ } = await build.run([
      'html',
      'fasd',
      dryFlagStr,
      '--input',
      validInputFlag,
      '--output',
      validOutputFlag,
    ]);

    const consoleResults = await firstValueFrom(consoleWarningLog$);
    expect(consoleResults[0].warning)
      .contain('Ignoring unknown formats');

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Creating output file');
  });

  test('with all invalid formats and no flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'sdaf',
      'mf'
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: No required flags found (--input, --output');
  });

  test('with no formats and empty args flag', async () => {
    const { asyncResultsLog$ } = await build.run([]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: No required flags found (--input, --output');
  });

  test('with only invalid formats and no flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'nsdfa',
      'ce'
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: No required flags found (--input, --output');
  });

  test('with pdf format and no flags', async () => {
    const { asyncResultsLog$ } = await build.run([
      'pdf'
    ]);

    const docGenResults = await firstValueFrom(asyncResultsLog$);

    expect(docGenResults.msg)
      .contain('Build failed: No required flags found (--input, --output');
  });

});