import { ApiServer } from "../api/api";
import commandLineArgs from "command-line-args";
import { CandleManager } from "../candle-manager/candle-manager";
import { ConfigManager } from "../config-manager/config-manager";
import { DB } from "../db/db";
import { logger } from "../util/log";
import { BrokerIG } from "../broker/ig/broker-ig";
import { BrokerYahoo } from "../broker/yahoo/broker-yahoo";

const cliOptions = commandLineArgs([
  { name: "clean", alias: "c", type: Boolean, defaultOption: false },
  { name: "dev", type: Boolean, defaultOption: false },
]);

export class System {
  readonly configManager = new ConfigManager(this);
  readonly db = new DB(this);
  readonly broker = new BrokerYahoo(this);
  readonly candleManager = new CandleManager(this);
  readonly apiServer = new ApiServer(this);

  async start() {
    logger.info(
      `\u231B Initialize system \n--------------------------------------------------------------`
    );

    if (cliOptions.clean) {
      await this.clean();
    }

    await this.db.init();
    await this.broker.init();

    // use only symbols with USDT (for now)
    // this.broker.exchangeInfo.symbols = this.broker.exchangeInfo.symbols.filter(symbol => this.configManager.config.symbols.includes(symbol.name))

    this.broker.exchangeInfo.symbols = this.broker.exchangeInfo.symbols.filter(
      (symbol) => this.configManager.config.symbols.includes(symbol.name)
    );

    this.configManager.config.symbols = this.broker.exchangeInfo.symbols.map(
      (symbol) => symbol.name
    );

    await this.candleManager.init();
    await this.candleManager.sync();
    await this.apiServer.start();

    this.candleManager.startWebsocketListener();
    this.candleManager.startOutTickInterval();
    logger.info(
      `\u2705 Initialize system \n-------------------------------------------------------------`
    );
  }

  stop() {}

  async clean() {
    await this.db.clean();
  }
}
