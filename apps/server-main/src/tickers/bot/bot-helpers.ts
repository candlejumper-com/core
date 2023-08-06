import { Ticker } from "../ticker";
import { Bot } from "./bot";
import { IWatcherOptions } from "./bot.interfaces";

export class DiffPercentageWatcher {

    defaults = {
        maxDiffPercentage: 50,
        minDiffPercentage: 12,
        minDiff: 50
    }

    private highestDiff

    constructor(private bot: Bot<any>, public options: IWatcherOptions) {}
count = 0
    async checkTrigger() {
        const priceDiff = Math.abs(this.options.startPrice - this.bot.price)

        const dir = this.options.dir

        if (!this.highestDiff || priceDiff >= this.highestDiff) {
            this.highestDiff = priceDiff
            return false
        } 

        const diffFromHighest = Math.abs(priceDiff / this.highestDiff) * 100

        // if (this.count++ < 3) {
        //     console.log(2222, diffFromHighest, priceDiffPercentage, priceDiff, this.options.startPrice)
        // }
        // if (dir === 'down' && diffFromHighest >= this.defaults.maxDiffPercentage) {
        if (dir === 'down') {
            if (diffFromHighest > this.defaults.minDiffPercentage && diffFromHighest >= this.defaults.maxDiffPercentage) {
                await this.options.onTrigger()
                return true
            }

            // if (diffFromHighest <= -5) {
            //     // await this.options.onTrigger()
            //     return true
            // }
        }

        if (dir === 'up' && diffFromHighest >= this.defaults.maxDiffPercentage) {
            await this.options.onTrigger()
            return true
        }

        return false
    }
}