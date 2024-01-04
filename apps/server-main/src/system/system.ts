import { join } from 'path'
import { Bot } from '../tickers/bot/bot'
import {
  logger,
  ISystemState,
  System,
  BrokerYahoo,
  DB,
  InsightEntity,
  InsightManager,
  BrokerAlphavantage,
  XtbBroker,
  OrderManager,
  BROKER_PURPOSE
} from '@candlejumper/shared'
import { ApiServer } from './api'
import { CANDLE_FIELD, CandleManager } from '../modules/candle-manager/candle-manager'
import { DeviceManager } from '../modules/device-manager/device-manager'
import { BacktestManager } from '../modules/backtest-manager/backtest-manager'
import { EditorManager, PATH_CUSTOM_DIST_BOTS, PATH_CUSTOM_DIST_INDICATORS } from '../modules/editor-manager/editor-manager'
import { UserManager } from '../modules/user-manager/user-manager'
import { AIManager } from '../modules/ai-manager/ai-manager'
import { ISymbol, TICKER_TYPE, BrokerIG } from '@candlejumper/shared'
import { readFileSync } from 'fs'
import { NewsManager } from '../modules/news-manager/news.manager'
import { CalendarManager } from '../modules/calendar-manager/calendar.manager'
import { ChatGPTManager } from '../modules/chatgpt-manager/chatgpt.manager'
import { DeviceEntity } from '../modules/device-manager/device.entity'
import { UserEntity } from '../modules/user-manager/user.entity'

export class SystemMain extends System {
  override system = this
  override type = TICKER_TYPE.SYSTEM_MAIN

  deviceManager: DeviceManager
  editorManager: EditorManager
  backtestManager: BacktestManager
  newsManager: NewsManager
  calendarManager: CalendarManager
  chatGPTManager: ChatGPTManager

  db = new DB(this, [UserEntity, DeviceEntity, InsightEntity])

  readonly aiManager = new AIManager(this)
  readonly candleManager = new CandleManager(this)
  readonly orderManager = new OrderManager(this)
  readonly userManager = new UserManager(this)
  readonly insightManager = new InsightManager(this)

  async onInit() {
    this.orderManager.init()

    if (this.type === TICKER_TYPE.SYSTEM_MAIN) {
      await this.initAsMain()
    }
  }

  toggleProductionMode(state: boolean): void {
    const prevMode = this.configManager.config.production.enabled

    if (prevMode === state) {
      return
    }

    this.configManager.config.production.enabled = state
  }

  /**
   * only executed on MAIN system (not a backtest)
   */
  private async initAsMain(): Promise<void> {
    await this.brokerManager.add(XtbBroker, [BROKER_PURPOSE.CANDLES, BROKER_PURPOSE.ORDERS])
    await this.brokerManager.add(BrokerAlphavantage, [BROKER_PURPOSE.CALENDAR])
    await this.brokerManager.add(BrokerYahoo, [BROKER_PURPOSE.INSIGHT])

    this.chatGPTManager = new ChatGPTManager(this)
    this.newsManager = new NewsManager(this)
    this.calendarManager = new CalendarManager(this)
    this.backtestManager = new BacktestManager(this)
    this.editorManager = new EditorManager(this)
    this.deviceManager = new DeviceManager(this)
    this.apiServer = new ApiServer(this)

    // connect database
    await this.db.init()

    // await this.deviceManager.init()

    // load current user
    await this.userManager.init()

    // load calendar
    // await this.chatGPTManager.init()
    await this.calendarManager.init()

    await Promise.all([
      // load broker (symbols, timezone, details etc)
      this.candleManager.sync(),

      // load editor (compile bots, load file-tree etc)
      // this.editorManager.init(),
    ])

    // initialize default bots / indicators
    // await this.addDefaultTickers()

    // open websocket to candle server
    await this.candleManager.openCandleServerSocket()

    this.symbolManager.update()

    // start public API server
    await this.apiServer.start()

    console.info(`--------------------------------------------------------------`)

    // console.info(`--------------------------------------------------------------`)
  }


