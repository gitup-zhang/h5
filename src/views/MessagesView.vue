<template>
  <main class="messages-page">
    <header class="page-nav">
      <button type="button" class="back-button" @click="goBack" aria-label="返回">
        <van-icon name="arrow-left" />
      </button>
      <div>
        <h1>消息中心</h1>
        <p v-if="total > 0">{{ total }} 条消息</p>
      </div>
    </header>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        :loading="loading"
        :finished="finished"
        finished-text="没有更多消息了"
        @load="fetchMessages"
      >
        <section v-if="messages.length > 0" class="message-list">
          <article
            v-for="msg in messages"
            :key="msg.id"
            class="message-card"
            :class="{
              'message-card--unread': msg.is_read === 0,
              'message-card--clickable': true,
              'message-card--expanded': isExpanded(msg.id),
            }"
            @click="handleMessageClick(msg)"
          >
            <div class="message-dot" :class="{ 'message-dot--unread': msg.is_read === 0 }"></div>
            <div class="message-body">
              <div class="message-header">
                <h2>{{ msg.title }}</h2>
                <span class="message-time">{{ formatTime(msg.send_time) }}</span>
              </div>
              <p
                class="message-content"
                :class="{ 'message-content--expanded': isExpanded(msg.id) }"
                v-html="msg.content"
              ></p>
              <span
                v-if="isSystemMessage(msg)"
                class="message-expand-hint"
              >{{ isExpanded(msg.id) ? '收起' : '展开' }}</span>
            </div>
          </article>
        </section>

        <div v-else-if="!loading" class="empty-state">
          <van-icon name="envelope-o" size="48" />
          <p>暂无消息</p>
        </div>
      </van-list>
    </van-pull-refresh>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { getMessages } from '@/api/message'
import { useMessageStore } from '@/stores/message'
import type { MessageItem } from '@/types/message'

const router = useRouter()
const messageStore = useMessageStore()
const messages = ref<MessageItem[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// ── 展开/收起 ──

const expandedIds = ref<Set<number>>(new Set())

const toggleExpand = (id: number) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedIds.value = next
}

const isExpanded = (id: number) => expandedIds.value.has(id)

const isSystemMessage = (msg: MessageItem) =>
  msg.target_type === 'ALL' || msg.target_type === 'FIELD' || msg.target_id === 0

// ── 点击处理 ──

const handleMessageClick = (msg: MessageItem) => {
  // 系统/领域消息：展开/收起查看完整内容
  if (isSystemMessage(msg)) {
    toggleExpand(msg.id)
    return
  }

  // 活动相关等：跳转活动详情
  router.push({ name: 'activity-detail', params: { id: msg.target_id } })
}

// ── 下拉刷新 ──

const onRefresh = async () => {
  // 重置分页状态
  page.value = 1
  finished.value = false
  expandedIds.value = new Set()

  try {
    const res = await getMessages({ page: 1, page_size: 10 })
    messages.value = res.data.list
    total.value = res.data.total
    if (messages.value.length >= res.data.total) {
      finished.value = true
    } else {
      page.value = 2
    }
    messageStore.clearUnreadCount()
  } catch {
    // 错误已由拦截器处理
  } finally {
    refreshing.value = false
  }
}

const formatTime = (iso: string) => {
  const d = dayjs(iso)
  const now = dayjs()
  if (d.isSame(now, 'day')) return d.format('HH:mm')
  if (d.isSame(now.subtract(1, 'day'), 'day')) return '昨天 ' + d.format('HH:mm')
  if (d.isSame(now, 'year')) return d.format('MM-DD HH:mm')
  return d.format('YYYY-MM-DD')
}

const fetchMessages = async () => {
  if (loading.value || finished.value || refreshing.value) return
  loading.value = true
  try {
    const res = await getMessages({ page: page.value, page_size: 10 })
    if (page.value === 1) {
      messages.value = res.data.list
      messageStore.clearUnreadCount()
    } else {
      messages.value = [...messages.value, ...res.data.list]
    }
    total.value = res.data.total
    if (messages.value.length >= res.data.total) {
      finished.value = true
    }
    page.value++
  } catch {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()
</script>

<style scoped lang="scss">
.messages-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  color: #111827;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.page-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  min-height: 72px;
  padding: 10px 16px;
  grid-template-columns: 40px minmax(0, 1fr);
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
  }
}

// PullRefresh 占满剩余空间
:deep(.van-pull-refresh) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 32px;
}

.back-button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #111827;
  font-size: 22px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.message-list {
  display: grid;
  gap: 10px;
  margin-top: 8px;
  padding: 0 16px;
}

.message-card {
  display: grid;
  padding: 16px;
  grid-template-columns: 8px minmax(0, 1fr);
  gap: 12px;
  background: #ffffff;
  border: 1px solid #eceff3;
  border-radius: 14px;

  &--unread {
    background: #fafcff;
    border-color: #e0e8f8;
  }
}

.message-dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: #d1d5db;

  &--unread {
    background: #2f80ff;
    box-shadow: 0 0 0 3px rgba(47, 128, 255, 0.15);
  }
}

.message-body {
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  h2 {
    margin: 0;
    overflow: hidden;
    color: #111827;
    font-size: 15px;
    font-weight: 800;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.message-time {
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1;
}

.message-content {
  margin: 8px 0 0;
  overflow: hidden;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  max-height: 3em; // 2 行截断

  // 富文本内部元素
  :deep(p) { margin: 0 0 4px; }
  :deep(img) { max-width: 100%; border-radius: 8px; }
  :deep(a)  { color: #2f80ff; }
  :deep(ul),
  :deep(ol) { padding-left: 18px; margin: 4px 0; }
}

.message-card--clickable {
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: #f0f3f8;
  }
}

.message-card--expanded {
  background: #fafcff;
  border-color: #d0daf0;
}

.message-content--expanded {
  max-height: none !important;
  overflow: visible;
}

.message-expand-hint {
  display: inline-block;
  margin-top: 8px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  user-select: none;
}

.empty-state {
  display: flex;
  min-height: 360px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  color: #c3cad3;

  .van-icon {
    font-size: 48px;
  }

  p {
    margin: 12px 0 0;
    color: #6b7280;
    font-size: 14px;
    font-weight: 800;
  }
}
</style>
