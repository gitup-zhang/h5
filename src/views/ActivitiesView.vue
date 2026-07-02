<template>
  <main class="activities-page">
    <header class="page-header">
      <button type="button" class="back-button" @click="goBack" aria-label="返回">
        <van-icon name="arrow-left" />
      </button>
      <div class="title-block">
        <span class="title-label">全部活动</span>
        <h1 class="page-title">发现活动</h1>
        <p class="page-subtitle">{{ subtitle }}</p>
      </div>
    </header>

    <section class="search-section">
      <van-search
        v-model="searchQuery"
        placeholder="搜索活动名称、地点"
        shape="round"
        clearable
      />
    </section>

    <section class="filter-tabs" aria-label="活动筛选">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="tab-count">{{ tabCount(tab.key) }}</span>
        {{ tab.label }}
      </button>
    </section>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多活动了"
        @load="onLoadMore"
      >
      <section class="activity-list" v-if="events.length > 0">
        <article
          v-for="event in events"
          :key="event.id"
          class="activity-card"
          :class="{ 'activity-card--finished': event.status.includes('结束') }"
          role="button"
          tabindex="0"
          @click="openActivity(event.id)"
          @keydown.enter="openActivity(event.id)"
        >
          <div class="activity-card__cover">
            <img :src="event.cover_image_url" :alt="event.title" />
            <span class="cover-status" :class="getStatusColor(event.status)">
              {{ event.status }}
            </span>
          </div>
          <div class="activity-card__body">
            <h2>{{ event.title }}</h2>
            <div class="activity-meta">
              <span><van-icon name="calendar-o" />{{ formatTime(event.event_start_time) }} {{ getWeekday(event.event_start_time) }}</span>
              <span><van-icon name="location-o" />{{ event.event_address }}</span>
            </div>
            <div class="activity-footer">
              <div class="activity-tags">
                <span v-for="field in event.fields.slice(0, 2)" :key="field.field_id" class="tag">
                  {{ field.field_name }}
                </span>
              </div>
              <span class="participants">{{ event.current_registrants }}/{{ event.max_registrants }}人</span>
            </div>
          </div>
        </article>
      </section>

      <div class="activity-empty" v-else-if="!loading">
        <van-icon name="search" size="48" />
        <p v-if="searchQuery.trim()">未找到「{{ searchQuery }}」相关活动</p>
        <p v-else>暂无匹配活动</p>
        <span>试试其他筛选条件吧</span>
      </div>
    </van-list>
    </van-pull-refresh>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { getEventList } from '@/api/event'
import type { EventItem, EventStatus } from '@/types/event'

defineOptions({ name: 'ActivitiesView' })

type TabKey = 'all' | 'hot' | 'soon'

interface TabCacheEntry {
  events: EventItem[]
  total: number
  page: number
}

const route = useRoute()
const router = useRouter()

function getInitialTab(): TabKey {
  const tab = route.query.tab
  if (tab === 'all' || tab === 'hot' || tab === 'soon') return tab
  return 'all'
}

const activeTab = ref<TabKey>(getInitialTab())
const searchQuery = ref('')
const events = ref<EventItem[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

/** 无搜索词时缓存各 tab 的首页数据，切换 tab 命中缓存时直接还原，避免重复请求 */
const tabCache: Record<string, TabCacheEntry> = {}

const tabs: Array<{ key: TabKey; label: string; status?: EventStatus }> = [
  { key: 'all', label: '全部' },
  { key: 'hot', label: '进行中', status: 'InProgress' },
  { key: 'soon', label: '即将开始', status: 'NotBegun' },
]

const tabCount = (key: TabKey) => {
  if (key === activeTab.value && total.value > 0) return total.value
  return ''
}

const goBack = () => router.back()

const openActivity = (id: number) => {
  router.push({ name: 'activity-detail', params: { id } })
}

// ── Helpers ──

const formatTime = (iso: string) => {
  const d = dayjs(iso)
  const now = dayjs()
  if (d.isSame(now, 'day')) return `今天 ${d.format('HH:mm')}`
  if (d.isSame(now.add(1, 'day'), 'day')) return `明天 ${d.format('HH:mm')}`
  return d.format('MM.DD HH:mm')
}

const getWeekday = (iso: string) => {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayjs(iso).day()]
}

