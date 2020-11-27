// Library modules
import Build from '../../commands/build';

// Third party modules
import { match, when } from 'ts-pattern';
import { isString, isFunction } from 'is-what';
const plur = require('plur');

export enum action {
  check,
  ready
}

export enum messagesKeys {
  noValidFormats = 'noValidFormats' as any,
  ignoreUnknownFormats = 'ignoreUnknownFormats' as any,
  noArgsOrFlags = 'noArgsOrFlags' as any,
  argsButNoFlags = 'argsButNoFlags' as any,
  noRequiredFlagsFound = 'noRequiredFlagsFound' as any,
  someRequiredFlagsFound = 'someRequiredFlagsFound' as any,
  createOutputFile = 'createOutputFile' as any,
  invalidInputFile = 'invalidInputFile' as any,
  invalidOutputFolderOrFile = 'invalidOutputFolderOrFile' as any,
  invalidInputAndOutput = 'invalidInputAndOutput' as any,
}

const messages: { [index: string]: string | ((options: { data: { quantity: number } }) => string) } = {
  noValidFormats: 'Did not build as there are no valid formats: ',
  ignoreUnknownFormats: 'Ignoring unknown formats: ',
  noArgsOrFlags: 'Build failed: No arguments and no flags available',
  argsButNoFlags: 'Build failed: Arguments provided but no flags present',
  noRequiredFlagsFound: 'Build failed: No required flags found (--input, --output)',
  someRequiredFlagsFound: 'Build failed: Missing a required "--input" or "--output"',
  buildingStartPrefix: 'Start building: ',
  createOutputFile: options => {
    return `Creating output ${plur('file', options?.data?.quantity)}`;
  },
  invalidInputFile: 'Build failed: Invalid input file',
  invalidOutputFolderOrFile: 'Build failed: Invalid output folder/file',
  invalidInputAndOutput: 'Build failed: Invalid input file and invalid output folder/file'
};

type BuildFormat = { action: action.ready; buildFormats: string[] }
type Check = { action: action.check; log: messagesKeys; data?: Record<string, any> }
type BuildOptions = BuildFormat | Check

export function buildLog(buildOptions: BuildOptions): string
export function buildLog(this: Build, buildOptions: BuildOptions) {
  return match(buildOptions)
    .with({
      action: action.check,
      log: when(log => {
        return isString(log);
      })
    }, () => {
      const { log, data } = buildOptions as Check;
      return isFunction(messages[log]) ?
        (messages[log] as Function)({ data }) :
        `${messages[log]}${data || ''}`;
    })
    .with({
      action: action.ready,
      buildFormats: when(buildFormats => {
        return isString(buildFormats);
      })
    }, () => {
      return `${messages.buildingStartPrefix}${(buildOptions as BuildFormat).buildFormats}`;
    })
    .run();
}
