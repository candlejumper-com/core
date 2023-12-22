export enum TICKER_TYPE {
  'SYSTEM_BASE' = 'SYSTEM_BASE',
  'SYSTEM_MAIN' = 'SYSTEM_MAIN',
  'SYSTEM_CANDLES' = 'SYSTEM_CANDLES',
  'SYSTEM_BACKTEST' = 'SYSTEM_BACKTEST',
  'INDICATOR' = 'INDICATOR',
  'BOT' = 'BOT',
  'MODULE' = 'MODULE',
}

export enum TICKER_EVENT_TYPE {
  START = 'START',
  STOP = 'STOP',
  TRADE = 'TRADE',
  WATCHER_START = 'WATCHER_START',
  WATCHER_STOP = 'WATCHER_STOP',
  WATCHER_TRIGGERED = 'WATCHER_TRIGGERED',
  TREND_UP = 'TREND_UP',
  TREND_DOWN = 'TREND_DOWN',
}