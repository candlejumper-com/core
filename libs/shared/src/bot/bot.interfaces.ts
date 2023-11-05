export interface IBotConfig {
  minLength?: number
  activeOrderLimit?: number
  allowOrderSideRepeat?: boolean
}

export enum BOT_INDICATOR_TYPE {
  'BB' = 'BB',
  'MACD' = 'MACD',
  'SMA' = 'SMA',
  'RSI' = 'RSI',
  'VOLUME_SMA' = 'VOLUME_SMA',
  'FIBONACCI' = 'FIBONACCI',
  'TREND' = 'TREND',
  'SHOCK' = 'SHOCK',
}

export interface IWatcherOptions {
  dir: 'up' | 'down'
  startPrice?: number
  onTrigger?: any
}