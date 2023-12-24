import 'reflect-metadata'
import { System } from '../system/system'
import { TICKER_TYPE } from '../ticker/ticker.util'
import { Broker } from '../modules/broker/broker'
import { ModuleBase } from '../module'
import { BrokerManager } from '../modules/broker/broker.manager'
import { SymbolManager } from '../modules/symbol/symbol.manager'

export interface ISystemDecoratorOptions {
  type: TICKER_TYPE,
  brokers?: {
    class: any
    // class: typeof Broker
  }[]
  routes?: [new (...args: any[]) => any]
}

export function SystemDecorator(options: ISystemDecoratorOptions): any {
  return function <T extends { new (...args: any[]): {} }>(Base: T): any {

    abstract class System extends Base {
      type = options.type

      constructor(...args: any[]) {
        const rootModule = args[0]
        const paramTypes = Reflect.getMetadata('design:paramtypes', Base)

        if (paramTypes?.length) {
          for (let i = 0; i < paramTypes.length; i++) {
            const arg = paramTypes[i]
            const existingModule = rootModule.modules.get(arg)
            if (existingModule) {
              args[i] = existingModule
            }
          }
        }

        super(...args)

        if (options.brokers?.length) {
          this.addBrokers(rootModule)
        }

        // if (options.routes?.length) {
        //   for (let i = 0; i < options.routes.length; i++) {
        //     const route = new options.routes[i](this)
        //   }
        // }
      }

      private addBrokers(root: ModuleBase) {
        const brokerManager = root.get<BrokerManager>(BrokerManager)
        for (let i = 0; i < options.brokers.length; i++) {
          const broker = options.brokers[i]
          brokerManager.add(broker.class)
        }

        root.get<SymbolManager>(SymbolManager).syncSymbolsWithBroker()
      }
    }

    return System
  }
}
