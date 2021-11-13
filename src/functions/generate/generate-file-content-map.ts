// Native modules
import * as path from 'path';

// Third party modules
import { of, Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { readFile } from '@rxnode/fs';
import { isString, isFunction, isUndefined } from 'is-what';

// Library modules
import typeCheck from '@utilities/type-check';
import { ProjectPackageJson } from './files/dynamic/project-package-json';

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
  indexJs: { name: 'generate-file-index.js' },
  configStylesIndex: { name: 'generate-file-index-module.scss' },
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
  latexSnowpackPlugin: { name: 'generate-file-latex-plugin.js' },
  server: { name: 'generate-file-server.js' },
  snowpack: { name: 'generate-file-snowpack.js' }
};

// Data could vary and pattern is not predictable
export function fileContentObservable(key: string, data: Record<string, any>): Observable<string | {}> {
  const asFn = fileContent[key] as FileContentFnValueType,
    asStr = fileContent[key] as FileContentNameValueType;

  // For files without content
  if (key === '')
    return of('');

  if (typeCheck(fileContent[key], 'Undefined'))
    return of({});

  if (typeCheck(asFn.content, 'Function'))
    return of(asFn.content(data));

  if (typeCheck(asStr.name, 'String'))
    return readFile(path.join(__dirname, `/files/${asStr.name}`), 'utf8')
      .pipe(share());

  return of({});
}
