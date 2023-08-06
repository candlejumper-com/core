import { Indicator, ITickerSnapshot, BOT_INDICATOR_TYPE } from "@candlejumper/core";
import { CANDLE_FIELD } from "@candlejumper/shared";


export default class IndicatorShock extends Indicator<IndicatorShock> {

    data: {
        isShock: boolean,
        isLow: boolean,
        startPrice: number,
    } = null;

    async onTick() {
        const candlesForRed = this.candles.slice(3, 7);
        const candlesForBlue = this.candles.slice(0, 3);
        const red = candlesForRed.filter(candle => candle[CANDLE_FIELD.OPEN] > candle[CANDLE_FIELD.CLOSE])
        const blue = candlesForBlue.filter(candle => candle[CANDLE_FIELD.OPEN] < candle[CANDLE_FIELD.CLOSE])
        const isShock = red.length >= 4 && blue.length == 2

        const isLow = candlesForRed.at(0)[CANDLE_FIELD.CLOSE] < candlesForRed.at(-1)[CANDLE_FIELD.CLOSE] * .95;

        // this.data = isShock && isLow;
        this.data = {
            isShock,
            isLow,
            startPrice: candlesForRed.at(0)[CANDLE_FIELD.CLOSE],
        };
    }

    snapshot(): ITickerSnapshot {
        return {
            candles: this.candles.slice(0, 35),
            output: this.data,
            params: this.config,
            type: BOT_INDICATOR_TYPE.SMA
        };
    }
}