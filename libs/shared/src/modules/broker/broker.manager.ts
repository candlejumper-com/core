import { Broker } from './broker'
import { System } from '../../system/system'
import { BROKER_PURPOSE } from './broker.util'
import { logger } from '../../util/log'

export class BrokerManager {
  // readonly brokers: {[key: string]: Broker} = {}
  private readonly brokers = new Map<typeof Broker, Broker>()

  constructor(private system: System) {}

  async init() {
    for (const broker of this.brokers.values()) {
      await broker.init()
    }
  }

  getByClass<T extends typeof Broker>(constructor?: T): InstanceType<T> {
    if (!constructor) {
      return this.brokers.values().next().value
    }

    return this.brokers.get(constructor) as InstanceType<T>
  }

  getByPurpose(purpose: BROKER_PURPOSE): Broker {
    const broker = Array.from(this.brokers.values()).find((broker: Broker) => {
      return broker.hasPurpose(purpose)
    })

    if (!broker) {
      throw new Error('Broker with purpose ' + purpose + ' not found')
    }

    return broker
  }

  getById(id: string): Broker {
    const broker = Array.from(this.brokers.values()).find((broker: Broker) => {
      return broker.id === id
    })

    if (!broker) {
      throw new Error('Broker with id ' + id + ' not found')
    }

    return broker
  }

  async add<T extends Broker>(BrokerClass: new (system: System, purposes: BROKER_PURPOSE[]) => T, purposes: BROKER_PURPOSE[]): Promise<T> {
    const broker = new BrokerClass(this.system, purposes)
    this.brokers.set(BrokerClass, broker)

    try {
      await broker.init()
    } catch (error: any) {
      console.error(error)
    }

    return broker
  }

  remove(broker: any) {
    this.brokers.delete(broker.id)
  }
}
