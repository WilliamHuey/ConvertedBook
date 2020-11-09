// Native modules
import { spawn } from 'child_process';

// Library modules
import Build from '../../commands/build';
import { BuildCheckGoodResults } from './build-checks';

export function buildGenerate(this: Build, results: BuildCheckGoodResults) {
  const { conditions } = results,
    { input, output } = conditions.flags;

  // const pandocService = spawn('pandoc', [input, '-o', `${output}content.pdf`, '--from', 'markdown']);

  // pandocService.stdout
  //   .on('data', (data) => {
  //     console.log(`${data}`);
  //   })
  //   .on('close', (code: any) => {
  //     console.log('Complete.');
  //   });

  // pandocService.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });
}
