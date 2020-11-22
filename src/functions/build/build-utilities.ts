// Third party modules
import { init, head, last } from 'ramda';
import { isArray } from 'is-what';

export function supposedFileName(fullPath: string) {
    const fullPathSplit = fullPath.split('/');
    return last(fullPathSplit)?.split('.');
}

export function getFileNameFromParts(supposeFileParts: string[] | undefined): string |
    undefined {
    return isArray(supposeFileParts) ?
        head(supposeFileParts) : '';
}

export function truncateFilePath(filePath: string) {
    const filePathSplit = filePath.split('/'),
        supposeFilePathFolderName = init(filePathSplit),
        filePathFolder = supposeFilePathFolderName.join('/');

    return {
        filePathSplit,
        filePathFolder
    };
}