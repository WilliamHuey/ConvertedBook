// Third party modules
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { isUndefined } from 'is-what';

// Library modules
import Build from '../../commands/build';
import { BuildCheckGoodResults } from './build-checks';
import { AsyncCheckResults } from './build-cli-input-async-checks';
import { truncateFilePath } from './build-utilities';
import { pandocGenerateFormat } from './build-generate-pandoc';

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
      return pandocGenerateFormat(input, normalizedOutputPath, format, fileOutputExistence, flags, checkFromServerCli);
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
