import { System } from "./system/system"

export class ModuleBase {

  modules = new Map()

  system: System

  get<T>(Module: any): T {
    const module = this.modules.get(Module)

    if (!module) {
      // throw new Error('Module not found: ' + Module)
    }
    return module
  }
}