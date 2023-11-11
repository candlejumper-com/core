import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { System } from "../../system/system";
import { logger } from "@candlejumper/shared";
import { ISystemConfig } from "./config.interfaces";

const PATH_BASE = join(__dirname, '../../../../../')
const PATH_CONFIG_DEFAULT_FILE = join(PATH_BASE, 'config.default.json')
const PATH_CONFIG_EXAMPLE_FILE = join(PATH_BASE, 'config.example.json')
const PATH_CONFIG_CUSTOM_FILE = join(PATH_BASE, 'config.json')

export class ConfigManager {

    config: ISystemConfig

    constructor(public system: System) {

    }

    async init() {
        await this.load()
    }

    private async load(): Promise<void> {
        const config = (await import('../../../../../config.json')).default
        this.config = config
        // this.config = require(join(__dirname, '../../../../../../../scripts/config.js')).config
    }
}