import { join } from 'path';
import { DataSource, Entity, EntitySchema } from "typeorm"
import { System } from '../system/system';
import { logger } from '@candlejumper/shared';

const PATH_DATA = join(__dirname, '../../../_data/server')

export class DB {

    connection: DataSource;

    constructor(public system: System, private entities: any[]) { }
    // constructor(public system: System, private entities: EntitySchema<any>[]) { }

    async init() {
        logger.debug(`\u267F Connect DB`)

        const now = Date.now()
        const myDataSource = new DataSource({
            type: "sqlite",
            database: join(PATH_DATA, 'tradebot.db'),
            entities: this.entities,
            logging: false,
            synchronize: true,
        })

        this.connection = await myDataSource.initialize()

        logger.info(`\u2705 Connect DB (${Date.now() - now}ms)`)
    }
}

