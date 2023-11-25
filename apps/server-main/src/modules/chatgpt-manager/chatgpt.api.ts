import { Application } from 'express'
import { System } from "../../system/system"

export default function (system: System, app: Application) {

    app.get('/api/chatgpt', async (req, res) => {
        try {
            const result = await system.chatGPTManager.test()
            res.send(result)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })
}