import { SystemBase, SYSTEM_ENV } from '../system/system';
import { IOrder } from '../order/order.interfaces';
import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance';
import { CandleTickerCallback, IAccount, IBrokerInfo } from './broker.interfaces';
import { logger } from '../util/log';
import { ICandle } from '../candle';
import { createAxiosRetryInstance } from '../util/axios-retry';


export abstract class Broker {
  abstract id: string
  abstract syncAccount(): Promise<void>;
  abstract syncExchangeFromCandleServer(): Promise<void>;
  abstract syncExchangeFromBroker(): Promise<void>;
  abstract getOrdersByMarket(market: string): Promise<IOrder[]>;
  abstract placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull>;
  abstract startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void>;
  abstract startCandleTicker(symbols: string[], intervals: string[], callback: CandleTickerCallback): void
  abstract getCandlesFromTime(symbol: string, interval: string, startTime: number): Promise<ICandle[]>
  abstract getCandlesFromCount(symbol: string, interval: string, count): Promise<ICandle[]>

  account = { balances: [] } as IAccount;
  exchangeInfo: IBrokerInfo
  axios = createAxiosRetryInstance()

  onCandleTickCallback: (symbol: string, interval: string, candle: ICandle, isFinal: boolean) => Promise<void>

  onInit?(): Promise<void>;

  constructor(public system: SystemBase) {

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
}
