import admin from "firebase-admin";
import { join } from "path";
import { System } from "../../system/system";
import { logger, IOrder } from "@candlejumper/shared";

import FIREBASE_CERT from './../../../../../firebase-keys.json';
import sdf from './device.json'
// admin.initializeApp({
//     credential: admin.credential.cert(FIREBASE_CERT)
// });

export class DeviceManager {

    constructor(public system: System) { }

    async init() {
        // let query = `CREATE TABLE IF NOT EXISTS DEVICES (token varchar(255) UNIQUE);`

        // await this.system.db.connection.run(query)
    }

    async add(token: string) {
        // const sql = `REPLACE INTO DEVICES (token) VALUES (${token})`;
        // await this.system.db.connection.run(sql);
    }

    async get() {
        // const rows = await this.system.db.connection.all(`SELECT * FROM DEVICES`)
        // return rows
        return []
    }

    async remove(token: string) {
        // await this.system.db.connection.run(`DELETE FROM DEVICES WHERE token='${token}'`)
    }

    async sendTradeNotification(orderEvent: IOrder) {
        const tokens = await this.get()

        for (let i = 0, len = tokens.length; i < len; i++) {
            const token = tokens[i].token

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