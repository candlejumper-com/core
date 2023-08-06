import { Bot, IOrderSnapshot, Indicator } from '@candlejumper/core';

export default class BotDefault<T> extends Bot<T> {

    async onTick() {

        // place your code here
    }

    buildSnapshot(...args: Indicator<any>[]): IOrderSnapshot {
        return super.buildSnapshot(...args);
    }
}