<template>
  <main class="list-page">
    <header class="page-nav">
      <button type="button" class="back-button" @click="goBack" aria-label="返回">
        <van-icon name="arrow-left" />
      </button>
      <div>
        <h1>{{ pageTitle }}</h1>
        <p>{{ activities.length }} 场活动</p>
      </div>
    </header>

    <section v-if="activities.length" class="activity-list">
      <button
        v-for="event in activities"
        :key="event.id"
        type="button"
        class="activity-card"
        @click="openActivity(event.id)"
      >
        <img :src="event.cover_image_url" :alt="event.title" />
        <div class="activity-info">
          <div class="activity-title">
            <h2>{{ event.title }}</h2>
            <span>{{ getTagText(event) }}</span>
          </div>
          <p><van-icon name="calendar-o" />{{ formatTime(event.event_start_time) }} - {{ formatTime(event.event_end_time) }}</p>
          <p><van-icon name="location-o" />{{ event.event_address }}</p>
        </div>
      </button>
    </section>

    <div v-else class="empty-state">
      <van-icon name="calendar-o" />
      <p>暂无报名活动</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { getMyRegistrations } from '@/api/event'
import type { EventItem } from '@/types/event'

const route = useRoute()
const router = useRouter()

const activities = ref<EventItem[]>([])
const loading = ref(false)
const pageTitle = ref('我的报名')

const formatTime = (iso: string) => {
  return dayjs(iso).format('MM.DD HH:mm')
}

const getTagText = (event: EventItem) => {
  return event.status.includes('结束') ? '已完成' : '待参加'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getMyRegistrations({ page_size: 100 })
    activities.value = res.data.list
  } catch {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const goBack = () => router.back()

const openActivity = (id: number) => {
  router.push({ name: 'activity-detail', params: { id } })
}
</script>

<style scoped lang="scss">
.list-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 16px 32px;
  color: #111827;
  background: #f7f8fa;
}

.page-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  min-height: 72px;
  padding: 10px 0;
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
    line-height: 1.2;
  }
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

.activity-list {
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

.activity-card {
  display: grid;
  width: 100%;
  padding: 12px;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  text-align: left;
  background: #ffffff;
  border: 1px solid #eceff3;
  border-radius: 16px;

  img {
    width: 86px;
    height: 86px;
    display: block;
    object-fit: cover;
    background: #eef1f4;
    border-radius: 13px;
  }
}

.activity-info {
  min-width: 0;

  p {
    display: flex;
    margin: 8px 0 0;
    align-items: center;
    gap: 5px;
    overflow: hidden;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.activity-title {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 8px;
  align-items: start;

  h2 {
    margin: 0;
    overflow: hidden;
    color: #111827;
    font-size: 16px;
    font-weight: 900;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0;
  }

  span {
    padding: 4px 7px;
    color: #047857;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    background: #ecfdf5;
    border-radius: 7px;
  }
}

.empty-state {
  display: flex;
  min-height: 360px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c3cad3;

  .van-icon {
    font-size: 36px;
  }

  p {
    margin: 12px 0 0;
    color: #6b7280;
    font-size: 14px;
    font-weight: 800;
  }
}
</style>
