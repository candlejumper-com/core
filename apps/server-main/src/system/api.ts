import express from 'express'
import { Server as SocketServer, Socket } from 'socket.io'
import { join } from 'path'
import { Server as HttpServer, createServer as createServerHttp } from 'http'
import { Server as HttpsServer, createServer as createServerHttps } from 'https'
import cors from 'cors'
import { SystemMain } from './stystem.main'
import { ApiServerBase, logger } from '@candlejumper/shared'
import systemRoutes from './system.main.api'
import deviceRoutes from '../modules/device-manager/device.api'
import backtestRoutes from '../modules/backtest-manager/backtest.api'
import candlesRoutes from '../modules/candle-manager/candle.api'
import ordersRoutes from '../modules/order-manager/order.api'
import editorRoutes from '../modules/editor-manager/editor.api'
import snapshotRoutes from '../modules/snapshot-manager/snapshot.api'
import userRoutes from '../modules/user-manager/user.api'
import aiRoutes from '../modules/ai-manager/ai.api'
import calendarRoutes from '../modules/calendar-manager/calendar.api'
import chatGPTRoutes from '../modules/chatgpt-manager/chatgpt.api'
import insightRoutes from '../modules/insight-manager/insight.api'
import * as passport from 'passport'
import { json } from 'body-parser'
import helmet from 'helmet'
import { TICKER_TYPE } from '@candlejumper/shared'
import { readFileSync } from 'fs'

const PATH_PUBLIC = join(__dirname, '../../../dist/apps/client')

export class ApiServer extends ApiServerBase {

  private cacheMaxAge = 1000 * 60 * 60 // 1 hour

  constructor(private system: SystemMain) {
    super()
  }

  // create public server for web clients
  async start(): Promise<void> {
    this.app = express()
    const isDev = this.system.configManager.config.dev

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
    this.app.use(cors())
    this.app.use(passport.initialize())
    this.app.use(express.static(PATH_PUBLIC, { maxAge: this.cacheMaxAge }))

    // setup public API routes
    this.bindRoutes()

    this.startIndicatorInterval()

    // wait until express server is UP
    return new Promise((resolve, reject) => {
      const { host, port } = this.system.configManager.config.server.api

      this.server.listen(port, host, null, () => {
        logger.info(`✅ Public API listening on ${host}:${port}`)
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
    chatGPTRoutes(this.system, this.app)
    insightRoutes(this.system, this.app)
  }
}
