import { EntitySchema, EntitySchemaOptions } from "typeorm"
import { ICandleObject } from "./candle.interfaces"
import { System } from "../system/system"

// base symbol table
export const BaseCandleSchema: EntitySchemaOptions<ICandleObject> = {
    name: "temp",
    columns: {  
        time: {
            type: Number,
            primary: true,
            unique: true
        },
        open: {
            type: 'text',
        },
        high: {
            type: 'text',
        },
        low: {
            type: 'text',
        },
        close: {
            type: 'text',
        },
        volume: {
            type: 'text',
        }
    }
}

// create table based on symbol name
// extends from base symbol table
export function createCandleEntity(tableName: string) {
    return new EntitySchema({
        name: tableName,
        columns: BaseCandleSchema.columns
    })
}

export function getCandleEntityName(system: System, symbolName: string, interval: string): string {
    symbolName = symbolName.replace('CS.D.', '').replace('.CFD.IP', '').replace('/', '').replace(' ', '')
    return `SYMBOL_${symbolName}_${interval.toUpperCase()}`
}