// Native modules
import { spawn } from "child_process";
const path = require("path");

// Third party modules
import { Command, flags } from "@oclif/command";
import { bindCallback } from "rxjs";
import { takeLast, tap, mergeMap } from "rxjs/operators";
import { isUndefined } from "is-what";

// Libraries modules
import { generateProject } from "../functions/generate/generate-imports";
import { GenerateContent } from "../functions/generate/generate-content";

export default class Generate extends Command {
  static description = 'Create a "convertedbook" project folder.';

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: "n", description: "Generate" }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" }),
    "project-name": flags.string({ char: "p" }),
  };

  static aliases = ["g"];

  static args = [{ name: "folderName" }];

  public generateProject = generateProject.bind(this);

  async run() {
    const { args, flags } = this.parse(Generate),
      { folderName } = args;

    // Read the project folder for generating the observable creating chain
    const folderStructure = new GenerateContent(folderName);
    GenerateContent.generateStructure(folderStructure);

    // const generateProject$ = this.generateProject({ folderName, flags })
    //   .pipe(takeLast(1));

    // generateProject$
    //   .pipe(takeLast(1))
    //   .pipe(
    //     tap(() => console.log('Downloading node modules...')),
    //     mergeMap(() => {
    //       const normalizedFolder = isUndefined(folderName) || folderName?.length === 0 ?
    //         'New Folder' : folderName;
    //       const executionPath = process.cwd(),
    //         npmService = spawn('npm', ['install'], { cwd: path.join(executionPath, '/', normalizedFolder, '/content/') });

    //       const npmOnComplete$ = bindCallback(
    //         npmService.stdout.on);

    //       const npmClose$ = npmOnComplete$
    //         .call(npmService, 'close');

    //       return npmClose$;
    //     })
    //   )
    //   .subscribe({
    //     error: () => { },
    //     next: () => {
    //       console.log('Complete project generation')
    //     }
    //   });
  }
}
