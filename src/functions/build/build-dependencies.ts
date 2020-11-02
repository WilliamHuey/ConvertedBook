// Third party modules
import { all } from 'ramda';
import { isString, isUndefined } from 'is-what';
import { from, forkJoin } from 'rxjs';
import { filter, map, first } from 'rxjs/operators';
const { lookpath } = require('lookpath');

// Library modules
import Build from '../../commands/build';

export function buildDependencies(this: Build) {
  // Check for presence of external dependencies
  const depCheckGroup$ = Build
    .requiredExternalDeps
    .map(extDep => {
      const stuff = lookpath(extDep);
      return from(stuff);
    });

  // Run checks for all external dependencies at once
  const pathCheckResults$ = forkJoin(depCheckGroup$);

  // All extenal dependencies are found
  const allDepsSatisfied$ = pathCheckResults$
    .pipe(
      first(),
      filter((result: Array<any>) => {
        return all((resItem: string | undefined) => {
          return isString(resItem);
        }, result);
      })
    );

  // Some or all of the external dependencies can not be found
  const showDepsUnsatisfied$ = pathCheckResults$
    .pipe(
      first(),
      map((result: Array<any>) => {
        return result.map((resItem, resItemIndex) => {
          return isUndefined(resItem) ?
            Build.requiredExternalDeps[resItemIndex] : '';
        });
      }),
      filter(res => {
        return res.join('').length > 0;
      })
    );

  return {
    showDepsUnsatisfied$,
    allDepsSatisfied$
  };
}
