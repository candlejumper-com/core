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

        setTimeout(() => {
          const service = new options.service(this.system)
          service.onInit?.()
        })


        // if (!this.system.modules.get(options.service)) {
        //   this.system.modules.set(options.service, service)
        // }

        // if (options.routes?.length) {
        //   for (let i = 0; i < options.routes.length; i++) {
        //     const route = new options.routes[i](this.system)
        //     route.onInit()
        //   }
        // }
      }
    }
  }
}