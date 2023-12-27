import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { System } from '../../system/system'
import { ISymbol } from '../symbol/symbol.interfaces'
import { INTERVAL } from '../../util/util'

// create table based on symbol name
export function createCandleEntity(tableName: string): any {

  @Entity({ name: tableName })
  class CandleEntity {
    @PrimaryGeneratedColumn()
    time!: number

    @Column({ nullable: false })
    open: number

    @Column({ nullable: false })
    high: number

    @Column({ nullable: false })
    low: number

    @Column({ nullable: false })
    close: number

    @Column({ nullable: false })
    volume: number
  }

  return CandleEntity
}

export function getCandleEntityName(symbol: ISymbol, interval: INTERVAL): string {
  const symbolName = symbol.name.replaceAll('.', '-')
  return `SYMBOL_${symbolName}_${interval}`.toUpperCase()
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
