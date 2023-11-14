import { join } from 'path';
import { DataSource } from "typeorm"
import { System } from '../system/system';
import { User } from '../modules/user-manager/user.entity';
import { logger } from '@candlejumper/shared';
import { Device } from '../modules/device-manager/device.entity';

const PATH_DATA = join(__dirname, '../../../../_data/server')
const PATH_ENTITIES = join(__dirname, '../user-manager/user.entity.ts')

export class DB {

    connection: DataSource;

    constructor(public system: System) { }

    async init() {
        logger.debug(`\u267F Connect DB`)

        const now = Date.now()
        const myDataSource = new DataSource({
            type: "sqlite",
            database: join(PATH_DATA, 'tradebot.db'),
            entities: [User, Device],
            // entities: [__dirname + '/../**/*.entity.{js,ts}'], // doesnt seem to work?
            logging: false,
            synchronize: true,
        })

        this.connection = await myDataSource.initialize()

        logger.info(`\u2705 Connect DB (${Date.now() - now}ms)`)
    }
}

