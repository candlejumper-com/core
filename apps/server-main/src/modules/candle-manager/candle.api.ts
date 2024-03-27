import { Application } from 'express'
import { SystemMain } from "../../system/stystem.main"

export default function (system: SystemMain, app?: Application) {

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

    // app.get('/api/candles/:symbol/:interval', async (req, res) => {
    //     try {
    //         const symbol = req.params.symbol
    //         const interval = req.params.interval
    //         const count = parseInt(req.query.count as string, 10) || 1000
    //         console.log('nono23434')
    //         const candles = await system.candleManager.getCandles(symbol.replace('_', '/'), interval, count)
    //         // const candles = await system.candleManager.getCandles(symbol.replace('_', '/'), interval, count)
        
    //         res.send(candles)

    //         // TODO - can only handle 1 socket
    //         if (system.apiServer.sockets.length){
    //             system.apiServer.sockets[0].data.watch = { symbol, interval }
    //         }
    //     } catch (error) {
    //         console.error(error)
    //         res.status(500).send(error)
    //     }
    // })
}