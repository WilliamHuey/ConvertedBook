// Third party modules
import { all } from 'ramda';
import { forkJoin, from, Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { lookpath } from 'lookpath';

// Library modules
import { typeCheck, stringTypes } from '../../utilities/type-check.js';
import Build from '../../commands/build.js';

export function buildDependencies(this: Build) {
  // Check for presence of external dependencies
  const depCheckGroup: Array<Observable<any>> = Build
    .requiredExternalDeps
    .map(extDep => {
      return from(lookpath(extDep));
    });

  // Run checks for all external dependencies at once
  const pathCheckResults$ = forkJoin(depCheckGroup);

  // All extenal dependencies are found
  const allDepsSatisfied$ = pathCheckResults$
    .pipe(
      filter((result: Array<any>) => {
        return all((resItem: string | undefined) => {
          return typeCheck(resItem, stringTypes.String);
        }, result);
      })
    );

  // Some or all of the external dependencies can not be found
  const showDepsUnsatisfied$ = pathCheckResults$
    .pipe(
      map((result: Array<any>) => {
        return result.map((resItem, resItemIndex) => {
          return typeCheck(resItem, stringTypes.Undefined) ?
            Build.requiredExternalDeps[resItemIndex] : '';
        });
      }),
      filter(res => {
        return res.join('').length > 0;
      }),
      take(1)
    );

  return {
    showDepsUnsatisfied$,
    allDepsSatisfied$
  };
}
