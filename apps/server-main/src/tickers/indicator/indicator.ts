import { ISymbol, ITickerSnapshot, TICKER_TYPE } from "@candlejumper/shared";
import { Ticker } from "../ticker";
import { System } from "../../system/system";

export abstract class Indicator<T> extends Ticker<T> {

    readonly type = TICKER_TYPE.INDICATOR

    constructor(
        system: System,
        parent: Ticker<any>,
        symbol: ISymbol,
        interval: string,
        config: any
    ) {
        super(system, parent, symbol, interval, config)
    }

    async init(): Promise<void> {
        await super.init()

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