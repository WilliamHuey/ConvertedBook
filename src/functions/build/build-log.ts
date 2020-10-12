// Library modules
import Build from '../../commands/build';

// Third party modules
import { match, when } from 'ts-pattern';
import { isString, isBoolean } from 'is-what';
const listify = require('listify');

export enum action {
  start
}

type BuildFormat = { action: action.start; buildFormats: string[] }
type AllFormats = { action: action.start; allFormats: boolean }
type BuildOptions = BuildFormat | AllFormats

export function buildLog(this: Build, buildOptions: BuildOptions) {
  return match(buildOptions)
    .with({
      action: action.start,
      buildFormats: when(buildFormats => {
        return isString(buildFormats);
      })
    }, () => {
      return `Start Building: ${(buildOptions as BuildFormat).buildFormats}`;
    })
    .with({
      action: action.start,
      allFormats: when(allFormats => {
        return isBoolean(allFormats);
      })
    }, () => {
      return `Start Building: ${listify(Build.acceptedOutputFormats)}`;
    })
    .run();
}
