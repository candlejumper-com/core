import { BrokerModule, ComponentModule, ConfigService, DB, ModuleBase } from '@candlejumper/shared'
import { CandleService } from './candle.service'
import { CandleApi } from './candle.api'
import { ApiServer } from '../../system/system.api'

@ComponentModule({
  service: CandleService,
  routes: [CandleApi],
  modules: [],
})
export class CandleModule extends ModuleBase {}
