// Library modules
import { typeCheck, stringTypes } from '@utilities/type-check';
import Build from '../../commands/build';
import { BuildCheckGoodResults, CommandFlagKeys } from './build-checks';
import { AsyncCheckResults, FileOutputExistence } from './build-cli-input-async-checks';
import { truncateFilePath } from './build-utilities';
import { pandocGenerated } from './build-generate-pandoc';
import { puppeteerGenerated } from './build-generate-puppeteer';

export interface BuildGenerate {
  input: string;
  normalizedFormats: string[];
  flags: CommandFlagKeys;
  fileOutputExistence: FileOutputExistence;
  checkFromServerCli: boolean;
  normalizedOutputPath: string;
}

export function buildGenerate(results: BuildCheckGoodResults, asyncResults: AsyncCheckResults): any
export function buildGenerate(this: Build,
  results: BuildCheckGoodResults, asyncResults: AsyncCheckResults) {
  const { conditions, fromServerCli, exactPdf } = results,
    { input, output: outputPath } = conditions.flags,
    { normalizedFormats, flags } = conditions,
    { truncateOutput, outputFilename, fileOutputExistence } = asyncResults,
    normalizedOutputPath = truncateOutput ?
      `${truncateFilePath(outputPath).filePathFolder}/${outputFilename}` :
      `${outputPath}${outputFilename}`;

  const checkFromServerCli = typeCheck(fromServerCli, stringTypes.Undefined) ?
    false : true;

  if (exactPdf) {
    // TODO: Run the 'puppeteer' build for the exact pdf generation
    puppeteerGenerated({
      input,
      normalizedFormats,
      flags,
      fileOutputExistence,
      checkFromServerCli,
      normalizedOutputPath
    });
  }

  // TODO: check for other format types ahead of time

  // Generally run the pandoc generation when converting any file type,
  // except for when an 'exact' pdf is requested to mirror the look of
  // of the html.

  // Allow pandoc to convert to other file formats when they are specified,
  // even when the exactpdf option is present because conversion shouldn't
  // be limited by the exactpdf options for other file formats.

  // TODO: (exactpdf and other file formats present) || !exactpdf
  return pandocGenerated({
    input,
    normalizedFormats,
    flags,
    fileOutputExistence,
    checkFromServerCli,
    normalizedOutputPath
  });
}
