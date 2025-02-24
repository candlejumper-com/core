import { System } from "../../system/stystem.main"

export class MonitorManager {

    private intervalCheckTime = 60000

    constructor(public system: System) {

    }

    init() {
        setInterval(() => this.checkProcessUsage())
    }

    checkProcessUsage() {
        const used = process.memoryUsage()
        console.info(used);
    }
}