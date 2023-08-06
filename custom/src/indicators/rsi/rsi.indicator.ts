import { BOT_INDICATOR_TYPE, ITickerSnapshot, Indicator } from "@candlejumper/core";
import { CANDLE_FIELD } from "@candlejumper/shared";
import { RSI } from "technicalindicators";

export default class IndicatorRSI extends Indicator<IndicatorRSI> {

    data: any[] = []

    async onTick() {
        const period = this.config.period.value
        const values = this.candles.slice(0, period + 1).map(price => price[CANDLE_FIELD.CLOSE])

        this.data = RSI.calculate({values,  period })
    }

    snapshot(): ITickerSnapshot {
        const period = this.config.period.value;
        return {
            candles: this.candles.slice(0, period + 1 + 20),
            output: this.data,
            params: this.config,
            type: BOT_INDICATOR_TYPE.RSI
        };
    }
}