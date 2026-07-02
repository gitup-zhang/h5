<template>
  <van-popup
    :show="visible"
    position="bottom"
    round
    :close-on-click-overlay="false"
    :style="{ borderRadius: '20px 20px 0 0' }"
    @update:show="(val: boolean) => emit('update:visible', val)"
  >
    <div class="popup-inner">
      <header class="popup-header">
        <h2>完善个人信息</h2>
        <p>请填写您的姓名，以便报名参加活动时自动填充</p>
      </header>

      <div class="form-body">
        <label class="name-field">
          <span>姓名</span>
          <input
            ref="nameInputRef"
            v-model.trim="name"
            type="text"
            placeholder="请输入您的姓名"
            autocomplete="name"
            @keyup.enter="handleSave"
          />
        </label>
        <p v-if="error" class="field-error">{{ error }}</p>
      </div>

      <div class="popup-footer">
        <van-button
          type="primary"
          block
          :loading="saving"
          :disabled="saving"
          @click="handleSave"
          class="confirm-btn"
        >
          {{ saving ? '保存中...' : '保存' }}
        </van-button>
        <button type="button" class="skip-btn" @click="handleSkip" :disabled="saving">
          暂不填写
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { updateUser } from '@/api/user'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'saved'): void
  (e: 'skip'): void
}>()

const name = ref('')
const error = ref('')
const saving = ref(false)
const nameInputRef = ref<HTMLInputElement | null>(null)

watch(() => props.visible, (v) => {
  if (v) {
    name.value = ''
    error.value = ''
    nextTick(() => {
      nameInputRef.value?.focus()
    })
  }
})

const handleSave = async () => {
  if (!name.value) {
    error.value = '请填写姓名'
    return
  }

  error.value = ''
  saving.value = true
  try {
    await updateUser({ name: name.value })
    emit('saved')
  } catch {
    // 错误已由拦截器处理
  } finally {
    saving.value = false
  }
}

const handleSkip = () => {
  if (!saving.value) {
    emit('skip')
  }
}
</script>

<style scoped lang="scss">
.popup-inner {
  padding: 0 0 max(16px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
}

.popup-header {
  padding: 24px 20px 16px;

  h2 {
    margin: 0 0 6px;
    color: #111827;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: #9ca3af;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }
}

.form-body {
  padding: 4px 20px 0;
}

.name-field {
  display: grid;
  gap: 7px;

  span {
    color: #374151;
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
  }

  input {
    width: 100%;
    min-width: 0;
    height: 48px;
    padding: 0 14px;
    color: #111827;
    font: inherit;
    font-size: 15px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    outline: none;

    &:focus {
      background: #ffffff;
      border-color: #111827;
    }

    &::placeholder {
      color: #9ca3af;
      font-size: 14px;
    }
  }
}

.field-error {
  margin: 6px 0 0;
  color: #dc2626;
  font-size: 12px;
  line-height: 1.2;
}

.popup-footer {
  padding: 20px 20px 0;
  display: grid;
  gap: 10px;
}

.confirm-btn {
  height: 50px;
  font-size: 16px;
  font-weight: 800;
  background: #ef4444;
  border: 0;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.28);
}

.skip-btn {
  display: block;
  width: 100%;
  padding: 10px;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  border: 0;
  cursor: pointer;

  &:active {
    color: #6b7280;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
