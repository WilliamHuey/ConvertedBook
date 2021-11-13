// Third party modules
import { init, head, last } from 'ramda';

// Libraries modules
import { typeCheck, stringTypes } from '@utilities/type-check';

export function supposedFileName(fullPath: string) {
  const fullPathSplit = fullPath.split('/');
  return last(fullPathSplit)?.split('.');
}

export function getFileNameFromParts(supposeFileParts: string[] | undefined): string |
  undefined {

  // Using the default typeof undefined check since TypeScript is not able to
  // infer the valid meaning of passing the running of typeCheck
  // against undefined.
  const validStringArray: string[] = typeCheck(supposeFileParts, stringTypes.Array) && typeof supposeFileParts != 'undefined' ? supposeFileParts : [];

  return validStringArray ? head(validStringArray) : '';
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
