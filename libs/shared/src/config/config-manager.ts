import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { SystemBase } from "../system/system";
import { logger } from "@candlejumper/shared";
import { ISystemConfig } from "./config.interfaces";
import merge from 'deepmerge';

const PATH_BASE = join(__dirname, '../../../../../')
const PATH_CONFIG_DEFAULT_FILE = join(PATH_BASE, 'config.default.json')
const PATH_CONFIG_EXAMPLE_FILE = join(PATH_BASE, 'config.example.json')
const PATH_CONFIG_CUSTOM_FILE = join(PATH_BASE, 'config.json')

export class ConfigManager {

    config: ISystemConfig

    constructor(public system: SystemBase) {}

    async init() {
        return this.load()
    }

    private async load(): Promise<void> {
        const configDefault = require('../../../../config.default.json')
        const config = require('../../../../config.json')
        this.config = merge(configDefault, config)
    }
}