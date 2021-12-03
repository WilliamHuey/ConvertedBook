// Third party modules
import { ReplaySubject } from 'rxjs';

// Library modules
import { typeCheck, stringTypes } from '@utilities/type-check';
import Build from '../../commands/build';
import { BuildCheckGoodResults, CommandFlagKeys } from './build-checks';
import { AsyncCheckResults, FileOutputExistence } from './build-cli-input-async-checks';
import { truncateFilePath } from './build-utilities';
import { pandocGenerated } from './build-generate-pandoc';
import { playwrightGenerated } from './build-generate-playwright';

export interface BuildGenerate {
  input: string;
  normalizedFormats: string[];
  flags: CommandFlagKeys;
  fileOutputExistence: FileOutputExistence;
  checkFromServerCli: boolean;
  normalizedOutputPath: string;
  buildDocuments$: ReplaySubject<any>;
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

  // Exact pdf creation will require playwright

  // TODO: merge the output of the playwright generation with pandoc
  // as an observable for completion management. Create generatedClose$
  // observable.
  const buildDocuments$ = new ReplaySubject(undefined);

  if (exactPdf && normalizedFormats.includes('pdf')) {
    playwrightGenerated({
      input,
      normalizedFormats,
      flags,
      fileOutputExistence,
      checkFromServerCli,
      normalizedOutputPath,
      buildDocuments$
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
    normalizedOutputPath,
    buildDocuments$
  });
}
