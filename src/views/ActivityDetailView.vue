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
          <strong>{{ event.current_registrants }}/{{ event.max_registrants }} 人（剩余 {{ remainSeats }}）</strong>
        </div>
      </div>
      <div class="info-item">
        <van-icon name="clock-o" />
        <div>
          <span>报名时间</span>
          <strong>{{ formatDate(event.registration_start_time) }} - {{ formatDate(event.registration_end_time) }}</strong>
        </div>
      </div>
    </section>

    <section v-if="event.detail" class="content-block">
      <h2>活动介绍</h2>
      <div class="rich-content" v-html="event.detail"></div>
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

    <footer class="bottom-bar">
      <div>
        <span>活动名额</span>
        <strong>{{ event.current_registrants }}/{{ event.max_registrants }}</strong>
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
            <label>
              <span>姓名</span>
              <input v-model.trim="registerForm.name" type="text" placeholder="请输入姓名" />
            </label>
            <div class="readonly-field">
              <span>手机号</span>
              <strong>{{ userMobile }}</strong>
            </div>
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
import { useActivityStore } from '@/stores/activity'
import { useUserStore } from '@/stores/user'
import type { EventDetail } from '@/types/event'

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

const eventId = computed(() => Number(route.params.id))

const registerForm = reactive({
  name: '',
  invite_code: '',
})

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
  return Math.max(0, event.value.max_registrants - event.value.current_registrants)
})

const actionText = computed(() => {
  if (!event.value) return '立即报名'
  if (event.value.status.includes('结束')) return '已结束'
  if (isRegistered.value) return '已报名'
  if (event.value.remaining_quota <= 0) return '名额已满'
  return '立即报名'
})

const actionDisabled = computed(() => {
  if (!event.value) return true
  return event.value.status.includes('结束') || isRegistered.value || event.value.remaining_quota <= 0
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

onMounted(() => {
  fetchDetail()
})

// ── Registration ──

const openRegisterForm = () => {
  if (actionDisabled.value) return
  formError.value = ''
  registerForm.name = userStore.profile?.name || userStore.profile?.nickname || ''
  registerForm.invite_code = ''
  formVisible.value = true
}

const closeRegisterForm = () => {
  formVisible.value = false
}

const submitRegister = async () => {
  if (!registerForm.name) {
    formError.value = '请填写姓名'
    return
  }

  if (event.value?.need_invite_code === 1 && !registerForm.invite_code) {
    formError.value = '请输入邀请码'
    return
  }

  submitting.value = true
  formError.value = ''
  try {
    await activityStore.joinEvent(
      eventId.value,
      event.value?.need_invite_code === 1 ? registerForm.invite_code : undefined,
    )
    isRegistered.value = true
    formVisible.value = false
  } catch {
    // 错误已由拦截器处理
  } finally {
    submitting.value = false
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
</style>
