// Third party modules
import { all } from 'ramda';
import { isString, isUndefined } from 'is-what';
import { forkJoin, from, Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
const { lookpath } = require('lookpath');

// Library modules
import Build from '../../commands/build';

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
          return isString(resItem);
        }, result);
      })
    );

  // Some or all of the external dependencies can not be found
  const showDepsUnsatisfied$ = pathCheckResults$
    .pipe(
      map((result: Array<any>) => {
        return result.map((resItem, resItemIndex) => {
          return isUndefined(resItem) ?
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
