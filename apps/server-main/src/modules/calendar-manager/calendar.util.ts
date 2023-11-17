import { CANDLE_FIELD, ICandle } from '@candlejumper/shared'

export function getDiffInPercentage(newest: ICandle, oldest: ICandle): number {
  const diff = oldest[CANDLE_FIELD.CLOSE] - newest[CANDLE_FIELD.CLOSE]
  return (diff / newest[CANDLE_FIELD.CLOSE]) * 100
}