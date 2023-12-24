import { Application, json } from 'express'
import { readFileSync } from 'fs'
import { SystemMain } from './system'
import * as jwt from 'jsonwebtoken'
import { ConfigService, logger, PATH_LOGS_COMBINED, Routes, Service } from '@candlejumper/shared'
import { UserService } from '../modules/user-manager/user.service'
import { EditorManager } from '../modules/editor-manager/editor-manager'
import { RouteBase } from 'libs/shared/src/route'
import express from 'express'
import passport from 'passport'
import { join } from 'path'
import { Server } from 'ws'
import { Server as SocketServer, Socket } from 'socket.io'
import { Server as HttpServer, createServer as createServerHttp } from 'http'
import { Server as HttpsServer, createServer as createServerHttps } from 'https'

const PATH_PUBLIC = join(__dirname, '../../../dist/apps/client')

@Service()
export class ApiServer {
  app: express.Application
  server: HttpServer
  io: SocketServer

  private cacheMaxAge = 1000 * 60 * 60 // 1 hour

  constructor(
    // private system: SystemMain,
    // private editorManager: EditorManager,
    private userService: UserService,
    private configManager: ConfigService
  ) {
 
  }

  onInit() {
    console.log('O INIT')
    const isDev = this.configManager.config.dev

    if (isDev) {
      this.server = createServerHttp(this.app)
    } else {
      const privateKey = readFileSync(join(__dirname, '../../../privkey.pem'))
      const certificate = readFileSync(join(__dirname, '../../../cert.pem'))

      this.server = createServerHttps(
        {
          key: privateKey,
          cert: certificate,
        },
        this.app,
      )
    }

    this.io = new SocketServer(this.server)
    this.app = express()  
    // this.app.use(cors())
    // this.app.use(helmet({
    //     contentSecurityPolicy: false,
    //     crossOriginEmbedderPolicy: false
    // }))
    this.app.use(json())
    this.app.use(passport.initialize())
    this.app.use(express.static(PATH_PUBLIC, { maxAge: this.cacheMaxAge }))

    // setup public API routes
 

    this.startIndicatorInterval()

    const { host, port } = this.configManager.config.server?.api

    this.server.listen(port, host, () => {
      logger.info(`\u2705 Public API started on http://${host}:${port}`)
    })

    this.server.on('error', error => {
      logger.error(error)
    })

    this.bindRoutes()
    
  }

  startIndicatorInterval() {
    setInterval(() => {
      // const systemData = this.system.getData()
      // const tickersData = systemData.tickers.filter((ticker) => ticker.type === TICKER_TYPE.INDICATOR)
      // this.io.emit('indicators', tickersData)
    }, 1000)
  }

  private bindRoutes() {

    this.io.on('connection', () => {
      logger.info('IO connection from client')
    })
    console.log('bind routes 222 3333')

    this.app.get('/', (req, res) => {

      res.send(true)
    })
    this.app.get('/api/app-init', (req, res) => {
      console.log(222222222222222)
      // const jwtToken = req.headers['authorization']?.split(' ')[1]
      // const user = jwtToken ? this.userService.getUserFromToken(jwtToken) : undefined

      // const data: any = {
      //   user,
      //   config: {
      //     availableBots: [],
      //     // availableBots: this.editorManager.availableBots,
      //     system: {
      //       intervals: this.configManager.config.intervals,
      //     },
      //   },
      //   state: {},
      //   // state: this.system.getData(false),
      // }

      res.send(true)
    })

    // get logs
    this.app.get('/api/logs', (req, res) => {
      const logs = readFileSync(PATH_LOGS_COMBINED)
      res.send({ logs: logs.toString() })
    })
  }
}
