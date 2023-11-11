import { MainClient, OrderResponseFull, OrderResponseResult } from 'binance'
import axios, { } from 'axios'
import { userTransforms } from './binance.tranformers'
import { IOrder, ORDER_SIDE } from '../../order/order.interfaces'
import renewListenKey from './external/lib/helpers/renewListenKey'
import getUserDataStream from './external/lib/services/getUserDataStream'
import SocketClient from './external/lib/socketClient'
import { Broker } from '../broker'
import { SYSTEM_ENV } from '../../system/system'
import { logger } from '../../util/log';

export class BrokerBinance extends Broker {

  instance: MainClient

  override async onInit() {
    if (this.system.env === SYSTEM_ENV.BACKTEST) {
      throw new Error('System env BACKTEST should not execute broker.onInit()')
    }

    const apiKey = this.system.configManager.config.brokers.binance.apiKey
    const apiSecret = this.system.configManager.config.brokers.binance.apiSecret

    this.instance = new MainClient({
      api_key: apiKey,
      api_secret: apiSecret,
      strictParamValidation: true
    }, {
      timeout: 60000
    })
  }

  async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void) {
    const APIKEY = this.system.configManager.config.brokers.binance.apiKey

    const listenKey = await getUserDataStream(APIKEY)
    const socketApi = new SocketClient(`ws/${listenKey}`)

    socketApi.setHandler('executionReport', (data) => eventCallback(userTransforms.executionReport(data)))
    socketApi.setHandler('outboundAccountPosition', (data) => eventCallback(userTransforms.outboundAccountPosition(data)))
    socketApi.setHandler('error', (data) => errorCallback(data))
    renewListenKey(APIKEY)(listenKey)
  }

  /**
   * load account balances
   */
  async syncAccount(): Promise<void> {
    logger.debug(`\u267F Sync balance`)

    const now = Date.now()

    try {
      const balances = await this.instance.getBalances()

      this.account.balances = balances.map(balance => ({
        free: parseFloat(balance.free as string),
        locked: parseFloat(balance.locked as string),
        asset: balance.coin
      }))
    } catch (error: any) {
      if (error.status) {
        console.error(error.status)
        console.error(error.data)
      } else {
        console.error(error)
      }

      throw new Error(`Error Sync account balance`)
    }

    logger.info(`\u2705 Sync balance (${Date.now() - now} ms)`)
  }

  /**
   * load broker data from candleServer (symbols, limits etc)
   */
  async syncExchange(): Promise<void> {
    logger.debug(`\u267F Sync exchange info`)

    const now = Date.now()
    const candleServerUrl = this.system.configManager.config.server.candles.url

    try {
      const { data } = await axios.get(`${candleServerUrl}/api/exchange/binance`)
      this.exchangeInfo = data.exchangeInfo
      this.timezone = (this.exchangeInfo as any).timezone
    } catch (error: any) {
      if (error.cause) {
        logger.error(error.cause)
      }
      else if (error.status) {
        console.error(error.status)
        console.error(error.data)
      }

      else {
        console.error(error)
      }

      throw new Error(`error fetching broker config from candle server`.red)
    }

    logger.info(`\u2705 Sync exchange info (${Date.now() - now} ms)`)
  }

  getExchangeInfoBySymbol(symbol: string): any {
    // getExchangeInfoBySymbol(symbol: string): Exc['symbols'][0] {
    return this.exchangeInfo.symbols.find(_symbol => _symbol.name === symbol)
  }

  async getOrdersByMarket(symbol: string): Promise<IOrder[]> {
    const orders = await this.instance.getAccountTradeList({ symbol, limit: 50 })

    // normalize
    return orders.map(order => {
      // const commissionAssetPrice = this.system.candleManager.getSymbolByPair(order.commissionAsset + 'USDT')?.price || 1

      const cleanOrder: IOrder = {
        id: order.id,
        type: 'MARKET',
        time: order.time,
        price: parseFloat(order.price as string),
        side: order.isBuyer ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
        symbol: order.symbol,
        quantity: parseFloat(order.qty as string),
        profit: 0,
        commission: parseFloat(order.commission as string),
        commissionAsset: order.commissionAsset,
        commissionUSDT: 0
      }

      // cleanOrder.commissionUSDT = cleanOrder.commission * commissionAssetPrice

      return cleanOrder
    })
  }

  // TODO: check typings
  async placeOrder(order: IOrder): Promise<OrderResponseResult | OrderResponseFull> {
    return this.instance.submitNewOrder(order as any) as Promise<OrderResponseResult>
  }

  // async get24HChanges(): Promise<IDailyStatsResult[]> {
  //   const results = await this.instance.get24hrChangeStatististics() as DailyChangeStatistic[]

  //   // normalize
  //   results.forEach(result => result.quoteVolume = parseFloat(result.quoteVolume as any))

  //   return results as IDailyStatsResult[]
  // }
}