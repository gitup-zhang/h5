import http from './http'
import type {
  SmsSendParams,
  SmsVerifyParams,
  SmsVerifyResult,
  RegisterParams,
  PasswordLoginParams,
  SmsLoginParams,
  LoginResult,
  ResetPasswordParams,
  RefreshTokenParams,
  UserInfo,
  UpdateUserParams,
  ChangePasswordParams,
  ChangePhoneParams,
} from '@/types/user'

// ─── 1.1 发送短信验证码（无需登录）───────────────────────
export const sendSms = (data: SmsSendParams) =>
  http.post('/users/sms/send', data)

// ─── 1.2 校验短信验证码（无需登录）───────────────────────
export const verifySms = (data: SmsVerifyParams) =>
  http.post<SmsVerifyResult>('/users/sms/verify', data)

// ─── 1.3 用户注册（无需登录）─────────────────────────────
export const register = (data: RegisterParams) =>
  http.post('/users/register', data)

// ─── 1.4 密码登录（无需登录）─────────────────────────────
export const passwordLogin = (data: PasswordLoginParams) =>
  http.post<LoginResult>('/users/login', data)

// ─── 1.5 短信验证码登录（无需登录）───────────────────────
export const smsLogin = (data: SmsLoginParams) =>
  http.post<LoginResult>('/users/login/sms', data)

// ─── 1.6 重置密码（无需登录）─────────────────────────────
export const resetPassword = (data: ResetPasswordParams) =>
  http.post('/users/password/reset', data)

// ─── 1.7 刷新 Token（无需登录）───────────────────────────
export const refreshToken = (data: RefreshTokenParams) =>
  http.post<LoginResult>('/users/token/refresh', data)

// ─── 1.8 退出登录（需要登录）─────────────────────────────
export const logout = () =>
  http.post('/users/logout')

// ─── 1.9 获取当前用户信息（需要登录）─────────────────────
export const getCurrentUser = () =>
  http.get<UserInfo>('/users/me')

// ─── 1.10 更新用户信息（需要登录）────────────────────────
export const updateUser = (data: UpdateUserParams) =>
  http.put('/users/me', data)

// ─── 1.11 修改密码（需要登录）────────────────────────────
export const changePassword = (data: ChangePasswordParams) =>
  http.patch('/users/me/password', data)

// ─── 1.12 修改手机号（需要登录）───────────────────────────
export const changePhone = (data: ChangePhoneParams) =>
  http.patch('/users/me/phone', data)
