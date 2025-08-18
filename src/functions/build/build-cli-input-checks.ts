// Third party modules
import { Observable } from 'rxjs';

// Library modules
import { BuildCheckResults } from './build-checks.js';

const serverFileName = 'server.js';

export type BuildCliChecks = {
  isServerJsFound$: Observable<Boolean>
}

export type buildCliInputChecksOutput = BuildCheckResults | {
  isServerJsFound$: Observable<boolean>;
  msg: string;
  continue: boolean;
}

