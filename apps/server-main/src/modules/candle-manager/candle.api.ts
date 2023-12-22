import { Application } from 'express'
import { SystemMain } from "../../system/system"
import { ConfigManager, Routes, SymbolManager } from '@candlejumper/shared'
import { OrderManager } from '../order-manager/order-manager'
import { CandleManager } from './candle-manager'
import { ApiServer } from '../../system/api'
import { UserManager } from '../user-manager/user-manager'
import { readFileSync } from 'fs'

@Routes({})
export class CandleApi {
  constructor(
    private configManager: ConfigManager,
    private userManager: UserManager,
    // private candleManager: CandleManager,
    private apiServer: ApiServer,
  ) {}


  init() {
    this.apiServer.app.get('/api/app-init', (req, res) => {
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

    this.apiServer.app.get('/api/candles/:symbol/:interval', async (req, res) => {
        try {
            const symbol = req.params.symbol
            const interval = req.params.interval
            const count = parseInt(req.query.count as string, 10) || 1000
            console.log('nono23434')
            // const candles = await this.candleManager.getCandles(symbol.replace('_', '/'), interval, count)
            // // const candles = await system.candleManager.getCandles(symbol.replace('_', '/'), interval, count)
        
            // res.send(candles)

            // // TODO - can only handle 1 socket
            // if (this.apiServer.sockets.length){
            //     this.apiServer.sockets[0].data.watch = { symbol, interval }
            // }
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })
  }
    // socket.on('get:/api/candles', (params, next) => {
    //     try {
    //         const from = parseInt(params.from, 10) || 0
    //         const count = parseInt(params.count, 10) || 1000
    //         const symbol = params.symbol
    //         const interval = params.interval
    //         const candles = system.candleManager.getCandles(symbol, interval, count)
        
    //         next({ result: candles })

    //         socket.data.watch = { symbol, interval }
    //     } catch (error) {
    //         console.error(error)
    //         next({ error: error })
    //     }
    // })

  
}