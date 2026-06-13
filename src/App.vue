<template>
  <RouterView />
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

const userStore = useUserStore()

const showFieldPicker = ref(false)
const fieldPickerRef = ref<{ setSaving: (v: boolean) => void } | null>(null)
let pickerShown = false

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

// 自动登录后检查
onMounted(async () => {
  await userStore.initAuth()
  checkFieldsAndPrompt()
})

// 手动登录后检查（profile 从 null 变为有值时触发）
watch(() => userStore.profile, (newVal, oldVal) => {
  // 退出登录时重置标记，允许下次登录再次弹出
  if (!newVal && oldVal) {
    pickerShown = false
    return
  }
  checkFieldsAndPrompt()
})
</script>
