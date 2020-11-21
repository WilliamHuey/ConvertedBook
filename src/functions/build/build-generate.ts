// Native modules
import { spawn } from 'child_process';

// Third party modules
import { bindCallback } from 'rxjs';

// Library modules
import Build from '../../commands/build';
import { BuildCheckGoodResults } from './build-checks';
import { AsyncCheckResults, truncateFilePath } from './build-cli-input-async-checks';

export function buildGenerate(results: BuildCheckGoodResults, asyncResults: AsyncCheckResults): any
export function buildGenerate(this: Build,
  results: BuildCheckGoodResults, asyncResults: AsyncCheckResults) {
  const { conditions } = results,
    { input, output: outputPath } = conditions.flags,
    { recognizedFormats } = conditions,
    { truncateOutput, outputFilename } = asyncResults,
    normalizedOutputPath = truncateOutput ?
      `${truncateFilePath(outputPath).filePathFolder}/${outputFilename}` :
      `${outputPath}${outputFilename}`;

  const pandocService = spawn('pandoc',
    ['-o', `${normalizedOutputPath}.html`, input]);

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
        console.log('Complete generation.');
      },
      error: (e: any) => {
        console.log('Error', e);
      }
    });

  return {
    pandocClose$
  };
}
