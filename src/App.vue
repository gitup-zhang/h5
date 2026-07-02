<template>
  <RouterView v-slot="{ Component }">
    <keep-alive :include="['HomeView', 'MineView', 'ActivitiesView']">
      <component :is="Component" />
    </keep-alive>
  </RouterView>
  <!-- 首次登录：引导完善个人信息（姓名） -->
  <ProfileCompleteDialog
    v-model:visible="showProfileDialog"
    @saved="handleProfileSaved"
    @skip="handleProfileSkipped"
  />
  <!-- 登录后领域为空时弹出选择 -->
  <FieldSelectDialog
    ref="fieldPickerRef"
    v-model:visible="showFieldPicker"
    @confirm="handleFieldConfirm"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateUser } from '@/api/user'
import FieldSelectDialog from '@/components/FieldSelectDialog.vue'
import ProfileCompleteDialog from '@/components/ProfileCompleteDialog.vue'

const userStore = useUserStore()

const showFieldPicker = ref(false)
const fieldPickerRef = ref<{ setSaving: (v: boolean) => void } | null>(null)
let pickerShown = false

const showProfileDialog = ref(false)
let profileDialogShown = false

/** 检查用户是否需要完善个人信息（首次登录 / 姓名为空时） */
const checkProfileAndPrompt = () => {
  if (profileDialogShown) return
  const profile = userStore.profile
  if (profile && !profile.name) {
    profileDialogShown = true
    showProfileDialog.value = true
  }
}

/** 用户保存姓名后：刷新资料，关闭弹窗，然后检查领域 */
const handleProfileSaved = async () => {
  await userStore.fetchProfile()
  showProfileDialog.value = false
  checkFieldsAndPrompt()
}

/** 用户跳过填写姓名：关闭弹窗，然后检查领域 */
const handleProfileSkipped = () => {
  showProfileDialog.value = false
  checkFieldsAndPrompt()
}

/** 检查用户是否需要选择领域（首次登录 / 领域为空时） */
const checkFieldsAndPrompt = () => {
  if (pickerShown) return
  const profile = userStore.profile
  if (profile && (!profile.fields || profile.fields.length === 0)) {
    pickerShown = true
    showFieldPicker.value = true
  }
}

/** 用户确认选择领域 */
const handleFieldConfirm = async (ids: number[]) => {
  fieldPickerRef.value?.setSaving(true)
  try {
    await updateUser({ field_ids: ids })
    await userStore.fetchProfile()
    showFieldPicker.value = false
  } catch {
    // 错误已由拦截器处理
  } finally {
    fieldPickerRef.value?.setSaving(false)
  }
}

// 自动登录后检查（先姓名，后领域）
onMounted(async () => {
  await userStore.initAuth()
  checkProfileAndPrompt()
  // 若姓名字段已存在，不会弹出 profile 对话框，继续检查领域
  if (!showProfileDialog.value) {
    checkFieldsAndPrompt()
  }
})

// 手动登录后检查（profile 从 null 变为有值时触发）
watch(() => userStore.profile, (newVal, oldVal) => {
  // 退出登录时重置标记，允许下次登录再次弹出
  if (!newVal && oldVal) {
    pickerShown = false
    profileDialogShown = false
    showProfileDialog.value = false
    return
  }
  if (!newVal) return
  checkProfileAndPrompt()
  // 若姓名字段已存在，不会弹出 profile 对话框，继续检查领域
  if (!showProfileDialog.value) {
    checkFieldsAndPrompt()
  }
})
</script>
