<template>
  <main class="login-page">
    <div class="login-shell">
      <header class="login-header" aria-labelledby="login-title">
        <span class="login-header__mark">A</span>
        <p>H5 Activity</p>
        <h1 id="login-title">{{ pageTitle }}</h1>
        <span>{{ pageDesc }}</span>
      </header>

      <section v-if="authMode === 'login'" class="login-panel" aria-label="登录表单">
        <div class="login-switch" role="tablist" aria-label="登录方式">
          <button
            type="button"
            :class="[
              'login-switch__item',
              { 'login-switch__item--active': activeTab === 'password' },
            ]"
            @click="activeTab = 'password'"
          >
            账号密码
          </button>
          <button
            type="button"
            :class="['login-switch__item', { 'login-switch__item--active': activeTab === 'sms' }]"
            @click="activeTab = 'sms'"
          >
            短信验证码
          </button>
        </div>

        <van-form v-if="activeTab === 'password'" class="login-form" @submit="handlePasswordLogin">
          <van-field
            v-model.trim="passwordForm.phone"
            name="phone"
            label="手机号"
            type="tel"
            maxlength="11"
            placeholder="请输入手机号"
            clearable
            autocomplete="tel"
          />
          <van-field
            v-model.trim="passwordForm.password"
            name="password"
            label="密码"
            type="password"
            placeholder="请输入密码"
            clearable
            autocomplete="current-password"
          />
          <van-button
            class="login-form__submit"
            type="primary"
            block
            native-type="submit"
            :loading="submitting"
            :disabled="submitting"
          >
            登录
          </van-button>
        </van-form>

        <van-form v-else class="login-form" @submit="handleSmsLogin">
          <van-field
            v-model.trim="smsForm.mobile"
            name="mobile"
            label="手机号"
            type="tel"
            maxlength="11"
            placeholder="请输入手机号"
            clearable
            autocomplete="tel"
          />
          <van-field
            v-model.trim="smsForm.code"
            name="code"
            label="验证码"
            type="digit"
            maxlength="6"
            placeholder="请输入验证码"
            clearable
            autocomplete="one-time-code"
          >
            <template #button>
              <button
                class="code-button"
                type="button"
                :disabled="isCodeCounting || submitting"
                @click="sendCode('LOGIN')"
              >
                {{ codeButtonText }}
              </button>
            </template>
          </van-field>
          <van-button
            class="login-form__submit"
            type="primary"
            block
            native-type="submit"
            :loading="submitting"
            :disabled="submitting"
          >
            登录
          </van-button>
        </van-form>

        <p class="login-panel__hint">登录即表示同意活动服务规则。</p>
        <p class="login-panel__action">
          新用户？
          <button type="button" @click="switchAuthMode('register')">立即注册</button>
        </p>
      </section>

      <section v-else class="login-panel" aria-label="注册表单">
        <button class="back-button" type="button" @click="switchAuthMode('login')">返回登录</button>

        <van-form class="login-form register-form" @submit="handleRegister">
          <van-field
            v-model.trim="registerForm.mobile"
            name="registerMobile"
            label="手机号"
            type="tel"
            maxlength="11"
            placeholder="请输入手机号"
            clearable
            autocomplete="tel"
          />
          <van-field
            v-model.trim="registerForm.code"
            name="registerCode"
            label="验证码"
            type="digit"
            maxlength="6"
            placeholder="请输入验证码"
            clearable
            autocomplete="one-time-code"
          >
            <template #button>
              <button
                class="code-button"
                type="button"
                :disabled="isCodeCounting || submitting"
                @click="sendCode('REGISTER')"
              >
                {{ codeButtonText }}
              </button>
            </template>
          </van-field>
          <van-field
            v-model.trim="registerForm.password"
            name="registerPassword"
            label="密码"
            type="password"
            placeholder="至少 6 位密码"
            clearable
            autocomplete="new-password"
          />
          <van-field
            v-model.trim="registerForm.confirmPassword"
            name="confirmPassword"
            label="确认"
            type="password"
            placeholder="请再次输入密码"
            clearable
            autocomplete="new-password"
          />
          <van-button
            class="login-form__submit"
            type="primary"
            block
            native-type="submit"
            :loading="submitting"
            :disabled="submitting"
          >
            创建账号
          </van-button>
        </van-form>

        <p class="login-panel__action">
          已有账号？
          <button type="button" @click="switchAuthMode('login')">返回登录</button>
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { sendSms, verifySms } from '@/api/user'
import { useUserStore } from '@/stores/user'
import type { SmsPurpose } from '@/types/user'

