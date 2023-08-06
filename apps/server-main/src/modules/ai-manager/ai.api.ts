import { Application } from 'express'
import { Socket } from 'socket.io'
import { System } from "../../system/system"
import { ITensorflowOptions } from './ai.interfaces'

export default function (system: System, app?: Application, socket?: Socket) {

    if (socket) {
        socket.on('post:/api/ai', async (options: ITensorflowOptions, callback) => {
            try {
                const result = await system.aiManager.run(options)
                callback(result)
            } catch (error) {
                console.error(error)
            }
        })
    }
  
    if (app) {
        app.get('/api/backtest/orders/:symbol/:interval', async (req, res) => {
            try {
                const symbol = req.params.symbol
                const interval = req.params.interval
                const backtest = system.backtestManager.latest.systems.find(backtest => backtest.config.symbols[0] === symbol && backtest.tickers[0].interval === interval)
    
                if (backtest) {
                    const orders = backtest.symbols[symbol].orders
                    res.send(orders)
                } else {
                    res.status(404).send({ error: 'not found' })
                }
            } catch (error) {
                console.error(error)
                res.status(500).send(error)
            }
        })
    }
}