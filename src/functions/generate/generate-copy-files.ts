// Third party modules
import path from 'node:path'; 
import { Observable, forkJoin } from 'rxjs';
import FastGlob from "fast-glob";

// Libraries modules
import { copyFile } from "../../utilities/rxjs-fs.js";
import { messages, messagesKeys } from './generate-log.js';

console.log(`${messages[messagesKeys.copyGenerateFilesToDist]}`);

const generateFileRoot = "src/functions/generate/files/",
  destinationDistFolder = "dist/functions/generate/files/";

const generateFilesForCopying = await FastGlob(`${generateFileRoot}/*`);

// Gather all observables for the copying of files
const obsFilesCopy: Array<Observable<any>> = [];

generateFilesForCopying.forEach((generateFile) => {
  const copyOperation$ = copyFile(
    generateFile,
    path.join(destinationDistFolder, path.basename(generateFile)));
  obsFilesCopy.push(
    copyOperation$
  );
});

forkJoin(obsFilesCopy)
  .subscribe(() => {
   console.log(`${messages[messagesKeys.completeGenerateFileCopy]}`);
  });