type LoginTab = 'password' | 'sms'
type AuthMode = 'login' | 'register'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const authMode = ref<AuthMode>('login')
const activeTab = ref<LoginTab>('password')
const submitting = ref(false)
const countdown = ref(0)
let countdownTimer: number | undefined

/** 登录成功后跳转的目标路径 */
const redirect = (route.query.redirect as string) || '/'

const pageTitle = computed(() => (authMode.value === 'login' ? '登录活动中心' : '创建账号'))
const pageDesc = computed(() =>
  authMode.value === 'login'
    ? '使用账号或手机验证码进入你的活动空间。'
    : '填写手机号，开启你的活动体验。',
)

const passwordForm = reactive({
  phone: '',
  password: '',
})

const smsForm = reactive({
  mobile: '',
  code: '',
})

const registerForm = reactive({
  mobile: '',
  code: '',
  password: '',
  confirmPassword: '',
})

const isCodeCounting = computed(() => countdown.value > 0)
const codeButtonText = computed(() => (countdown.value > 0 ? `${countdown.value}s` : '获取验证码'))

const isValidMobile = (mobile: string) => /^1[3-9]\d{9}$/.test(mobile)

/** 根据当前模式获取发送验证码的手机号 */
const getSmsMobile = (purpose: SmsPurpose): string => {
  if (purpose === 'REGISTER') return registerForm.mobile
  return smsForm.mobile
}

const resetCountdown = () => {
  countdown.value = 0
  window.clearInterval(countdownTimer)
  countdownTimer = undefined
}

const switchAuthMode = (mode: AuthMode) => {
  authMode.value = mode
  resetCountdown()
}

// ─── 发送验证码 ──────────────────────────────────────

const sendCode = async (purpose: SmsPurpose) => {
  const mobile = getSmsMobile(purpose)
  if (!isValidMobile(mobile)) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    await sendSms({ phone_number: mobile, purpose })
    showToast('验证码已发送')

    // 开启倒计时
    countdown.value = 60
    window.clearInterval(countdownTimer)
    countdownTimer = window.setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        window.clearInterval(countdownTimer)
        countdownTimer = undefined
      }
    }, 1000)
  } catch {
    // 错误已由 http 拦截器统一 toast 提示
  }
}

// ─── 密码登录 ────────────────────────────────────────

const handlePasswordLogin = async () => {
  if (!passwordForm.phone) {
    showToast('请输入手机号')
    return
  }

  if (!isValidMobile(passwordForm.phone)) {
    showToast('请输入正确的手机号')
    return
  }

  if (!passwordForm.password) {
    showToast('请输入密码')
    return
  }

  if (passwordForm.password.length < 6) {
    showToast('密码至少 6 位')
    return
  }

  submitting.value = true
  try {
    await userStore.loginWithPassword({
      phone_number: passwordForm.phone,
      password: passwordForm.password,
    })
    router.replace(redirect)
  } catch {
    // 错误已由 http 拦截器统一 toast 提示
  } finally {
    submitting.value = false
  }
}

// ─── 短信登录 ────────────────────────────────────────

const handleSmsLogin = async () => {
  if (!isValidMobile(smsForm.mobile)) {
    showToast('请输入正确的手机号')
    return
  }

  if (!/^\d{4}$/.test(smsForm.code)) {
    showToast('请输入 4 位验证码')
    return
  }

  submitting.value = true
  try {
    // 1. 校验短信验证码
    const verifyRes = await verifySms({
      phone_number: smsForm.mobile,
      code: smsForm.code,
      purpose: 'LOGIN',
    })
    // 2. 短信登录
    await userStore.loginWithSms({
      phone_number: smsForm.mobile,
      verify_token: verifyRes.data.verify_token,
    })
    router.replace(redirect)
  } catch {
    // 错误已由 http 拦截器统一 toast 提示
  } finally {
    submitting.value = false
  }
}

// ─── 注册 ────────────────────────────────────────────

