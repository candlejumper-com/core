import { ComponentModule } from '../../decorators/component-module.decorator';
import { ModuleBase } from '../../module';
import { BrokerService } from './broker.service';

@ComponentModule({
  service: BrokerService,
  modules: [],
})
export class BrokerModule extends ModuleBase {}
