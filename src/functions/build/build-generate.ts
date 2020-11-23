// Native modules
import { spawn } from 'child_process';

// Third party modules
import { bindCallback, forkJoin } from 'rxjs';

// Library modules
import Build from '../../commands/build';
import { BuildCheckGoodResults } from './build-checks';
import { AsyncCheckResults } from './build-cli-input-async-checks';
import { truncateFilePath } from './build-utilities';

function generateFormat(input: string,
  normalizedOutputPath: string,
  format: string) {
  const pandocService = spawn('pandoc',
    ['-o', `${normalizedOutputPath}.${format}`, input]);

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
      },
      error: (e: any) => {
        console.log('Error', e);
      }
    });

  return pandocClose$;
}

export function buildGenerate(results: BuildCheckGoodResults, asyncResults: AsyncCheckResults): any
export function buildGenerate(this: Build,
  results: BuildCheckGoodResults, asyncResults: AsyncCheckResults) {
  const { conditions } = results,
    { input, output: outputPath } = conditions.flags,
    { recognizedFormats } = conditions,
    { truncateOutput, outputFilename, outputFileExist$ } = asyncResults,
    normalizedOutputPath = truncateOutput ?
      `${truncateFilePath(outputPath).filePathFolder}/${outputFilename}` :
      `${outputPath}${outputFilename}`;

  outputFileExist$
    .subscribe((outputFileExist) => {
      console.log(`Output file already exists: ${outputFilename}`)
    });

  const generated = recognizedFormats
    .map(format => {
      return generateFormat(input, normalizedOutputPath, format);
    })
    .map(pandocClose$ => {
      return pandocClose$;
    });

  // Treat the inpout file types as a group even though
  // one might only be present for easier processing
  const groupFormatsGenerated$ = forkJoin(generated);
  groupFormatsGenerated$
    .subscribe(() => {
      console.log('Complete file format generation');
    });

  return {
    pandocClose$: groupFormatsGenerated$
  };
}
