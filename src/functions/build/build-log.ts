// Library modules
import Build from '../../commands/build';

// Third party modules
import { match, when } from 'ts-pattern';
import { isString } from 'is-what';
interface BuildFormats {
  action: string;
  buildFormats: string[];
}

export function buildLog(this: Build, buildOptions: BuildFormats) {
  return match(buildOptions)
    .with({
      action: 'start',
      buildFormats: when(buildFormats => {
        return isString(buildFormats);
      })
    }, () => {
      return `Start Building: ${buildOptions.buildFormats}`;
    })
    .run();
}
