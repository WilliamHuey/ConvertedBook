// Native modules
import * as path from 'path';

// Third party modules
import { ReplaySubject } from 'rxjs';
import { reject } from 'ramda';

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
  htmlCliGenerate?: boolean,
  checkFromServerCli: boolean;
  normalizedOutputPath: string;
  buildDocuments$: ReplaySubject<any>;
  docsGenerated$: ReplaySubject<any>;
  exactPdf?: boolean;
}

const pdfAndHtmlFormat = (n: string) => n === 'pdf' || n === 'html';

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
  const buildDocuments$ = new ReplaySubject(undefined);
  const docsGenerated$ = new ReplaySubject(undefined);

  const hasPdfFormat = normalizedFormats.includes('pdf'),
    hasHtmlFormat = normalizedFormats.includes('html'),
    moreThanTwoFormats = normalizedFormats.length > 2,

    // inclusive of pdf format
    hasFormatsOtherThanPdfandHtml = moreThanTwoFormats &&
      (hasHtmlFormat && hasPdfFormat);

  const playWrightPdfGeneration = exactPdf && hasPdfFormat;

  if (playWrightPdfGeneration) {

    // Use pandoc to create the html document because playwright
    // will depend on it for the exact pdf generation.

    // Manipulate the settings to only generate the html with pandoc
    pandocGenerated({
      input,
      normalizedFormats: !normalizedFormats.includes('html') ?
        [...normalizedFormats, 'html'] : normalizedFormats,
      htmlCliGenerate: normalizedFormats.includes('html'),
      flags: Object.assign(flags, { output: path.parse(flags.input).name }),
      fileOutputExistence,
      checkFromServerCli,
      normalizedOutputPath,
      buildDocuments$,
      docsGenerated$,
      exactPdf: true
    });

    // Pass in additional argument to distinguish the branch type generation
    playwrightGenerated({
      input,
      normalizedFormats,
      flags,
      fileOutputExistence,
      checkFromServerCli,
      normalizedOutputPath,
      docsGenerated$,
      buildDocuments$
    });
  }

  // Generally run the pandoc generation when converting any file type,
  // except for when an 'exact' pdf is requested to mirror the look of
  // of the html.

  // Allow pandoc to convert to other file formats when they are specified,
  // even when the exactpdf option is present because conversion shouldn't
  // be limited by the exactpdf options for other file formats.
  docsGenerated$
    .subscribe(() => {
      console.log('Complete file format generation');
    });

  if (!exactPdf) {
    return pandocGenerated({
      input,
      normalizedFormats,
      flags,
      fileOutputExistence,
      checkFromServerCli,
      normalizedOutputPath,
      buildDocuments$,
      exactPdf,
      docsGenerated$
    });
  } else {

    // Still generate all other files that was indicated for conversion
    // only pandoc will be able to create these files.
    if (hasFormatsOtherThanPdfandHtml) {
      return pandocGenerated({
        input,

        // Avoid generating the pdf and html again since its handled
        // by the first branch's pandoc generation.
        normalizedFormats: reject(pdfAndHtmlFormat, normalizedFormats),
        flags,
        fileOutputExistence,
        checkFromServerCli,
        normalizedOutputPath,
        buildDocuments$,
        docsGenerated$,
        exactPdf
      });
    } else {

      // Generation to complete before returning the document
      // generation completion status
      return docsGenerated$;
    }
  }
}