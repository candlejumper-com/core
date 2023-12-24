import { System } from "../system/system"

export function injectModules(args: any[] ,paramTypes, system: System) {
  
  if (paramTypes?.length) {
    for (let i = 0; i < paramTypes.length; i++) {
      const arg = paramTypes[i]
      const existingModule = system.modules.get(arg)
      if (existingModule) {
        args[i] = existingModule
      }
    }
  }
}