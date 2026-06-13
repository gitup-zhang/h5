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
        <div>
          <h2>选择你的领域</h2>
          <p>
            选择你感兴趣的领域，以便为你推荐相关活动 ·
            <em>已选 {{ selectedIds.length }}</em>
          </p>
        </div>
      </header>

      <div class="chip-grid">
        <button
          v-for="item in fieldList"
          :key="item.id"
          type="button"
          class="chip-btn"
          :class="{ 'chip-btn--active': selectedIds.includes(item.id) }"
          @click="toggleField(item.id)"
        >
          <span>{{ item.field_name }}</span>
          <van-icon v-if="selectedIds.includes(item.id)" name="success" size="14" />
        </button>
      </div>

      <div class="popup-footer">
        <van-button
          type="primary"
          block
          :loading="saving"
          :disabled="saving"
          @click="handleConfirm"
          class="confirm-btn"
        >
          {{ saving ? '保存中...' : '确定' }}
        </van-button>
        <button type="button" class="skip-btn" @click="handleSkip" :disabled="saving">
          暂不选择
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getFields } from '@/api/field'
import type { FieldItem } from '@/types/field'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'confirm', ids: number[]): void
}>()

const fieldList = ref<FieldItem[]>([])
const selectedIds = ref<number[]>([])
const saving = ref(false)

watch(() => props.visible, (v) => {
  if (v && fieldList.value.length === 0) {
    fetchFields()
  }
})

const fetchFields = async () => {
  try {
    const res = await getFields(1)
    fieldList.value = Array.isArray(res.data) ? res.data : []
  } catch {
    // 错误已由拦截器处理
  }
}

const toggleField = (id: number) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const handleConfirm = () => {
  emit('confirm', [...selectedIds.value])
}

const handleSkip = () => {
  if (!saving.value) {
    emit('update:visible', false)
  }
}

const setSaving = (v: boolean) => {
  saving.value = v
}

defineExpose({ setSaving })
</script>

<style scoped lang="scss">
.popup-inner {
  padding: 0 0 max(16px, env(safe-area-inset-bottom));
  max-height: 70vh;
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

    em {
      color: #ef4444;
      font-weight: 800;
      font-style: normal;
    }
  }
}

.chip-grid {
  flex: 1;
  overflow-y: auto;
  padding: 4px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content: flex-start;
}

.chip-btn {
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

.popup-footer {
  padding: 16px 20px 0;
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
