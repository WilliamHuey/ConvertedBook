// Native modules
import * as fs from 'fs';

// Library modules
import { deleteFile } from "../../utilities/rxjs-fs.js";
import { messages, messagesKeys } from './generate-log.js';

// Clear out the ts build cache file for proper updates
fs.readFile('./tsconfig.tsbuildinfo', 'utf8',  (err, data) => {
  if (!err && data) {
    deleteFile("./tsconfig.tsbuildinfo")
      .subscribe(() => {
        console.log(`${messages[messagesKeys.removeTsconfigBuildInfo]}`);
      });
  }
})



