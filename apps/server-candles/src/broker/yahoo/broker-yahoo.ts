import { HistoricalHistoryResult } from "yahoo-finance2/dist/esm/src/modules/historical"
import { ICandle } from "@candlejumper/shared"
import { Broker } from "../broker"
import { IBrokerInfo, CandleTickerCallback, ISymbol } from "../broker.interfaces"
import TEMP_BROKER_INFO from "./broker-yahoo.json"
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
    const exchangeInfo = structuredClone(TEMP_BROKER_INFO)

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
  startCandleTicker(symbols: string[], intervals: string[], callback: CandleTickerCallback): void {}

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