  /**
   * tick
   *
   * TODO: should use super.tick()
   */
  async tick(time = new Date(), symbol: ISymbol): Promise<void> {
    // IMPORTANT - to keep backtests realistic
    this.time = time

    try {
      // tick all bots
      for (let i = 0, len = this.tickers.length; i < len; i++) {
        const ticker = this.tickers[i] as unknown as Bot<any>

        if (ticker.symbol.name !== symbol.name) {
          continue
        }

        // TEMP = IMPORTANT - ensure candle direction if forward
        // TODO - should not be needed
        if (ticker.candles.length && ticker.candles[0][CANDLE_FIELD.TIME] >= ticker.candles[1][CANDLE_FIELD.TIME]) {
          throw new Error(`candles not linear!`)
        }

        await ticker.tick()
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * get system data
   *
   * TODO: is fixed on 1h timeframe?????
   *
   */
  getData(orders = false): ISystemState {
    // const findPrice24H = (symbol: string) => {
    //   if (!this.candleManager.candles[symbol]["1h"]) {
    //     return 0
    //   }

    //   const startTime = new Date()
    //   startTime.setHours(0, 0, 0, 0)
    //   // * TODO: is fixed on 1h timeframe?????
    //   return this.candleManager.candles[symbol]["1h"].candles.find(
    //     (candle) => candle[CANDLE_FIELD.TIME] < startTime.getTime()
    //   )
    // }

    const data: ISystemState = {
      config: {
        symbols: this.symbolManager.symbols.map(symbol => symbol.name),
      },
      account: {
        balances: this.brokerManager.getByClass(BrokerYahoo).account.balances,
        // balances: []
      },
      symbols: this.symbolManager.getInfo(),
      tickers: this.tickers.map(ticker => ({
        env: this.type,
        config: {
          // indicators: JSON.parse(JSON.stringify(bot.getIndicatorConfigs()))
        },
        type: ticker.type,
        events: ticker.events,
        name: ticker.constructor.name,
        symbol: ticker.symbol,
        interval: ticker.interval,
        stats: ticker.stats,
        data: ticker.data,
        hits: (() => {
          // TEMP - for now, only bots have hits
          if (ticker.type !== TICKER_TYPE.BOT) {
            return 0
          }

          const orders = this.orderManager.orders[ticker.symbol.name]?.filter(order => order.side === 'SELL') || []
          const hits = orders.filter(order => order.profit > 0)
          return parseFloat(((hits.length / orders.length) * 100).toFixed(2)) || 0
        })(),
      })),
    }

    // TODO - refactor
    // if (this.userManager.user) {
    //   data.account.balances = this.broker.account.balances.filter(
    //     (balance) => balance.asset === "USDT" || balance.asset === this.tickers[0].symbol.baseAsset || balance.free > 0
    //   )
    // }

    // NEEDED???
    // this.broker.exchangeInfo.symbols.forEach((symbol) => {
    //   data.symbols[symbol.name] = {
    //     name: symbol.name,
    //     totalOrders: this.orderManager.orders[symbol.name]?.length || 0,
    //     orders: orders ? this.orderManager.orders[symbol.name] : [],
    //     price: this.candleManager.symbols[symbol.name].price,
    //     baseAsset: symbol.baseAsset,
    //     baseAssetPrecision: symbol.baseAssetPrecision,
    //     quoteAsset: symbol.quoteAsset,
    //     start24HPrice: this.env === SYSTEM_ENV.MAIN ? findPrice24H(symbol.name)?.[CANDLE_FIELD.CLOSE] : 0,
    //   }
    // })

    return data
  }

  async addBotsFromConfig(): Promise<void> {
    logger.info(`\u231B Add bots from config`)

    const now = Date.now()
    const configBots = this.configManager.config.production.bots

    // this.removeTickers()

    for (let i = 0, len = configBots.length; i < len; i++) {
      const ticker = configBots[i] as any
      console.log(ticker)
      const botName = ticker.class.name.toLowerCase()
      const botPath = join(PATH_CUSTOM_DIST_BOTS, `${botName}/bot_${botName}`)
      // const symbol = this.candleManager.getSymbolByPair(ticker.symbol)
      // clean up cached module
      // delete require.cache[require.resolve(botPath)]

      // load file
      const file = readFileSync(botPath + '.js', 'utf8')
      console.log(234, file)
      // const TickerClass = require('../../../../custom/dist/bots/bollinger/bot_bollinger').default as new () => Bot<Ticker<any>>
      // const TickerClass = require(botPath).default as new () => Bot<Ticker<any>>

      // await this.addTicker({
      //   path: botPath,
      //   params: {},
      //   ...ticker,
      //   id: ticker.id,
      //   class: TickerClass,
      //   symbol,
      // })
    }

    logger.info(`✅ Add bots from config ${Date.now() - now}ms)`)
  }

  async addDefaultTickers(): Promise<void> {
    logger.info(`\u231B Add default tickers`)

    const now = Date.now()
    const tickers = this.configManager.config.tickers?.default
    const symbols = this.symbolManager.symbols
    const intervals = this.configManager.config.intervals

    for (let i = 0, len = tickers.length; i < len; i++) {
      const ticker = tickers[i]
      const { 0: type, 1: name } = ticker.split('/')

      for (const symbolName in symbols) {
        const symbol = symbols[symbolName]

        for (let k = 0; k < intervals.length; k++) {
          let tickerPath: string

          switch (type) {
            case '@indicator':
              tickerPath = join(PATH_CUSTOM_DIST_INDICATORS, `${name}/${name}.indicator`)
              break
            case '@bot':
              tickerPath = join(PATH_CUSTOM_DIST_BOTS, `${name}/bot_${name}`)
          }

          await this.addTicker({
            id: `${name}_${symbolName}_${intervals[k]}_${i}`,
            path: tickerPath,
            interval: intervals[k],
            symbol,
            params: {},
          })
        }
      }
    }

    logger.info(`✅ Add default tickers (${Date.now() - now}ms)`)
  }
}
