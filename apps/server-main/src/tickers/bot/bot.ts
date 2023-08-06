import { DiffPercentageWatcher } from './bot-helpers';
import { IBotConfig, IWatcherOptions } from './bot.interfaces';
import { TICKER_EVENT_TYPE, TICKER_TYPE, Ticker } from '../ticker';
import { CANDLE_FIELD } from '../../modules/candle-manager/candle-manager';
import { Indicator } from '../indicator/indicator';
import { IOrderSnapshot } from '../../modules/order-manager/order.interfaces';
import { ITickerSnapshot } from '../ticker.interfaces';

export abstract class Bot<T> extends Ticker<T> {
  readonly type = TICKER_TYPE.BOT;

  config: IBotConfig = {};
  watchers: DiffPercentageWatcher[] = [];

  private lastCandleTime = 0;

  async init(): Promise<void> {
    await super.init();
    await this.onInit?.();

    this.isInitialized = true;
  }

  addWatcher(options: IWatcherOptions): DiffPercentageWatcher {
    options.startPrice = options.startPrice || this.price;
    const watcher = new DiffPercentageWatcher(this, options);
    this.watchers.push(watcher);
    this.addEvent(TICKER_EVENT_TYPE.WATCHER_START, {
      time: this.system.time,
      dir: options.dir,
    });
    return watcher;
  }

  removeWatcher(watcher: DiffPercentageWatcher): void {
    this.watchers.splice(this.watchers.indexOf(watcher, 1));
    this.addEvent(TICKER_EVENT_TYPE.WATCHER_STOP, { time: this.system.time });
  }

  /**
   * the actual tick of the bot
   */
  async tick(): Promise<void> {
    await super.tick();

    // check if tick is first of new candle
    const isNewCandle =
      this.candles[0][CANDLE_FIELD.TIME] > this.lastCandleTime;

    // tick watchers
    for (let i = 0, len = this.watchers.length; i < len; i++) {
      const watcher = this.watchers[i];
      const triggered = await watcher.checkTrigger();

      if (triggered) {
        this.addEvent(TICKER_EVENT_TYPE.WATCHER_TRIGGERED, {
          time: this.system.time,
        });
        this.removeWatcher(watcher);
      }
    }

    // bot tick
    await this.onTick(isNewCandle);

    // tick is done, ready for next
    this.isReady = true;
  }

  buildSnapshot(...args: Indicator<any>[]): IOrderSnapshot {
    function findEarliestCandles(snapshots: ITickerSnapshot[]) {
      let lowestValue = Infinity;
      let lowestIndex = -1;

      for (let i = 0; i < snapshots.length; i++) {
        const snapshot = snapshots[i];
        const value = snapshot.candles.at(-1)[0];

        if (value < lowestValue) {
          lowestValue = value;
          lowestIndex = i;
        }
      }

      return snapshots[lowestIndex].candles;
    }

    const indicatorSnapshots = args.map((indicator) => indicator.snapshot());
    return {
      indicators: indicatorSnapshots,
      candles: findEarliestCandles(indicatorSnapshots),
    };
  }
}
