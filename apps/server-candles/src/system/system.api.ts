import express from 'express'
import { Server as IOServer } from 'socket.io'
import { createServer, Server } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import * as bodyParser from 'body-parser'
import { BrokerService, ConfigService, logger, Service } from '@candlejumper/shared'

@Service({ name: 'ApiServer' })
export class ApiServer {
  app: express.Application
  server: Server
  io: IOServer

  constructor(
    // private configManager: ConfigService,
    // private brokerService: BrokerService,
  ) {}

  onInit() {
    this.app = express()
    this.app.use(cors())
    this.app.use(helmet())
    this.app.use(bodyParser.json({ limit: '50mb' }))
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

    this.server = createServer(this.app)
    this.io = new IOServer(this.server)

    this.bindRoutes()

    // return new Promise((resolve, reject) => {
    //   const { host, port } = this.configManager.config.server?.candles

    //   this.server.listen(port, host, () => {
    //     logger.info(`\u2705 Public API started on http://${host}:${port}`)
    //     resolve(null)
    //   })

    //   this.server.on('error', error => {
    //     logger.error(error)
    //   })
    // })
  }

  private bindRoutes() {
    this.io.on('connection', () => {
      logger.info('IO connection from client')
    })

    // return OK
    this.app.get('/', (req, res) => res.send('Candle server is running'))

    // get candles
    
    this.app.get('/api/exchange/:broker', async (req, res) => {
      // try {
      //   res.send({
      //     intervals: this.configManager.config.intervals,
      //     exchangeInfo: this.brokerService.get().exchangeInfo,
      //   })
      // } catch (error) {
      //   console.error(error)
      //   res.sendStatus(500)
      // }
    })
  }
}
