import admin from "firebase-admin";
import { join } from "path";
import { System } from "../../system/system";
import { logger, IOrder, ICalendarItem } from "@candlejumper/shared";
import FIREBASE_CERT from './../../../../../firebase-keys.json';
import { Device } from "./device.entity";

export class DeviceManager {

    constructor(public system: System) { }

    async init() {
        admin.initializeApp({
            credential: admin.credential.cert(FIREBASE_CERT as any)
        });
    }

    async temp() {
        const token = "f6iJ3VrDz6hyQd19oQSRu4:APA91bFEJoGwhgD64qsQ24sZNs3AWUpRfvVepvw_XZBwmSfwqpUgFXLl4BwOPMJ4WHpdM2P4pXEfxl4syUGPC7K4EHN3VXBsnZdTtI5rMuNAwIJdqjVHsmoEsAT2l-iw2ZJ6D34FyF79"
        const payload = {
            token,
            notification: {
                title: `Trade `,
                body: `sadfsdf`,
            },
            android: {
                notification: {
                    sound: 'assets/sound/bleep.mp3'
                },
            },
            data: {
                account: "Savings",
                balance: "$3020.25"
            },
        };

        const result = await admin.messaging().send(payload)

    }

    async add(token: string) {
        const DeviceRepo = this.system.db.connection.getRepository(Device)
        const device = DeviceRepo.create({token})
        const results = await DeviceRepo.save(device)

        return results
    }

    async get() {
        const DeviceRepo = this.system.db.connection.getRepository(Device)
        const devices = await DeviceRepo.find()

        const tokens = devices.map(device => device.token)
        return [...new Set(tokens)];
    }

    async remove(token: string) {
        // await this.system.db.connection.run(`DELETE FROM DEVICES WHERE token='${token}'`)
    }

    async sendCalendarNotifiction(data: ICalendarItem[]) {
        const tokens = await this.get()
        // console.log(233, tokens)
        for (let i = 0, len = tokens.length; i < len; i++) {
            const token = tokens[i]

            try {
                const payload = {
                    token,
                    notification: {
                        title: `${data.length} news events`,
                        body: `${data.map(item => item.symbol)}`,
                    },
                    android: {
                        notification: {
                            sound: 'assets/sound/bleep.mp3'
                        },
                    },
                    data: {
                        account: "Savings",
                        balance: "$3020.25"
                    },
                };
        
                const result = await admin.messaging().send(payload)

            } catch (error: any) {
                logger.warn(error.message, error.code)

                if (error.code === 'messaging/registration-token-not-registered') {
                    try {
                        await this.remove(token)
                    } catch (removeError) {
                        console.error(removeError)
                    }
                }
            }
        }
    }

    async sendTradeNotification(orderEvent: IOrder) {
        const tokens = await this.get()

        for (let i = 0, len = tokens.length; i < len; i++) {
            const token = tokens[i]

            try {
                const payload = {
                    token,
                    notification: {
                        title: `Trade ${orderEvent.symbol} ${orderEvent.side} `,
                        body: `${orderEvent.price * orderEvent.quantity}`,
                    },
                    android: {
                        notification: {
                            sound: 'assets/sound/bleep.mp3'
                        },
                    },
                    data: {
                        account: "Savings",
                        balance: "$3020.25"
                    },
                };
        
                const result = await admin.messaging().send(payload)

            } catch (error: any) {
                logger.warn(error.message, error.code)

                if (error.code === 'messaging/registration-token-not-registered') {
                    try {
                        await this.remove(token)
                    } catch (removeError) {
                        console.error(removeError)
                    }
                }
            }
        }
        
    }
}