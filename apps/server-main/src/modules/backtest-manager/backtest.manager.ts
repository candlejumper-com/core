import { join } from 'path';
import { SystemMain } from "../../system/system";
import { pool, Pool } from 'workerpool';
import { logger, ISystemState, BrokerYahoo } from '@candlejumper/shared';
import { IBacktestResult, IBacktestOptions, IWorkerData } from './backtest.interfaces';

const PATH_WORKER = join(__dirname, 'backtest.worker.js')
// const PATH_WORKER = new URL(join(__dirname, 'backtest.worker.js'), import.meta.url)

export enum BACKTEST_TYPE {
    'OHLC' = 'OHLC',
    'OHLC_TICKS' = 'OHLC_TICKS'
}

export class BacktestManager {

    latest: IBacktestResult

    private pool: Pool

    constructor(public system: SystemMain, public maxWorker?: number) { }

    /**
     * start running a batch of backtests
     */
    async run(options: IBacktestOptions): Promise<IBacktestResult> {
        logger.info(`Backtest starting`)

        const now = Date.now()
        const promiseList = []

        if (!this.pool) {
            this.createPool()
        }

        if (!options.bots?.length) {
            throw 'No bots'
        }

        // loop over all symbols
        for (let i = 0, len = options.symbols.length; i < len; ++i) {
            const symbolName = options.symbols[i]
            const brokerSymbol = this.system.brokerManager.getByClass(BrokerYahoo).getExchangeInfoBySymbol(symbolName)
            const symbol = this.system.symbolManager.get(symbolName)

            // check if symbol is recognized (currently in use / cached)
            if (!brokerSymbol || !symbol) {
                logger.error(`BACKTEST - Symbol ${symbolName} is not valid`)
                continue
            }

            // loop over all intervals
            for (let k = 0, lenk = options.intervals.length; k < lenk; k++) {
                const workerData: IWorkerData = {
                    exchangeInfo: {
                        symbols: [brokerSymbol]
                    } as any,
                    options: {
                        symbol,
                        interval: options.intervals[k],
                        candleCount: +options.candleCount,
                        bots: options.bots,
                        USDT: options.USDT,
                        optimize: options.optimize,
                        type: options.type,
                    }
                }

                promiseList.push(this.pool.exec('run', [workerData], {on: () => {
                    console.log('23434')
                }}))
            }
        }

        const results = await Promise.all(promiseList)
        const systems = this.getData(results.filter(Boolean), options)
        const totalTime = Date.now() - now

        this.latest = {
            config: options,
            totalTime,
            systems
        }

        logger.info(`Backtest took ${totalTime}ms`)

        return this.latest
    }

    stop() {
        console.log('BacktestManager - TODO - stop')
    }

    getData(systems: ISystemState[], options: IBacktestOptions) {        
        const data = systems.map(_backtest => {
            const backtest = _backtest
            const startUSDT = options.USDT
            
            // calculate daily average profit
            const symbol = backtest.config.symbols[0]
            const baseAsset = backtest.tickers[0].symbol.baseAsset
            const quoteAsset = backtest.tickers[0].symbol.quoteAsset
            const baseAssetBalance = backtest.account.balances.find(balance => balance.asset === baseAsset).free
            const qouteAssetBalance = backtest.account.balances.find(balance => balance.asset === quoteAsset).free
            const latestPrice = backtest.tickers[0].symbol.price
            const totalValue = (latestPrice * baseAssetBalance) + qouteAssetBalance
            const totalProfit = totalValue - startUSDT

            // calculate daily profit
            const startDate = new Date(backtest.tickers[0].stats.startTime)
            const endDate = this.system.time || new Date()
            const diffMilliseconds = (endDate?.getTime() - startDate?.getTime()) || 0
            const diffDays = diffMilliseconds / (1000 * 3600 * 24)
            const dailyProfit = totalProfit / diffDays
            const profitIndex = (dailyProfit / startUSDT) * 100

            backtest.profitIndex = profitIndex
            backtest.profit = totalProfit
            // backtest.orders = []
            // backtest.orders = backtest.symbols[symbol].orders

            return backtest
        })

        return data
    }

    async destroy(): Promise<void> {
        logger.info(`Killing worker pool`)
        await this.pool.terminate()
    }

    private createPool() {
        const options: any = {}

        if (this.maxWorker) {
            options.maxWorkers = this.maxWorker
        }
        console.log(3434, PATH_WORKER.toString())
        this.pool = pool(PATH_WORKER.toString().replace('file:///', '/'), options);
    }
}