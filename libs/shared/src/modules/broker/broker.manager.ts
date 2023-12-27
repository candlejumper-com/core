import { BrokerAlphavantage } from "../../brokers/alphavantage/alphavantage.broker";
import { Broker } from "./broker";
import { System } from "../../system/system";

export enum BROKER_PURPOSE {
  CANDLES = "CANDLES",
  ORDERS = "ORDERS",
  CALENDAR = "CALENDAR",
  PREDICTION = "PREDICTION"
}

export class BrokerManager {

  // readonly brokers: {[key: string]: Broker} = {}
  private readonly brokers = new Map<typeof Broker, any>()

  constructor(private system: System) {}

  get<T extends Broker>(constructor?: new (...args: any[]) => T): T {
    if (!constructor) {
      return this.brokers.values().next().value
    }
    
    return this.brokers.get(constructor)
  }

  async add<T extends Broker>(BrokerClass: new(system: System) => T, purpose?: BROKER_PURPOSE): Promise<T> {
    const broker = new BrokerClass(this.system)
    this.brokers.set(BrokerClass, broker)
    await broker.init()

    return broker
  }

  remove(broker: any) {
    this.brokers.delete(broker.id)
  }
}
