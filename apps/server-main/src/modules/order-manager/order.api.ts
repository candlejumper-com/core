import { Application } from 'express'
import { SystemMain } from '../../system/system'
import { logger, ORDER_SIDE, Routes, SymbolManager } from '@candlejumper/shared'
import { OrderManager } from './order-manager'

interface IOrderPostBody {
  symbol: string
  side: ORDER_SIDE
  quantity?: number
  data?: any
}

@Routes({})
export class OrderApi {
  constructor(
    private app: Application,
    private symbolManager: SymbolManager,
    private orderManager: OrderManager,
  ) {}

  async init() {
    this.app.post('/api/order', async (req, res) => {
      try {
        const options: IOrderPostBody = req.body
        const symbol = this.symbolManager.get(options.symbol)
        const result = await this.orderManager.placeOrder({ force: true, ...options, symbol }, null)
        res.send(result)
      } catch (error) {
        console.error(error)
        logger.error(error)
        res.status(500).send('Server error')
      }
    })

    this.app.get('/api/orders', (req, res) => {
      try {
        const count = 100
        const orders = this.symbolManager.symbols.map(symbol => this.orderManager.orders[symbol.name]).flat()

        orders.sort((p1, p2) => (p1.time < p2.time ? 1 : p1.time > p2.time ? -1 : 0))

        res.send(orders.slice(0, count).filter(Boolean))
      } catch (error) {
        res.status(500).send(error)
      }
    })

    this.app.get('/api/orders/:symbol', async (req, res) => {
      res.send(this.orderManager.orders[req.params.symbol] || [])
    })
  }
}
