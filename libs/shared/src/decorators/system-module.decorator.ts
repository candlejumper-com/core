import "reflect-metadata";
import { System } from '../system/system'
import { TICKER_TYPE } from "../ticker/ticker.util";
import { ModuleBase } from "../module";

export interface ISystemModuleDecoratorOptions {
  type: TICKER_TYPE
  modules?: any[],
  system: new (...args: any[]) => System
}

export function SystemModule(options: ISystemModuleDecoratorOptions): any {
  return function<T extends { new (...args: any[]): {} }>(Base: typeof ModuleBase, key): typeof ModuleBase {
    return class extends Base {
      type = options.type

      constructor() {
        super();

        options.modules.forEach(Module => {
          if (!this.modules.get(Module)) {
            const module = new Module(this)
            module.module = this
            this.modules.set(Module, module)
            module.onInit?.()
          }
        })

        this.system = new options.system(this)
        this.system.modules = this

        this.modules.forEach(module => module.system = this.system)
      }
    }
  }
}