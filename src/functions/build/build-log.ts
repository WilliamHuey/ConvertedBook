// Library modules
import Build from '../../commands/build';

// Third party modules
import { match, when } from 'ts-pattern';
import { isString } from 'is-what';

export enum action {
  beforeStart,
  start
}

export enum messagesKeys {
  noValidFormats = 'noValidFormats' as any,
  ignoreUnknownFormats = 'ignoreUnknownFormats' as any,
  noArgsOrFlags = 'noArgsOrFlags' as any,
  noArgsButFlags = 'noArgsButFlags' as any,
  argsButNoFlags = 'argsButNoFlags' as any,
  noRequiredFlagsFound = 'noRequiredFlagsFound' as any,
  someRequiredFlagsFound = 'someRequiredFlagsFound' as any,
  nonExistingOutputFileAndTruncatedFolder = 'nonExistingOutputFileAndTruncatedFolder' as any,
  createOutputFile = 'createOutputFile' as any,
  invalidInputFile = 'invalidInputFile' as any,
  invalidOutputFolderOrFile = 'invalidOutputFolderOrFile' as any,
  invalidInputAndOutput = 'invalidInputAndOutput' as any,
}

const messages: { [index: string]: string } = {
  noValidFormats: 'Did not build as there are no valid formats: ',
  ignoreUnknownFormats: 'Ignoring unknown formats: ',
  noArgsOrFlags: 'Build failed: No arguments and no flags available.',
  noArgsButFlags: 'No arguments but has flags.',
  argsButNoFlags: 'Build failed: Arguments provided but no flags present.',
  noRequiredFlagsFound: 'Build failed: No required flags found (--input, --output)',
  someRequiredFlagsFound: 'Build failed: Missing a required "--input" or "--output"',
  buildingStartPrefix: 'Start building: ',
  nonExistingOutputFileAndTruncatedFolder: 'Output path is invalid path for output file',
  createOutputFile: 'Creating output file',
  invalidInputFile: 'Invalid input file',
  invalidOutputFolderOrFile: 'Invalid output folder/file',
  invalidInputAndOutput: 'Invalid input file and invalid output folder/file'
};

type BuildFormat = { action: action.start; buildFormats: string[] }
type BuildBeforeStart = { action: action.beforeStart; log: messagesKeys; data?: Record<string, any> }
type BuildOptions = BuildFormat | BuildBeforeStart

export function buildLog(this: Build, buildOptions: BuildOptions) {
  return match(buildOptions)
    .with({
      action: action.beforeStart,
      log: when(log => {
        return isString(log);
      })
    }, () => {
      const { log, data } = buildOptions as BuildBeforeStart;
      return `${messages[log]}${data || ''}`;
    })
    .with({
      action: action.start,
      buildFormats: when(buildFormats => {
        return isString(buildFormats);
      })
    }, () => {
      return `${messages.buildingStartPrefix}${(buildOptions as BuildFormat).buildFormats}`;
    })
    .run();
}
