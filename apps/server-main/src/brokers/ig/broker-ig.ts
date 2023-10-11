import { logger } from '../../util/log';
import { Broker } from '../broker';
import { OrderResponseFull, OrderResponseResult, WebsocketClient } from 'binance';
import axios, { AxiosError } from 'axios';
import rateLimit from 'axios-rate-limit';
import IG, { API_BASE_URL } from 'ig-node-api';
import { QueueBinance } from '../binance/binance.queue';
import { IOrder } from '../../modules/order-manager/order.interfaces';
import { SYSTEM_ENV } from '../../system/system';

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

  queue: QueueBinance;

  http = rateLimit(axios.create(defaultOptions), { maxRequests: 5, perMilliseconds: 1000 });

  async onInit() {
    if (this.system.env === SYSTEM_ENV.BACKTEST) {
      throw new Error('System env BACKTEST should not execute broker.onInit()');
    }

    // this.queue = new QueueBinance(this.system)

    const apiKey = this.system.configManager.config.brokers.ig.apiKey;
    const username = this.system.configManager.config.brokers.ig.username;
    const password = this.system.configManager.config.brokers.ig.password;

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

  /**
   * load broker data from candleServer (symbols, limits etc)
   */
  async syncExchange(): Promise<void> {
    logger.debug(`\u267F Sync exchange info`);

    const now = Date.now();
    const candleServerUrl = this.system.configManager.config.server.candles.url;

    try {
      const { data } = await axios.get(`${candleServerUrl}/api/exchange/ig`, {
        'axios-retry': {
          retries: 10
        },
      });

      this.exchangeInfo = data.exchangeInfo;
      this.timezone = (this.exchangeInfo as any).timezone;

      logger.info(`\u2705 Sync exchange info (${Date.now() - now} ms)`);
    } catch (error) {
      // Throw an error indicating the failure to fetch broker config
      throw new Error(`error fetching broker config from candle server`.red);
    }
  }

  getExchangeInfoBySymbol(symbol: string): any {
    return this.exchangeInfo.symbols.find((_symbol) => _symbol.name === symbol);
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

  // async get24HChanges(): Promise<IDailyStatsResult[]> {
  //   const results = await this.instance.get24hrChangeStatististics() as DailyChangeStatistic[]

  //   // normalize
  //   results.forEach(result => result.quoteVolume = parseFloat(result.quoteVolume as any))

  //   return results as IDailyStatsResult[]
  // }
}
