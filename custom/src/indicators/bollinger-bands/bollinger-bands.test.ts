import { SYSTEM_ENV, SystemBase } from '@candlejumper/shared'
import IndicatorBollingerBands from './bollinger-bands.indicator'
import { createSymbolObject, tickByTicker } from '../../../../test/util/test.util'
import candles from '../../../../test/mock/candles/BTCUSDT.mock.json'
import { ICandle } from '@candlejumper/core/modules/candle-manager/candle.interfaces'

let system: SystemBase

beforeEach(async () => {
    system = new System(SYSTEM_ENV.BACKTEST);
    await system.init()

    const symbol = {
        symbol: 'BTCUSDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        baseAssetPrecision: 0.0001,
        price: 0
    }

    // set candles for warmup
    system.candleManager.candles[symbol.name] = {
        '15m': {
            candles: [],
            volume: []
        }
    }

    await system.addTicker({
        class: IndicatorBollingerBands,
        symbol,
        interval: '15m',
        id: 'bollinger_test'
    })
});

describe('Indicator Bollinger Bands', () => {

    it('Should init', async () => {
        const symbol = createSymbolObject()
        const indicator = new IndicatorBollingerBands({ env: SYSTEM_ENV.BACKTEST} as any, null as any, symbol, '15', null)
        indicator.isInitialized = true
        indicator.config = {
            period: {
                value: 20
            },
            weight: {
                value: 2
            }
        }

        await tickByTicker(indicator, candles as ICandle[])

        const indicatorValue = indicator.data

        // await system.tick(new Date())
    })
})