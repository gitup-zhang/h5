// ─── 短信验证码 ──────────────────────────────────────────

/** 短信验证码发送目的 */
export type SmsPurpose = 'REGISTER' | 'LOGIN' | 'CHANGE_PASSWORD' | 'RESET_PASSWORD'

/** 1.1 发送短信验证码 */
export interface SmsSendParams {
  phone_number: string
  purpose: SmsPurpose
}

/** 1.2 校验短信验证码 */
export interface SmsVerifyParams {
  phone_number: string
  code: string
  purpose: SmsPurpose
}

/** 1.2 校验结果 */
export interface SmsVerifyResult {
  verify_token: string
}

// ─── 注册 ──────────────────────────────────────────────

/** 1.3 用户注册 */
export interface RegisterParams {
  phone_number: string
  password: string
  verify_token: string
}

// ─── 登录 ──────────────────────────────────────────────

/** 1.4 密码登录 */
export interface PasswordLoginParams {
  phone_number: string
  password: string
}

/** 1.5 短信验证码登录 */
export interface SmsLoginParams {
  phone_number: string
  verify_token: string
}

/** 1.4 / 1.5 / 1.7 登录 & 刷新响应 */
export interface LoginResult {
  access_token: string
  refresh_token: string
}

// ─── 密码 ──────────────────────────────────────────────

/** 1.6 重置密码（忘记密码） */
export interface ResetPasswordParams {
  phone_number: string
  verify_token: string
  new_password: string
}

/** 1.11 修改密码 */
export interface ChangePasswordParams {
  old_password: string
  new_password: string
}

/** 修改手机号 */
export interface ChangePhoneParams {
  phone_number: string
  verify_token: string
}

// ─── Token ─────────────────────────────────────────────

/** 1.7 刷新 Token */
export interface RefreshTokenParams {
  refresh_token: string
}

// ─── 用户信息 ──────────────────────────────────────────

/** 领域信息 */
export interface FieldInfo {
  field_code: string
  field_name: string
}

/** 1.9 当前用户信息 */
export interface UserInfo {
  user_id: number
  nickname: string
  avatar_url: string
  name: string
  country_code: string
  phone_number: string
  email: string
  unit: string
  department: string
  position: string
  industry_id: number
  industry_name: string
  role: string
  role_name: string
  status: number
  fields: FieldInfo[]
}

/** 1.10 更新用户信息（全部字段可选） */
export interface UpdateUserParams {
  nickname?: string
  avatar_url?: string
  name?: string
  email?: string
  unit?: string
  department?: string
  position?: string
  industry_id?: number
  field_ids?: number[]
}
