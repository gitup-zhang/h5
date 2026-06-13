<template>
  <main class="settings-page">
    <!-- ── 顶部导航 ── -->
    <header class="page-nav">
      <button type="button" class="back-button" @click="goBack" aria-label="返回">
        <van-icon name="arrow-left" />
      </button>
      <div>
        <h1>个人信息</h1>
        <p>{{ isEditing ? '编辑后记得保存' : '查看当前个人资料' }}</p>
      </div>
      <button type="button" class="edit-button" @click="toggleEdit">
        {{ isEditing ? '取消' : '编辑' }}
      </button>
    </header>

    <!-- ════════════════════════════════════════════ -->
    <!-- 查看模式 -->
    <!-- ════════════════════════════════════════════ -->
    <template v-if="!isEditing">
      <section class="profile-card">
        <div class="avatar-preview">{{ userStore.avatarText }}</div>
        <div class="profile-main">
          <div class="name-row">
            <h2>{{ displayName }}</h2>
            <span v-if="profile?.gender" class="gender-badge" :class="genderBadgeClass">
              {{ userStore.displayGender }}
            </span>
          </div>
          <p>{{ userStore.displayMobile }}</p>
          <span class="role-tag">{{ userStore.displayRole }}</span>
        </div>
      </section>

      <section class="settings-card">
        <h2>详细信息</h2>
        <div class="readonly-details">
          <div v-if="profile?.unit" class="readonly-row">
            <span class="readonly-row__label">单位</span>
            <span class="readonly-row__value">{{ profile.unit }}</span>
          </div>
          <div v-if="profile?.department" class="readonly-row">
            <span class="readonly-row__label">部门</span>
            <span class="readonly-row__value">{{ profile.department }}</span>
          </div>
          <div v-if="profile?.position" class="readonly-row">
            <span class="readonly-row__label">职位</span>
            <span class="readonly-row__value">{{ profile.position }}</span>
          </div>
          <div v-if="profile?.industry_name" class="readonly-row">
            <span class="readonly-row__label">行业</span>
            <span class="readonly-row__value">{{ profile.industry_name }}</span>
          </div>
          <div v-if="profile?.fields && profile.fields.length" class="readonly-row readonly-row--tags">
            <span class="readonly-row__label">领域</span>
            <div class="readonly-tags">
              <span v-for="f in profile.fields" :key="f.field_code">{{ f.field_name }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ════════════════════════════════════════════ -->
    <!-- 编辑模式 -->
    <!-- ════════════════════════════════════════════ -->
    <template v-else>
      <section class="settings-card">
        <h2>编辑资料</h2>
        <form class="settings-form" @submit.prevent="submitProfile">
          <!-- 手机号（只读） -->
          <div class="readonly-row">
            <span>手机号</span>
            <strong>{{ userStore.displayMobile }}</strong>
          </div>

          <!-- 姓名 -->
          <label>
            <span>姓名</span>
            <input
              v-model.trim="editForm.name"
              type="text"
              placeholder="请输入姓名"
              autocomplete="name"
            />
          </label>

          <!-- 性别 -->
          <label>
            <span>性别</span>
            <div class="gender-toggle">
              <button
                v-for="opt in genderOptions"
                :key="opt.value"
                type="button"
                class="gender-option"
                :class="{ selected: editForm.gender === opt.value }"
                @click="editForm.gender = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </label>

          <!-- 单位 -->
          <label>
            <span>单位</span>
            <input
              v-model.trim="editForm.unit"
              type="text"
              placeholder="请输入单位名称"
              autocomplete="organization"
            />
          </label>

          <!-- 部门 -->
          <label>
            <span>部门</span>
            <input
              v-model.trim="editForm.department"
              type="text"
              placeholder="请输入部门"
              autocomplete="organization-title"
            />
          </label>

          <!-- 职位 -->
          <label>
            <span>职位</span>
            <input
              v-model.trim="editForm.position"
              type="text"
              placeholder="请输入职位"
              autocomplete="organization-title"
            />
          </label>

          <!-- 行业（单选） -->
          <label>
            <span>行业</span>
            <button
              type="button"
              class="selector-button"
              :disabled="industryList.length === 0"
              @click="showIndustryPicker = true"
            >
              <span :class="{ placeholder: !selectedIndustryName }">
                {{ selectedIndustryName || '请选择行业' }}
              </span>
              <van-icon name="arrow" size="14" />
            </button>
          </label>

          <!-- 领域（多选） -->
          <label>
            <span>领域（可多选）</span>
            <button
              type="button"
              class="selector-button"
              :disabled="fieldList.length === 0"
              @click="showFieldPicker = true"
            >
              <span :class="{ placeholder: editForm.field_ids.length === 0 }">
                {{ selectedFieldsSummary || '请选择领域' }}
              </span>
              <van-icon name="arrow" size="14" />
            </button>
          </label>

          <!-- 已选领域标签 -->
          <div v-if="editForm.field_ids.length" class="selected-fields">
            <span
              v-for="fid in editForm.field_ids"
              :key="fid"
              class="field-chip"
              @click="toggleField(fid)"
            >
              {{ getFieldName(fid) }}
              <van-icon name="cross" size="10" />
            </span>
          </div>

          <p v-if="profileError" class="form-error">{{ profileError }}</p>
          <button type="submit" class="primary-button" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </form>
      </section>

      <!-- ── 修改密码 ── -->
      <section class="settings-card">
        <h2>修改密码</h2>
        <form class="settings-form" @submit.prevent="submitChangePassword">
          <label>
            <span>当前密码</span>
            <input
              v-model.trim="passwordForm.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              autocomplete="current-password"
            />
          </label>

          <label>
            <span>新密码</span>
            <input
              v-model.trim="passwordForm.newPassword"
              type="password"
              placeholder="至少 6 位"
              autocomplete="new-password"
            />
          </label>

          <label>
            <span>确认密码</span>
            <input
              v-model.trim="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              autocomplete="new-password"
            />
          </label>

          <p v-if="passwordError" class="form-error">{{ passwordError }}</p>
          <button type="submit" class="primary-button" :disabled="submitting">
            {{ submitting ? '保存中...' : '修改密码' }}
          </button>
        </form>
      </section>

      <!-- ── 修改手机号 ── -->
      <section class="settings-card">
        <h2>修改手机号</h2>
        <form class="settings-form" @submit.prevent="submitChangePhone">
          <label>
            <span>新手机号</span>
            <input
              v-model.trim="phoneForm.newPhone"
              type="tel"
              maxlength="11"
              placeholder="请输入新手机号"
              autocomplete="tel"
            />
          </label>

          <label>
            <span>验证码</span>
            <div class="code-row">
              <input
                v-model.trim="phoneForm.code"
                type="tel"
                inputmode="numeric"
                maxlength="4"
                placeholder="4位验证码"
                autocomplete="one-time-code"
              />
              <button type="button" :disabled="countdown > 0 || submitting" @click="sendPhoneCode">
                {{ codeButtonText }}
              </button>
            </div>
          </label>

          <p v-if="phoneError" class="form-error">{{ phoneError }}</p>
          <button type="submit" class="primary-button" :disabled="submitting">
            {{ submitting ? '保存中...' : '修改手机号' }}
          </button>
        </form>
      </section>
    </template>

    <!-- ── 退出登录 ── -->
    <button
      type="button"
      class="logout-button"
      :disabled="logoutLoading"
      @click="logout"
    >
      {{ logoutLoading ? '退出中...' : '退出登录' }}
    </button>

    <!-- ════════════════════════════════════════════ -->
    <!-- 行业选择器（Popup/Chip Grid · 单选） -->
    <!-- ════════════════════════════════════════════ -->
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
            :class="{ 'industry-chip--active': editForm.industry_id === item.id }"
            @click="selectIndustry(item)"
          >
            <span>{{ item.industry_name }}</span>
            <van-icon v-if="editForm.industry_id === item.id" name="success" size="14" />
          </button>
        </div>

        <div class="industry-picker__footer">
          <button type="button" class="industry-clear-btn" @click="clearIndustry">
            清除选择
          </button>
        </div>
      </div>
    </van-popup>

    <!-- ════════════════════════════════════════════ -->
    <!-- 领域选择器（Popup/Chip Grid） -->
    <!-- ════════════════════════════════════════════ -->
    <van-popup
      v-model:show="showFieldPicker"
      position="bottom"
      round
      :close-on-click-overlay="true"
      :style="{ borderRadius: '20px 20px 0 0' }"
    >
      <div class="field-picker">
        <header class="field-picker__header">
          <div>
            <h3>选择领域</h3>
            <p>
              已选 <em>{{ editForm.field_ids.length }}</em> 项
            </p>
          </div>
          <button type="button" class="field-picker__close" @click="showFieldPicker = false">
            <van-icon name="cross" size="18" />
          </button>
        </header>

        <div class="field-picker__grid">
          <button
            v-for="item in fieldList"
            :key="item.id"
            type="button"
            class="field-chip-btn"
            :class="{ 'field-chip-btn--active': editForm.field_ids.includes(item.id) }"
            @click="toggleField(item.id)"
          >
            <span>{{ item.field_name }}</span>
            <van-icon v-if="editForm.field_ids.includes(item.id)" name="success" size="14" />
          </button>
        </div>

        <div class="field-picker__footer">
          <van-button
            type="primary"
            block
            @click="showFieldPicker = false"
            class="field-picker__confirm"
          >
            确定
          </van-button>
        </div>
      </div>
    </van-popup>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { showConfirmDialog, showToast } from 'vant'
import { sendSms, verifySms } from '@/api/user'
import { getIndustries } from '@/api/industry'
import { getFields } from '@/api/field'
import { useUserStore } from '@/stores/user'
import type { IndustryItem } from '@/types/industry'
import type { FieldItem } from '@/types/field'

const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)

