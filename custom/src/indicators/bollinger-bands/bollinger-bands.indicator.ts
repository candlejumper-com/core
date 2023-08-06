import { BollingerBands } from "technicalindicators"
import { BOT_INDICATOR_TYPE, Bot, IOrderSnapshot, ITickerSnapshot, Indicator, ORDER_SIDE } from '@candlejumper/core';
import { CANDLE_FIELD } from "@candlejumper/shared";

export interface IIndicatorBollingerBandsConfig {
  period: {
    value: number
  }
  weight: {
    value: number
  }
}

export default class IndicatorBollingerBands extends Indicator<IndicatorBollingerBands> {
  data: any[] = []

  declare config: IIndicatorBollingerBandsConfig

  async onTick() {
    const period = this.config.period.value
    const stdDev = this.config.weight.value
    const values = this.candles
      .slice(0, period)
      .map((price) => price[CANDLE_FIELD.CLOSE])
      .reverse()
    this.data = BollingerBands.calculate({ values, period, stdDev }).reverse()
  }

  snapshot(): ITickerSnapshot {
    const period = this.config.period.value;
    const margin = 20;
    return {
      candles: this.candles.slice(0, period + margin),
      output: this.data,
      params: this.config,
      type: BOT_INDICATOR_TYPE.BB
    };
  }
}
