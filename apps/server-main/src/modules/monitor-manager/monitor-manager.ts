import { SystemMain } from "../../system/system"

export class MonitorManager {

    private intervalCheckTime = 60000

    constructor(public system: SystemMain) {

    }

    init() {
        setInterval(() => this.checkProcessUsage())
    }

    checkProcessUsage() {
        const used = process.memoryUsage()
        console.info(used);
    }
}