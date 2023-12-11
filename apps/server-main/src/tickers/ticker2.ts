import { logger, ICandle, ISymbol, ITickerEvent, ITickerParams, TICKER_EVENT_TYPE, TICKER_TYPE, sleep } from '@candlejumper/shared'
import { CANDLE_FIELD } from '../modules/candle-manager/candle-manager'
import { System } from '../system/system'
import { join } from 'path'

export abstract class Ticker<T> {
  static eventId = 0

  // type of ticker (BOT / INDICATOR / SYSTEM)
  abstract type: TICKER_TYPE

  // unique ID (read: unique to parent)
  id: string | number

  // list of child tickers
  tickers: Ticker<T>[] = []

  // current price
  // TODO: should not be here
  price: number

  // any (custom) data that is stored for later use
  data: { [key: string]: any }

  // has previous tick finished
  isReady = true

  // is this ticker initialized
  isInitialized = false

  // stats about this ticker
  readonly stats = {
    ticks: 0,
    candles: 0,
    startTime: null,
  }

  readonly events: ITickerEvent[] = []

  // get pointer to candles
  get candles() {
    return this._candles
  }

  // set pointer to candles
  set candles(candles: ICandle[]) {
    if (this._candles) {
      throw new Error(`Ticker.candles already set`)
    }

    this._candles = candles
  }

  // holds pointer to candles
  private _candles: ICandle[]

  protected onInit?(): Promise<void>
  protected onTick?(isNew?: boolean): Promise<void>
  protected onDestroy?(): Promise<void>

  constructor(
    public system: System,
    public parent: Ticker<any>,
    public symbol: ISymbol,
    public interval: string,
    public config: any = {},
  ) {}

  async init(): Promise<void> {
    if (this.isInitialized) {
      throw 'Already initialized'
    }

    if (!this.id) {
      throw 'Missing id ' + this.constructor.name
    }

    // set pointer to candles
    // this.candles = this.system.candleManager.candles[this.symbol.name][this.interval].candles
  }

  async tick(...arg: any): Promise<void> {
    try {
      // check if initialized
      if (!this.isInitialized) {
        throw `${this.id} not initialized`
      }

      // check if previous tick finished
      if (!this.isReady) {
        logger.info(`Skipping tick (too fast)`)
        return
      }

      // // check there is candle history
      if (!this.candles.length) {
        throw `${this.symbol.name} - ${this.id} - No price history. Will not do tick`
      }

      // first tick
      if (this.stats.ticks++ === 0) {
        this.stats.startTime = this.system.time
      }

      // set price
      // TODO - remove this.price field
      this.symbol.price = this.price = this.candles[0][CANDLE_FIELD.CLOSE]

      this.isReady = false

      await this.tickChildren()
    } catch (error) {
      console.error(error)
      // throw new Error(error)
    }
  }

  /**
   * get indicator data by ID
   */
  getTickerById(id: string | number, errorOnMissing = true): any {
    const ticker = this.tickers.find((ticker) => ticker.id === id)

    if (errorOnMissing && !ticker) {
      throw `Ticker with id: ${id} not found`
    }

    return ticker
  }

  /**
   * add a child ticker
   */
  async addTicker<T>(config: ITickerParams<T>): Promise<Ticker<T>> {
    return null
    let TickerClass = config.class as any
    // let TickerClass: typeof Ticker = config.class
    if (!TickerClass) {
      // clean up cached module
      // delete require.cache[require.resolve(config.path)]

      // add ticker

      const url = new URL(join(config.path) + '.js', import.meta.url)

      TickerClass = require('/home/kewin/Projects/candlejumper/core/custom/dist/bots/bollinger/bot_bollinger.js').default
      console.log(232, TickerClass.constructor)
      TickerClass = TickerClass.constructor

      // TickerClass =  (await import(`${config.path}.js`)).default
      // TickerClass = (await import(join(__dirname, config.path + '.js'))).default
    }

    if (!TickerClass) {
      throw new Error('addTicker: TickerClass not found')
    }

    // console.log('ADD TICKER', TickerClass , new Date)

    const instance = new TickerClass(this.system || this, this, config.symbol, config.interval, config.params || {})
    const existingTicker = this.tickers.find((ticker) => ticker.id === config.id)

    // check if id unique
    if (existingTicker) {
      await sleep(1000)
      throw `Ticker with [id]: ${config.id} already set`
    }

    instance.id = config.id

    await instance.init()

    this.tickers.push(instance)

    return instance
  }

  /**
   * remove all tickers
   */
  removeTickers(): void {
    this.tickers = []
  }

  /**
   * Add custom event (like something special happend)
   */
  addEvent(type: TICKER_EVENT_TYPE, data: any): ITickerEvent {
    const event: ITickerEvent = {
      id: Ticker.eventId++,
      time: this.system.time,
      type,
      data,
    }

    this.events.push(event)

    return event
  }

  /**
   * tick sub tickers of this ticker (example: indicators on bot)
   */
  private async tickChildren(): Promise<void> {
    for (let i = 0, len = this.tickers.length; i < len; i++) {
      await this.tickers[i].tick()
    }
  }
}
