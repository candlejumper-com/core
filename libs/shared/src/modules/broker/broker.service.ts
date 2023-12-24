import { Broker } from "./broker";
import { Service } from "../../decorators/service.decorator";
import { ConfigService } from "../config/config.service";
import { System } from "../../system/system";

export enum BROKER_PURPOSE {
  CANDLES = "CANDLES",
  ORDERS = "ORDERS",
  CALENDAR = "CALENDAR",
  PREDICTION = "PREDICTION"
}

@Service({})
export class BrokerService {

  constructor(private configManager: ConfigService) {}

  // readonly brokers: {[key: string]: Broker} = {}
  private readonly brokers = new Map<typeof Broker, any>()

  get<T extends Broker>(constructor?: new (...args: any[]) => T): T {
    if (!constructor) {
      return this.brokers.values().next().value
    }
    
    return this.brokers.get(constructor)
  }

  async add<T extends Broker>(system: System, BrokerClass: any, purpose?: BROKER_PURPOSE): Promise<T> {
  // async add<T extends Broker>(BrokerClass: new (...args: any[]) => T, purpose?: BROKER_PURPOSE): Promise<T> {
    // console.log(BrokerClass)
    const broker = new BrokerClass(this.configManager)
    broker.system = system
    // broker.system = this.systen
    this.brokers.set(BrokerClass, broker)
    await broker.init()
    return broker
  }

  remove(broker: any) {
    this.brokers.delete(broker.id)
  }
}
