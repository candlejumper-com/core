import { Symbol, INTERVAL, System } from "@candlejumper/shared"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"


// create table based on symbol name
export function createCandleEntity(tableName: string): any {

  @Entity({ name: tableName })
  class CandleEntity {
    @PrimaryGeneratedColumn()
    time!: number

    @Column('int', { nullable: false })
    open: number

    @Column('int', { nullable: false })
    high: number

    @Column('int', { nullable: false })
    low: number

    @Column('int', { nullable: false })
    close: number

    @Column('int', { nullable: false })
    volume: number
  }

  return CandleEntity
}

export function getCandleEntityName(symbol: Symbol, interval: INTERVAL): string {
  return `SYMBOL_${symbol.name}_${interval}`.toUpperCase()
}

/**
 *
 * create candle entities for each symbol and interval
 */
export function createCandleEntities(system: System) {
  const symbols = system.symbolManager.symbols
  const intervals = system.configManager.config.intervals
  const tableNames = symbols.map(symbol => intervals.map(interval => getCandleEntityName(symbol, interval))).flat()
  return tableNames.map(tableName => createCandleEntity(tableName))
}
