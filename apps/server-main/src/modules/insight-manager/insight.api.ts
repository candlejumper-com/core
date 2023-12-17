import { Application } from 'express'
import { SystemMain } from "../../system/system"

export default function (system: SystemMain, app: Application) {

    app.get('/api/insight', (req, res) => {
        try {
            // res.send(system.symbolManager.symbols)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })
}