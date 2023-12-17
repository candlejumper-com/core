import { Application } from 'express'
import { SystemMain } from "../../system/system"

export default function (system: SystemMain, app: Application) {

    app.get('/api/calendar', (req, res) => {
        try {
            res.send(system.calendarManager.items)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })
}