import { ComponentModule, Module, ModuleBase } from "@candlejumper/shared";

@ComponentModule({
  type: TICKER_TYPE.SYSTEM_MAIN,
  modules: [
   
  ],
  system: SystemMain,
})
export class ModuleCandles extends ModuleBase {
  start() {
    return this.system.start()
  }
}
