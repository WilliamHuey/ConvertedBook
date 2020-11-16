// Native modules
import { spawn } from 'child_process';

// Third party modules
import { bindCallback } from 'rxjs';

// Library modules
import Build from '../../commands/build';
import { BuildCheckGoodResults } from './build-checks';

export function buildGenerate(this: Build,
  results: BuildCheckGoodResults) {
  const { conditions } = results,
    { input, output } = conditions.flags;

  const pandocService = spawn('pandoc',
    ['-o', `${output}content.pdf`, input]);

  const pandocOnComplete$ = bindCallback(
    pandocService.stdout.on);

  const pandocClose$ = pandocOnComplete$
    .call(pandocService, 'close');

  const pandocCompletePromise = pandocClose$.toPromise();

  pandocClose$
    .subscribe({
      next: () => {
        console.log('Complete generation.');
      },
      error: e => {
        console.log('Error', e);
      }
    });

  return {
    pandocCompletePromise
  };
}
