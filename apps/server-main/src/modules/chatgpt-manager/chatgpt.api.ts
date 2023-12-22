import { Application } from 'express'
import { SystemMain } from "../../system/system"
import { ChatGPTManager } from './chatgpt.manager'

export class OrderApi {
    constructor(
      private system: SystemMain,
      private app: Application,
      private chatGPTManager: ChatGPTManager,
    ) {}
  
    init() {

    this.app.get('/api/chatgpt', async (req, res) => {
        try {
            const result = await this.chatGPTManager.test()
            res.send(result)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })
}
}