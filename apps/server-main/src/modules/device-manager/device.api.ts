import { Application } from 'express'
import { SystemMain } from "../../system/system"
import { Routes } from '@candlejumper/shared'
import { EditorManager } from '../editor-manager/editor-manager'
import { DeviceManager } from './device-manager'

@Routes({})
export class DeviceApi {
  constructor(
    private system: SystemMain,
    private app: Application,
    private deviceManager: DeviceManager,
  ) {}

  init() {
    this.app.post('/api/device', async (req, res) => {
        try {
            await this.deviceManager.add(req.body.fcmToken)
            res.sendStatus(204)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })
}
}