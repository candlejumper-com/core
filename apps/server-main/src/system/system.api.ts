import { Application } from 'express'
import { readFileSync } from 'fs'
import { SystemMain } from './system'
import * as jwt from 'jsonwebtoken'
import { ConfigManager, logger, PATH_LOGS_COMBINED, Routes } from '@candlejumper/shared'
import { UserManager } from '../modules/user-manager/user-manager'
import { EditorManager } from '../modules/editor-manager/editor-manager'
import { RouteBase } from 'libs/shared/src/route'

@Routes({})
export class SystemApi extends RouteBase {
  constructor(
    // private system: SystemMain,
    // private editorManager: EditorManager,
    private userManager: UserManager,
    private configManager: ConfigManager,
    private app: Application,
  ) {
    super()
  }

  async init() {
    // on client init (bootstrap)
    console.log(33333333333)
    this.app.get('/api/app-init', (req, res) => {
      const jwtToken = req.headers['authorization']?.split(' ')[1]
      const user = jwtToken ? this.userManager.getUserFromToken(jwtToken) : undefined

      const data: any = {
        user,
        config: {
          availableBots: [],
          // availableBots: this.editorManager.availableBots,
          system: {
            intervals: this.configManager.config.intervals,
          },
        },
        state: {},
        // state: this.system.getData(false),
      }

      res.send(data)
    })

    // get logs
    this.app.get('/api/logs', (req, res) => {
      const logs = readFileSync(PATH_LOGS_COMBINED)
      res.send({ logs: logs.toString() })
    })
  }
}
