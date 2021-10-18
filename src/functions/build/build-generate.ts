// Third party modules
import { isUndefined } from 'is-what';

// Library modules
import Build from '../../commands/build';
import { BuildCheckGoodResults } from './build-checks';
import { AsyncCheckResults } from './build-cli-input-async-checks';
import { truncateFilePath } from './build-utilities';
import { pandocGenerated } from './build-generate-pandoc';

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

  return pandocGenerated({
    input,
    normalizedFormats,
    flags,
    fileOutputExistence,
    checkFromServerCli,
    normalizedOutputPath
  });
}