// ─── 模式状态 ──────────────────────────────────────
const isEditing = ref(false)
const submitting = ref(false)
const logoutLoading = ref(false)

// ─── 行业 & 领域列表 ────────────────────────────────
const industryList = ref<IndustryItem[]>([])
const fieldList = ref<FieldItem[]>([])
const showIndustryPicker = ref(false)
const showFieldPicker = ref(false)

// ─── 性别选项 ──────────────────────────────────────
const genderOptions = [
  { label: '男', value: 'M' },
  { label: '女', value: 'F' },
  { label: '保密', value: 'U' },
]

// ─── 编辑表单 ──────────────────────────────────────
const editForm = reactive({
  name: '',
  gender: '',
  unit: '',
  department: '',
  position: '',
  industry_id: null as number | null,
  field_ids: [] as number[],
})

const profileError = ref('')

// ─── 密码表单 ──────────────────────────────────────
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordError = ref('')

// ─── 手机号表单 ────────────────────────────────────
const phoneForm = reactive({
  newPhone: '',
  code: '',
})

const phoneError = ref('')
const countdown = ref(0)
let timer: number | undefined

// ─── 计算属性 ──────────────────────────────────────
const displayName = computed(() => profile.value?.name || profile.value?.nickname || '未设置')

const genderBadgeClass = computed(() => {
  const code = profile.value?.gender_code
  if (code === 'M') return 'gender-badge--male'
  if (code === 'F') return 'gender-badge--female'
  return ''
})

