<template>
  <main class="detail-page" v-if="event">
    <header class="detail-nav">
      <button type="button" class="icon-button" @click="goBack" aria-label="返回">
        <van-icon name="arrow-left" />
      </button>
      <strong>活动详情</strong>
      <div></div>
    </header>

    <section class="cover-section">
      <img :src="event.cover_image_url" :alt="event.title" />
    </section>

    <section class="title-section">
      <div class="title-row">
        <span class="status">{{ event.status }}</span>
      </div>
      <h1>{{ event.title }}</h1>
    </section>

    <!-- 自定义 Tab 栏（仅活动有详情介绍时显示） -->
    <nav v-if="event.detail" class="detail-tab-bar">
      <button
        :class="{ active: detailTab === 0 }"
        @click="detailTab = 0"
      >活动信息</button>
      <button
        :class="{ active: detailTab === 1 }"
        @click="detailTab = 1"
      >活动详情</button>
    </nav>

    <!-- 活动信息 -->
    <template v-if="detailTab === 0 || !event.detail">
      <section class="info-panel" aria-label="活动信息">
        <div class="info-item">
          <van-icon name="calendar-o" />
          <div>
            <span>活动时间</span>
            <strong>{{ formatDateTime(event.event_start_time) }} - {{ formatDateTime(event.event_end_time) }}</strong>
          </div>
        </div>
        <div class="info-item">
          <van-icon name="location-o" />
          <div>
            <span>活动地点</span>
            <strong>{{ event.event_address }}</strong>
          </div>
        </div>
        <div class="info-item">
          <van-icon name="friends-o" />
          <div>
            <span>报名人数</span>
            <strong v-if="isUnlimited">{{ event.current_registrants }} 人（不限人数）</strong>
            <strong v-else>{{ event.current_registrants }}/{{ event.max_registrants }} 人（剩余 {{ remainSeats }}）</strong>
          </div>
        </div>
        <div class="info-item">
          <van-icon name="clock-o" />
          <div>
            <span>报名时间</span>
            <strong>{{ formatDateTime(event.registration_start_time) }} - {{ formatDateTime(event.registration_end_time) }}</strong>
          </div>
        </div>
      </section>

      <section v-if="event.fields.length > 0" class="content-block">
        <h2>活动领域</h2>
        <div class="tag-list">
          <span v-for="field in event.fields" :key="field.field_id">{{ field.field_name }}</span>
        </div>
      </section>

      <section v-if="event.images.length > 0" class="content-block">
        <h2>活动图片</h2>
        <div class="image-gallery">
          <img
            v-for="img in event.images"
            :key="img.image_id"
            :src="img.url"
            alt="活动图片"
          />
        </div>
      </section>
    </template>

    <!-- 活动详情（富文本） -->
    <template v-if="event.detail && detailTab === 1">
      <section class="content-block">
        <div class="rich-content" v-html="event.detail"></div>
      </section>
    </template>

    <footer class="bottom-bar">
      <div>
        <span>活动名额</span>
        <strong v-if="isUnlimited">不限</strong>
        <strong v-else>{{ event.current_registrants }}/{{ event.max_registrants }}</strong>
      </div>
      <button type="button" :disabled="actionDisabled" @click="openRegisterForm">
        {{ actionText }}
      </button>
    </footer>

    <teleport to="body">
      <div v-if="formVisible" class="register-layer" role="dialog" aria-modal="true">
        <button class="layer-mask" type="button" aria-label="关闭报名表" @click="closeRegisterForm"></button>
        <section class="register-sheet">
          <header class="sheet-header">
            <div>
              <h2>填写报名信息</h2>
              <p>{{ event.title }}</p>
            </div>
            <button type="button" class="sheet-close" aria-label="关闭" @click="closeRegisterForm">
              <van-icon name="cross" />
            </button>
          </header>

          <form class="register-form" @submit.prevent="submitRegister">
            <!-- 用户提示 -->
            <div class="sync-notice" v-if="event.user_info && event.user_info.length > 0">
              <van-icon name="info-o" size="14" />
              <span>填写的信息将在报名成功后自动同步至您的个人资料</span>
            </div>

            <!-- 全部字段由 user_info 动态渲染 -->
            <template v-if="event.user_info && event.user_info.length > 0">
              <template v-for="field in event.user_info" :key="field.user_info_id">
                <!-- 手机号：只读 -->
                <div v-if="isPhoneField(field.code)" class="readonly-field">
                  <span>{{ field.name }}</span>
                  <strong>{{ userMobile }}</strong>
                </div>

                <!-- 行业：选择器 -->
                <div v-else-if="isIndustryField(field.code)" class="choice-field">
                  <span>{{ field.name }}</span>
                  <button
                    type="button"
                    class="selector-button"
                    :disabled="industryList.length === 0"
                    @click="showIndustryPicker = true"
                  >
                    <span :class="{ placeholder: !selectedIndustryName }">
                      {{ selectedIndustryName || `请选择${field.name}` }}
                    </span>
                    <van-icon name="arrow" size="14" />
                  </button>
                </div>

                <!-- 其余：文本输入框 -->
                <label v-else>
                  <span>{{ field.name }}</span>
                  <input
                    v-model.trim="dynamicFields[field.code]"
                    type="text"
                    :placeholder="`请输入${field.name}`"
                  />
                  <p v-if="field.code === 'name' && !dynamicFields['name']" class="field-hint">
                    填写后将在报名成功时自动同步至个人资料，后续报名无需重复填写
                  </p>
                </label>
              </template>
            </template>

            <label v-if="event?.need_invite_code === 1">
              <span>邀请码</span>
              <input v-model.trim="registerForm.invite_code" type="text" placeholder="请输入邀请码" />
            </label>
            <p v-if="formError" class="form-error">{{ formError }}</p>
            <button class="submit-button" type="submit" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交报名' }}
            </button>
          </form>
        </section>

        <!-- 行业选择器 Popup -->
        <van-popup
          v-model:show="showIndustryPicker"
          position="bottom"
          round
          :close-on-click-overlay="true"
          :style="{ borderRadius: '20px 20px 0 0' }"
        >
          <div class="industry-picker">
            <header class="industry-picker__header">
              <div>
                <h3>选择行业</h3>
                <p>选择你所在的行业领域</p>
              </div>
              <button type="button" class="industry-picker__close" @click="showIndustryPicker = false">
                <van-icon name="cross" size="18" />
              </button>
            </header>

            <div class="industry-picker__grid">
              <button
                v-for="item in industryList"
                :key="item.id"
                type="button"
                class="industry-chip"
                :class="{ 'industry-chip--active': selectedIndustryId === item.id }"
                @click="selectedIndustryId = item.id; showIndustryPicker = false"
              >
                <span>{{ item.industry_name }}</span>
                <van-icon v-if="selectedIndustryId === item.id" name="success" size="14" />
              </button>
            </div>

            <div class="industry-picker__footer">
              <button type="button" class="industry-clear-btn" @click="selectedIndustryId = null; showIndustryPicker = false">
                清除选择
              </button>
            </div>
          </div>
        </van-popup>
      </div>
    </teleport>
  </main>

  <main class="detail-page detail-page--empty" v-else-if="!loading">
    <button type="button" class="icon-button" @click="goBack" aria-label="返回">
      <van-icon name="arrow-left" />
    </button>
    <div class="empty-state">
      <van-icon name="notes-o" size="46" />
      <p>活动不存在</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { getEventDetail, getRegistrationStatus } from '@/api/event'
