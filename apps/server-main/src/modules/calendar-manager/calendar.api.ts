import { Application } from 'express'
import { System } from "../../system/system"

export default function (system: System, app: Application) {

    app.get('/api/calendar/file-tree', (req, res) => {
        try {
            res.send(system.editorManager.fileTree)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })

    app.get('/api/editor/file', async (req, res) => {
        try {
            const filePath = req.query.path as string
            const content = await system.editorManager.getFile(filePath)
            res.send({ content })
        } catch (error) {
            console.error(error)
            res.sendStatus(500).send(error)
        }
    })

    app.get('/api/editor/typings', async (req, res) => {
        try {
            res.send(system.editorManager.getTypings())
        } catch (error) {
            console.error(error)
            res.sendStatus(500).send(error)
        }
    })

    app.put('/api/editor/files', async (req, res) => {
        try {
            const files = req.body
            await system.editorManager.saveFiles(files)
            res.send({})
        } catch (error) {
            console.error(error)
            res.sendStatus(500).send(error)
        }
    })
}