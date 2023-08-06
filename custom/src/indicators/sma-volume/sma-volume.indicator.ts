import { Indicator, BOT_INDICATOR_TYPE } from "@candlejumper/core";
import { SMA } from "technicalindicators";

export default class IndicatorSMAVolume extends Indicator<IndicatorSMAVolume> {

    data: number[] = []

    async onTick() {
        const period = this.config.period.value
        const values = this.system.candleManager.getVolume(this.symbol, this.interval, period)

        this.data = SMA.calculate({ period, values })
    }


    snapshot() {
        const period = this.config.period.value;
        return {
            candles: this.candles.slice(0, period + 20),
            // output: this.system.candleManager.getVolume(this.symbol, this.interval, period),
            output: this.data,
            params: this.config,
            type: BOT_INDICATOR_TYPE.VOLUME_SMA
        };
    }
}