import { getIndustries } from '@/api/industry'
import { updateUser } from '@/api/user'
import { useActivityStore } from '@/stores/activity'
import { useUserStore } from '@/stores/user'
import type { EventDetail } from '@/types/event'
import type { IndustryItem } from '@/types/industry'
import type { UpdateUserParams } from '@/types/user'

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()
const userStore = useUserStore()

const event = ref<EventDetail | null>(null)
const isRegistered = ref(false)
const registrationChecked = ref(false)
const loading = ref(false)
const formVisible = ref(false)
const formError = ref('')
const submitting = ref(false)

// ── Tab 切换（活动信息 / 活动详情）──

const detailTab = ref(0)

const eventId = computed(() => Number(route.params.id))

const registerForm = reactive({
  invite_code: '',
})

// ── 动态文本字段（key = user_info.code，value = 用户输入）──
const dynamicFields = reactive<Record<string, string>>({})

// ── 行业选择器 ──
const industryList = ref<IndustryItem[]>([])
const showIndustryPicker = ref(false)
const selectedIndustryId = ref<number | null>(null)

const selectedIndustryName = computed(() => {
  if (selectedIndustryId.value === null) return ''
  return industryList.value.find((i) => i.id === selectedIndustryId.value)?.industry_name || ''
})

// ── user_info.code 即为用户资料对象的字段名，直接从 Pinia 取值 ──

