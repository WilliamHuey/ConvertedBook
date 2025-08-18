// Native modules
import * as path from 'path';

// Third party modules
import { of, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

// Library modules
import { typeCheck, stringTypes } from '../../utilities/type-check.js'
import { ProjectPackageJson } from './files/dynamic/project-package-json.js';
import { readFile } from '../../utilities/rxjs-fs.js';
import { currDir } from '../../utilities/filesystem.js';

const __dirname = currDir(import.meta.url);

interface FileContentNameValueType {
  name: string;
}

interface FileContentFnValueType {
  content: ((v: Record<string, any>) => string);
}

interface FileContentType {
  [key: string]: FileContentNameValueType | FileContentFnValueType;
}

const fileContent: FileContentType = {
  gitignore: { name: 'generate-file-git-ignore.txt' },
  indexHtml: { name: 'generate-file-index.html' },
  indexTex: { name: 'generate-file-index.tex' },
  helperJs: { name: 'generate-file-helper.js' },
  projectJs: { name: 'generate-file-project.js' },
  globalJs: { name: 'generate-file-global.js' },
  configStylesIndex: { name: 'generate-file-vendor.css' },
  texHtml5Template: { name: 'generate-file-latex-default.html5' },
  packageJson: {
    content: ({ projectName }) => {
      return JSON.stringify(
        new ProjectPackageJson(projectName),
        null,
        4
      );
    }
  },
  server: { name: 'generate-file-server.js' },
  serverConfig: { name: 'generate-file-server-config.js' },
  convert: { name: 'generate-file-convert.js' }
};

// Data could vary and pattern is not predictable
export function fileContentObservable(key: string, data: Record<string, any>): Observable<string | NodeJS.ArrayBufferView> {
  const asFn = fileContent[key] as FileContentFnValueType,
    asStr = fileContent[key] as FileContentNameValueType;

  // For files without content
  if (key === '')
    return of('');

  if (typeCheck(fileContent[key], stringTypes.Undefined)){
    return of('');
  }

  if (typeCheck(asFn.content, stringTypes.Function)) {
    return of(asFn.content(data));
  }

  if (typeCheck(asStr.name, stringTypes.String)) {
    return readFile(path.join(__dirname, `/files/${asStr.name}`), 'utf8');
  }

  return of('');
}
