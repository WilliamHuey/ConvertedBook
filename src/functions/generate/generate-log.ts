// Library modules
import { messageType } from "../shared/types.js"

export enum messagesKeys {
  nonExistingParentFolder = 'nonExistingParentFolder' as any,
  folderAlreadyExists = 'folderAlreadyExists' as any,
  folderExistsNotGenerated = 'folderExistsNotGenerated' as any,
  canNotCreateFolder = 'canNotCreateFolder' as any,
  completeProjectGeneration = 'completeProjectGeneration' as any,
  createdProjectFoldersAndFiles = 'createdProjectFoldersAndFiles' as any,
  nowDownloadingFiles = 'nowDownloadingFiles' as any,
  copyGenerateFilesToDist = 'copyGenerateFilesToDist' as any,
  completeGenerateFileCopy = 'completeGenerateFileCopy' as any,
  removeTsconfigBuildInfo = 'removeTsconfigBuildInfo' as any,
}

export const messages: {[key: string]: messageType} = {
  nowDownloadingFiles: 'Now downloading node modules...',
  createdProjectFoldersAndFiles: 'Created project folders and files',
  completeProjectGeneration: 'Completed project generation',
  canNotCreateFolder: 'Error: Can not create folder',
  nonExistingParentFolder: 'Error: Non-existent parent folder for ',
  folderAlreadyExists: 'Error: Folder already exists in current directory and project was not generated',
  copyGenerateFilesToDist: "Copy the 'generate' files for the dist folder",
  completeGenerateFileCopy: "Complete the 'generate' files copy",
  removeTsconfigBuildInfo: "Removed 'tsconfig.tsbuildinfo'",
  folderExistsNotGenerated: (data: any) =>{
    return `Error: Folder already exists: ${data.path}. Project was not generated`;
  }
};
