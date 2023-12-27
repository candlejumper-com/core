import { Broker } from './broker'
import { System } from '../../system/system'
import { BROKER_PURPOSE } from './broker.util'

export class BrokerManager {
  // readonly brokers: {[key: string]: Broker} = {}
  private readonly brokers = new Map<typeof Broker, Broker>()

  constructor(private system: System) {}

  getByClass<T extends typeof Broker>(constructor?: T): InstanceType<T> {
    if (!constructor) {
      return this.brokers.values().next().value
    }

    return this.brokers.get(constructor) as InstanceType<T>
  }

  getByPurpose(purpose: BROKER_PURPOSE): Broker {
    const broker = Array.from(this.brokers.values()).find((broker: Broker) => {
      return broker.purposes.includes(purpose)
    })

    if (!broker) {
      throw new Error('Broker with purpose ' + purpose + ' not found')
    }

    return broker
  }

  async add<T extends Broker>(BrokerClass: new (system: System, purposes: BROKER_PURPOSE[]) => T, purposes: BROKER_PURPOSE[]): Promise<T> {
    const broker = new BrokerClass(this.system, purposes)
    this.brokers.set(BrokerClass, broker)
    await broker.init()

    return broker
  }

  remove(broker: any) {
    this.brokers.delete(broker.id)
  }
}
