// Library modules
import Build from '../../commands/build';

// Third party modules
import { match, when } from 'ts-pattern';
import { isString, isBoolean } from 'is-what';
const listify = require('listify');

export enum action {
  beforeStart,
  start
}

export enum messagesKeys {
  noValidFormats = 'noValidFormats' as any,
  ignoreUnknownFormats = 'ignoreUnknownFormats' as any,
}

const messages: { [index: string]: any } = {
  noValidFormats: 'Did not build as there are no valid formats: ',
  ignoreUnknownFormats: 'Ignoring unknown formats: ',
  buildingStartPrefix: 'Start building: '
};

type BuildFormat = { action: action.start; buildFormats: string[] }
type AllFormats = { action: action.start; allFormats: boolean }
type BuildBeforeStart = { action: action.beforeStart; log: messagesKeys; data?: any }
type BuildOptions = BuildFormat | AllFormats | BuildBeforeStart

export function buildLog(this: Build, buildOptions: BuildOptions) {
  return match(buildOptions)
    .with({
      action: action.beforeStart,
      log: when(log => {
        return isString(log);
      })
    }, () => {
      const { log, data } = buildOptions as BuildBeforeStart;
      return `${messages[log]}${data}`;
    })
    .with({
      action: action.start,
      buildFormats: when(buildFormats => {
        return isString(buildFormats);
      })
    }, () => {
      return `${messages.buildingStartPrefix}${(buildOptions as BuildFormat).buildFormats}`;
    })
    .with({
      action: action.start,
      allFormats: when(allFormats => {
        return isBoolean(allFormats);
      })
    }, () => {
      return `${messages.buildingStartPrefix}${listify(Build.acceptedOutputFormats)}`;
    })
    .run();
}
