/**************
 * 
 * WORKER FILE
 * 
 * this file is called by ./backtest-manager.ts as a new NodeJS Thread
 * and executes the 'run' method
 */
import 'color'
import { worker } from 'workerpool';
import { Backtest } from './backtest'
import { SYSTEM_ENV } from '../../system/system'
import { setSystemEnvironment } from '@candlejumper/shared'

setSystemEnvironment(SYSTEM_ENV.BACKTEST)

worker({
    run: async function (workerOptions) {
        try {
            const backtestWorker = new Backtest(workerOptions)
            await backtestWorker.run()
            return backtestWorker.system.getData(true)
        } catch (error) {
            console.error(error)
        }
    }
})
