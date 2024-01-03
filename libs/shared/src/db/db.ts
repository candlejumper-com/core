import { join } from 'path'
import { DataSource, MixedList, EntitySchema, getMetadataArgsStorage, Table } from 'typeorm'
import { System } from '../system/system'
import { logger } from '@candlejumper/shared'

const PATH_DATA = join(__dirname, '../../../_data/server')

export class DB {
  connection: DataSource

  constructor(
    public system: System,
    private entities: EntitySchema<any>[] | MixedList<any>,
  ) {}

  async init() {
    logger.info(`♿ Connect DB`)
    const now = Date.now()

    // first time setup, expect all tables to exist
    await this.setup()

    // if there are tables missing, synchronize
    if (await this.shouldSynchronize()) {
      await this.setup(true)
    }

    logger.info(`✅ Connect DB (${Date.now() - now}ms)`)
  }

  private async setup(synchronize = false) {
    await this.connection?.destroy()

    const myDataSource = new DataSource({
      type: 'better-sqlite3',
      database: join(PATH_DATA, 'tradebot.db'),
      entities: this.entities,
      logging: false,
      synchronize,
    })

    this.connection = await myDataSource.initialize()
  }

  // check if all tables exist
  private async shouldSynchronize() {
    const tableNames = await this.getAllTableNames()
    const enitityNames = getMetadataArgsStorage().tables.map(enitity => enitity.name)

    return enitityNames.some(name => !tableNames.includes(name))
  }

  private async getAllTableNames() {
    const queryRunner = this.connection.createQueryRunner()

    // Fetch all table names from the information schema
    const tables = await queryRunner.query(`
        SELECT name
        FROM sqlite_schema
        WHERE type ='table' AND name NOT LIKE 'sqlite_%'
    `) as Table[]

    // Extract table names from the result
    return tables.map(table => table.name)
  }
}
