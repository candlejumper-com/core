import { join } from 'path';
import { DataSource } from 'typeorm';
import { System } from '../system/system';
import { logger } from '../util/log';
import { createCandleEntity, getCandleEntityName } from '../candle-manager/candle.entity'
import { rm } from 'fs/promises';
import { BrokerEntity } from '../broker/binance/broker-binance.entity'

const PATH_DATA = join(__dirname, '../../../../../../../_data/candles')

export class DB {

    connection: DataSource

    private dataDirectoryPath: string

    constructor(public system: System) { }

    async init() {
        logger.info(`\u231B Initialize DB`)

        const now = Date.now()
        const dataFilePath = join(PATH_DATA, 'candles.db')
        const CandleEntities = this.createCandleEntities()

        const myDataSource = new DataSource({
            type: "sqlite",
            database: dataFilePath,
            entities: [...CandleEntities, BrokerEntity],
            logging: false,
            synchronize: true,
        })

        this.connection = await myDataSource.initialize()

        logger.info(`\u2705 Initialize DB (${Date.now() - now}ms)`)
    }
    
    async clean() {
        await rm(PATH_DATA, { recursive: true, force: true })
    }

    private createCandleEntities() {
        const symbols = this.system.configManager.config.symbols
        const intervals = this.system.configManager.config.intervals
        const tableNames = symbols.map(symbol => intervals.map(interval => getCandleEntityName(this.system, symbol, interval))).flat()

        return tableNames.map(tableName => createCandleEntity(tableName))
    }
}

