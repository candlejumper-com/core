import { Indicator, BOT_INDICATOR_TYPE } from "@candlejumper/core";
import { CANDLE_FIELD } from "@candlejumper/shared";
import { SMA } from "technicalindicators";


export default class IndicatorSMA extends Indicator<IndicatorSMA> {

    data: number[] = []

    async onTick() {
        const period = this.config.period.value
        const values = this.candles.slice(0, period).reverse().map(price => price[CANDLE_FIELD.CLOSE])

        this.data = SMA.calculate({ period, values })
    }

    snapshot() {
        const period = this.config.period.value;
        return {
            candles: this.candles.slice(0, period + 20),
            output: this.data,
            type: BOT_INDICATOR_TYPE.SMA,
            params: this.config,
        };
    }
}