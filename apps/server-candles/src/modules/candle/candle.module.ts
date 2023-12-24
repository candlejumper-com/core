import { ComponentModule, ConfigManager, DB, ModuleBase, SymbolManager, TICKER_TYPE } from '@candlejumper/shared'
import { BrokerManager } from 'libs/shared/src/modules/broker/broker.manager'
import { CandleService } from './candle.service'
import { CandleApi } from './candle.api'

@ComponentModule({
  service: CandleService,
  routes: [CandleApi],
  modules: [ConfigManager, DB, BrokerManager, SymbolManager],
})
export class CandleModule extends ModuleBase {}
