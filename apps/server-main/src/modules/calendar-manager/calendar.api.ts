import { Application } from 'express'
import { SystemMain } from "../../system/system"
import { Routes, SymbolManager } from '@candlejumper/shared'
import { CalendarManager } from './calendar.manager'

@Routes({})
export class OrderApi {
  constructor(
    private app: Application,
    private symbolManager: SymbolManager,
    private calendarManager: CalendarManager,
  ) {}

  init() {
    this.app.get('/api/calendar', (req, res) => {
        try {
            res.send(this.calendarManager.items)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })
}
}