import { Application } from 'express'
import { authenticate } from 'passport'
import { SystemMain } from '../../system/system'
import * as jwt from 'jsonwebtoken'
import { IUser, UserService } from './user.service'
import { ConfigService, RouteBase, Routes, System } from '@candlejumper/shared'
import { Z_ASCII } from 'zlib'
import { ApiServer } from '../../system/system.api'

@Routes({})
export class UserApi extends RouteBase {
  constructor(
    // private userService: UserService,
    private apiServer: ApiServer,
    private configManager: ConfigService,
  ) {
    super()
  }

  async onInit() {
    this.apiServer.app.get('/api/user', async (req, res) => {
      try {
        // const user = await this.userService.find(req.body)

        // if (user) {
        //   res.send(user)
        // } else {
        //   res.sendStatus(404)
        // }
      } catch (error) {
        console.error(error)
        res.sendStatus(500)
      }
    })

    this.apiServer.app.post('/api/user', async (req, res) => {
      try {
        // await this.userService.create(req.body)
        res.sendStatus(204)
      } catch (error) {
        console.error(error)
        res.sendStatus(500)
      }
    })

    this.apiServer.app.post('/api/user/production-mode', async (req, res) => {
      // try {
      //     this.system.toggleProductionMode(req.body.state as boolean)
      //     res.sendStatus(204)
      // } catch (error) {
      //     console.error(error)
      //     res.sendStatus(500)
      // }
    })

    this.apiServer.app.post('/api/user/login', async (req, res) => {
      try {
        authenticate('local', { session: false }, (err, user: IUser) => {
          if (err) {
            return res.status(500).send(err)
          }

          if (!user) {
            return res.sendStatus(401)
          }

          req.login(user, { session: false }, err => {
            if (err) {
              res.send(err)
            }

            // create a new token for the user
            const jwtSecret = this.configManager.config.security.jwtSecret
            const token = jwt.sign(user, jwtSecret)
            res.json({ token })
          })
        })(req, res)
      } catch (error) {
        console.error(error)
        res.sendStatus(500)
      }
    })
  }
}
