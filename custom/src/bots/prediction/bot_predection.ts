import { Bot, IOrderSnapshot, Indicator, ORDER_SIDE } from '@candlejumper/core';
import IndicatorTrend from '../../indicators/trend/trend.indicator'
import IndicatorBollingerBands from '../../indicators/bollinger-bands/bollinger-bands.indicator'

export default class BotPredection<T> extends Bot<T> {

    id = 'BotPredection'
    
    crossedLower = false
    crossedMiddle = false
    crossedUpper = false

    async onInit() {
        await this.addTicker({
            class: IndicatorBollingerBands,
            id: 'BB',
            symbol: this.symbol,
            interval: this.interval,
            params: {
                period: {
                    value: 20,
                    min: 10,
                    max: 30
                },
                weight: {
                    value: 2,
                    min: 1,
                    max: 3
                }
            }
        })

        await this.addTicker({
            class: IndicatorTrend,
            id: 'Trend',
            symbol: this.symbol,
            interval: this.interval,
            params: {
                period: {
                    value: 20,
                    min: 10,
                    max: 30
                },
                weight: {
                    value: 2,
                    min: 1,
                    max: 3
                }
            }
        })
    }

    async onTick() {
        const currentTrend = this.getTickerById('Trend').data
        const BBLatest = this.getTickerById('BB').data[0]

        const VolumeSMAIndicator = this.getTickerById('VOLUME_SMA')
        const VolumeSMALatest = VolumeSMAIndicator[0]
        const currentVolume = VolumeSMALatest.data[0]
        const isVolumeAboveAverage = currentVolume > (VolumeSMALatest)

        // if (this.price < BBLatest.lower && currentTrend === 'up') {
        if (currentTrend === 'up') {
            this.crossedLower = false
            this.crossedUpper = false

            await this.system.orderManager.placeOrder({symbol: this.symbol, side: ORDER_SIDE.BUY}, {
                snapshot: this.buildSnapshot(this.getTickerById('Trend'), this.getTickerById('BB')),
                interval: this.interval
            })

            if (this.watchers.length && this.watchers[0].options.dir !== 'down') {
                this.removeWatcher(this.watchers[0])
            }

            if (!this.watchers.length) {
                this.addWatcher({dir: 'down', onTrigger: async () => {
                if (isVolumeAboveAverage) {
                await this.system.orderManager.placeMarketOrder(this.symbol, ORDER_SIDE.BUY)
                }
                }})
            }
        }

        // price is below bottom line 
        if (this.price < BBLatest.lower && !this.crossedLower) {
            this.crossedLower = true
            this.crossedUpper = false
        }

        // if (this.price > BBLatest.upper) {
        if (this.price > BBLatest.upper && this.crossedUpper) {
            this.crossedUpper = false
            this.crossedLower = false

            await this.system.orderManager.placeOrder({symbol: this.symbol, side: ORDER_SIDE.SELL}, {
                snapshot: this.buildSnapshot(this.getTickerById('Trend'), this.getTickerById('BB')),
                interval: this.interval
            })

            if (this.watchers.length && this.watchers[0].options.dir !== 'up') {
                this.removeWatcher(this.watchers[0])
            }

            if (!this.watchers.length) {
                // this.addWatcher({dir: 'up', onTrigger: async () => {
                // if (isVolumeAboveAverage) {
                // await this.system.orderManager.placeMarketOrder(this.symbol, ORDER_SIDE.SELL)
                // }
                // }})
            }
        }

        // price is above upper line 
        if (this.price > BBLatest.upper && !this.crossedUpper) {
            this.crossedLower = false
            this.crossedUpper = true
        }
    }

    buildSnapshot(...args: Indicator<any>[]): IOrderSnapshot {
        return super.buildSnapshot(...args);
    }
}