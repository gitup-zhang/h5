import { defineStore } from 'pinia'
import { showToast } from 'vant'
import {
  passwordLogin,
  smsLogin,
  register,
  getCurrentUser,
  updateUser,
  changePassword,
  changePhone,
  logout as logoutApi,
} from '@/api/user'
import http from '@/api/http'
import type {
  UserInfo,
  PasswordLoginParams,
  SmsLoginParams,
  RegisterParams,
  UpdateUserParams,
  ChangePasswordParams,
  ChangePhoneParams,
  LoginResult,
} from '@/types/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    /** 当前用户信息（未登录时为 null） */
    profile: null as UserInfo | null,
    /** 是否正在加载用户信息 */
    loading: false,
  }),

  getters: {
    /** 是否已登录 */
    isLoggedIn: (state) => state.profile !== null,

    /** 头像展示文字（姓名首字，兜底"我"） */
    avatarText: (state) => {
      if (!state.profile) return '我'
      const name = state.profile.name || state.profile.nickname || ''
      return name.charAt(0) || '我'
    },

    /** 性别展示文字 */
    displayGender: (state) => {
      const code = state.profile?.gender_code
      if (code === 'M') return '男'
      if (code === 'F') return '女'
      return ''
    },

    /** 展示用手机号（脱敏中间四位） */
    displayMobile: (state) => {
      const phone = state.profile?.phone_number || ''
      if (phone.length === 11) {
        return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      }
      return phone
    },

    /** 身份展示名称 */
    displayRole: (state) => state.profile?.role_name || '普通用户',

    /** 行业名称列表 */
    industryNames: (state) => {
      if (!state.profile?.industry_name) return []
      return [state.profile.industry_name]
    },

    /** 领域名称列表 */
    fieldNames: (state) => {
      if (!state.profile?.fields) return []
      return state.profile.fields.map((f) => f.field_name)
    },
  },

  actions: {
    // ─── 初始化 ─────────────────────────────────────────

    /**
     * 应用启动时从 localStorage 恢复登录态
     * 如果存在有效 token，则拉取用户信息
     */
    async initAuth() {
      const token = http.getToken()
      if (!token) return
      try {
        await this.fetchProfile()
      } catch {
        // token 已过期或无效，清除残留
        this.clearAuth()
      }
    },

    // ─── 登录 & 注册 ────────────────────────────────────

    /** 密码登录 */
    async loginWithPassword(params: PasswordLoginParams) {
      const res = await passwordLogin(params)
      this.setTokens(res.data)
      await this.fetchProfile()
      showToast('登录成功')
    },

    /** 短信验证码登录 */
    async loginWithSms(params: SmsLoginParams) {
      const res = await smsLogin(params)
      this.setTokens(res.data)
      await this.fetchProfile()
      showToast('登录成功')
    },

    /** 注册（不自动登录，需用户再走登录流程） */
    async registerAccount(params: RegisterParams) {
      await register(params)
      showToast('注册成功，请登录')
    },

    // ─── 用户信息 ───────────────────────────────────────

    /** 获取当前用户信息 */
    async fetchProfile() {
      this.loading = true
      try {
        const res = await getCurrentUser()
        this.profile = res.data
      } finally {
        this.loading = false
      }
    },

    /** 更新个人信息（部分更新） */
    async updateProfile(payload: UpdateUserParams) {
      await updateUser(payload)
      // 更新成功后刷新本地 profile
      await this.fetchProfile()
    },

    // ─── 密码 ───────────────────────────────────────────

    /** 修改密码（已登录场景） */
    async changePassword(payload: ChangePasswordParams) {
      await changePassword(payload)
      showToast('密码修改成功')
    },

    /** 修改手机号（已登录场景） */
    async changePhone(payload: ChangePhoneParams) {
      await changePhone(payload)
      // 修改成功后刷新用户信息
      await this.fetchProfile()
    },

    // ─── 退出 ───────────────────────────────────────────

    /** 退出登录 */
    async logout() {
      try {
        await logoutApi()
      } catch {
        // 即使服务端登出失败，也清除本地状态
      }
      this.clearAuth()
    },

    // ─── 内部工具 ───────────────────────────────────────

    /** 保存 tokens */
    setTokens(tokens: LoginResult) {
      http.setToken(tokens.access_token)
      http.setRefreshToken(tokens.refresh_token)
    },

    /** 清除所有登录状态 */
    clearAuth() {
      this.profile = null
      this.loading = false
      http.clearToken()
      http.clearRefreshToken()
    },
  },
})
