import { createLogger, format, transports } from 'winston'
import * as path from 'path'
import { TICKER_TYPE } from '../ticker/ticker.util'
import { System } from '../system/system'

const PATH_LOGS = path.join(__dirname, '../../../../_logs/')
const PATH_LOGS_ERROR = path.join(PATH_LOGS, 'error.log')
export const PATH_LOGS_COMBINED = path.join(PATH_LOGS, 'combined.log')

const { combine, timestamp, label, printf, colorize, simple, errors, prettyPrint, json } = format

const errorStackFormat = format(info => {
  if (info instanceof Error) {
    return Object.assign({}, info, {
      stack: info.stack,
      message: info.message,
    })
  }
  return info
})

function minLengthString(text: string, minLength: number) {
  if (text.length < minLength) {
    text = text + new Array(minLength - text.length).join(' ')
  }

  return text
}

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${systemEnvironment}] ${minLengthString(level, 20)}: ${message}`
})

let systemEnvironment: TICKER_TYPE | string = 'SYSTEM'

export function setLogSystemEnvironment(system: System) {
  switch (system.type) {
    case TICKER_TYPE.SYSTEM_MAIN:
      systemEnvironment = system.type.magenta
      break
    case TICKER_TYPE.SYSTEM_BACKTEST:
      systemEnvironment = system.type.gray
      break
    case TICKER_TYPE.SYSTEM_CANDLES:
      systemEnvironment = system.type.yellow
      break
    default:
      throw new Error(`unkown environment: ${system.type}`)
  }

  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  if (process.env['NODE_ENV'] !== 'production') {
    const logLevel = system.configManager.config.logLevel

    logger.add(
      new transports.Console({
        level: logLevel,
        handleExceptions: true,
        format: combine(
          label({ label: systemEnvironment }),
          customFormat,
          timestamp({
            format: 'DD-MM-YYYY HH:mm:ss',
          }),
          errorStackFormat(),
          // prettyPrint()
        ),
      }),
    )
  }
}

export const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: systemEnvironment }),
    timestamp({
      format: 'DD-MM-YYYY HH:mm:ss',
    }),
    // customFormat,
    errorStackFormat(),
    colorize(),
    // errors({ stack: true }), // <-- use errors format
    simple(),
    // json(),
    timestamp(),
    // prettyPrint(),
  ),
  handleExceptions: true,
  // defaultMeta: { time: new Date() },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new transports.File({ filename: PATH_LOGS_ERROR, level: 'error', maxFiles: 10, maxsize: 1000 * 1000 }),
    new transports.File({ filename: PATH_LOGS_COMBINED, maxFiles: 10, maxsize: 1000 * 1000 }),
  ],
})

class Logger {
  static UNIQUE_ID = 0

  tracked: { type: 'debug' | 'info' | 'warn' | 'error'; id: number; message: any[]; now: number }[] = []
  systemEnvironment: TICKER_TYPE | string = 'SYSTEM'

  customFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${this.systemEnvironment}] ${this.minLengthString(level, 20)}: ${message}`
  })

  errorStackFormat = format(info => {
    if (info instanceof Error) {
      return Object.assign({}, info, {
        stack: info.stack,
        message: info.message,
      })
    }
    return info
  })

  minLengthString(text: string, minLength: number) {
    if (text.length < minLength) {
      text = text + new Array(minLength - text.length).join(' ')
    }
  
    return text
  }

  logger = createLogger({
    level: 'info',
    format: combine(
      label({ label: this.systemEnvironment }),
      timestamp({
        format: 'DD-MM-YYYY HH:mm:ss',
      }),
      // customFormat,
      this.errorStackFormat(),
      colorize(),
      // errors({ stack: true }), // <-- use errors format
      simple(),
      // json(),
      timestamp(),
      // prettyPrint(),
    ),
    handleExceptions: true,
    // defaultMeta: { time: new Date() },
    transports: [
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      //
      new transports.File({ filename: PATH_LOGS_ERROR, level: 'error', maxFiles: 10, maxsize: 1000 * 1000 }),
      new transports.File({ filename: PATH_LOGS_COMBINED, maxFiles: 10, maxsize: 1000 * 1000 }),
    ],
  })

  debug(message: any, track = false) {
    this.logger.debug(message)
  }

  info(...args: any[]) {
    this.logger.info(args as unknown as [any])
  }

  infoTrack(...args: any[]): number {
    args[0] = `♿ ${args[0]}`;
    
    this.logger.info(...args as unknown as [any])

    this.tracked.push({
      type: 'info',
      id: ++Logger.UNIQUE_ID,
      message: args,
      now: Date.now(),
    })

    return Logger.UNIQUE_ID
  }

  warn(...args: any[]) {
    this.logger.warn(args as unknown as [any])
  }

  error(...args: any[]) {
    this.logger.error(...args as unknown as [any])
  }

  finish(id: number) {
    const tracked = this.tracked.find(tracked => tracked.id === id)

    if (tracked) {
      const message = `${tracked.message} (${Date.now() - tracked.now}ms)`
      this.logger[tracked.type](message)
      this.tracked.splice(this.tracked.indexOf(tracked), 1)
    }
  }

  setSystem(system: System) {
    switch (system.type) {
      case TICKER_TYPE.SYSTEM_MAIN:
        this.systemEnvironment = system.type.magenta
        break
      case TICKER_TYPE.SYSTEM_BACKTEST:
        this.systemEnvironment = system.type.gray
        break
      case TICKER_TYPE.SYSTEM_CANDLES:
        this.systemEnvironment = system.type.yellow
        break
      default:
        throw new Error(`unkown environment: ${system.type}`)
    }
  
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    if (!system.production) {
      this.logger.add(
        new transports.Console({
          level: 'info',
          handleExceptions: true,
          format: combine(
            label({ label: this.systemEnvironment }),
            this.customFormat,
            timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            this.errorStackFormat(),
            // prettyPrint()
          ),
        }),
      )
    }
  }
}

// export const logger = new Logger()