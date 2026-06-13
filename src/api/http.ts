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
  data: T
  message?: string
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

  // ─── 拦截器 ───────────────────────────────────────────

  private initInterceptors(): void {
    // 请求拦截器 —— 自动携带 Token
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

    // 响应拦截器 —— 统一处理业务状态码 & HTTP 错误
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { code, message } = response.data
        // 业务成功码：0 或 200
        if (code === 0 || code === 200) {
          return response.data as unknown as AxiosResponse
        }
        // 业务异常：后端返回 HTTP 200 但 code 非成功
        const errMsg = message || `请求失败 (code: ${code})`
        if (errMsg) showToast(errMsg)
        return Promise.reject(new Error(errMsg))
      },
      (error: AxiosError<ApiResponse>) => {
        // 后端返回 HTTP 4xx/5xx 并附带业务错误体
        const resData = error.response?.data
        const errMsg =
          (resData && typeof resData === 'object' && 'message' in resData
            ? (resData as ApiResponse).message
            : '') ||
          ''
        this.handleHttpError(error, errMsg)
        return Promise.reject(new Error(errMsg || error.message))
      },
    )
  }

  /** HTTP 状态码错误处理 */
  private handleHttpError(error: AxiosError<ApiResponse>, extractedMsg: string): void {
    const status = error.response?.status
    let message = extractedMsg

    switch (status) {
      case 400:
        message ||= '请求参数有误'
        break
      case 401:
        message ||= '登录已过期，请重新登录'
        this.clearToken()
        this.clearRefreshToken()
        break
      case 403:
        message ||= '没有访问权限'
        break
      case 404:
        message ||= '请求的资源不存在'
        break
      case 500:
        message ||= '服务器繁忙，请稍后再试'
        break
      default:
        message ||= error.message || '网络异常，请稍后重试'
    }

    if (message) showToast(message)
  }

  // ─── Token 管理 ────────────────────────────────────────

  /** 获取本地存储的 Token */
  getToken(): string | null {
    try {
      return localStorage.getItem('token')
    } catch {
      return null
    }
  }

  /** 保存 Token 到本地存储 */
  setToken(token: string): void {
    try {
      localStorage.setItem('token', token)
    } catch {
      // localStorage 不可用（无痕浏览等场景），仅内存持有
    }
  }

  /** 清除本地 Token */
  clearToken(): void {
    try {
      localStorage.removeItem('token')
    } catch {
      // localStorage 不可用
    }
  }

  /** 获取本地存储的 RefreshToken */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken')
    } catch {
      return null
    }
  }

  /** 保存 RefreshToken 到本地存储 */
  setRefreshToken(token: string): void {
    try {
      localStorage.setItem('refreshToken', token)
    } catch {
      // localStorage 不可用
    }
  }

  /** 清除本地 RefreshToken */
  clearRefreshToken(): void {
    try {
      localStorage.removeItem('refreshToken')
    } catch {
      // localStorage 不可用
    }
  }

  // ─── 公开 HTTP 方法 ────────────────────────────────────

  /**
   * GET 请求
   * @example
   * const res = await http.get<User>(`/users/${id}`)
   * console.log(res.data) // User
   */
  get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.instance.get(url, { params, ...config }) as unknown as Promise<ApiResponse<T>>
  }

  /**
   * POST 请求
   * @example
   * const res = await http.post<User>('/users', { name: 'Alice' })
   */
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config) as unknown as Promise<ApiResponse<T>>
  }

  /**
   * PUT 请求
   * @example
   * const res = await http.put<User>(`/users/${id}`, { name: 'Bob' })
   */
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config) as unknown as Promise<ApiResponse<T>>
  }

  /**
   * PATCH 请求
   * @example
   * const res = await http.patch<User>('/users/me', { nickname: 'NewName' })
   */
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config) as unknown as Promise<ApiResponse<T>>
  }

  /**
   * DELETE 请求
   * @example
   * const res = await http.delete(`/users/${id}`)
   */
  delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config) as unknown as Promise<ApiResponse<T>>
  }
}

/** 全局请求实例（单例） */
export const http = new Request()

export default http
