import { System } from '../system/system'

export abstract class Queue {}

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

  add<T>(method: () => Promise<any>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.list.push({
        method: async () => {
          try {
            const result_1 = await method()
            this.active--
            resolve(result_1)
          } catch (error) {
            this.active--
            reject(error)
          }
        },
      })
    })
  }

  async tick() {
    // if ((weightUsed > this.maxWeight || this.currentWeight >= this.maxWeight) && this.firstLoad !== true) {
    //     return
    // }

    if (this.active >= this.maxActive || (this.lastRequest && Date.now() - this.lastRequest.getTime() < this.callTimeout)) {
      return
    }

    if (this.list.length) {
      this.lastRequest = new Date()
      this.currentWeight++
      const wrapper = this.list.shift()
      this.active++
      const method = await wrapper.method()
      // await method()``
      // const result = await method()
    }
  }

  private startInterval() {
    setInterval(async () => {
      await this.tick()
    }, 100)
  }
}
