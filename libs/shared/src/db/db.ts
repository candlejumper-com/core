import { join } from 'path';
import { DataSource, Entity, EntitySchema } from "typeorm"
import { System } from '../system/system';
import { logger } from '../util/log';
import { Service } from '../decorators/service.decorator';

const PATH_DATA = join(__dirname, '../../../_data/server')

@Service({})
export class DB {

    connection: DataSource;

    constructor(public system: System) { }

    async init(entities: any[]) {
        logger.info(`\u267F Connect DB`)

        const now = Date.now()
        const myDataSource = new DataSource({
            type: "sqlite",
            database: join(PATH_DATA, 'tradebot.db'),
            entities: entities,
            logging: false,
            synchronize: true,
        })

        this.connection = await myDataSource.initialize()

        logger.info(`\u2705 Connect DB (${Date.now() - now}ms)`)
    }
}

