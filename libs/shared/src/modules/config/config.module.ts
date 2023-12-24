import { ComponentModule, ModuleBase } from '@candlejumper/shared'
import { ConfigService } from './config.service'

@ComponentModule({
  service: ConfigService,
  modules: [],
})
export class ConfigModule extends ModuleBase {}
