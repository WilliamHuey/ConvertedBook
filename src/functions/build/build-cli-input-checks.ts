// Third party modules
import { match, when } from 'ts-pattern';
import { from } from 'rxjs';
import { filter } from 'rxjs/operators';
import { init } from 'ramda';
const IsThere = require('is-there');

// Library modules
import Build from '../../commands/build';
import { action, messagesKeys } from './build-log';
import { BuildCheckResults, BuildCheckBadResults, BuildCheckGoodResults } from './build-checks';

export function buildCliInputsChecks(this: Build): BuildCheckResults {
  // Check for cli input validity
  const buildCmd = this.parse(Build);
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
          action: action.beforeStart,
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
          action: action.beforeStart,
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
      return (this.buildChecks(buildCmd) as BuildCheckResults);
    })
    .run();
  return output;
}

export function buildCliInputsAsyncChecks(this: Build, buildCli: BuildCheckGoodResults) {
  // console.log(output);
  const { flags } = buildCli.conditions;
  const { input, output } = flags;

  const checkInputFile$ = from(IsThere.promises.file(input) as Promise<boolean>);
  const supposeOutputFolderName = init(output.split('/')),
    outputFolder = supposeOutputFolderName.join('/');

  // File does not exists, means that is the new file
  // for the directory that is to be created
  const checkOutputFile$ = from(IsThere.promises.file(output) as Promise<boolean>);

  // Assumed that output given is an actual valid folder path
  const checkOutputFolder$ = from(IsThere.promises.directory(output) as Promise<boolean>);

  // Another check for the actual output folder, by removing the
  // last portion of the path item from the initial output
  const truncatedOutputFolder$ = from(IsThere.promises.directory(outputFolder) as Promise<boolean>);

  checkOutputFile$
    .pipe(
      filter(result => {
        return result;
      })
    )
    .subscribe(checkOutputFile => {
      console.log("buildCliInputsAsyncChecks -> checkOutputFile", checkOutputFile)
    });

  checkOutputFolder$
    .subscribe(checkOutputFolder => {
      console.log("buildCliInputsAsyncChecks -> checkOutputFolder", checkOutputFolder)
    });

  truncatedOutputFolder$
    .subscribe(truncatedOutputFolder => {
      console.log("buildCliInputsAsyncChecks -> truncatedOutputFolder", truncatedOutputFolder)

    });

  checkInputFile$
    .subscribe(stuff => {
      console.log(stuff)
    });
}
