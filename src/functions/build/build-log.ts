// Library modules
import { typeCheck, stringTypes } from '../../utilities/type-check.js';
import Build from '../../commands/build.js';
import { messageType } from "../shared/types.js"

// Third party modules
import { match, P } from 'ts-pattern';
import inflection from 'inflection';

export enum action {
  check,
  ready
}

export enum messagesKeys {
  dependenciesNotMet = 'dependenciesNotMet' as any,
  noValidFormats = 'noValidFormats' as any,
  ignoreUnknownFormats = 'ignoreUnknownFormats' as any,
  ignoreUnknownFormatsWithUnknowns = 'ignoreUnknownFormatsWithUnknowns' as any,
  // Future Implementation
  // argsButNoFlags = 'argsButNoFlags' as any,
  noRequiredFlagsFound = 'noRequiredFlagsFound' as any,
  someRequiredFlagsFound = 'someRequiredFlagsFound' as any,
  createOutputFile = 'createOutputFile' as any,
  invalidInputFile = 'invalidInputFile' as any,
  invalidOutputFolderOrFile = 'invalidOutputFolderOrFile' as any,
  invalidInputAndOutput = 'invalidInputAndOutput' as any,
  invalidServerBuildPort = 'invalidServerBuildPort' as any,
  dryRunInfo = 'dryRunInfo' as any,
  generatedFormat = 'generatedFormat' as any,
  error = 'error' as any,
  warning = 'warning' as any,
  completeFileFormatGeneration = 'completeFileFormatGeneration' as any,
  warningExactFlagOnForPdf = 'warningExactFlagOnForPdf' as any,
  warningHtmlFileExtOnlyForHtml = 'warningHtmlFileExtOnlyForHtml' as any,
  outputfileOptionMissing = 'outputfileOptionMissing' as any,
}

export const messages: { [index: string]: string | messageType | ((options: { data: { quantity: number } }) => string) } = {
  dependenciesNotMet: 'Build failed: These dependencies were not found in your path:',
  noValidFormats: 'Build failed: Did not build as there are no valid formats: ',
  ignoreUnknownFormats: 'Ignoring unknown formats: ',
  ignoreUnknownFormatsWithUnknowns: (options:any) => {
    return `${messages.ignoreUnknownFormats}${options}`;
  },
  // Future Implementation
  // argsButNoFlags: 'Build failed: Arguments provided but no flags present',
  noRequiredFlagsFound: 'Build failed: No required flags found (--input, --output)',
  someRequiredFlagsFound: 'Build failed: Missing a required "--input" or "--output"',
  buildingStartPrefix: 'Start building: ',
  createOutputFile: (options:any) => {
    return `Creating output ${inflection.inflect('file', options?.data?.quantity)}`;
  },
  invalidInputFile: 'Build failed: Invalid input file',
  invalidOutputFolderOrFile: 'Build failed: Invalid output folder/file',
  invalidInputAndOutput: 'Build failed: Invalid input file and invalid output folder/file',
  invalidServerBuildPort: 'Build failed: Invalid build server port provided',
  dryRunInfo: 'Info: Dry run option provided. No actual files were generated',
  completeFileFormatGeneration: 'Completed file format generation',
  warningExactFlagOnForPdf: 'Warning: Exact flag was provided, but this only applies to pdf file output',
  warningHtmlFileExtOnlyForHtml: 'Warning: html file output extension was provided, but this only applies to html file output and will be ignored',
  outputfileOptionMissing: 'Warning: Output file option is missing. The output is defaulted to the same folder level as the source file',
  generatedFormat: (data: any) => {
    return `Generated ${data}`;
  },
  error: (data: any) => {
    return `Error ${data}`;
  },
  warning: (data: any) => {
    return `Warning: ${data} file type exists`;
  }
};

type BuildFormat = { action: action.ready; buildFormats: string[] | string }
type Check = { action: action.check; log: messagesKeys; data?: Record<string, any> }
type BuildOptions = BuildFormat | Check

export function buildLog(buildOptions: BuildOptions): string
export function buildLog(this: Build, buildOptions: BuildOptions) {

  return match(buildOptions)
    .with({
      action: action.check,
      log: P.when(log => {
        return typeCheck(log, stringTypes.String);
      })
    }, () => {
      const { log, data } = buildOptions as Check;
      return typeCheck(messages[log], stringTypes.Function) ?
        (messages[log] as Function)({ data }) :
        `${messages[log]}${data || ''}`;
    })
    .with({
      action: action.ready,
      buildFormats: P.when(buildFormats => {
        return typeCheck(buildFormats, stringTypes.String);
      })
    }, () => {
      return `${messages.buildingStartPrefix}${(buildOptions as BuildFormat).buildFormats}`;
    })
    .run();
}
