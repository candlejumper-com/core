import { ModuleBase } from '../module'
import { RouteBase } from '../route'
import { System } from '../system/system'
import { injectModules } from './decorator.util'
import { IRoutesDecoratorOptions } from './routes.decorator'

export interface IServiceDecoratorOptions {
  name?: string
  // routes?: typeof RouteBase[]
  // routes?: [new (...args: any[]) => any]
  routes?: any[]
}

type Constructor<T = {}> = new (...args: any[]) => T
export function Service(options: IServiceDecoratorOptions = {}): any {

  return function <T extends Constructor>(Base: any): any {
    const paramTypes = Reflect.getMetadata('design:paramtypes', Base)

    abstract class Service extends Base {
      system: System
      moduleRoot: ModuleBase

      constructor(...args: any[]) {
        const system: System = args[0]

        if (paramTypes?.length) {
          for (let i = 0; i < paramTypes.length; i++) {
            const arg = paramTypes[i]
            const existingModule = system.modules.get(arg)
            if (existingModule) {
              args[i] = existingModule
            }
          }
        }

        // injectModules(args, paramTypes, system)

        super(...args)

        this.system = system
      }
    }

    return Service
  }
}
