import { CLIENT_EXTENSION_MESSAGE_TYPE } from "./service-worker.util"

export interface IClientExtensionMessage {
  type: CLIENT_EXTENSION_MESSAGE_TYPE
  data?: any
}