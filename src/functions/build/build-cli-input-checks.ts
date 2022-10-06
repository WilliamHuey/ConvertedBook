// Third party modules
import { match, when } from 'ts-pattern';
const IsThere = require('is-there');
import { Observable, from } from 'rxjs';

// Library modules
import Build from '../../commands/build';
import { action, messagesKeys } from './build-log';
import { BuildCheckResults, BuildCheckBadResults } from './build-checks';
import { ServerjsBuild } from './build-import';

const serverFileName = 'server.js';

export type BuildCliChecks = {
  isServerJsFound$: Observable<Boolean>
}

export function buildCliInputsChecks(this: Build, serverJs?: Boolean | undefined): (BuildCheckResults & BuildCliChecks) {
  // Check for cli input validity
  const buildCmd = this.parse(Build);

  console.log('1 buildCmd', buildCmd, serverJs);


  const isServerJsFound$ = from(IsThere
    .promises.file(serverFileName) as Promise<boolean>);

  // Only synchronous checks here
  const output = match(buildCmd)
    .with(({
      // No build arguments and no flags
      argv: [],
      flags: when(flags => {
        return Object.keys(flags).length === 0;
      })
    }), (): BuildCheckBadResults => {
      // Can not continue
      return {
        msg: this.buildLog({
          action: action.check,
          log: messagesKeys.noArgsOrFlags
        }),
        continue: false
      };
    })
    .with(({
      // Build arguments, but no flags
      argv: when(argv => {
        return argv.length > 0;
      }),
      flags: when(flags => {
        return Object.keys(flags).length === 0;
      })
    }), (): BuildCheckBadResults => {
      // Can not continue
      return {
        msg: this.buildLog({
          action: action.check,
          log: messagesKeys.argsButNoFlags
        }),
        continue: false
      };
    })
    .with(({
      // No build arguments, but has flags
      argv: [],
      flags: when(flags => {
        return Object.keys(flags).length > 0;
      })
    }), () => {
      console.log('1111111');
      // Further checks on the flags
      return (this.buildChecks(buildCmd) as BuildCheckResults);
    })
    .with(({
      // Build arguments and flags present
      argv: when(argv => {
        return argv.length > 0;
      }),
      flags: when(flags => {
        return Object.keys(flags).length > 0;
      })
    }), () => {
      console.log('22222', serverJs);


      return (this.buildChecks(buildCmd) as BuildCheckResults);

    })
    .run();

  console.log('output', output);



  return { ...output, isServerJsFound$ };
}
