import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { showToast } from 'vant'
import { appConfig } from '@/config/env'

/** 接口统一返回格式 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  requestId?: string
}

/** HTTP 请求工具类 */
class Request {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: appConfig.apiBaseUrl,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    })
    this.initInterceptors()
  }

  private initInterceptors(): void {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => Promise.reject(error),
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { code } = response.data
        if (this.isSuccessCode(code)) {
          return response.data as unknown as AxiosResponse
        }

        const errMsg = this.getResponseMessage(response.data, `请求失败 (code: ${code})`)
        this.showErrorToast(errMsg)
        return Promise.reject(new Error(errMsg))
      },
      (error: AxiosError<ApiResponse>) => {
        const errMsg = this.getHttpErrorMessage(error)
        this.handleAuthError(error.response?.status)
        this.showErrorToast(errMsg)
        return Promise.reject(new Error(errMsg))
      },
    )
  }

  private isSuccessCode(code: unknown): boolean {
    return code === 0 || code === 200
  }

  private normalizeMessage(msg: unknown): string {
    if (typeof msg === 'string') {
      return msg.trim()
    }
    if (typeof msg === 'number' || typeof msg === 'boolean') {
      return String(msg)
    }
    return ''
  }

  private getResponseMessage(data: unknown, fallback: string): string {
    if (data && typeof data === 'object') {
      const message = this.normalizeMessage((data as Record<string, unknown>).message)
      if (message) return message
    }
    return fallback
  }

  private getHttpErrorMessage(error: AxiosError<ApiResponse>): string {
    const status = error.response?.status
    const fallback = this.getStatusFallbackMessage(status, error.message)
    return this.getResponseMessage(error.response?.data, fallback)
  }

  private getStatusFallbackMessage(status: number | undefined, axiosMessage: string): string {
    switch (status) {
      case 400:
        return '请求参数有误'
      case 401:
        return '登录已过期，请重新登录'
      case 403:
        return '没有访问权限'
      case 404:
        return '请求的资源不存在'
      case 500:
        return '服务器繁忙，请稍后再试'
      default:
        return axiosMessage || '网络异常，请稍后重试'
    }
  }

  /** 安全地展示 Toast，防止空白消息 */
  private showErrorToast(message: string): void {
    const safe = (message ?? '').trim() || '操作失败，请稍后重试'
    showToast({ message: safe, duration: 3000 })
  }

  private handleAuthError(status: number | undefined): void {
    if (status !== 401) return
    this.clearToken()
    this.clearRefreshToken()
  }

  getToken(): string | null {
    try {
      return localStorage.getItem('token')
    } catch {
      return null
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem('token', token)
    } catch {
      // localStorage may be unavailable in some browser modes.
    }
  }

  clearToken(): void {
    try {
      localStorage.removeItem('token')
    } catch {
      // localStorage may be unavailable in some browser modes.
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken')
    } catch {
      return null
    }
  }

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem('refreshToken', token)
    } catch {
      // localStorage may be unavailable in some browser modes.
    }
  }

  clearRefreshToken(): void {
    try {
      localStorage.removeItem('refreshToken')
    } catch {
      // localStorage may be unavailable in some browser modes.
    }
  }

  get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.instance.get(url, { params, ...config }) as unknown as Promise<ApiResponse<T>>
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config) as unknown as Promise<ApiResponse<T>>
  }

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config) as unknown as Promise<ApiResponse<T>>
  }

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config) as unknown as Promise<ApiResponse<T>>
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config) as unknown as Promise<ApiResponse<T>>
  }
}

export const http = new Request()

export default http
