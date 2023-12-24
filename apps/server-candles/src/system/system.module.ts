import { ConfigModule, DB, SystemModule, ModuleBase, TICKER_TYPE, BrokerModule, SymbolModule } from '@candlejumper/shared'
import { ApiServer } from './system.api'
import { SystemCandles } from './system'
import { CandleModule } from '../modules/candle/candle.module'

@SystemModule({
  type: TICKER_TYPE.SYSTEM_CANDLES,
  modules: [],
  // modules: [ConfigModule, SymbolModule, DB, BrokerModule, ApiServer, CandleModule],
  system: SystemCandles,
})
export class ModuleCandles extends ModuleBase {
  start() {
    return this.system.start()
  }
}