/** 从用户资料中获取 code 对应的预填值 */
const getProfileValue = (code: string): string => {
  const p = userStore.profile as Record<string, unknown> | null
  if (!p) return ''
  const val = p[code]
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  return ''
}

/** 判断是否为手机号字段（只读展示） */
const isPhoneField = (code: string) =>
  ['phone_number', 'phone', 'mobile'].includes(code)

/** 判断是否为行业字段（选择器） */
const isIndustryField = (code: string) =>
  ['Industry', 'industry', 'industry_id'].includes(code)

const goBack = () => router.back()

// ── Helpers ──

const formatDateTime = (iso: string) => {
  const d = dayjs(iso)
  return d.format('YYYY.MM.DD HH:mm')
}

const formatDate = (iso: string) => {
  const d = dayjs(iso)
  return d.format('MM.DD')
}

const getWeekday = (iso: string) => {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayjs(iso).day()]
}

const userMobile = computed(() => userStore.profile?.phone_number || '未绑定手机号')

const remainSeats = computed(() => {
  if (!event.value) return 0
  if (event.value.remaining_quota === -1) return Infinity
  return Math.max(0, event.value.max_registrants - event.value.current_registrants)
})

/** 是否不限制报名人数 */
const isUnlimited = computed(() => event.value?.remaining_quota === -1)

const actionText = computed(() => {
  if (!event.value) return '立即报名'
  if (event.value.status.includes('结束')) return '已结束'
  if (isRegistered.value) return '已报名'
  if (!isUnlimited.value && event.value.remaining_quota <= 0) return '名额已满'
  return '立即报名'
})

const actionDisabled = computed(() => {
  if (!event.value) return true
  return event.value.status.includes('结束') || isRegistered.value || (!isUnlimited.value && event.value.remaining_quota <= 0)
})

// ── Fetch ──

const fetchDetail = async () => {
  loading.value = true
  try {
    const [detailRes, statusRes] = await Promise.all([
      getEventDetail(eventId.value),
      getRegistrationStatus(eventId.value).catch(() => null),
    ])
    event.value = detailRes.data
    if (statusRes) {
      isRegistered.value = statusRes.data.is_registered === 'Y'
    }
    registrationChecked.value = true
  } catch {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 并行加载：活动详情、用户资料、行业列表
  await Promise.all([
    fetchDetail(),
    userStore.profile ? Promise.resolve() : userStore.fetchProfile().catch(() => {}),
    getIndustries(1)
      .then((res) => {
        industryList.value = res.data || []
      })
      .catch(() => {
        // 静默失败，行业选择器将显示为空
      }),
  ])
})

// ── Registration ──

const openRegisterForm = async () => {
  if (actionDisabled.value) return
  formError.value = ''
  registerForm.invite_code = ''

  // 清空动态字段并预填用户资料
  Object.keys(dynamicFields).forEach((k) => delete dynamicFields[k])
  selectedIndustryId.value = null

  // 确保用户资料已加载（首次点击报名时兜底）
  if (!userStore.profile) {
    await userStore.fetchProfile().catch(() => {})
  }

  if (event.value?.user_info) {
    for (const field of event.value.user_info) {
      if (isPhoneField(field.code)) continue // 只读，无需预填
      if (isIndustryField(field.code)) {
        selectedIndustryId.value = userStore.profile?.industry_id ?? null
      } else {
        // 文本字段：从已有资料预填
        dynamicFields[field.code] = getProfileValue(field.code)
      }
    }
  }

  formVisible.value = true
}

