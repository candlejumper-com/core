import { Application } from 'express'
import { authenticate } from 'passport'
import { SystemMain } from "../../system/stystem.main"
import * as jwt from 'jsonwebtoken'
import { IUser } from './user-manager'

export default function (system: SystemMain, app: Application) {

    app.get('/api/user', async (req, res) => {
        try {
            const user = await system.userManager.find(req.body)

            if (user) {
                res.send(user)
            } else {
                res.sendStatus(404)
            }
        } catch (error) {
            console.error(error)
            res.sendStatus(500)
        }
    })

    app.post('/api/user', async (req, res) => {
        try {
            await system.userManager.create(req.body)
            res.sendStatus(204)
        } catch (error) {
            console.error(error)
            res.sendStatus(500)
        }
    })

    
    app.post('/api/user/production-mode', async (req, res) => {
        try {
            system.toggleProductionMode(req.body.state as boolean)
            res.sendStatus(204)
        } catch (error) {
            console.error(error)
            res.sendStatus(500)
        }
    })

    app.post('/api/user/login', async (req, res) => {
        try {
            authenticate('local', { session: false }, (err, user: IUser) => {
                if (err) {
                    return res.status(500).send(err)
                }

                if (!user) {
                    return res.sendStatus(401)
                }

                req.login(user, { session: false }, (err) => {
                    if (err) {
                        res.send(err);
                    }

                    // create a new token for the user
                    const jwtSecret = system.configManager.config.security.jwtSecret
                    const token = jwt.sign(user, jwtSecret)
                    res.json({ token })
                });
            })(req, res)
        } catch (error) {
            console.error(error)
            res.sendStatus(500)
        }
    })
}