const codeButtonText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s` : '获取验证码',
)

const selectedIndustryName = computed(() => {
  if (editForm.industry_id === null) return ''
  return industryList.value.find((i) => i.id === editForm.industry_id)?.industry_name || ''
})

const selectedFieldsSummary = computed(() => {
  if (editForm.field_ids.length === 0) return ''
  return `已选 ${editForm.field_ids.length} 项`
})

const getFieldName = (id: number) =>
  fieldList.value.find((f) => f.id === id)?.field_name || ''

// ─── 生命周期 ──────────────────────────────────────
onMounted(async () => {
  try {
    const [indRes, fldRes] = await Promise.all([
      getIndustries(1),
      getFields(1),
    ])
    industryList.value = indRes.data || []
    fieldList.value = fldRes.data || []
  } catch {
    // 错误已由拦截器处理
  }
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

// ─── 表单填充 ──────────────────────────────────────
const populateForm = () => {
  const p = userStore.profile
  if (!p) return
  editForm.name = p.name || ''
  editForm.gender = p.gender_code || ''
  editForm.unit = p.unit || ''
  editForm.department = p.department || ''
  editForm.position = p.position || ''
  editForm.industry_id = p.industry_id || null
  // 通过 field_code 映射到 fieldList 中的 id
  editForm.field_ids = (p.fields || [])
    .map((pf) => fieldList.value.find((f) => f.field_code === pf.field_code)?.id)
    .filter((id): id is number => id !== undefined)
}

const resetForm = () => {
  editForm.name = ''
  editForm.gender = ''
  editForm.unit = ''
  editForm.department = ''
  editForm.position = ''
  editForm.industry_id = null
  editForm.field_ids = []
  profileError.value = ''
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordError.value = ''
  phoneForm.newPhone = ''
  phoneForm.code = ''
  phoneError.value = ''
  countdown.value = 0
  window.clearInterval(timer)
}

// ─── 编辑切换 ──────────────────────────────────────
const toggleEdit = () => {
  if (isEditing.value) {
    resetForm()
    isEditing.value = false
    return
  }
  populateForm()
  isEditing.value = true
}

// ─── 行业选择 ──────────────────────────────────────
const selectIndustry = (item: IndustryItem) => {
  editForm.industry_id = item.id
  showIndustryPicker.value = false
}

const clearIndustry = () => {
  editForm.industry_id = null
  showIndustryPicker.value = false
}

// ─── 领域切换 ──────────────────────────────────────
const toggleField = (id: number) => {
  const idx = editForm.field_ids.indexOf(id)
  if (idx >= 0) {
    editForm.field_ids.splice(idx, 1)
  } else {
    editForm.field_ids.push(id)
  }
}

// ─── 提交个人信息 ──────────────────────────────────
const submitProfile = async () => {
  if (!editForm.name.trim()) {
    profileError.value = '请填写姓名'
    return
  }

  const p = userStore.profile
  if (!p) return

  // 按需构建 payload：只传与原始值不同的字段
  const payload: Record<string, unknown> = {}

  const name = editForm.name.trim()
  if (name !== (p.name || '')) payload.name = name

  const gender = editForm.gender
  if (gender !== (p.gender_code || '')) payload.gender = gender

  const unit = editForm.unit.trim()
  if (unit !== (p.unit || '')) payload.unit = unit

  const department = editForm.department.trim()
  if (department !== (p.department || '')) payload.department = department

  const position = editForm.position.trim()
  if (position !== (p.position || '')) payload.position = position

  const industryId = editForm.industry_id
  if (industryId !== (p.industry_id || null)) payload.industry_id = industryId

  // 领域比对
  const originalFieldIds = (p.fields || [])
    .map((pf) => fieldList.value.find((f) => f.field_code === pf.field_code)?.id)
    .filter((id): id is number => id !== undefined)
    .sort()
  const currentFieldIds = [...editForm.field_ids].sort()
  if (JSON.stringify(currentFieldIds) !== JSON.stringify(originalFieldIds)) {
    payload.field_ids = editForm.field_ids
  }

  // 无修改则直接退出编辑模式
  if (Object.keys(payload).length === 0) {
    isEditing.value = false
    return
  }

  submitting.value = true
  profileError.value = ''
  try {
    await userStore.updateProfile(payload as import('@/types/user').UpdateUserParams)
    isEditing.value = false
  } catch {
    // 错误已由拦截器处理
  } finally {
    submitting.value = false
  }
}

// ─── 修改密码 ──────────────────────────────────────
const submitChangePassword = async () => {
  if (!passwordForm.oldPassword) {
    passwordError.value = '请输入当前密码'
    return
  }

  if (!passwordForm.newPassword) {
    passwordError.value = '请填写新密码'
    return
  }

  if (passwordForm.newPassword.length < 6) {
    passwordError.value = '密码至少 6 位'
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = '两次输入的密码不一致'
    return
  }

  submitting.value = true
  passwordError.value = ''
  try {
    await userStore.changePassword({
      old_password: passwordForm.oldPassword,
      new_password: passwordForm.newPassword,
    })
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch {
    // 错误已由拦截器处理
  } finally {
    submitting.value = false
  }
}

// ─── 修改手机号 ────────────────────────────────────
const sendPhoneCode = async () => {
  const phone = phoneForm.newPhone.trim()
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入正确的手机号'
    return
  }

  phoneError.value = ''
  try {
    await sendSms({ phone_number: phone, purpose: 'CHANGE_PASSWORD' })
    showToast('验证码已发送')

    countdown.value = 60
    window.clearInterval(timer)
    timer = window.setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        window.clearInterval(timer)
        timer = undefined
      }
    }, 1000)
  } catch {
    // 错误已由拦截器处理
  }
}

const submitChangePhone = async () => {
  const phone = phoneForm.newPhone.trim()
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入正确的手机号'
    return
  }

  if (!/^\d{4}$/.test(phoneForm.code)) {
    phoneError.value = '请填写 4 位验证码'
    return
  }

  submitting.value = true
  phoneError.value = ''
  try {
    const verifyRes = await verifySms({
      phone_number: phone,
      code: phoneForm.code,
      purpose: 'CHANGE_PASSWORD',
    })
    await userStore.changePhone({
      phone_number: phone,
      verify_token: verifyRes.data.verify_token,
    })
    showToast('手机号修改成功')
    phoneForm.newPhone = ''
    phoneForm.code = ''
    countdown.value = 0
    window.clearInterval(timer)
  } catch {
    // 错误已由拦截器处理
  } finally {
    submitting.value = false
  }
}

// ─── 退出登录 ──────────────────────────────────────
const logout = async () => {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '确定要退出当前账号吗？',
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
    })
  } catch {
    // 用户取消
    return
  }

  logoutLoading.value = true
  try {
    await userStore.logout()
  } catch {
    // 即使登出接口失败也清本地状态并跳转
  }
  logoutLoading.value = false
  router.replace({ name: 'login' })
}

// ─── 导航 ──────────────────────────────────────────
const goBack = () => router.back()
</script>

<style scoped lang="scss">
.settings-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 16px 32px;
  color: #111827;
  background: #f7f8fa;
}

// ── 顶部导航 ──

.page-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  min-height: 72px;
  padding: 10px 0;
  grid-template-columns: 40px minmax(0, 1fr) 54px;
  gap: 12px;
  align-items: center;
  background: rgba(247, 248, 250, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  h1 {
    margin: 0;
    color: #111827;
    font-size: 22px;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: 0;
  }

  p {
    margin: 5px 0 0;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.2;
  }
}

.back-button,
.edit-button {
  display: grid;
  height: 36px;
  place-items: center;
  color: #111827;
  font-weight: 900;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.back-button {
  width: 36px;
  font-size: 22px;
}

.edit-button {
  width: 54px;
  font-size: 13px;
}

// ── 卡片通用 ──

.profile-card,
.settings-card {
  margin-top: 12px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #eceff3;
  border-radius: 18px;
}

.settings-card h2 {
  margin: 0 0 14px;
  color: #111827;
  font-size: 17px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: 0;
}

// ── 查看模式 - 头像卡片 ──

.profile-card {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 14px;
  align-items: flex-start;
}

.profile-main {
  min-width: 0;

  .name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h2 {
    margin: 0;
    overflow: hidden;
    color: #111827;
    font-size: 20px;
    font-weight: 900;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0;
  }

  p {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.2;
  }
}

.gender-badge {
  display: inline-flex;
  flex-shrink: 0;
  padding: 2px 8px;
  color: #6b7280;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  background: #f3f4f6;
  border-radius: 6px;

  &--male {
    color: #2563eb;
    background: #eff6ff;
  }

  &--female {
    color: #db2777;
    background: #fdf2f8;
  }
}

.role-tag {
  display: inline-flex;
  margin-top: 9px;
  padding: 4px 10px;
  color: #2f80ff;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.3;
  background: rgba(47, 128, 255, 0.07);
  border-radius: 999px;
}

.avatar-preview {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  color: #ffffff;
  font-size: 24px;
  font-weight: 900;
  background: linear-gradient(135deg, #4ba0ff 0%, #2f74ff 100%);
  border-radius: 18px;
  box-shadow: 0 6px 16px rgba(47, 116, 255, 0.22);
}

// ── 查看模式 - 详情 ──

.readonly-details {
  display: grid;
  gap: 10px;
}

.readonly-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.45;

  &__label {
    flex-shrink: 0;
    width: 36px;
    color: #9ca3af;
    font-weight: 600;
    font-size: 13px;
  }

  &__value {
    color: #111827;
    font-weight: 600;
    word-break: break-all;
  }

  &--tags {
    align-items: flex-start;
  }
}

.readonly-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    height: 28px;
    padding: 0 10px;
    color: #374151;
    font-size: 12px;
    font-weight: 700;
    line-height: 26px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
  }
}

// ── 编辑表单 ──

.settings-form {
  display: grid;
  gap: 12px;

  label {
    display: grid;
    gap: 7px;
  }

  label > span {
    color: #374151;
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
  }

  input {
    width: 100%;
    min-width: 0;
    height: 44px;
    padding: 0 12px;
    color: #111827;
    font: inherit;
    font-size: 14px;
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

// ── 性別切换 ──

.gender-toggle {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.gender-option {
  height: 40px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 700;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.15s ease;

  &.selected {
    color: #ffffff;
    background: #111827;
    border-color: #111827;
  }

  &:active {
    opacity: 0.8;
  }
}

// ── 选择器按钮（行业 & 领域） ──

.selector-button {
  display: flex;
  width: 100%;
  height: 44px;
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

// ── 已选领域标签 ──

.selected-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.field-chip {
  display: inline-flex;
  height: 32px;
  padding: 0 12px;
  align-items: center;
  gap: 6px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  background: #ef4444;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);

  &:active {
    transform: scale(0.95);
    opacity: 0.85;
  }

  .van-icon {
    color: #ffffff;
    opacity: 0.8;
  }
}

// ── 只读行（编辑模式复用） ──

.readonly-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 44px;
  padding: 0 12px;
  color: #6b7280;
  font-size: 14px;
  background: #f9fafb;
  border-radius: 12px;

  &:first-child {
    margin-bottom: 0;
  }

  strong {
    color: #111827;
    font-weight: 900;
  }
}

// ── 验证码 ──

.code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 104px;
  gap: 8px;

  button {
    height: 44px;
    color: #111827;
    font-size: 13px;
    font-weight: 900;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 12px;

    &:disabled {
      color: #9ca3af;
    }
  }
}

// ── ActionSheet 选择列表 ──

// ── 领域选择器 Popup ──

.field-picker {
  padding: 0 0 max(16px, env(safe-area-inset-bottom));
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.field-picker__header {
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

    em {
      color: #ef4444;
      font-weight: 800;
      font-style: normal;
    }
  }
}

.field-picker__close {
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

.field-picker__grid {
  flex: 1;
  overflow-y: auto;
  padding: 4px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content: flex-start;
}

.field-chip-btn {
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

.field-picker__footer {
  padding: 16px 20px 0;
}

.field-picker__confirm {
  height: 50px;
  font-size: 16px;
  font-weight: 800;
  background: #ef4444;
  border: 0;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.28);
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

// ── 按钮 ──

.primary-button {
  height: 46px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  background: #111827;
  border: 0;
  border-radius: 12px;

  &:disabled {
    opacity: 0.5;
  }
}

.form-error {
  margin: -2px 0 0;
  color: #dc2626;
  font-size: 12px;
  line-height: 1.2;
}

.logout-button {
  width: 100%;
  height: 46px;
  margin-top: 16px;
  color: #dc2626;
  font-size: 15px;
  font-weight: 900;
  background: #ffffff;
  border: 1px solid #fee2e2;
  border-radius: 12px;

  &:disabled {
    opacity: 0.5;
  }
}
</style>