const closeRegisterForm = () => {
  formVisible.value = false
}

const submitRegister = async () => {
  // ── 校验所有 user_info 字段是否已填写 ──
  if (event.value?.user_info) {
    for (const field of event.value.user_info) {
      const code = field.code
      if (isPhoneField(code)) continue // 只读，无需校验

      if (isIndustryField(code)) {
        if (selectedIndustryId.value === null) {
          formError.value = `请选择${field.name}`
          return
        }
      } else {
        const val = (dynamicFields[code] || '').trim()
        if (!val) {
          formError.value = `请填写${field.name}`
          return
        }
      }
    }
  }

  if (event.value?.need_invite_code === 1 && !registerForm.invite_code) {
    formError.value = '请输入邀请码'
    return
  }

  submitting.value = true
  formError.value = ''
  try {
    // 1. 先构建报名请求体（对比同步前的旧 profile，捕获所有变化）
    const registrationParams: Record<string, unknown> = {}

    if (event.value?.need_invite_code === 1) {
      registrationParams.invite_code = registerForm.invite_code
    }

    if (event.value?.user_info) {
      for (const field of event.value.user_info) {
        const code = field.code
        if (isPhoneField(code)) continue

        if (isIndustryField(code)) {
          const newVal = selectedIndustryId.value
          const oldVal = userStore.profile?.industry_id ?? null
          if (newVal !== oldVal) {
            registrationParams.industry_id = String(newVal)
          }
        } else {
          const newVal = (dynamicFields[code] || '').trim()
          const oldVal = getProfileValue(code)
          if (newVal !== oldVal) {
            registrationParams[code] = newVal
          }
        }
      }
    }

    // 2. 再同步个人资料（这步会刷新 profile，但不影响已构建好的请求体）
    await syncProfile()

    // 3. 调用报名接口
    await activityStore.joinEvent(eventId.value, registrationParams)
    isRegistered.value = true
    // 立即更新本地已报名人数，无需等待接口刷新
    if (event.value) {
      event.value.current_registrants += 1
      if (event.value.remaining_quota !== -1) {
        event.value.remaining_quota -= 1
      }
    }
    formVisible.value = false
  } catch {
    // 错误已由拦截器处理
  } finally {
    submitting.value = false
  }
}

/** 将表单中修改的信息同步到用户个人资料 */
const syncProfile = async () => {
  const p = userStore.profile
  if (!p || !event.value?.user_info?.length) return

  const payload: Record<string, unknown> = {}

  for (const field of event.value.user_info) {
    const code = field.code
    // 手机号只读，不参与同步
    if (isPhoneField(code)) continue

    if (isIndustryField(code)) {
      const newVal = selectedIndustryId.value ?? undefined
      if (newVal !== (p.industry_id || undefined)) {
        payload.industry_id = newVal
      }
    } else {
      const newVal = (dynamicFields[code] || '').trim()
      const oldVal = getProfileValue(code)
      if (newVal !== oldVal) {
        payload[code] = newVal
      }
    }
  }

  if (Object.keys(payload).length === 0) return

  try {
    await updateUser(payload as UpdateUserParams)
    // 刷新 store 中的用户资料
    await userStore.fetchProfile()
  } catch {
    // 同步失败不影响报名结果，静默处理
    console.warn('个人信息同步失败', payload)
  }
}
</script>

<style scoped lang="scss">
.detail-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 16px 96px;
  color: #101936;
  background: #f7f8fa;
}

.detail-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  height: 58px;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  gap: 10px;
  align-items: center;
  background: rgba(247, 248, 250, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  strong {
    color: #111827;
    font-size: 16px;
    font-weight: 800;
    line-height: 1;
    text-align: center;
  }
}

