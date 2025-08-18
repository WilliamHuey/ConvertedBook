// Third party modules
import { init, last } from 'ramda';

// Libraries modules
import { typeCheck, stringTypes } from '../../utilities/type-check.js';

export function supposedFileName(fullPath: string): Array<string> {
  const fullPathSplit = fullPath.split('/');
  const lastFullPathSplit = last(fullPathSplit)?.split('.');
  return lastFullPathSplit ? lastFullPathSplit : [""];
}

export function getFileNameFromParts(supposeFileParts: Array<string>): Array<string> {

  // Using the default typeof undefined check since TypeScript is not able to
  // infer the valid meaning of passing the running of typeCheck
  // against undefined.
  const validStringArray = typeCheck(supposeFileParts, stringTypes.Array) && typeof supposeFileParts != 'undefined' ? supposeFileParts : [""];
  return validStringArray ? [validStringArray[0]] : [""];
}

export function truncateFilePath(filePath: string) {
  const filePathSplit = filePath.split('/'),
    supposeFilePathFolderName = init(filePathSplit),
    supposeFilePathFolderNameJoin = supposeFilePathFolderName.join('/'),

    // Normalize the path output to the current directory when no './'
    // is found in the front of the output file path
    filePathFolder = supposeFilePathFolderNameJoin.length === 0 ?
      ['.'].join('/') : supposeFilePathFolderNameJoin;

  return {
    filePathSplit,
    filePathFolder
  };
}
