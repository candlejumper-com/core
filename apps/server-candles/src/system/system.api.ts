import express from 'express'
import { Server as IOServer } from 'socket.io'
import { createServer, Server } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import * as bodyParser from 'body-parser'
import { SystemCandles } from './system'
import { ConfigManager, logger, Service, SymbolManager } from '@candlejumper/shared'
import { BrokerManager } from 'libs/shared/src/modules/broker/broker.manager'
import { CandleManager } from '../modules/candle-manager/candle-manager'

@Service({ name: 'ApiServer' })
export class ApiServer {
  app: express.Application
  server: Server
  io: IOServer

  constructor(
    private configManager: ConfigManager,
    private symbolManager: SymbolManager,
    private brokerManager: BrokerManager,
    // private candleManager: CandleManager,
  ) {}

  private connections: any[] = []

  async start() {
    this.app = express()
    this.app.use(cors())
    this.app.use(helmet())
    this.app.use(bodyParser.json({ limit: '50mb' }))
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

    this.server = createServer(this.app)
    this.io = new IOServer(this.server)

    this.bindRoutes()

    return new Promise((resolve, reject) => {
      const { host, port } = this.configManager.config.server?.candles

      this.server.listen(port, host, () => {
        logger.info(`\u2705 Public API started on http://${host}:${port}`)
        resolve(null)
      })

      this.server.on('error', error => {
        logger.error(error)
      })
    })
  }

  private bindRoutes() {
    this.io.on('connection', () => {
      logger.info('IO connection from client')
    })

    // return OK
    this.app.get('/', (req, res) => res.send('Candle server is running'))

    // get candles
    this.app.post('/api/candles', async (req, res) => {
      try {
        const query = req.query as any
        const pairs = req.body as any
        const from = parseInt(query.from, 10) || 0
        const count = parseInt(query.count, 10)
        const data = {}
        for (let i = 0, len = pairs.length; i < len; i++) {
          const pair = pairs[i]
          const symbol = this.symbolManager.get(pair.name)

          if (!symbol) {
            continue
          }

          const interval = pair.interval
        //   const candles = await this.candleManager.getFromDB(symbol, interval, count)

        //   data[symbol.name] = data[symbol.name] || {}
        //   data[symbol.name][interval] = candles
        }

        res.send(data)
      } catch (error) {
        console.error(error)
        res.status(500).send(error)
      }
    })

    this.app.get('/api-candles/candles/:symbol/:interval', async (req, res) => {
      try {
        const params = req.params
        const query = req.query as any
        const count = parseInt(query.count, 10) || 1000
        // const candles = this.system.candleManager.get(params.symbol, params.interval, count)

        // const candles = await this.candleManager.getFromDB({name: params.symbol}, params.interval, count)
        // res.send(candles)
      } catch (error) {
        console.error(error)
        res.status(500).send(error)
      }
    })

    this.app.get('/api/exchange/:broker', async (req, res) => {
      try {
        res.send({
          intervals: this.configManager.config.intervals,
          exchangeInfo: this.brokerManager.get().exchangeInfo,
        })
      } catch (error) {
        console.error(error)
        res.sendStatus(500)
      }
    })
  }
}
