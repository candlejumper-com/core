import { join } from 'path'
import { System } from '../../system/system'
import { ISystemConfig } from './config.interfaces'
import merge from 'deepmerge'
import { existsSync, readFileSync } from 'fs'

const PATH_BASE = join(__dirname, '../../../')

// USING THESE VARIABLES DOENST SEEM TO WORK
const PATH_CONFIG_DEFAULT_FILE = join(PATH_BASE, 'config.default.json')
const PATH_CONFIG_CUSTOM_FILE = join(PATH_BASE, 'config.json')

export class ConfigManager {
  config: ISystemConfig

  constructor(public system: System) {}

  init() {
    this.load()
  }

  /**
   * load config from root dir
   * COMMENT - not using require() or import(), because it seems to 'lock' the file, giving watcher/tsc problems
   * also, this way it will never cache the config file and always reload it from disk
   */
  private load(): void {
    const configDefault = JSON.parse(readFileSync(PATH_CONFIG_DEFAULT_FILE, 'utf8')) as ISystemConfig
    let configCustom = {}

    if (existsSync(PATH_CONFIG_CUSTOM_FILE)) {
      configCustom = JSON.parse(readFileSync(PATH_CONFIG_CUSTOM_FILE, 'utf8')) as ISystemConfig
    }

    this.config = merge(configDefault, configCustom)

    this.system.production = !!this.config.production.enabled
  }
}
