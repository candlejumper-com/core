import "reflect-metadata";
import { System } from '../system/system'
import { TICKER_TYPE } from "../ticker/ticker.util";
import { ModuleBase } from "../module";

export interface IComponentModuleDecoratorOptions {
  name?: string
  // routes?: typeof RouteBase[]
  // routes?: [new (...args: any[]) => any]
  routes?: any[]
  modules?: any[]
  service?: any
}

export function ComponentModule(options: IComponentModuleDecoratorOptions): any {
  return function<T extends { new (...args: any[]): {} }>(Base: typeof ModuleBase, key): typeof ModuleBase {
    return class extends Base {
      constructor(...args: any[]) {
        super()

        this.system = args[0]
        const service = new options.service(this.system)
        this.system.modules.set(options.service, service)
      }
    }
  }
}