const getStatusColor = (status: string) => {
  if (status.includes('进行')) return 'cover-status--hot'
  if (status.includes('结束')) return 'cover-status--finished'
  return 'cover-status--soon'
}

// ── Data fetching ──

const subtitle = computed(() => {
  if (total.value === 0) return '暂无活动'
  return `${total.value} 场活动`
})

const currentTab = computed(() => tabs.find((t) => t.key === activeTab.value))

const fetchEvents = async (reset = false) => {
  if (reset) {
    page.value = 1
    finished.value = false
  }

  loading.value = true
  try {
    const params: { page: number; page_size: number; event_status?: EventStatus; event_title?: string } = {
      page: page.value,
      page_size: 10,
    }

    const tab = currentTab.value
    if (tab?.status) {
      params.event_status = tab.status
    }

    const q = searchQuery.value.trim()
    if (q) {
      params.event_title = q
    }

    const res = await getEventList(params)
    if (reset) {
      events.value = res.data.list
    } else {
      events.value = [...events.value, ...res.data.list]
    }
    total.value = res.data.total
    if (events.value.length >= res.data.total) {
      finished.value = true
    }

    // 无搜索词时写入缓存，下次切回本 tab 直接还原
    if (!searchQuery.value.trim()) {
      tabCache[activeTab.value] = {
        events: [...events.value],
        total: total.value,
        page: page.value,
      }
    }
  } catch {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  // 清除当前 tab 缓存，确保拉到最新数据
  delete tabCache[activeTab.value]
  await fetchEvents(true)
  refreshing.value = false
}

const onLoadMore = () => {
  if (finished.value) return
  page.value++
  fetchEvents()
}

// Tab 切换：同步URL → 命中缓存则直接还原，否则请求数据
watch(activeTab, (tab, oldTab) => {
  router.replace({ query: { ...route.query, tab } })

  // 保存当前 tab 数据到缓存（仅无搜索词时）
  if (oldTab && !searchQuery.value.trim() && events.value.length > 0) {
    tabCache[oldTab] = {
      events: [...events.value],
      total: total.value,
      page: page.value,
    }
  }

  // 命中缓存 → 直接还原，不走网络
  const cached = tabCache[tab]
  if (cached && !searchQuery.value.trim()) {
    events.value = cached.events
    total.value = cached.total
    page.value = cached.page
    finished.value = cached.events.length >= cached.total
    return
  }

  fetchEvents(true)
})

// keep-alive 场景：外部 URL 变化（如直接导航到 /activities?tab=soon）时同步 tab
watch(() => route.query.tab, (newTab) => {
  if (newTab && newTab !== activeTab.value && (newTab === 'all' || newTab === 'hot' || newTab === 'soon')) {
    activeTab.value = newTab as TabKey
  }
})
watch(searchQuery, () => {
  // 防抖搜索
  const q = searchQuery.value.trim()
  if (q) {
    fetchEvents(true)
  } else if (events.value.length === 0 || total.value > 0) {
    fetchEvents(true)
  }
})

onMounted(() => {
  fetchEvents(true)
})
</script>

<style scoped lang="scss">
.activities-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 16px 32px;
  color: #101936;
  background: linear-gradient(180deg, #fbfdff 0%, #f7faff 48%, #f5f8fe 100%);
  display: flex;
  flex-direction: column;
}

// PullRefresh 占满剩余空间，确保 van-list 能正确检测触底
:deep(.van-pull-refresh) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// ── Header ──

.page-header {
  padding: 18px 0 8px;
}

.back-button {
  display: inline-grid;
  width: 36px;
  height: 36px;
  margin-bottom: 14px;
  place-items: center;
  color: #101936;
  font-size: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(233, 238, 248, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(105, 121, 151, 0.08);
  transition: background 0.2s;

  &:active {
    background: rgba(245, 248, 254, 0.95);
  }
}

.title-block {
  position: relative;
  padding-left: 14px;

  &::before {
    content: '';
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 0;
    width: 4px;
    background: #101936;
    border-radius: 999px;
  }
}

.title-label {
  display: block;
  margin-bottom: 5px;
  color: #8a93a6;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.page-title {
  margin: 0;
  color: #101936;
  font-size: 24px;
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: 0;
}

.page-subtitle {
  margin: 7px 0 0;
  color: #7d879a;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
}

// ── Search ──

.search-section {
  margin: 14px -4px 0;

  :deep(.van-search__content) {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(233, 238, 248, 0.9);
    box-shadow: 0 6px 18px rgba(105, 121, 151, 0.07);
  }
}

// ── Filter tabs ──

.filter-tabs {
  display: flex;
  gap: 8px;
  margin: 14px -16px 0;
  padding: 0 16px 2px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  button {
    display: inline-flex;
    height: 34px;
    padding: 0 14px;
    align-items: center;
    gap: 5px;
    flex: 0 0 auto;
    color: #536076;
    font-size: 13px;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(233, 238, 248, 0.9);
    border-radius: 999px;
    transition: all 0.2s ease;

    &.active {
      color: #ffffff;
      background: linear-gradient(135deg, #101936 0%, #1f2848 100%);
      border-color: #101936;
      box-shadow: 0 4px 14px rgba(16, 25, 54, 0.22);
    }
  }
}

.tab-count {
  display: inline-grid;
  min-width: 16px;
  height: 16px;
  place-items: center;
  color: inherit;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  opacity: 0.55;

  .active & {
    opacity: 0.8;
  }
}

// ── Activity list ──

.activity-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.activity-card {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid rgba(233, 238, 248, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(105, 121, 151, 0.07);

  &--finished {
    opacity: 0.6;
  }
}

.activity-card__cover {
  position: relative;
  height: 118px;
  overflow: hidden;
  background-size: cover;
  border-radius: 10px;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

.cover-status {
  position: absolute;
  top: 5px;
  left: 5px;
  padding: 3px 7px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.3;
  border-radius: 999px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  &--hot,
  &--joined {
    background: rgba(72, 202, 129, 0.9);
  }

  &--soon {
    background: rgba(245, 158, 11, 0.88);
  }

  &--finished {
    background: rgba(107, 114, 128, 0.8);
  }
}

.cover-price {
  position: absolute;
  bottom: 5px;
  right: 5px;
  padding: 3px 7px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, rgba(47, 128, 255, 0.9) 0%, rgba(47, 116, 255, 0.85) 100%);
  border-radius: 6px;

  &--free {
    background: linear-gradient(135deg, rgba(72, 202, 129, 0.9) 0%, rgba(56, 185, 110, 0.85) 100%);
  }
}

.activity-card__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;

  h2 {
    margin: 0;
    overflow: hidden;
    color: #101936;
    font-size: 16px;
    font-weight: 900;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0;
  }
}

.activity-summary {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #7d879a;
  font-size: 12px;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 10px;
  margin-top: 2px;

  span {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 3px;
    overflow: hidden;
    color: #9ba4b6;
    font-size: 11px;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;

    .van-icon {
      flex: 0 0 auto;
      font-size: 12px;
    }
  }
}

.activity-footer {
  display: flex;
  margin-top: auto;
  padding-top: 6px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  padding: 2px 6px;
  color: #2f80ff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.35;
  background: rgba(47, 128, 255, 0.07);
  border-radius: 4px;
}

.participants {
  color: #8a93a6;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.activity-empty {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #d5dbe6;

  p {
    margin: 12px 0 6px;
    color: #7d879a;
    font-size: 15px;
    font-weight: 600;
  }

  span {
    color: #9ba4b6;
    font-size: 13px;
  }
}

@media (max-width: 374px) {
  .activities-page {
    padding-right: 12px;
    padding-left: 12px;
  }

  .filter-tabs {
    margin-right: -12px;
    margin-left: -12px;
    padding-right: 12px;
    padding-left: 12px;
  }

  .activity-card {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 10px;
  }
}
</style>
