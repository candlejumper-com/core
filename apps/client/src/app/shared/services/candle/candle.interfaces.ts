export interface IPricesWebsocketResponse {
  time: number;
  prices: { [key: string]: number };
  chart: {
    symbol: string;
    interval: string;
    candle: any;
  };
}
