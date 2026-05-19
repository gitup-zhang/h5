import axios, { AxiosError, type AxiosResponse } from 'axios'
import { showToast } from 'vant'

import { appConfig } from '@/config/env'

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message?: string
}

export const http = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 10000,
})

http.interceptors.request.use((config) => config)

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.message || error.message || '请求失败，请稍后重试'
    showToast(message)
    return Promise.reject(error)
  },
)
