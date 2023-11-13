import { SystemBase, SYSTEM_ENV } from '../system/system';
import { IOrder } from '../order/order.interfaces';
import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance';
import { IAccount, IBrokerInfo } from './broker.interfaces';
import { logger } from '../util/log';
import { ICandle } from '../candle';
import { createAxiosRetryInstance } from '../util/axios-retry';


export abstract class Broker {
  account = { balances: [] } as IAccount;
  exchangeInfo: IBrokerInfo
  axios = createAxiosRetryInstance()

  onCandleTickCallback: (symbol: string, interval: string, candle: ICandle, isFinal: boolean) => Promise<void>

  onInit?(): Promise<void>;

  abstract syncAccount(): Promise<void>;
  abstract syncExchangeFromCandleServer(): Promise<void>;
  abstract syncExchangeFromBroker(): Promise<void>;
  abstract getOrdersByMarket(market: string): Promise<IOrder[]>;
  abstract placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull>;

  constructor(public system: SystemBase) {}

  async init() {
    await this.onInit?.();
    await this.syncExchangeFromBroker();

    if (this.system.env === SYSTEM_ENV.MAIN) {
      if (!this.exchangeInfo.timezone) {
        throw new Error('Missing broker timezone');
      }

      process.env.TZ = this.exchangeInfo.timezone;
    }
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
}
