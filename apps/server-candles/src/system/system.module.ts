import { ConfigManager, DB, SystemModule, ModuleBase, SymbolManager, TICKER_TYPE } from '@candlejumper/shared'
import { ApiServer } from './system.api'
import { SystemCandles } from './system'
import { BrokerManager } from 'libs/shared/src/modules/broker/broker.manager'
import { CandleModule } from '../modules/candle/candle.module'

@SystemModule({
  type: TICKER_TYPE.SYSTEM_CANDLES,
  modules: [ConfigManager, DB, BrokerManager, ApiServer, SymbolManager, CandleModule],
  system: SystemCandles,
})
export class ModuleCandles extends ModuleBase {
  start() {
    return this.system.start()
  }
}
