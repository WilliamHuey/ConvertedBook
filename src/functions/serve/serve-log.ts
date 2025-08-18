// Library modules
import { messageType } from "../shared/types.js"

export enum messagesKeys {
  errorWhenStartingServer = 'errorWhenStartingServer' as any,
  serverJsNotFound = 'serverJsNotFound' as any
}

export const messages: {[key: string]: messageType}  = {
  errorWhenStartingServer: 'Error when attempting to start server!',
  serverJsNotFound: 'Error: Did not find the "server.js" file, might not be a "convertedbook" project! Pdf generation will run without respecting the "exact" option'
}