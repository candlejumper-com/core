import { Bot, IOrderSnapshot, Indicator, ORDER_SIDE } from '@candlejumper/core';
import IndicatorRSI from '../../indicators/rsi/rsi.indicator'
import IndicatorSMA from '../../indicators/sma/sma.indicator'

export default class BotRSI<T> extends Bot<T> {

    async onInit() {
        await this.addTicker({
            class: IndicatorSMA,
            id: 'SMA',
            symbol: this.symbol,
            interval: this.interval,
            params: {
                period: {
                    value: 50,
                    min: 30,
                    max: 70
                },
                color: 'orange'
            }
        })

        await this.addTicker({
            class: IndicatorRSI,
            id: 'RSI',
            symbol: this.symbol,
            interval: this.interval,
            params: {
                period: {
                    value: 20,
                    min: 10,
                    max: 40
                },
                color: 'purple'
            }
        })
    }
    
    async onConfigTick(previousConfig = this.config, stepCount: number, force = false) {
        if (force) {
            this.config = previousConfig
            return
        }

        // // first step
        // if (stepCount === 1) {
        //     previousConfig.indicators[0].params.period.value = this.config.indicators[0].params.period.min
        //     previousConfig.indicators[1].params.period.value = this.config.indicators[1].params.period.min
        // }

        // if (stepCount % 10 === 0) {
        //     this.config.indicators[0].params.period.value = previousConfig.indicators[0].params.period.value + 10
        //     this.config.indicators[1].params.period.value = this.config.indicators[1].params.period.min
        // } else {
        //     // this.config.indicators[0].params.period.value = previousConfig.indicators[0].params.period.value
        //     this.config.indicators[1].params.period.value = previousConfig.indicators[1].params.period.value + 13
        // }
    }

    async onTick() {
        const rsi = this.getTickerById('RSI')
        const sma = this.getTickerById('SMA')

        const rsiValue = rsi.data[0]
        const smaValue = sma.data[0]
        
        const trend = rsiValue > 50 ? 'up' : rsiValue < 50 ? 'down' : null;
        if (this.price < smaValue && trend === 'up') {
            await this.system.orderManager.placeOrder({
                symbol: this.symbol, 
                side: ORDER_SIDE.BUY
            }, {
                snapshot: this.buildSnapshot(rsi, sma),
                interval: this.interval
            })
        }
        
        else if (this.price > smaValue && trend === 'down') {
            await this.system.orderManager.placeOrder({symbol: this.symbol, side: ORDER_SIDE.BUY}, {
                snapshot: this.buildSnapshot(rsi, sma),
                interval: this.interval
            })
        }
    }

    buildSnapshot(...args: Indicator<any>[]): IOrderSnapshot {
        return super.buildSnapshot(...args);
    }
}