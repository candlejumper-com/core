import { OrderResponseFull, OrderResponseResult, WebsocketClient } from 'binance'
import axios, { AxiosError } from 'axios'
import rateLimit from 'axios-rate-limit'
import IG, { API_BASE_URL } from 'ig-node-api'
import { Broker } from '../../modules/broker/broker'
import { SimpleQueue } from '../../util/queue'
import { ISymbol, ICandle } from '../../index_client'
import { CandleTickerCallback } from '../../modules/broker/broker.interfaces'
import { IOrder } from '../../modules/order/order.interfaces'
import { TICKER_TYPE } from '../../ticker/ticker.util'
import { logger } from '../../util/log'
import { ICalendarItem } from '../../modules/calendar/calendar.interfaces'
import yahooFinance from 'yahoo-finance2'
import { InsightsResult } from 'yahoo-finance2/dist/esm/src/modules/insights'

const defaultOptions = {
  baseURL: API_BASE_URL.PROD,
  headers: {
    'Content-Type': 'application/json',
    'X-IG-API-KEY': '',
    'IG-ACCOUNT-ID': 'BSYOC',
  },
}

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
  id = 'IG'
  instance: IG
  websocket: WebsocketClient

  queue: SimpleQueue

  http = rateLimit(axios.create(defaultOptions), { maxRequests: 5, perMilliseconds: 1000 })

  override async onInit() {
    if (this.system.type === TICKER_TYPE.SYSTEM_BACKTEST) {
      throw new Error('System env BACKTEST should not execute broker.onInit()')
    }

    // this.queue = new QueueBinance(this.system)

    const apiKey = this.system.configManager.config.brokers.ig.apiKey
    const username = this.system.configManager.config.brokers.ig.username
    const password = this.system.configManager.config.brokers.ig.password

    // set default headers
    this.http.defaults.headers['X-IG-API-KEY'] = apiKey
    this.http.defaults.headers['IG-ACCOUNT-ID'] = 'BSYOC'

    // get access token
    const { data } = await this.http.post(
      '/session',
      { identifier: username, password },
      {
        headers: { Version: 3 },
        'axios-retry': {
          retries: 3,
        },
      },
    )

    // this.instance.getPrices()

    // add access token to default heades
    this.http.defaults.headers['Authorization'] = `Bearer ${data.oauthToken.access_token}`
  }
}
