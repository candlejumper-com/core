import { Application } from 'express'
import { Socket } from 'socket.io'
import { System } from "../../system/system"
import { ITensorflowOptions } from './ai.interfaces'

export default function (system: System, app?: Application, socket?: Socket) {

    if (socket) {
        socket.on('post:/api/ai', async (options: ITensorflowOptions, callback) => {
            try {
                const aiGroup = system.aiManager.run(options)
                callback({
                    id: aiGroup.id,
                    instances: aiGroup.instances.map(instance => ({
                        id: instance.id,
                        symbol: instance.options.symbol
                    }))
                })
            } catch (error) {
                console.error(error)
            }
        })
    }
}