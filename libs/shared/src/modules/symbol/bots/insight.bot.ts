import { System } from '../../../system/system'
import { Ticker } from '../../../ticker/ticker'
import { Symbol } from '../../symbol/symbol'
import { TICKER_TYPE } from '../../../ticker/ticker.util'
import { BROKER_PURPOSE } from '../../broker/broker.util'
import { ORDER_SIDE, ORDER_TYPE } from '../../order/order.util'

export class InsightBot extends Ticker<any> {
  override type = TICKER_TYPE.BOT
  override id: string | number

  constructor(
    public system: System,
    symbol: Symbol,
  ) {
    super(system, symbol)
    this.type = TICKER_TYPE.BOT
  }
  override async onTick() {
    const broker = this.symbol.getBrokerByPurpose(BROKER_PURPOSE.ORDERS)
    const hasOpenOrders = this.symbol.orders.length > 0
    const orderModule = this.system.modules.order
    const insight = this.symbol.insights

    if (!broker || !insight) {
      return
    }

    if (hasOpenOrders) {
      if (this.symbol.orders[0].side === ORDER_SIDE.BUY && insight.short < 3) {
        await orderModule.closeOrder(this.symbol.orders[0])
      }
      if (this.symbol.orders[0].side === ORDER_SIDE.SELL && insight.short > -3) {
        await orderModule.closeOrder(this.symbol.orders[0])
      }

      return
    }

    // LONG
    if (insight.short === 4 && insight.mid >= 2) {
      if (this.symbol.currency === 'USD') {
        await orderModule.placeOrder(
          {
            side: ORDER_SIDE.BUY,
            symbol: this.symbol,
            quantity: this.calcQuantity(),
            type: ORDER_TYPE.MARKET,
          },
          {},
        )
      }
    }
    // SHORT
    if (insight.short === -4 && insight.mid <= -2) {
      if (this.symbol.currency === 'USD') {
        await orderModule.placeOrder(
          {
            side: ORDER_SIDE.SELL,
            symbol: this.symbol,
            quantity: this.calcQuantity(),
            type: ORDER_TYPE.MARKET,
          },
          {},
        )
      }
    }
  }

  private calcQuantity() {
    const minOrderValue = 50
    const orderValue = this.price * this.symbol.lotMin
    let quantity: number
    if (orderValue < minOrderValue) {
      quantity = Math.ceil(minOrderValue / this.price)
    } else {
      quantity = this.symbol.lotMin
    }
    return quantity
  }
}
