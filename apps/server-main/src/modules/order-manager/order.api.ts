import { Application } from 'express'
import { SystemMain } from "../../system/system"
import { logger, ORDER_SIDE, ORDER_TYPE } from '@candlejumper/shared'

interface IOrderPostBody {
    symbol: string
    side: ORDER_SIDE
    quantity?: number
    data?: any
}

export default function (system: SystemMain, app: Application) {
    app.post('/api/order', async (req, res) => {
        try {
            const options: IOrderPostBody = req.body
            const symbol = system.symbolManager.get(options.symbol)
            const result = await system.orderManager.placeOrder({type: ORDER_TYPE.MARKET, force: true, ...options, symbol}, null)
            res.send(result)
        } catch (error) {
            console.error(error)
            logger.error(error)
            res.status(500).send('Server error')
        }
    })

    app.get('/api/orders', (req, res) => {
        try {
            // const count = 100
            // const orders = system.symbolManager.symbols.map(symbol => system.orderManager.orders[symbol.name]).flat()
    
            // orders.sort((p1, p2) => (p1.time < p2.time) ? 1 : (p1.time > p2.time) ? -1 : 0)
    
            // res.send(orders.slice(0, count).filter(Boolean))
        } catch (error) {
            res.status(500).send(error)
        }
    })

    app.get('/api/orders/:symbol', async (req, res) => {
        // res.send(system.orderManager.orders[req.params.symbol] || [])
    })
}