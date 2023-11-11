import { SystemBase, SYSTEM_ENV } from '../system/system';
import { IOrder } from '../order/order.interfaces';
import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance';
import { IAccount, IBrokerInfo } from './broker.interfaces';
import * as axiosRetry from 'axios-retry';
import axios, { AxiosError } from 'axios';
import { logger } from '../util/log';

const onRetry = (retryCount: number, error: AxiosError) => {
  if (error.response) {
    console.log(error.response.data);
    console.log(error.response.status);
  } else if (error.cause){
    console.error(error.cause);
  }
}

const retryDelay = (retryCount: number): number => {
  const maxDelay = 60000;
  const delayMultiplier = 1000;

  return Math.min(maxDelay, retryCount * delayMultiplier);
};

// console.log(axiosRetry)

// axiosRetry(axios, { retries: 3, retryDelay, onRetry });

export abstract class Broker {
  account = { balances: [] } as IAccount;
  exchangeInfo: IBrokerInfo;
  timezone: string;

  onInit?(): Promise<void>;

  abstract syncAccount(): Promise<void>;
  abstract syncExchange(): Promise<void>;
  abstract getOrdersByMarket(market: string): Promise<IOrder[]>;
  abstract placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull>;

  constructor(public system: SystemBase) {}

  async init() {
    await this.onInit?.();
    await this.syncExchange();

    if (this.system.env === SYSTEM_ENV.MAIN) {
      if (!this.timezone) {
        throw new Error('Missing broker timezone');
      }

      process.env.TZ = this.timezone;
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
