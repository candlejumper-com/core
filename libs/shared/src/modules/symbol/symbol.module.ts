import { ComponentModule, ModuleBase, SymbolService } from '@candlejumper/shared'

@ComponentModule({
  service: SymbolService,
  modules: [],
})
export class SymbolModule extends ModuleBase {}
