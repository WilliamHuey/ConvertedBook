// Third party modules
import { filter } from 'rxjs/operators';
import { from } from 'rxjs';
import isOnline from 'is-online';

export function onlineCheck() {
    // The generation test relies on internet connectivity to test out
    // project generation, which provide warning when no connection is found
    const onLineTest$ = from(isOnline() as Promise<boolean>);

    const isOnLine$ = onLineTest$
        .pipe(
            filter((connected): boolean => {
                return connected;
            })
        );

    const isOffLine$ = onLineTest$
        .pipe(
            filter((connected): boolean => {
                return !connected;
            })
        );

    isOffLine$
        .subscribe(() => {
            console.log('Warning: Tests will fail if NPM modules can not be downloaded due to no internet connectivity');
        });

    // Online observable wrapped function
    const isOnLine = function (fn: any) {
        isOnLine$
            .subscribe(fn);
    };

    return isOnLine;
}