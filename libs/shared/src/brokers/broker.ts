import { System, SYSTEM_ENV } from '../system/system';
import { IOrder } from '../order/order.interfaces';
import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance';
import { CandleTickerCallback, IAccount, IBrokerInfo } from './broker.interfaces';
import { logger } from '../util/log';
import { ICandle } from '../candle';
import { createAxiosRetryInstance } from '../util/axios-retry';
import { ISymbol } from '../index_client';

export abstract class Broker {
  abstract id: string
  abstract syncAccount(): Promise<void>;
  abstract syncExchangeFromBroker(): Promise<void>;
  abstract getOrdersByMarket(market: string): Promise<IOrder[]>;
  abstract placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull>;
  abstract startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void>;
  abstract startCandleTicker(symbols: ISymbol[], intervals: string[], callback: CandleTickerCallback): void
  abstract getCandlesFromTime(symbol: ISymbol, interval: string, startTime: number): Promise<ICandle[]>
  abstract getCandlesFromCount(symbol: ISymbol, interval: string, count): Promise<ICandle[]>

  account = { balances: [] } as IAccount;
  exchangeInfo: IBrokerInfo
  axios = createAxiosRetryInstance()

  onCandleTickCallback: (symbol: ISymbol, interval: string, candle: ICandle, isFinal: boolean) => Promise<void>

  onInit?(): Promise<void>;

  constructor(public system: System) {

  }

  async init() {
    await this.onInit?.();

    if (this.system.name === 'CANDLES') {
      await this.syncExchangeFromBroker();
    } else {
      await this.syncExchangeFromCandleServer();
    }

    if (this.system.env === SYSTEM_ENV.MAIN) {
      if (!this.exchangeInfo.timezone) {
        throw new Error('Missing broker timezone');
      }

      process.env.TZ = this.exchangeInfo.timezone;
    }

    // add symbols to SymbolManager
    this.exchangeInfo.symbols.forEach(symbol => this.system.symbolManager.add(symbol))
  }

  getBalance(asset: string): number {
    const balanceAsset = this.account.balances.find((balance) => balance.asset === asset);

    if (!balanceAsset) {
      logger.warn(`Balance asset not found: ${asset}`);
      return 0;
    }

    return balanceAsset.free;
  }

  hasEnoughBalance(asset: string, amount: number): boolean {
    const balance = this.account.balances.find((balance) => balance.asset === asset);
    return balance.free >= amount;
  }

  getExchangeInfoBySymbol(symbol: string): any {
    return this.exchangeInfo.symbols.find((_symbol) => _symbol.name === symbol);
  }

  async syncExchangeFromCandleServer(): Promise<void> {
    logger.debug(`\u267F Sync exchange info`)

    const now = Date.now()
    const candleServerUrl = this.system.configManager.config.server.candles.url

    try {
      const { data } = await this.axios.get(`${candleServerUrl}/api/exchange/${this.id}`)
      this.exchangeInfo = data.exchangeInfo
      this.exchangeInfo.timezone = (this.exchangeInfo as any).timezone
    } catch (error: any) {
      if (error.cause) {
        logger.error(error.cause)
      } else if (error.status) {
        console.error(error.status)
        console.error(error.data)
      } else {
        console.error(error)
      }

      throw new Error(`error fetching broker config from candle server`.red)
    }

    logger.info(`\u2705 Sync exchange info (${Date.now() - now} ms)`)
  }
}
