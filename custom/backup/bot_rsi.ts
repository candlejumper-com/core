import { Bot, BOT_INDICATOR_TYPE } from '../../../../lib/server/dist/bot/bot';
import { ORDER_SIDE } from '../../../../lib/server/dist/order-manager/order-manager';

export default class BotRSI extends Bot {

    // give indicators for frontend to show and bots to follow
    config = {
        allowOrderSideRepeat: false,
        indicators: [
            {
                id: 'SMA',
                type: BOT_INDICATOR_TYPE.SMA,
                params: {
                    period: {
                        value: 50,
                        min: 30,
                        max: 70
                    },
                    color: 'orange'
                }
            },
            {
                id: 'RSI',
                type: BOT_INDICATOR_TYPE.RSI,
                params: {
                    period: {
                        value: 50,
                        min: 20,
                        max: 150
                    },
                    color: 'purple'
                }
            }
        ]
    }

    async onConfigTick(previousConfig = this.config, stepCount: number, force = false) {
        if (force) {
            this.config = previousConfig
            return
        }

        // first step
        if (stepCount === 1) {
            previousConfig.indicators[0].params.period.value = this.config.indicators[0].params.period.min
            previousConfig.indicators[1].params.period.value = this.config.indicators[1].params.period.min
        }

        if (stepCount % 10 === 0) {
            this.config.indicators[0].params.period.value = previousConfig.indicators[0].params.period.value + 10
            this.config.indicators[1].params.period.value = this.config.indicators[1].params.period.min
        } else {
            // this.config.indicators[0].params.period.value = previousConfig.indicators[0].params.period.value
            this.config.indicators[1].params.period.value = previousConfig.indicators[1].params.period.value + 13
        }
    }


    async onTick() {
        const rsi = this.getTickerById('RSI').data[0]
        const sma = this.getTickerById('SMA').data[0]
        
        const trend = rsi > 50 ? 'up' : rsi < 50 ? 'down' : null

        if (this.price < sma && trend === 'up') {
            await this.system.orderManager.placeMarketOrder(this.symbol, ORDER_SIDE.BUY)
        }
        
        else if (this.price > sma || trend === 'down') {
            await this.system.orderManager.placeMarketOrder(this.symbol, ORDER_SIDE.SELL)
        }
    }
}