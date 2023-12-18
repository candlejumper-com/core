import { System } from "../system/system"


export abstract class Queue {
    
}

export class SimpleQueue extends Queue {

    list: { method: () => Promise<any> }[] = []

    private currentWeight = null
    private maxWeight = 300
    private firstLoad = true
    private lastRequest: Date
    private maxActive = 1
    private active = 0
    private callTimeout = 1000

    constructor(public system: System) {
        super()

        this.startInterval()
    }

    add(method: () => Promise<any>): Promise<any> {

        const returnPromise = new Promise(resolve => {

            this.list.push({ method: () => {
   
                return method().then(result => {
                    this.active--
                    resolve(result)
                })
            } })

        })

       
        return returnPromise

    }

    async tick() {
        // if ((weightUsed > this.maxWeight || this.currentWeight >= this.maxWeight) && this.firstLoad !== true) {
        //     return
        // }

        if ( this.active >= this.maxActive || (this.lastRequest && Date.now() - this.lastRequest.getTime() < this.callTimeout)) {
            return
        }


        if (this.list.length) {
            this.lastRequest = new Date()
            this.currentWeight++
            const wrapper = this.list.shift()
            this.active++
            const method = await (wrapper.method())
            // await method()``
            // const result = await method()
        }
    }

    private startInterval() {
        setInterval(async () => { await this.tick() }, 100)
    }
}

