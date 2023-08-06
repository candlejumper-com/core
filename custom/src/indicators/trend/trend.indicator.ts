import { Indicator, BOT_INDICATOR_TYPE } from "@candlejumper/core";
import { CANDLE_FIELD } from "@candlejumper/shared";
import { SMA, RSI } from "technicalindicators";

export default class IndicatorTrend extends Indicator<IndicatorTrend> {

    declare data: 'up' | 'down'

    periodSMA = 30
    periodRSI = 20

    async onTick() {
        const periodSMA = 30
        const periodRSI = 20
        const valuesSMA = this.candles.slice(0, periodSMA + 1).map(price => price[CANDLE_FIELD.CLOSE]).reverse()
        const valuesRSI = this.candles.slice(0, periodRSI + 1).map(price => price[CANDLE_FIELD.CLOSE]).reverse()
        const RSIValue = RSI.calculate({values: valuesSMA,  period: periodSMA })[0]
        const SMAValue = SMA.calculate({values: valuesRSI,  period: periodRSI })[0]

        if (RSIValue > 50 && this.price > SMAValue) {
            if (this.data !== 'up') {
                this.addEvent('TREND_UP' as any, {})
            }

            this.data = 'up'
        } 

        else if (RSIValue < 50 && this.price < SMAValue) {
            if (this.data !== 'down') {
                this.addEvent('TREND_DOWN' as any, {})
            }

            this.data = 'down'
        } else {
            this.data = null
        }
    }

    snapshot() {
        return {
            candles: this.candles.slice(0, this.periodRSI + 1 + 20),
            output: this.data,
            params: this.config,
            type: BOT_INDICATOR_TYPE.TREND
        };
    }
}