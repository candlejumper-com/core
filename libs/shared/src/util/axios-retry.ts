import axios, { AxiosError } from 'axios'
import axiosRetry from 'axios-retry'

export function createAxiosRetryInstance(retries = 10) {
  const onRetry = (retryCount: number, error: AxiosError) => {
    if (error.response) {
      console.log(error.response.data)
      console.log(error.response.status)
    } else if (error.cause) {
      console.error(error.cause)
    }
  }

  const retryDelay = (retryCount: number): number => {
    const maxDelay = 60000
    const delayMultiplier = 1000

    return Math.min(maxDelay, retryCount * delayMultiplier)
  }

  const axiosInstance = axios.create()

  axiosRetry(axiosInstance, { retries, retryDelay, onRetry })

  return axiosInstance
}
