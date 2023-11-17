import { SystemBase } from "../system/system";
import { ISystemConfig } from "./config.interfaces";
import merge from 'deepmerge';

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

        console.log(this.config.server, config.server, configDefault.server)
    }
}