.icon-button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #111827;
  font-size: 20px;
  background: #ffffff;
  border: 1px solid #e6eaf0;
  border-radius: 10px;

  &.active {
    color: #f59e0b;
  }
}

.cover-section {
  height: 218px;
  overflow: hidden;
  background: #eef1f4;
  border-radius: 16px;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

.title-section,
.info-panel,
.content-block,
.price-panel {
  margin-top: 12px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #eceff3;
  border-radius: 14px;
}

.title-row {
  display: flex;
  gap: 7px;
  margin-bottom: 10px;
}

.status,
.category {
  display: inline-flex;
  height: 24px;
  padding: 0 8px;
  align-items: center;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  background: #eff6ff;
  border-radius: 7px;
}

.status {
  color: #047857;
  background: #ecfdf5;

  &--soon {
    color: #2563eb;
    background: #eff6ff;
  }

  &--finished {
    color: #6b7280;
    background: #f3f4f6;
  }
}

.title-section {
  h1 {
    margin: 0;
    color: #111827;
    font-size: 24px;
    font-weight: 900;
    line-height: 1.28;
    letter-spacing: 0;
  }

  p {
    margin: 10px 0 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }
}

.info-panel {
  display: grid;
  gap: 14px;
}

.info-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
  align-items: start;

  > .van-icon {
    margin-top: 2px;
    color: #6b7280;
    font-size: 20px;
  }

  div {
    min-width: 0;
  }

  span {
    display: block;
    color: #9ca3af;
    font-size: 12px;
    line-height: 1;
  }

  strong {
    display: block;
    margin-top: 6px;
    overflow: hidden;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ── 自定义 Tab 栏 ──

.detail-tab-bar {
  position: sticky;
  top: 58px;
  z-index: 15;
  display: flex;
  margin: 12px 0 0;
  background: rgba(247, 248, 250, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  button {
    flex: 1;
    padding: 12px 0 10px;
    color: #9ca3af;
    font-size: 14px;
    font-weight: 600;
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;

    &.active {
      color: #111827;
      font-weight: 700;
      border-bottom-color: #111827;
    }
  }
}

.content-block {
  h2 {
    margin: 0 0 10px;
    color: #111827;
    font-size: 16px;
    font-weight: 900;
    line-height: 1.2;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.7;

    + p {
      margin-top: 8px;
    }
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    padding: 7px 10px;
    color: #374151;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    background: #f3f4f6;
    border-radius: 8px;
  }
}

.price-panel {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  div {
    display: grid;
    gap: 7px;
  }

  span {
    color: #9ca3af;
    font-size: 12px;
    line-height: 1;
  }

  strong {
    color: #111827;
    font-size: 18px;
    font-weight: 900;
    line-height: 1;
  }
}

.free {
  color: #047857 !important;
}

.bottom-bar {
  position: fixed;
  right: 50%;
  bottom: 0;
  z-index: 30;
  display: grid;
  width: 100%;
  max-width: 430px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 12px;
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #eceff3;
  transform: translateX(50%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  span {
    display: block;
    color: #9ca3af;
    font-size: 12px;
    line-height: 1;
  }

  strong {
    display: block;
    margin-top: 6px;
    color: #111827;
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
  }

  button {
    height: 44px;
    color: #ffffff;
    font-size: 15px;
    font-weight: 900;
    background: #111827;
    border: 0;
    border-radius: 12px;

    &:disabled {
      color: #9ca3af;
      background: #e5e7eb;
    }
  }
}

.register-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.layer-mask {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(17, 24, 39, 0.34);
  border: 0;
}

.register-sheet {
  position: absolute;
  right: 50%;
  bottom: 0;
  width: 100%;
  max-width: 430px;
  padding: 18px 16px calc(16px + env(safe-area-inset-bottom));
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -18px 40px rgba(17, 24, 39, 0.16);
  transform: translateX(50%);
}

.sheet-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px;
  gap: 12px;
  align-items: start;

  h2 {
    margin: 0;
    color: #111827;
    font-size: 20px;
    font-weight: 900;
    line-height: 1.2;
  }

  p {
    margin: 7px 0 0;
    overflow: hidden;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.sheet-close {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  color: #6b7280;
  font-size: 18px;
  background: #f3f4f6;
  border: 0;
  border-radius: 10px;
}

.register-form {
  display: grid;
  gap: 12px;
  margin-top: 18px;

  label {
    display: grid;
    gap: 7px;
  }

  span {
    color: #374151;
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
  }

  input,
  textarea {
    width: 100%;
    min-width: 0;
    padding: 12px;
    color: #111827;
    font: inherit;
    font-size: 14px;
    line-height: 1.35;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    outline: none;

    &:focus {
      background: #ffffff;
      border-color: #111827;
    }
  }

}

.readonly-field,
.choice-field {
  display: grid;
  gap: 8px;

  > span {
    color: #374151;
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
  }
}

.readonly-field strong {
  display: flex;
  min-height: 44px;
  padding: 0 12px;
  align-items: center;
  color: #6b7280;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.choice-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    height: 34px;
    padding: 0 12px;
    color: #4b5563;
    font-size: 13px;
    font-weight: 800;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 999px;

    &.selected {
      color: #ffffff;
      background: #111827;
      border-color: #111827;
    }
  }
}

.field-hint {
  margin: 4px 0 0;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.4;
}

.form-error {
  margin: -2px 0 0;
  color: #dc2626;
  font-size: 12px;
  line-height: 1.2;
}

.submit-button {
  height: 46px;
  margin-top: 2px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  background: #111827;
  border: 0;
  border-radius: 12px;

  &:disabled {
    color: #9ca3af;
    background: #e5e7eb;
  }
}

.rich-content {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
  }

  :deep(p) {
    margin: 0 0 8px;
  }
}

.image-gallery {
  display: grid;
  gap: 8px;

  img {
    width: 100%;
    border-radius: 10px;
    display: block;
  }
}

.detail-page--empty {
  padding-top: 16px;
}

.empty-state {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c3cad3;

  p {
    margin: 12px 0 0;
    color: #6b7280;
    font-size: 14px;
    font-weight: 800;
  }
}

// ── 同步提示 ──

.sync-notice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
  background: #f0f7ff;
  border-radius: 10px;

  .van-icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: #3b82f6;
  }
}

// ── 选择器按钮 ──

.selector-button {
  display: flex;
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: border-color 0.15s ease;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #111827;

    &.placeholder {
      color: #9ca3af;
    }
  }

  .van-icon {
    flex-shrink: 0;
    color: #9ca3af;
  }

  &:disabled {
    opacity: 0.5;
  }
}

