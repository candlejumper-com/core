import { Application } from 'express'
import { SystemMain } from "../../system/system"
import { EditorManager } from './editor-manager'
import { Routes } from '@candlejumper/shared'

@Routes({})
export class OrderApi {
  constructor(
    private system: SystemMain,
    private app: Application,
    private editorManager: EditorManager,
  ) {}

  init() {
    this.app.get('/api/editor/file-tree', (req, res) => {
        try {
            res.send(this.editorManager.fileTree)
        } catch (error) {
            console.error(error)
            res.status(500).send(error)
        }
    })

    this.app.get('/api/editor/file', async (req, res) => {
        try {
            const filePath = req.query.path as string
            const content = await this.editorManager.getFile(filePath)
            res.send({ content })
        } catch (error) {
            console.error(error)
            res.sendStatus(500).send(error)
        }
    })

    this.app.get('/api/editor/typings', async (req, res) => {
        try {
            res.send(this.editorManager.getTypings())
        } catch (error) {
            console.error(error)
            res.sendStatus(500).send(error)
        }
    })

    this.app.put('/api/editor/files', async (req, res) => {
        try {
            const files = req.body
            await this.editorManager.saveFiles(files)
            res.send({})
        } catch (error) {
            console.error(error)
            res.sendStatus(500).send(error)
        }
    })
  }

   
}