const handleRegister = async () => {
  if (!isValidMobile(registerForm.mobile)) {
    showToast('请输入正确的手机号')
    return
  }

  if (!/^\d{4}$/.test(registerForm.code)) {
    showToast('请输入 4 位验证码')
    return
  }

  if (!registerForm.password) {
    showToast('请设置密码')
    return
  }

  if (registerForm.password.length < 6) {
    showToast('密码至少 6 位')
    return
  }

  if (registerForm.confirmPassword !== registerForm.password) {
    showToast('两次输入的密码不一致')
    return
  }

  submitting.value = true
  try {
    // 1. 校验短信验证码
    const verifyRes = await verifySms({
      phone_number: registerForm.mobile,
      code: registerForm.code,
      purpose: 'REGISTER',
    })
    // 2. 注册
    await userStore.registerAccount({
      phone_number: registerForm.mobile,
      password: registerForm.password,
      verify_token: verifyRes.data.verify_token,
    })

    // 注册成功后回填登录表单并切换到登录页
    passwordForm.phone = registerForm.mobile
    passwordForm.password = registerForm.password
    registerForm.code = ''
    registerForm.confirmPassword = ''
    activeTab.value = 'password'
    switchAuthMode('login')
  } catch {
    // 错误已由 http 拦截器统一 toast 提示
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  window.clearInterval(countdownTimer)
})
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  padding: 20px 18px max(28px, env(safe-area-inset-bottom));
  background: #f5f5f3;
}

.login-shell {
  display: flex;
  min-height: calc(100vh - 48px);
  flex-direction: column;
  justify-content: center;
}

.login-header {
  margin-bottom: 30px;
  color: #111111;
}

.login-header__mark {
  display: grid;
  width: 44px;
  height: 44px;
  margin-bottom: 26px;
  place-items: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  background: #111111;
  border-radius: 8px;
}

.login-header p {
  margin: 0 0 8px;
  color: #77736b;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.login-header h1 {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.16;
  letter-spacing: 0;
}

.login-header > span:last-child {
  display: block;
  max-width: 280px;
  margin-top: 12px;
  color: #77736b;
  font-size: 15px;
  line-height: 1.7;
}

.login-panel {
  padding: 8px 0 0;
  background: transparent;
}

.login-switch {
  display: grid;
  padding: 4px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  background: #e8e5df;
  border-radius: 8px;
}

.login-switch__item {
  height: 42px;
  color: #77736b;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: 0;
  border-radius: 6px;
}

.back-button {
  height: 34px;
  padding: 0;
  color: #77736b;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: 0;
}

.login-switch__item--active {
  color: #111111;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(20, 20, 20, 0.08);
}

.login-form {
  margin-top: 22px;
}

.register-form {
  margin-top: 16px;
}

.login-form :deep(.van-cell) {
  min-height: 58px;
  margin-top: 12px;
  padding: 0 16px;
  align-items: center;
  background: #ffffff;
  border: 1px solid #ece9e3;
  border-radius: 8px;
}

.login-form :deep(.van-cell::after) {
  display: none;
}

.login-form :deep(.van-field__label) {
  width: 62px;
  color: #4f4a43;
  font-size: 14px;
  font-weight: 700;
}

.login-form :deep(.van-field__control) {
  color: #111111;
  font-size: 15px;
}

.login-form :deep(.van-field__control::placeholder) {
  color: #bbb5aa;
}

.code-button {
  min-width: 82px;
  height: 32px;
  padding: 0 10px;
  color: #111111;
  font-size: 13px;
  font-weight: 700;
  background: #f3f1ec;
  border: 0;
  border-radius: 6px;
}

.code-button:disabled {
  color: #a59f94;
}

.login-form__submit {
  height: 52px;
  margin-top: 24px;
  font-size: 16px;
  font-weight: 800;
  background: #111111;
  border: 0;
  border-radius: 8px;
  box-shadow: 0 14px 24px rgba(17, 17, 17, 0.18);
}

.login-panel__hint {
  margin: 18px 4px 0;
  color: #9b9488;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

.login-panel__action {
  margin: 18px 0 0;
  color: #77736b;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;

  button {
    padding: 0;
    color: #111111;
    font: inherit;
    font-weight: 800;
    background: transparent;
    border: 0;
  }
}

@media (min-width: 480px) {
  .login-shell {
    max-width: 420px;
    margin: 0 auto;
  }
}
</style>
