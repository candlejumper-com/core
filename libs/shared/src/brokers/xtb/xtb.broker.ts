import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance';
import { ISymbol, ICandle } from '../../index_client';
import { Broker } from '../../modules/broker/broker';
import { CandleTickerCallback } from '../../modules/broker/broker.interfaces';
import { IOrder } from '../../order/order.interfaces';
import XAPI from 'xapi-node'

export class XtbBroker extends Broker {
    override id = 'xtb'
    instance: any

    override async onInit(): Promise<void> {
        const { type, accountId, password } = this.system.configManager.config.brokers.xtb
        this.instance = new XAPI({
            accountId,
            password,
            type
        });
        await this.instance.connect();
    }
    
    override syncAccount(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    override syncExchangeFromBroker(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    override getOrdersByMarket(market: string): Promise<IOrder[]> {
        throw new Error('Method not implemented.');
    }
    override placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull> {
        throw new Error('Method not implemented.');
    }
    override startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
        throw new Error('Method not implemented.');
    }
    override startCandleTicker(symbols: ISymbol[], intervals: string[], callback: CandleTickerCallback): void {
        throw new Error('Method not implemented.');
    }
    override getCandlesFromTime(symbol: ISymbol, interval: string, startTime: number): Promise<ICandle[]> {
        throw new Error('Method not implemented.');
    }
    override getCandlesFromCount(symbol: ISymbol, interval: string, count: number): Promise<ICandle[]> {
        throw new Error('Method not implemented.');
    }

}