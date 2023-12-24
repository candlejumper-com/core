import { ModuleBase } from '../module'
import { RouteBase } from '../route'
import { System } from '../system/system'
import { IRoutesDecoratorOptions } from './routes.decorator'

export interface IServiceDecoratorOptions {
  name?: string
  // routes?: typeof RouteBase[]
  routes?: [new (...args: any[]) => any]
}

type Constructor<T = {}> = new (...args: any[]) => T
export function Service(options: IServiceDecoratorOptions): any {

  return function <T extends Constructor>(Base: any): any {
    const paramTypes = Reflect.getMetadata('design:paramtypes', Base)

    abstract class Service extends Base {
      system: System
      moduleRoot: ModuleBase

      constructor(...args: any[]) {
        const system: System = args[0]
        // console.log('system', args, options)

        if (paramTypes?.length) {
          for (let i = 0; i < paramTypes.length; i++) {
            const arg = paramTypes[i]
            const existingModule = system.modules.get(arg)
            if (existingModule) {
              args[i] = existingModule
            }
          }
        }

        super(...args)

        this.system = system

        if (options.routes?.length) {
          for (let i = 0; i < options.routes.length; i++) {
            console.log(222, options.routes[i])
            const route = new options.routes[i]()
            route.system = system
            route.init()
          }
        }
      }
    }

    return Service
  }

  function inject() {
    
  }
}
