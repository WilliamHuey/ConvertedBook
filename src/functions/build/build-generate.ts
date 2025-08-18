// Native modules
import * as path from 'path';
import { unlinkSync } from 'fs';

// Third party modules
import { ReplaySubject } from 'rxjs';

// Library modules
import { typeCheck, stringTypes } from '../../utilities/type-check.js';
import Build from '../../commands/build.js';
import { BuildCheckGoodResults, CommandFlagKeys } from './build-checks.js';
import { AsyncCheckResults, FileOutputExistence }
  from './build-cli-input-async-checks.js';
import { truncateFilePath } from './build-utilities.js';
import { pandocGenerated } from './build-generate-pandoc.js';
import { playwrightGenerated } from './build-generate-playwright.js';
import { messages, messagesKeys } from './build-log.js';
import { messages as messagesServer,
  messagesKeys as messagesKeysServer } from '../serve/serve-log.js';

export interface BuildPlaywrightGenerate {
  normalizedOutputPath: string,
  buildDocuments$: ReplaySubject<any>;
  docsGenerated$: ReplaySubject<any>;
  additionalInputArgs: Record<any, any>;
}

export interface BuildGenerate extends BuildPlaywrightGenerate {
  input: string;
  normalizedFormats: string[];
  flags: CommandFlagKeys;
  fileOutputExistence: FileOutputExistence;
  htmlCliGenerate?: boolean,
  checkFromServerCli: boolean;
  exactPdf?: boolean;
}

export function buildGenerate(
  results: BuildCheckGoodResults & AsyncCheckResults,
  docsGenerated$: ReplaySubject<any>,
  consoleLogSubject$ : ReplaySubject<any>,
  additionalInputArgs: Record<any, any>): any
export function buildGenerate(
  this: Build,
  results: BuildCheckGoodResults & AsyncCheckResults,
  docsGenerated$: ReplaySubject<any>,
  consoleLogSubject$ : ReplaySubject<any>,
  additionalInputArgs: Record<any, any>) {
  const { conditions, fromServerCli, exactPdf, truncateOutput, outputFilename, fileOutputExistence } = results,
    { input, output: outputPath } = conditions.flags,
    { normalizedFormats, flags } = conditions,
    normalizedOutputPath = truncateOutput ?
      `${truncateFilePath(outputPath).filePathFolder}/${outputFilename}` :
      `${outputPath}${outputFilename}`;

  const outputExt = path.extname(outputPath);

  const checkFromServerCli = typeCheck(fromServerCli, stringTypes.Undefined) ?
    false : true;

  // Exact pdf creation will require playwright
  const buildDocuments$ = new ReplaySubject(undefined);

  const hasPdfFormat = normalizedFormats.includes('pdf');

  // Generally run the pandoc generation when converting any file type,
  // except for when an 'exact' pdf is requested to mirror the look of
  // of the html.

  // Allow pandoc to convert to other file formats when they are specified,
  // even when the exactpdf option is present because conversion shouldn't
  // be limited by the exactpdf options for other file formats.
  docsGenerated$
    .subscribe((res) => {

      // Delete the intermediary html file when after
      // completion of an exact pdf generation, but
      // only when no html output is specified with the exact pdf
      // generation
      if (exactPdf && !normalizedFormats.includes('html')) {
        try {
          unlinkSync(`${normalizedOutputPath}.html`);
        } catch (_) {
          // Avoid logging out error when html does not exist
        }
      }
      this.log(`${messages[messagesKeys.completeFileFormatGeneration]}`);
    });

  // Warn if the exact flag was given, but the pdf output was not specified
  if (!normalizedFormats.includes('pdf') && exactPdf) {
    this.log(`${messages[messagesKeys.warningExactFlagOnForPdf]}`);
    consoleLogSubject$
      .next({warning: `${messages[messagesKeys.warningExactFlagOnForPdf]}` })
  }

  // The 'normalizedFormats' values should be the more accurate measure
  // of what needs to be output
  if (normalizedFormats.includes('html')) {
    if (outputExt !== ".html") {
      this.log(`${messages[messagesKeys.warningHtmlFileExtOnlyForHtml]}`);
      consoleLogSubject$
      .next({warning: `${messages[messagesKeys.warningHtmlFileExtOnlyForHtml]}` })
    }
  }

  if (hasPdfFormat) {
    // Exact pdf generation is handled by playwright

    // Only allow the exact flag to be used in a project folder
    if (exactPdf) {

      // The html might be generated alongside the pdf
      if (checkFromServerCli) {

        // Manipulate the settings to only generate the html with pandoc
        pandocGenerated({
          input,
          normalizedFormats: normalizedFormats,
          flags: Object.assign(flags, { output: path.parse(flags.input).name }),
          fileOutputExistence,
          checkFromServerCli,
          normalizedOutputPath,
          buildDocuments$,
          docsGenerated$,
          additionalInputArgs
        });

        playwrightGenerated({
          normalizedOutputPath,
          buildDocuments$,
          docsGenerated$,
          additionalInputArgs
        });
      } else {
        this.log(`${messagesServer[messagesKeysServer.serverJsNotFound]}`);
      }

    }
  }

  return pandocGenerated({
    input,
    normalizedFormats,
    flags,
    fileOutputExistence,
    checkFromServerCli,
    normalizedOutputPath,
    buildDocuments$,
    docsGenerated$,
    additionalInputArgs
  });
}