import { TICKER_TYPE } from "../ticker/ticker.util";
import { System } from "./system";


export function SystemBase(params?: { modules?: { [key: string]: any }, type?: TICKER_TYPE }): any {

  return function <TBase extends { new(...args: any[]): System }>(constructor: TBase ): TBase {
    abstract class Hoi extends constructor {
      override type = params.type
      sdsd = 2323
      constructor(...args: any[]) {
        super(...args)

        this.modules = this.modules || {}

        for (let key in params.modules) {
          this.modules[key] = new params.modules[key](this)
        }    
      }
    }

    return Hoi
  }
}