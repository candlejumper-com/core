import { CandleTickerCallback, ICandle, ISymbol, System, TICKER_TYPE, logger } from '@candlejumper/shared';
import { OrderResponseFull, OrderResponseResult, WebsocketClient } from 'binance';
import axios, { AxiosError } from 'axios';
import rateLimit from 'axios-rate-limit';
import IG, { API_BASE_URL } from 'ig-node-api';
import { IOrder } from '../../order/order.interfaces';
import { Broker } from '../../modules/broker/broker';
import { SimpleQueue } from '../../util/queue';

const defaultOptions = {
  baseURL: API_BASE_URL.PROD,
  headers: {
    'Content-Type': 'application/json',
    'X-IG-API-KEY': '',
    'IG-ACCOUNT-ID': 'BSYOC',
  },
};

export enum BROKER_IG_TIMEFRAMES {
  '1m' = 'MINUTE',
  '2m' = 'MINUTE_2',
  '3m' = 'MINUTE_3',
  '5m' = 'MINUTE_5',
  '10m' = 'MINUTE_10',
  '15m' = 'MINUTE_15',
  '30m' = 'MINUTE_30',
  '1h' = 'HOUR',
  '2h' = 'HOUR_2',
  '3h' = 'HOUR_3',
  '4h' = 'HOUR_4',
  '1d' = 'DAY',
  'W' = 'WEEK',
  'M' = 'MONTH',
}

export class BrokerIG extends Broker {

  id = 'IG';
  instance: IG;
  websocket: WebsocketClient;

  queue: SimpleQueue;

  http = rateLimit(axios.create(defaultOptions), { maxRequests: 5, perMilliseconds: 1000 });

  override async onInit() {
    if (this.system.type === TICKER_TYPE.SYSTEM_BACKTEST) {
      throw new Error('System env BACKTEST should not execute broker.onInit()')
    }

    // this.queue = new QueueBinance(this.system)

    const apiKey = this.configManager.config.brokers.ig.apiKey;
    const username = this.configManager.config.brokers.ig.username;
    const password = this.configManager.config.brokers.ig.password;

    // set default headers
    this.http.defaults.headers['X-IG-API-KEY'] = apiKey;
    this.http.defaults.headers['IG-ACCOUNT-ID'] = 'BSYOC';

    // get access token
    const { data } = await this.http.post(
      '/session',
      { identifier: username, password },
      {
        headers: { Version: 3 },
        'axios-retry': {
          retries: 3,
        },
      }
    );

    // this.instance.getPrices()

    // add access token to default heades
    this.http.defaults.headers['Authorization'] = `Bearer ${data.oauthToken.access_token}`;
  }

  async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void) {
    // const APIKEY = this.system.configManager.config.brokers.binance.apiKey
    // const listenKey = await getUserDataStream(APIKEY)
    // const socketApi = new SocketClient(`ws/${listenKey}`)
    // socketApi.setHandler('executionReport', (data) => eventCallback(userTransforms.executionReport(data)))
    // socketApi.setHandler('outboundAccountPosition', (data) => eventCallback(userTransforms.outboundAccountPosition(data)))
    // socketApi.setHandler('error', (data) => errorCallback(data))
    // renewListenKey(APIKEY)(listenKey)
  }

  /**
   * load account balances
   */
  async syncAccount(): Promise<void> {
    logger.debug(`\u267F Sync balance`);

    const now = Date.now();

    // try {
    //   const balances = await this.instance.getBalances()

    //   this.account.balances = balances.map(balance => ({
    //     free: parseFloat(balance.free as string),
    //     locked: parseFloat(balance.locked as string),
    //     asset: balance.coin
    //   }))
    // } catch (error) {
    //   if (error.status) {
    //     console.error(error.status)
    //     console.error(error.data)
    //   } else {
    //     console.error(error)
    //   }

    //   throw new Error(`Error Sync account balance`)
    // }

    logger.info(`\u2705 Sync balance (${Date.now() - now} ms)`);
  }

  async syncExchangeFromBroker(): Promise<void> {
      
  }

  async getOrdersByMarket(symbol: string): Promise<IOrder[]> {
    // const orders = await this.system.broker.instance.getAccountTradeList({ symbol, limit: 50 })

    // // normalize
    // return orders.map(order => {
    //   const commissionAssetPrice = this.system.candleManager.getSymbolByPair(order.commissionAsset + 'USDT')?.price || 1

    //   const cleanOrder: IOrder = {
    //     id: order.id,
    //     type: 'MARKET',
    //     time: order.time,
    //     price: parseFloat(order.price as string),
    //     side: order.isBuyer ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
    //     symbol: order.symbol,
    //     quantity: parseFloat(order.qty as string),
    //     profit: 0,
    //     commission: parseFloat(order.commission as string),
    //     commissionAsset: order.commissionAsset,
    //     commissionUSDT: 0
    //   }

    //   cleanOrder.commissionUSDT = cleanOrder.commission * commissionAssetPrice

    //   return cleanOrder
    // })
    return [];
  }

  // TODO: check typings
  async placeOrder(order: IOrder): Promise<OrderResponseResult | OrderResponseFull> {
    // return this.system.broker.instance.submitNewOrder(order as any) as Promise<OrderResponseResult>
    return null;
  }

  override startCandleTicker(symbols: ISymbol[], intervals: string[], callback: CandleTickerCallback): void {}
  override getCandlesFromTime(symbol: ISymbol, interval: string, startTime: number): Promise<ICandle[]> {
    throw new Error('Method not implemented.');
  }
  override getCandlesFromCount(symbol: ISymbol, interval: string, count: number): Promise<ICandle[]> {
    throw new Error('Method not implemented.');
  }
  // async get24HChanges(): Promise<IDailyStatsResult[]> {
  //   const results = await this.instance.get24hrChangeStatististics() as DailyChangeStatistic[]

  //   // normalize
  //   results.forEach(result => result.quoteVolume = parseFloat(result.quoteVolume as any))

  //   return results as IDailyStatsResult[]
  // }
}
