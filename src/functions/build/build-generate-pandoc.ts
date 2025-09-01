// Native modules
import spawn from 'cross-spawn';
import { unlinkSync } from 'fs';

// Third party modules
import { forkJoin, bindCallback, of } from 'rxjs';
import { first } from 'rxjs/operators';
import listify from 'listify';

// Library modules
import { FileOutputExistence } from './build-cli-input-async-checks.js';
import { BuildGenerate } from './build-generate.js';
import { messages, messagesKeys } from './build-log.js';

// Directory for pandoc process
const baseDir = process.cwd(),
  baseContentDir = `${baseDir}/src/config/templates`;

export function pandocGenerated({
  input,
  normalizedFormats,
  flags,
  fileOutputExistence,
  checkFromServerCli,
  normalizedOutputPath,
  buildDocuments$,
  docsGenerated$ }: BuildGenerate) {
  const generated = normalizedFormats
    .map(format => {
      return pandocGenerateFormat(input, normalizedOutputPath, format,
        fileOutputExistence, flags, checkFromServerCli
        );
    });

  const pandocGen = generated.reduce((acc, el): any => {
    return {
      pandocCloseGroup: [...acc.pandocCloseGroup, el.pandocClose$]
    };
  }, { pandocCloseGroup: [] });

  const {
    pandocCloseGroup: pandocCloseGroup$
  } = pandocGen;

  // Treat the input file types as a group even though
  // one might only be present for easier processing
  const groupFormatsGenerated$ = forkJoin(pandocCloseGroup$)
    .pipe(first());

  groupFormatsGenerated$
    .subscribe((res) => {
      buildDocuments$.next('Pandoc generated');

      // TODO: Update this when generating pdf from project folder
      docsGenerated$.next(`Created following: ${listify(normalizedFormats)}`);
      docsGenerated$.complete();
    });

  return {
    docsGenerated$
  };
}

export function pandocGenerateFormat(input: string,
  normalizedOutputPath: string,
  format: string,
  fileOutputExistence: FileOutputExistence,
  flags: Record<string, any>,
  fromServerCli: boolean) {

  // Need to match the directory in which
  // pandoc is referring to for proper
  // inclusion of files in latex
  if (fromServerCli) process.chdir(baseContentDir);

  // Configure pandoc options and arguments
  const pandocAdditionalOptions = flags.pandoc || fromServerCli ?
    JSON.parse(flags.pandoc).pandoc : null;
  const basePandocOptions = [input, '-o', `${normalizedOutputPath}.${format}`, '-s', '--toc'];
  const pandocDefaultOptions = fromServerCli ? [`--data-dir=${baseContentDir}`, '--template=default.html5', ...basePandocOptions] : basePandocOptions;

  // Add in more options for Pandoc when specified
  const allPandocOptions = pandocAdditionalOptions ?
    [...pandocDefaultOptions, pandocAdditionalOptions] :
    pandocDefaultOptions;

  // Remove the existing file if the a force flag is present
  // because the overwriting option is not available in pandoc
  try {
    if (flags.force) unlinkSync(`${normalizedOutputPath}.${format}`);
  } catch (_) {
    // File does not exists when the force flag is used,
    // however, do not error out as that is not useful
  }

  // Start the pandoc service
  const pandocService = spawn('pandoc', allPandocOptions);

  // Convert callback into observable for the
  // 'complete' signal. The observable can also be
  // converted for use as a promise for testing.

  if (pandocService.stdout) {
    const pandocOnComplete$ = bindCallback(
      pandocService.stdout.on);

    const pandocClose$ = pandocOnComplete$
      .call(pandocService, 'close');

    // Log information from pandoc
    pandocClose$
      .subscribe({
        next: () => {
          console.log(`${(messages[messagesKeys.generatedFormat] as Function)(format)}`);

          // Warn on existing file format with the name of the output path
          if (fileOutputExistence[format] && !fromServerCli && !flags.force)
            console.log(`${(messages[messagesKeys.warning] as Function)(format)}`);
        },
        error: (e: any) => {
          console.log(`${(messages[messagesKeys.error] as Function)(e)}`);
        }
      });

    return {
      pandocClose$
    };
  } else {
    return { pandocClose$: of("Error: Std not defined")};
  }
}

