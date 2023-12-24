import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance';
import { ISymbol, ICandle } from '../../index_client';
import { Broker } from '../../modules/broker/broker';
import { CandleTickerCallback } from '../../modules/broker/broker.interfaces';
import { IOrder } from '../../order/order.interfaces';
import XAPI, { CHART_RANGE_INFO_RECORD, RATE_INFO_RECORD, SYMBOL_RECORD } from 'xapi-node'
import { logger } from '@candlejumper/shared';
import { format } from 'date-fns';
import { log } from 'console';

// https://xstation5.xtb.com/#/demo/loggedIn
// http://developers.xstore.pro/documentation/

export class XtbBroker extends Broker {
    override id = 'xtb'
    instance: any

    override async onInit(): Promise<void> {
        // logger.info('Init broker xtb')
        const { type, accountId, password } = this.configManager.config.brokers.xtb
        this.instance = new XAPI({
            accountId,
            password,
            type
        });
        await this.instance.connect();
    }
    
    override async syncAccount(): Promise<void> {
        logger.debug(`\u267F Sync balance`)

        const now = Date.now()

        logger.info(`\u2705 Sync balance (${Date.now() - now} ms)`)
    }

    override async syncExchangeFromBroker(): Promise<void> {
        const symbols = await this.getTrendingSymbols()
        this.exchangeInfo = {
            symbols: symbols,
            timezone: 'Europe/London',
        }
    }

    override async getOrdersByMarket(market: string): Promise<IOrder[]> {
        return [];
    }

    override async placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull> {
        return null;
    }

    override async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
        // throw new Error('Method not implemented.');
    }

    override async startCandleTicker(symbols: ISymbol[], intervals: string[], callback: CandleTickerCallback) {
        // throw new Error('Method not implemented.');
    }

    override async getCandlesFromTime(symbol: ISymbol, interval: string, fromTime: number): Promise<ICandle[]> {
        const fromTimeDate = new Date(fromTime)
        const startTime = format(fromTimeDate, 'yyyy-MM-dd')
        const queryOptions: CHART_RANGE_INFO_RECORD = {
            end: new Date().getTime(),
            period: 1440, // 1 day
            start: fromTime,
            symbol: symbol.name,
            ticks: 1000
        }

        logger.debug(`\u267F Sync from time: ${symbol} ${interval} ${startTime}`)

        let candles;
        try {
            candles = (await this.instance.Socket.send.getChartRangeRequest(...Object.values(queryOptions))).data.returnData
        } catch (error) {
            console.log(error, 'error');
            
        }
        return this.normalizeCandles(candles.rateInfos)
    }

    override async getCandlesFromCount(symbol: ISymbol, interval: string, count: number): Promise<ICandle[]> {
        const now = new Date()
        const queryOptions: CHART_RANGE_INFO_RECORD = { 
            end: new Date().getTime(),
            period: 1440, // 1 day
            start: now.getTime() - (count * 1440 * 1000),
            symbol: symbol.name,
            ticks: 1000
        }

        logger.debug(`\u267F Sync from time: ${symbol} ${interval} ${now}`)

        let candles;
        try {
            candles = (await this.instance.Socket.send.getChartRangeRequest(...Object.values(queryOptions))).data.returnData
        } catch (error) {
            console.log(error, 'error');
            
        }

        return this.normalizeCandles(candles.rateInfos)
    }

    private async getTrendingSymbols(): Promise<ISymbol[]> {
        const data = (await this.instance.Socket.send.getAllSymbols()).data.returnData;
        const symbols = data.map((symbol: SYMBOL_RECORD) => {
            return {
                name: symbol.symbol,
                baseAsset: '',
                quoteAsset: '',
                price: symbol.ask,
                priceString: symbol.ask.toString(),
                direction: 0,
                change24H: 0,
                start24HPrice: 0,
                change24HString: '0',
                changedSinceLastClientTick: false,
                totalOrders: 0,
                candles: {
                    '1d': {
                        candles: [],
                        volume: [],
                    },
                }
            }
        });
        return symbols;
    }

    private normalizeCandles(candles: RATE_INFO_RECORD[]): ICandle[] {
        // console.log(parse(candles[0].snapshotTime, "yyyy:MM:dd-HH:mm:ss", new Date()))
    
        return (candles || []).map(candle => [new Date(candle.ctm).getTime(), candle.open, candle.open + candle.high, candle.open + candle.low, candle.open + candle.close, candle.vol])
      }

}