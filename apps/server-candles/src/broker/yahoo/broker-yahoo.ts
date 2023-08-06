import { HistoricalHistoryResult } from "yahoo-finance2/dist/esm/src/modules/historical"
import { ICandle } from "@candlejumper/shared"
import { Broker } from "../broker"
import { IBrokerInfo, CandleTickerCallback, ISymbol } from "../broker.interfaces"
// import TEMP_BROKER_INFO from "./broker-yahoo.json"
import yahooFinance from "yahoo-finance2"
import { format } from 'date-fns'

export class BrokerYahoo extends Broker {
  id = "Yahoo"
  instance: any
  websocket = null

  onCandleTickCallback: (symbol: string, interval: string, candle: ICandle, isFinal: boolean) => Promise<void>

  protected async loadConfig(): Promise<IBrokerInfo> {
    // protected async loadConfig(): Promise<{accounts: Account[]}> {
    // return this.instance.getAccountDetails()
    
    const exchangeInfo = structuredClone(TEMP)
    // const exchangeInfo = structuredClone(TEMP_BROKER_INFO)

    exchangeInfo.symbols.forEach((symbol: ISymbol) => {
      symbol.baseAsset = "AUD"
    })

    return exchangeInfo as IBrokerInfo
  }
  async getCandlesFromTime(symbol: string, interval: string, fromTime: number): Promise<ICandle[]> {
    // console.log(fromTime)
    const fromTimeDate = new Date(fromTime)
    const period1 = format(fromTimeDate, 'yyyy-MM-dd')
    const query = symbol.includes("/") ? `${symbol.split("/")[0]}=X` : symbol
    const queryOptions = { period1, interval: "1d" as any  }
    const candles = await yahooFinance.historical(query, queryOptions)
    return this.normalizeCandles(candles)
  }
  async getCandlesFromCount(symbol: string, interval: string, count: number): Promise<ICandle[]> {
    const query = symbol.includes("/") ? `${symbol.split("/")[0]}=X` : symbol
    const queryOptions = { period1: "2000-01-01", interval: "1d" as any }
    const candles = await yahooFinance.historical(query, queryOptions)
    return this.normalizeCandles(candles)
  }
  startCandleTicker(symbols: string[], intervals: string[], callback: CandleTickerCallback): void {
    console.log('start ticker')
  }

  private normalizeCandles(candles: HistoricalHistoryResult): ICandle[] {
    // console.log(parse(candles[0].snapshotTime, "yyyy:MM:dd-HH:mm:ss", new Date()))

    return candles.map((candle) => [
      new Date(candle.date).getTime(),
      candle.open,
      candle.high,
      candle.low,
      candle.close,
      candle.volume,
    ]) as ICandle[] // TEMP to fix typing
  }
}


const TEMP = {
  "timezone": "Europe/London",
  "symbols": [
      {
          "delayTime": 0,
          "epic": "CS.D.AUDUSD.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "OIL",
          "high": 0.67333,
          "low": 0.67267,
          "percentageChange": 0,
          "updateTime": "75539000",
          "updateTimeUTC": "20:58:59",
          "bid": 0.67276,
          "offer": 0.67342,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.AUDUSD.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "AAPL",
          "high": 0.67333,
          "low": 0.67267,
          "percentageChange": 0,
          "updateTime": "75539000",
          "updateTimeUTC": "20:58:59",
          "bid": 0.67276,
          "offer": 0.67342,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.AUDUSD.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "AUD/USD",
          "high": 0.67333,
          "low": 0.67267,
          "percentageChange": 0,
          "updateTime": "75539000",
          "updateTimeUTC": "20:58:59",
          "bid": 0.67276,
          "offer": 0.67342,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.EURCHF.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "EUR/CHF",
          "high": 0.96398,
          "low": 0.96308,
          "percentageChange": 0,
          "updateTime": "75537000",
          "updateTimeUTC": "20:58:57",
          "bid": 0.96291,
          "offer": 0.96381,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.EURGBP.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "EUR/GBP",
          "high": 0.8664,
          "low": 0.86537,
          "percentageChange": 0,
          "updateTime": "75538000",
          "updateTimeUTC": "20:58:58",
          "bid": 0.86514,
          "offer": 0.86602,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.EURJPY.CFD.IP",
          "netChange": 0,
          "lotSize": 1000,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "EUR/JPY",
          "high": 157.902,
          "low": 157.776,
          "percentageChange": 0,
          "updateTime": "75538000",
          "updateTimeUTC": "20:58:58",
          "bid": 157.716,
          "offer": 157.841,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 100
      },
      {
          "delayTime": 0,
          "epic": "CS.D.EURUSD.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "EUR/USD ",
          "high": 1.11271,
          "low": 1.11256,
          "percentageChange": 0,
          "updateTime": "75528000",
          "updateTimeUTC": "20:58:48",
          "bid": 1.11224,
          "offer": 1.1129,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.GBPEUR.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "GBP/EUR",
          "high": 1.15643,
          "low": 1.15493,
          "percentageChange": 0,
          "updateTime": "75539000",
          "updateTimeUTC": "20:58:59",
          "bid": 1.15515,
          "offer": 1.15545,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.GBPUSD.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "GBP/USD ",
          "high": 1.28549,
          "low": 1.28516,
          "percentageChange": 0,
          "updateTime": "75538000",
          "updateTimeUTC": "20:58:58",
          "bid": 1.28522,
          "offer": 1.28546,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.USDCAD.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "USD/CAD",
          "high": 1.32295,
          "low": 1.32232,
          "percentageChange": 0,
          "updateTime": "75539000",
          "updateTimeUTC": "20:58:59",
          "bid": 1.32226,
          "offer": 1.3226,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.USDCHF.CFD.IP",
          "netChange": 0,
          "lotSize": 10,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "USD/CHF",
          "high": 0.86631,
          "low": 0.86565,
          "percentageChange": 0,
          "updateTime": "75538000",
          "updateTimeUTC": "20:58:58",
          "bid": 0.8656,
          "offer": 0.86625,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 10000
      },
      {
          "delayTime": 0,
          "epic": "CS.D.USDJPY.CFD.IP",
          "netChange": 0,
          "lotSize": 1000,
          "expiry": "-",
          "instrumentType": "CURRENCIES",
          "name": "USD/JPY",
          "high": 141.855,
          "low": 141.787,
          "percentageChange": 0,
          "updateTime": "75537000",
          "updateTimeUTC": "20:58:57",
          "bid": 141.785,
          "offer": 141.852,
          "otcTradeable": true,
          "streamingPricesAvailable": true,
          "marketStatus": "EDITS_ONLY",
          "scalingFactor": 100
      }
  ]
}