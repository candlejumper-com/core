import { Application } from 'express'
import { System } from "../../system/system"

export default function (system: System, app: Application) {
    app.post('/api/device', async (req, res) => {
        try {
            await system.deviceManager.add(req.body.fcmToken)
            res.sendStatus(204)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })
}