import { Application } from 'express'
import { System } from "../../system/system"

export default function (system: System, app: Application) {

    app.get('/api/insight', (req, res) => {
        try {
            res.send(system.insightManager.insights)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })
}