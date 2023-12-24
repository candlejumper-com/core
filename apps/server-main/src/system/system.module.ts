import { ConfigManager, DB, InsightManager, SystemModule, ModuleBase, SymbolManager, TICKER_TYPE } from '@candlejumper/shared'
import { CandleManager } from '../modules/candle-manager/candle-manager'
import { ApiServer } from './api'
import { SystemMain } from './system'
import { BrokerManager } from 'libs/shared/src/modules/broker/broker.manager'
import { UserManager } from '../modules/user-manager/user-manager'
import { OrderManager } from '../modules/order-manager/order-manager'
import { EditorManager } from '../modules/editor-manager/editor-manager'
import { DeviceManager } from '../modules/device-manager/device-manager'
import { ChatGPTManager } from '../modules/chatgpt-manager/chatgpt.manager'
import { CalendarManager } from '../modules/calendar-manager/calendar.manager'

@SystemModule({
  type: TICKER_TYPE.SYSTEM_MAIN,
  modules: [
    DB,
    ConfigManager,
    UserManager,
    BrokerManager,
    ApiServer,
    DeviceManager,
    SymbolManager,
    CandleManager,
    CalendarManager,
    InsightManager,

    OrderManager,
    EditorManager,

    ChatGPTManager
  ],
  system: SystemMain,
})
export class ModuleCandles extends ModuleBase {
  start() {
    return this.system.start()
  }
}
