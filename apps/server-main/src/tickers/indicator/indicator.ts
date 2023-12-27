import { ISymbol, ITickerSnapshot, System, TICKER_TYPE, Ticker } from "@candlejumper/shared";

export abstract class Indicator<T> extends Ticker<T> {

    constructor(
        public system: System,
        parent: Ticker<any>,
        symbol: ISymbol,
        interval: string,
        config: any
    ) {
        super(parent, symbol, interval, config)
    }

    async init(): Promise<void> {
        super.init()

        await this.onInit?.()

        this.isInitialized = true
    }

    async tick(): Promise<void> {
        await super.tick()
        await this.onTick?.()
        this.isReady = true
    }

    snapshot(): ITickerSnapshot {
        return {
            candles: [],
            output: undefined,
            params: undefined,
            type: undefined
        };
    }
}