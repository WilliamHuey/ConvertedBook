// Native modules
import { spawn } from 'child_process';

// Third party modules
import { bindCallback, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { isUndefined } from 'is-what';

// Library modules
import Build from '../../commands/build';
import { BuildCheckGoodResults } from './build-checks';
import { AsyncCheckResults, FileOutputExistence } from './build-cli-input-async-checks';
import { truncateFilePath } from './build-utilities';

// Directory for pandoc process
const baseDir = process.cwd(),
  baseContentDir = `${baseDir}/content`;

function generateFormat(input: string,
  normalizedOutputPath: string,
  format: string,
  fileOutputExistence: FileOutputExistence,
  flags: Record<string, any>,
  fromServerCli: boolean) {

  // Need to match the directory in which
  // pandoc is referring to for proper
  // inclusion of files in latex
  if (fromServerCli) process.chdir(baseContentDir);

  const pandocAdditionalOptions = flags.pandoc ?
    JSON.parse(flags.pandoc).pandoc : null;
  const pandocDefaultOptions = [`--data-dir=${baseContentDir}/config`, '--template=default.html5', input, '-o', `${normalizedOutputPath}.${format}`, '-s'];

  // Add in more options for Pandoc when specified
  const allPandocOptions = pandocAdditionalOptions ?
    [...pandocDefaultOptions, pandocAdditionalOptions] :
    pandocDefaultOptions;

  const pandocService = spawn('pandoc', allPandocOptions);

  // Convert callback into observable for the
  // 'complete' signal. The observable can also be
  // converted for use as a promise for testing.
  const pandocOnComplete$ = bindCallback(
    pandocService.stdout.on);

  const pandocClose$ = pandocOnComplete$
    .call(pandocService, 'close');

  pandocClose$
    .subscribe({
      next: () => {
        console.log(`Generated ${format}`);

        // Warn on existing file format with the name of the output path
        if (fileOutputExistence[format] && !fromServerCli)
          console.log(`Warning: ${format} file type exists`);
      },
      error: (e: any) => {
        console.log('Error', e);
      }
    });

  return {
    pandocClose$,
    pandocService
  };
}

export function buildGenerate(results: BuildCheckGoodResults, asyncResults: AsyncCheckResults): any
export function buildGenerate(this: Build,
  results: BuildCheckGoodResults, asyncResults: AsyncCheckResults) {
  const { conditions, fromServerCli } = results,
    { input, output: outputPath } = conditions.flags,
    { normalizedFormats, flags } = conditions,
    { truncateOutput, outputFilename, fileOutputExistence } = asyncResults,
    normalizedOutputPath = truncateOutput ?
      `${truncateFilePath(outputPath).filePathFolder}/${outputFilename}` :
      `${outputPath}${outputFilename}`;

  const checkFromServerCli = isUndefined(fromServerCli) ?
    false : fromServerCli;

  const generated = normalizedFormats
    .map(format => {
      return generateFormat(input, normalizedOutputPath, format, fileOutputExistence, flags, checkFromServerCli);
    });

  const pandocGen = generated.reduce((acc, el): any => {
    return {
      pandocServiceGroup: [...acc.pandocServiceGroup, el.pandocService],
      pandocCloseGroup: [...acc.pandocCloseGroup, el.pandocClose$]
    };
  }, { pandocServiceGroup: [], pandocCloseGroup: [] });

  const {
    pandocCloseGroup: pandocCloseGroup$,
    pandocServiceGroup
  } = pandocGen;

  // Treat the inpout file types as a group even though
  // one might only be present for easier processing
  const groupFormatsGenerated$ = forkJoin(pandocCloseGroup$)
    .pipe(first());

  groupFormatsGenerated$
    .subscribe(() => {
      console.log('Complete file format generation');
    });

  return {
    pandocClose$: groupFormatsGenerated$,
    pandocServiceGroup
  };
}
