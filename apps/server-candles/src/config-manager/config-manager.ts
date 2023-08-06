import { join } from "path"
import { System } from "../system/system"
import { ISystemConfig } from "./config.interface"
import config from '../../config.json'

// const PATH_CONFIG_CUSTOM_FILE = join(__dirname, '../../../apps/server-candles/config.json')

export class ConfigManager {

    config: ISystemConfig

    constructor(public system: System) {
        this.config = config
        // this.config = require(join(__dirname, '../../../../scripts/config.js')).config
    }
}