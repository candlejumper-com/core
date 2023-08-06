import { createLogger, format, transports } from 'winston'
import * as path from 'path'
import { SYSTEM_ENV } from '../system/system'

export const PATH_LOGS = path.join(__dirname, '../../../../_logs/')
export const PATH_LOGS_COMBINED = path.join(PATH_LOGS, 'combined.log')
export const PATH_LOGS_ERROR = path.join(PATH_LOGS, 'error.log')

const { combine, timestamp, label, printf, colorize, simple, errors, prettyPrint, json } = format

const errorStackFormat = format(info => {
  if (info instanceof Error) {
    return Object.assign({}, info, {
      stack: info.stack,
      message: info.message
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

let systemEnvironment = 'SYSTEM'

export function setSystemEnvironment(env: SYSTEM_ENV) {

  switch (env) {
    case SYSTEM_ENV.MAIN:
      systemEnvironment = env.magenta
      break
    case SYSTEM_ENV.BACKTEST:
      systemEnvironment = env.gray
      break
    default:
      throw new Error(`unkown environment: ${env}`)
  }
}

export const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: systemEnvironment }),
    timestamp({
      format: "DD-MM-YYYY HH:mm:ss",
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

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    level: 'debug',
    handleExceptions: true,
    format: combine(
      label({ label: systemEnvironment }),
      customFormat,
      timestamp({
        format: "DD-MM-YYYY HH:mm:ss",
      }),
      errorStackFormat(),
      // prettyPrint()
    ),
  }))
} else {

}