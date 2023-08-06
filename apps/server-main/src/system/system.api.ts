import { Application } from 'express'
import { readFileSync } from 'fs'
import { System } from "./system"
import * as jwt from 'jsonwebtoken'
import { logger, PATH_LOGS_COMBINED } from '../util/log'

export default function (system: System, app: Application) {
    
    // on client init (bootstrap)
    app.get('/api/app-init', (req, res) => {
        const jwtToken = req.headers['authorization']?.split(' ')[1]
        const user = jwtToken ? system.userManager.getUserFromToken(jwtToken) : undefined

        const data: any = {
            user,
            config: {
                availableBots: system.editorManager.availableBots,
                system: {
                    intervals: system.configManager.config.intervals
                }
            },
            state: system.getData(false)
        }

        res.send(data)
    })

    // get logs
    app.get('/api/logs', (req, res) => {
        const logs = readFileSync(PATH_LOGS_COMBINED)
        res.send({ logs: logs.toString() })
    })
}