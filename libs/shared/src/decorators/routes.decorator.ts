import 'reflect-metadata'
import { System } from '../system/system'
import { TICKER_TYPE } from '../ticker/ticker.util'
import { ModuleBase } from '../module'
import { RouteBase } from '../route'

export interface IRoutesDecoratorOptions {}
type Constructor<T = {}> = new (...args: any[]) => T
export function Routes(options: IRoutesDecoratorOptions): any {

  return function <T extends Constructor>(Base: T, key): any {
    const paramTypes = Reflect.getMetadata('design:paramtypes', Base)

    abstract class Route extends Base {
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

        // super()
        super(...args)

        // this.system = system
      }
    }

    return Route
  }
}
