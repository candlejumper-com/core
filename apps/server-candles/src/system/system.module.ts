import { ConfigManager, DB, Module, ModuleBase, SymbolManager, TICKER_TYPE } from '@candlejumper/shared'
import { CandleManager } from '../modules/candle-manager/candle-manager'
import { ApiServer } from './system.api'
import { SystemCandles } from './system'
import { BrokerManager } from 'libs/shared/src/modules/broker/broker.manager'

@Module({
  type: TICKER_TYPE.SYSTEM_CANDLES,
  modules: [ConfigManager, DB, BrokerManager, ApiServer, SymbolManager, CandleManager],
  system: SystemCandles,
})
export class ModuleCandles extends ModuleBase {
  start() {
    return this.system.start()
  }
}
