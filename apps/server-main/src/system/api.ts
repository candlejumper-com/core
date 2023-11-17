import express from 'express'
import { Server as SocketServer, Socket } from 'socket.io'
import { join } from 'path'
import { Server as HttpServer, createServer as createServerHttp } from 'http'
import { Server as HttpsServer, createServer as createServerHttps } from 'https'
import cors from 'cors'
import { System } from './system'
import { logger, PATH_LOGS_COMBINED } from '@candlejumper/shared'
import systemRoutes from './system.api'
import deviceRoutes from '../modules/device-manager/device.api'
import backtestRoutes from '../modules/backtest-manager/backtest.api'
import candlesRoutes from '../modules/candle-manager/candle.api'
import ordersRoutes from '../modules/order-manager/order.api'
import editorRoutes from '../modules/editor-manager/editor.api'
import snapshotRoutes from '../modules/snapshot-manager/snapshot.api'
import userRoutes from '../modules/user-manager/user.api'
import aiRoutes from '../modules/ai-manager/ai.api'
import calendarRoutes from '../modules/calendar-manager/calendar.api'
import passport from 'passport'
import { json } from 'body-parser'
import helmet from 'helmet'
import { TICKER_TYPE } from '@candlejumper/shared'
import { readFileSync } from 'fs'

const PATH_PUBLIC = join(__dirname, '../../public/client')

export class ApiServer {
  app: express.Application
  server: HttpServer
  io: SocketServer
  sockets: Socket[] = []

  private cacheMaxAge = 1000 * 60 * 60 // 1 hour

  constructor(private system: System) {}

  // create public server for web clients
  async start(): Promise<void> {
    this.app = express()
    const isDev = false

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
    // this.app.use(cors())
    // this.app.use(helmet({
    //     contentSecurityPolicy: false,
    //     crossOriginEmbedderPolicy: false
    // }))
    this.app.use(json())
    this.app.use(passport.initialize())
    this.app.use(express.static(PATH_PUBLIC, { maxAge: this.cacheMaxAge }))

    // setup public API routes
    this.bindRoutes()

    this.startIndicatorInterval()

    // wait until express server is UP
    return new Promise((resolve, reject) => {
      const { host, port } = this.system.configManager.config.server.api

      this.server.listen(port, '0.0.0.0', null, () => {
        logger.info(`\u2705 Public API listening on ${host}:${port}`)
        resolve(null)
      })
    })
  }

  startIndicatorInterval() {
    setInterval(() => {
      const systemData = this.system.getData()
      const tickersData = systemData.tickers.filter((ticker) => ticker.type === TICKER_TYPE.INDICATOR)
      this.io.emit('indicators', tickersData)
    }, 1000)
  }

  // bind API routes
  // TODO - refactor. Let modules load routes them selfs (NestJS??)
  private bindRoutes(): void {
    this.io.on('connection', (socket) => {
      // remove socket from list
      socket.on('disconnect', () => {
        this.system.backtestManager.stop()
        this.sockets.splice(this.sockets.indexOf(socket), 1)
      })

      // add socket to list
      this.sockets.push(socket)

      // bind socket routes
      backtestRoutes(this.system, null, socket)
      snapshotRoutes(this.system, null, socket)
      aiRoutes(this.system, null, socket)
    })

    systemRoutes(this.system, this.app)
    backtestRoutes(this.system, this.app)
    deviceRoutes(this.system, this.app)
    userRoutes(this.system, this.app)
    candlesRoutes(this.system, this.app)
    ordersRoutes(this.system, this.app)
    editorRoutes(this.system, this.app)
    snapshotRoutes(this.system, this.app)
    calendarRoutes(this.system, this.app)
  }
}
