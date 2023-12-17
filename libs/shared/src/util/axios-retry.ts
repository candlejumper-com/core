import axios, { AxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import { logger } from './log'

export function createAxiosRetryInstance(statusCodes = [404], retries = 10) {

  function retryCondition(error: AxiosError) {
    if (error.code === 'ECONNREFUSED') {
      return true
    }

    return statusCodes.includes(error.response?.status)
  }

  const axiosInstance = axios.create()

  axiosRetry(axiosInstance, { retries, retryDelay, onRetry, retryCondition })

  return axiosInstance
}

const onRetry = (retryCount: number, error: AxiosError) => {
  if (error.response) {
    logger.info(error.response.data)
    logger.info(error.response.status)
  } else if (error.cause) {
    logger.error(error.cause)
  }
}

const retryDelay = (retryCount: number): number => {
  const maxDelay = 60000
  const delayMultiplier = 1000

  return Math.min(maxDelay, retryCount * delayMultiplier)
}
