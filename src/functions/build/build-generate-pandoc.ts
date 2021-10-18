// Native modules
import { spawn } from 'child_process';
import { unlinkSync } from 'fs';

// Third party modules
import { bindCallback } from 'rxjs';

// Library modules
import { FileOutputExistence } from './build-cli-input-async-checks';

// Directory for pandoc process
const baseDir = process.cwd(),
  baseContentDir = `${baseDir}/content`;

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
  const pandocAdditionalOptions = flags.pandoc ?
    JSON.parse(flags.pandoc).pandoc : null;
  const pandocDefaultOptions = [`--data-dir=${baseContentDir}/config`, '--template=default.html5', input, '-o', `${normalizedOutputPath}.${format}`, '-s'];

  // Add in more options for Pandoc when specified
  const allPandocOptions = pandocAdditionalOptions ?
    [...pandocDefaultOptions, pandocAdditionalOptions] :
    pandocDefaultOptions;

  // Remove the existing file if the a force flag is present
  // because the overwriting option is not available in pandoc
  if (flags.force) unlinkSync(`${normalizedOutputPath}.${format}`);

  // Start the pandoc service
  const pandocService = spawn('pandoc', allPandocOptions);

  // Convert callback into observable for the
  // 'complete' signal. The observable can also be
  // converted for use as a promise for testing.
  const pandocOnComplete$ = bindCallback(
    pandocService.stdout.on);

  const pandocClose$ = pandocOnComplete$
    .call(pandocService, 'close');

  // Log information from pandoc
  pandocClose$
    .subscribe({
      next: () => {
        console.log(`Generated ${format}`);

        // Warn on existing file format with the name of the output path
        if (fileOutputExistence[format] && !fromServerCli && !flags.force)
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