import { System } from '../system/system'
import { logger } from './log'

export interface IExitHandlerOptions {
  cleanup?: boolean
  exit?: boolean
}

export function setProcessExitHandlers(system: System) {
  
  function exitHandler(options: IExitHandlerOptions, exitCode: number) {
    if (options.cleanup) {
      system.stop()
    }
    if (exitCode || exitCode === 0) {
      logger.info(`exit: ${exitCode}`)
    }
    if (options.exit) {
      process.exit()
    }
  }

  //do something when app is closing
  process.once('exit', exitHandler.bind(null, { cleanup: true, exit: true }))

  //catches ctrl+c event
  process.once('SIGINT', exitHandler.bind(null, { exit: true }))

  // catches "kill pid" (for example: nodemon restart)
  process.once('SIGUSR1', exitHandler.bind(null, { exit: true }))
  process.once('SIGUSR2', exitHandler.bind(null, { exit: true }))

  //catches uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('uncaughtException', error)
    exitHandler.bind(null, { exit: true })
  })

  process.on('unhandledRejection', (error) => {
    logger.error('UnhandledRejection')
    console.error(error)
    // exitHandler.bind(null, { exit: true })
  })

  
}
