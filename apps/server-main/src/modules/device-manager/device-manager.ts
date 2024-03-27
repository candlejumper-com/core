import * as admin from 'firebase-admin'
import { SystemMain } from '../../system/stystem.main'
import { logger, ICalendarItem } from '@candlejumper/shared'
import { DeviceEntity } from './device.entity'
import { TokenMessage } from 'firebase-admin/lib/messaging/messaging-api'

const ERROR_TOKEN_NOT_FOUND = 'messaging/registration-token-not-registered'

export class DeviceManager {
  constructor(public system: SystemMain) {}

  async init() {
    const firebaseConfig = this.system.configManager.config.thirdParty.firebase
    
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    })
  }

  async get(): Promise<string[]> {
    const DeviceRepo = this.system.db.connection.getRepository(DeviceEntity)
    const devices = await DeviceRepo.find()

    const tokens = devices.map((device) => device.token) as string[]
    return [...new Set(tokens)]
  }

  async add(token: string) {
    const DeviceRepo = this.system.db.connection.getRepository(DeviceEntity)
    const device = DeviceRepo.create({ token })
    const results = await DeviceRepo.save(device)

    return results
  }

  async remove(token: string) {
    const DeviceRepo = this.system.db.connection.getRepository(DeviceEntity)
    await DeviceRepo.delete({ token })
  }

  async sendCalendarUpcomingNotifiction(items: ICalendarItem[]) {
    if (!items.length) {
      return
    }

    for await (const token of await this.get()) {
      await this.send({
        token,
        notification: {
          title: `${items.length} upcoming company results`,
          body: `${items.map((item) => item.symbol)}`,
        },
        data: {
          account: 'Savings',
          balance: '$3020.25',
        },
        webpush: {
          fcmOptions: {
            link: '/#/news',
          },
        },
      })

    }
  }

  private async send(payload: TokenMessage) {
    try {
      await admin.messaging().send(payload)
    } catch (error: any) {
      if (error.code === ERROR_TOKEN_NOT_FOUND) {
        try {
          await this.remove(payload.token)
        } catch (removeError) {
          logger.error(removeError)
        }
      } else {
        logger.warn(error.message, error.code)
      }
    }
  }

  private async temp() {
    const token =
      'f6iJ3VrDz6hyQd19oQSRu4:APA91bFEJoGwhgD64qsQ24sZNs3AWUpRfvVepvw_XZBwmSfwqpUgFXLl4BwOPMJ4WHpdM2P4pXEfxl4syUGPC7K4EHN3VXBsnZdTtI5rMuNAwIJdqjVHsmoEsAT2l-iw2ZJ6D34FyF79'
    const payload = {
      token,
      notification: {
        title: `Trade `,
        body: `sadfsdf`,
      },
      data: {
        account: 'Savings',
        balance: '$3020.25',
      },
    }

    const result = await admin.messaging().send(payload)
  }
}