// ── 行业选择器 Popup ──

.industry-picker {
  padding: 0 0 max(16px, env(safe-area-inset-bottom));
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.industry-picker__header {
  display: flex;
  padding: 20px 20px 16px;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0 0 4px;
    color: #111827;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: #9ca3af;
    font-size: 13px;
    font-weight: 500;
  }
}

.industry-picker__close {
  display: grid;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  place-items: center;
  color: #6b7280;
  background: #f3f4f6;
  border: 0;
  border-radius: 50%;
  transition: background 0.15s;

  &:active {
    background: #e5e7eb;
  }
}

.industry-picker__grid {
  flex: 1;
  overflow-y: auto;
  padding: 4px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content: flex-start;
}

.industry-chip {
  display: inline-flex;
  height: 40px;
  padding: 0 16px;
  align-items: center;
  gap: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  background: #f3f4f6;
  border: 1.5px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:active {
    transform: scale(0.96);
  }

  &--active {
    color: #ffffff;
    background: #ef4444;
    border-color: #ef4444;
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.25);

    .van-icon {
      opacity: 1;
    }
  }

  .van-icon {
    opacity: 0.7;
    flex-shrink: 0;
  }
}

.industry-picker__footer {
  padding: 16px 20px 0;
}

.industry-clear-btn {
  display: block;
  width: 100%;
  padding: 12px;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  border: 0;
  cursor: pointer;

  &:active {
    color: #ef4444;
  }
}
</style>
