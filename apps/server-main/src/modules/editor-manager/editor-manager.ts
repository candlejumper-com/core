import { join } from 'path'
import { readFileSync, writeFileSync } from "fs"
import watch from "node-watch"
import dirTree, { DirectoryTree } from "directory-tree"
import { System } from '../../system/system'
import { logger } from '@candlejumper/shared'
import { pool, WorkerPool } from 'workerpool'
import { IEditorCompileOptions } from './editor-worker'
import { readFile, writeFile } from 'fs/promises'

export const PATH_ROOT = join(__dirname, '../../..')
export const PATH_CUSTOM = join(PATH_ROOT, 'custom')
export const PATH_CUSTOM_SRC = join(PATH_CUSTOM, 'src')
export const PATH_CUSTOM_SRC_BOTS = join(PATH_CUSTOM_SRC, 'bots')
export const PATH_CUSTOM_SRC_INDICATORS = join(PATH_CUSTOM_SRC, 'indicators')
export const PATH_CUSTOM_DIST = join(PATH_CUSTOM, 'dist')
export const PATH_CUSTOM_DIST_BOTS = join(PATH_CUSTOM_DIST, 'bots')
export const PATH_CUSTOM_DIST_INDICATORS = join(PATH_CUSTOM_DIST, 'indicators')
export const PATH_TSCONFIG = join(PATH_CUSTOM, 'tsconfig.json')

const url = new URL(join(__dirname, 'editor-worker.js'), import.meta.url)

export class EditorManager {

    fileTree: DirectoryTree<any>[]
    availableBots: Array<{ name: string }> = []
    availableIndicators: Array<{ name: string }> = []

    private pool: WorkerPool

    constructor(public system: System) { }

    async init(): Promise<void> {
        this.pool = pool(url.toString(), { maxWorkers: 1 })

        await this.readAndUpdate()
        await this.compile()

        this.setAvailableBots()

        if (!this.system.configManager.config.production.enabled) {
            setTimeout(() => this.startWatcher(), 5000)
        }
    }

    async destroy(): Promise<void> {
        await this.pool.terminate()
    }

    async getFile(filePath: string): Promise<string> {
        return readFile(filePath, { encoding: 'utf-8' })
    }

    async saveFiles(files: any[]): Promise<void> {
        await Promise.all(files.map(file => writeFile(file.path, file.content)))
    }

    async getTypings(): Promise<any[]> {
        const files = [
            join(__dirname, '../../tickers/bot/bot.d.ts'),
            join(__dirname, '../../system/system.d.ts'),
            join(__dirname, '../broker/broker.d.ts'),
            // join(__dirname, '../broker/broker_binance.d.ts'),
            join(__dirname, '../../system/api.d.ts'),
            join(__dirname, '../config-manager/config-manager.d.ts'),
            join(__dirname, '../candle-manager/candle-manager.d.ts'),
            join(__dirname, '../order-manager/order-manager.d.ts'),
        ]

        const promises = files.map(async file => ({
            path: this.normalizePath(file),
            content: await readFile(file, { encoding: 'utf-8' })
        }))

        return Promise.all(promises)
    }

    // TODO: make async (move filetree watcher to worker?)
    private async readAndUpdate(): Promise<void> {
        const tree = dirTree(PATH_CUSTOM_SRC, { normalizePath: true }).children
        this.fileTree = tree

        this.setAvailableBots()
    }

    private setAvailableBots(): void {
        this.availableBots = this.fileTree[0].children.map(child => ({
            name: child.name
        }))
    }

    // TODO: only rebuild changed bot/indicator
    private startWatcher(): void {
        watch(PATH_CUSTOM_SRC, { recursive: true }, (evt: string, name: string) => {
            this.readAndUpdate()
            this.system.apiServer.io.emit('editor/file-tree', this.fileTree)
            this.compile()
        });
    }

    private async compile(): Promise<void> {
        logger.info(`\u267F Compiling bots & indicators`)

        const now = Date.now()

        try {
            // using 1 worker to compile, is faster then a woker per bot, hmmmkay
            // await this.pool.exec('compile', [{ root: PATH_CUSTOM, dir: this.fileTree[0] }])

            logger.info(`\u2705 Compiling bots & indicators done (${Date.now() - now}ms)`)
        } catch (error) {
            console.error(error)
        }
    }

    private normalizePath(path: string): string {
        return path.replace(PATH_ROOT, '')
    }
}