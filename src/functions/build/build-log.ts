// Library modules
import Build from '../../commands/build';

// Third party modules
import { match } from 'ts-pattern';

export function buildLog(this: Build, {
  action,
  buildFormats
}: {
  action: string;
  buildFormats: string[];
}) {
  return match(action)
    .with('start', () => {
      return `Start Building: ${buildFormats}`;
    })
    .run();
}
