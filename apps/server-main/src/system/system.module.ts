import { ConfigService, DB, InsightManager, SystemModule, ModuleBase, SymbolManager, TICKER_TYPE, BrokerModule, SymbolModule } from '@candlejumper/shared'
import { CandleManager } from '../modules/candle-manager/candle-manager'
import { SystemMain } from './system'
import { UserModule } from '../modules/user-manager/user.module'
import { OrderService } from '../modules/order-manager/order.service'
import { EditorManager } from '../modules/editor-manager/editor-manager'
import { DeviceManager } from '../modules/device-manager/device-manager'
import { ChatGPTManager } from '../modules/chatgpt-manager/chatgpt.manager'
import { CalendarManager } from '../modules/calendar-manager/calendar.manager'
import { ApiServer } from './system.api'

@SystemModule({
  type: TICKER_TYPE.SYSTEM_MAIN,
  modules: [
    DB,

    ConfigService,
    ApiServer,
    UserModule,
    BrokerModule,
    SymbolModule,
    // DeviceManager,
    // SymbolManager,
    // CandleManager,
    // CalendarManager,
    // InsightManager,
    // OrderService,
    // EditorManager,
    // ChatGPTManager
  ],
  system: SystemMain,
})
export class ModuleCandles extends ModuleBase {
  start() {
    return this.system.start()
  }
}
