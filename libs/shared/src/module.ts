import { System } from "./system/system"

export class ModuleBase {

  modules = new Map()

  system: System

  get<T extends any>(Module: any): T {
    return this.modules.get(Module) as T
  }
}