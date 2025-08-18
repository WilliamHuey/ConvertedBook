// Third party modules
import { Observable, ReplaySubject } from 'rxjs';
import { scan, map, filter } from 'rxjs/operators';

export default class ConsoleLog {
  create() {
    // General logger to gather all the log messages
    const consoleLogSubject$ = new ReplaySubject <{}>;

    const scanConsoleLogSubject$ = consoleLogSubject$.pipe(
      scan(function(acc: any, curr)  {
        acc.push(curr)
        return acc;
      }, []));

    const consoleLog$: Observable<any> = scanConsoleLogSubject$.pipe(
      map((msgs) => {
        return msgs.filter((msg: any) => {
          return msg?.info;
        });
      }),
      filter((msgs) => {
        return msgs.length > 0;
      })
    );

    const consoleWarningLog$: Observable<any> = scanConsoleLogSubject$.pipe(
      map((msgs) => {
        return msgs.filter((msg: any) => {
          return msg?.warning;
        });
      }),
      filter((msgs) => {
        return msgs.length > 0;
      })
    );

    const consoleErrorLog$: Observable<any> = scanConsoleLogSubject$.pipe(
      map((msgs) => {
        return msgs.filter((msg: any) => {
          return msg?.error;
        });
      }),
      filter((msgs) => {
        return msgs.length > 0;
      })
    );

    return {
      consoleLog$, consoleWarningLog$, consoleErrorLog$, consoleLogSubject$ };
  }
}