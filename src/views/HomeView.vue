<template>
  <main class="home-page">
    <!-- Search mode -->
    <template v-if="searchActive">
      <section class="search-bar">
        <van-search
          v-model="searchQuery"
          placeholder="搜索活动、地点"
          show-action
          autofocus
          shape="round"
          @update:model-value="onSearchInput"
          @cancel="closeSearch"
        >
          <template #action>
            <button type="button" class="search-cancel-btn" @click="closeSearch">取消</button>
          </template>
        </van-search>
        <div class="search-suggestions" v-if="!searchQuery.trim()">
          <h3 class="suggest-title">热门搜索</h3>
          <div class="suggest-tags">
            <span
              v-for="tag in hotSearchTags"
              :key="tag"
              class="suggest-tag"
              @click="searchQuery = tag"
            >{{ tag }}</span>
          </div>
        </div>
      </section>

      <section class="search-results" v-if="searchQuery.trim()">
        <div class="search-result-info" v-if="searchResults.length > 0">
          找到 <em>{{ searchResults.length }}</em> 个相关活动
        </div>

        <div class="search-empty" v-else>
          <van-icon name="search" size="48" />
          <p>未找到「{{ searchQuery }}」相关的活动</p>
          <span>试试其他关键词吧</span>
        </div>

        <div class="search-result-list">
          <article
            v-for="event in searchResults"
            :key="event.id"
            class="search-result-card"
            @click="openActivity(event.id)"
          >
            <div class="search-result-card__cover">
              <img :src="event.cover_image_url" :alt="event.title" />
              <span class="search-result-card__status" :style="{ background: getStatusColor(event.status) }">
                {{ event.status }}
              </span>
            </div>
            <div class="search-result-card__body">
              <h3>{{ event.title }}</h3>
              <p><van-icon name="calendar-o" />{{ formatTime(event.event_start_time) }}</p>
              <p><van-icon name="location-o" />{{ event.event_address }}</p>
              <div class="search-result-card__footer">
                <span class="search-result-card__category">{{ event.fields[0]?.field_name || '活动' }}</span>
                <span class="search-result-card__participants">{{ event.current_registrants }}人报名</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </template>

    <!-- Normal mode -->
    <template v-else>
    <section class="top-bar" aria-label="搜索活动">
      <div class="search-box" @click="openSearch">
        <van-icon name="search" />
        <span>搜索活动、地点</span>
      </div>
      <button class="notice-button" type="button" aria-label="消息通知" @click="openMessages">
        <van-icon name="bell" />
        <span v-if="unreadCount > 0" class="notice-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </button>
    </section>

    <section class="activity-banner" aria-labelledby="banner-title">
      <div class="section-heading">
        <h2 id="banner-title">正在进行</h2>
        <button v-if="inProgressEvents.length > 0" type="button" @click="showMoreActivities">查看更多 <van-icon name="arrow" /></button>
      </div>
      <div v-if="loading" class="skeleton-banner"></div>
      <div v-if="!loading && inProgressEvents.length > 0" class="banner-scroll" ref="bannerScrollRef">
        <article
          v-for="event in inProgressEvents"
          :key="event.id"
          class="banner-card"
          @click="openActivity(event.id)"
        >
          <div class="banner-card__bg">
            <img :src="event.cover_image_url" :alt="event.title" />
            <div class="banner-overlay" aria-hidden="true"></div>
          </div>
          <div class="banner-card__content">
            <div class="banner-top">
              <span class="banner-status" :style="{ background: getStatusColor(event.status) }">
                {{ event.status }}
              </span>
            </div>
            <h2 class="banner-title">{{ event.title }}</h2>
            <div class="banner-meta">
              <span class="banner-meta__item">
                <van-icon name="calendar-o" />{{ formatTime(event.event_start_time) }}
              </span>
              <span class="banner-meta__item">
                <van-icon name="location-o" />{{ event.event_address }}
              </span>
            </div>
            <div class="banner-footer">
              <div class="banner-participants">
                <div class="avatar-stack" aria-hidden="true">
                  <i></i><i></i><i></i>
                </div>
                <strong>{{ event.current_registrants }}/{{ event.max_registrants }}人</strong>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div v-if="!loading && inProgressEvents.length > 0" class="banner-dots" aria-hidden="true">
        <span
          v-for="(event, idx) in inProgressEvents"
          :key="event.id"
          class="banner-dots__item"
          :class="{ 'banner-dots__item--active': idx === activeBanner }"
        ></span>
      </div>
      <div v-if="!loading && inProgressEvents.length === 0" class="empty-banner">
        <van-icon name="clock-o" size="32" />
        <p>暂无进行中的活动</p>
      </div>
    </section>

    <section class="upcoming-section" aria-labelledby="upcoming-title">
      <div class="section-heading">
        <h2 id="upcoming-title">即将开始</h2>
        <button v-if="upcomingEvents.length > 0" type="button" @click="showMoreActivities">查看更多 <van-icon name="arrow" /></button>
      </div>

      <div v-if="loading" class="upcoming-list">
        <article v-for="n in 3" :key="n" class="upcoming-card skeleton-upcoming">
          <div class="date-block">
            <strong class="skeleton-block skeleton-block--date"></strong>
            <span class="skeleton-block skeleton-block--weekday"></span>
          </div>
          <div class="upcoming-card__cover">
            <div class="skeleton-block skeleton-block--cover"></div>
          </div>
          <div class="upcoming-card__content">
            <h3 class="skeleton-block skeleton-block--title"></h3>
            <p class="skeleton-block skeleton-block--text"></p>
            <p class="skeleton-block skeleton-block--text"></p>
          </div>
          <div class="upcoming-card__side">
            <strong class="skeleton-block skeleton-block--status"></strong>
            <span class="skeleton-block skeleton-block--count"></span>
          </div>
        </article>
      </div>
      <div v-if="!loading" class="upcoming-list">
        <article
          v-for="event in upcomingEvents"
          :key="event.id"
          class="upcoming-card"
          @click="openActivity(event.id)"
        >
          <div class="date-block">
            <strong>{{ formatDateBlock(event.event_start_time).date }}</strong>
            <span>{{ formatDateBlock(event.event_start_time).weekday }}</span>
          </div>
          <div class="upcoming-card__cover">
            <img :src="event.cover_image_url" :alt="event.title" />
          </div>
          <div class="upcoming-card__content">
            <h3>{{ event.title }}</h3>
            <p>{{ formatTime(event.event_start_time) }}</p>
            <p><van-icon name="location-o" />{{ event.event_address }}</p>
          </div>
          <div class="upcoming-card__side">
            <strong>{{ event.status }}</strong>
            <span>{{ event.current_registrants }}人报名</span>
          </div>
        </article>
      </div>
      <div v-if="!loading && upcomingEvents.length === 0" class="empty-state">
        <van-icon name="calendar-o" size="32" />
        <p>暂无即将开始的活动</p>
      </div>
    </section>

    <van-tabbar route safe-area-inset-bottom>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { getEventList } from '@/api/event'
import { useActivityStore } from '@/stores/activity'
import { useSearchStore } from '@/stores/search'
import { useMessageStore } from '@/stores/message'
import type { EventItem } from '@/types/event'

const router = useRouter()
const activityStore = useActivityStore()
const searchStore = useSearchStore()
const messageStore = useMessageStore()
const { active: searchActive, query: searchQuery, results: searchResults } = storeToRefs(searchStore)
const { unreadCount } = storeToRefs(messageStore)

// ── Data ──

const inProgressEvents = ref<EventItem[]>([])
const upcomingEvents = ref<EventItem[]>([])
const searchLoading = ref(false)
const loading = ref(false)

const fetchHomeData = async () => {
  loading.value = true
  try {
    const [inProgressRes, upcomingRes] = await Promise.all([
      getEventList({ event_status: 'InProgress', page_size: 5 }),
      getEventList({ event_status: 'NotBegun', page_size: 10 }),
    ])
    inProgressEvents.value = inProgressRes.data.list
    upcomingEvents.value = upcomingRes.data.list
  } catch {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}

// ── Helpers ──

const formatTime = (iso: string) => {
  const d = dayjs(iso)
  const now = dayjs()
  if (d.isSame(now, 'day')) return `今天 ${d.format('HH:mm')}`
  if (d.isSame(now.add(1, 'day'), 'day')) return `明天 ${d.format('HH:mm')}`
  return d.format('MM.DD HH:mm')
}

const formatDateBlock = (iso: string) => {
  const d = dayjs(iso)
  return {
    date: d.format('MM.DD'),
    weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.day()],
  }
}

const getStatusColor = (status: string) => {
  if (status.includes('进行')) return '#48ca81'
  if (status.includes('结束')) return '#9ba4b6'
  return '#ff9f43'
}

// ── Banner ──

const bannerScrollRef = ref<HTMLElement | null>(null)
const activeBanner = ref(0)

let scrollTimer: ReturnType<typeof setInterval> | null = null

const onBannerScroll = () => {
  const el = bannerScrollRef.value
  if (!el) return
  const idx = Math.round(el.scrollLeft / el.offsetWidth)
  if (idx !== activeBanner.value) activeBanner.value = idx
}

const teardownBannerScroll = () => {
  if (scrollTimer) {
    clearInterval(scrollTimer)
    scrollTimer = null
  }
  bannerScrollRef.value?.removeEventListener('scroll', onBannerScroll)
}

const setupBannerScroll = () => {
  const el = bannerScrollRef.value
  if (!el || inProgressEvents.value.length === 0) return
  // Clean up any existing instance first
  teardownBannerScroll()
  el.addEventListener('scroll', onBannerScroll, { passive: true })
  scrollTimer = setInterval(() => {
    if (!bannerScrollRef.value || inProgressEvents.value.length === 0) return
    const next = (activeBanner.value + 1) % inProgressEvents.value.length
    bannerScrollRef.value.scrollTo({ left: next * bannerScrollRef.value.offsetWidth, behavior: 'smooth' })
  }, 4000)
}

// Watch for banner data to setup scroll
watch(inProgressEvents, (val) => {
  if (val.length > 0) {
    setTimeout(setupBannerScroll, 100)
  }
})

// Keep-alive: pause auto-scroll when component is hidden, resume when visible
onDeactivated(() => {
  if (scrollTimer) {
    clearInterval(scrollTimer)
    scrollTimer = null
  }
})

onActivated(() => {
  // Resume banner auto-scroll if data is available
  if (inProgressEvents.value.length > 0 && !scrollTimer) {
    setupBannerScroll()
  }
})

onUnmounted(() => {
  teardownBannerScroll()
})

const showMoreActivities = () => {
  router.push({ name: 'activities' })
}

const openMessages = () => {
  router.push({ name: 'messages' })
}

const openActivity = (id: number) => {
  router.push({ name: 'activity-detail', params: { id } })
}

// ── Search ──

let searchDebounce: ReturnType<typeof setTimeout> | undefined

const hotSearchTags = ['技术', 'AI', '峰会', '创业', '音乐', '设计']

const openSearch = () => {
  searchStore.open()
}

const closeSearch = () => {
  searchStore.close()
}

const onSearchInput = () => {
  clearTimeout(searchDebounce)
  const q = searchQuery.value.trim()
  if (!q) {
    searchResults.value = []
    return
  }
  searchDebounce = setTimeout(async () => {
    searchLoading.value = true
    try {
      const res = await getEventList({ event_title: q, page_size: 20 })
      searchStore.cacheResults(q, res.data.list)
    } catch {
      // 错误已由拦截器处理
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

// ── 离开搜索页时，只保留去详情页的搜索状态 ──
onBeforeRouteLeave((to) => {
  if (to.name !== 'activity-detail') {
    searchStore.close()
  }
})

// ── 从 store 恢复搜索状态（从详情页返回时无需重新请求） ──
onMounted(() => {
  if (searchStore.active && searchStore.results.length > 0) {
    // store 中有缓存的搜索结果，直接展示
    searchActive.value = true
    searchQuery.value = searchStore.query
    searchResults.value = searchStore.results
  }
  fetchHomeData()
  messageStore.fetchUnreadCount()
})

// Keep-alive: 返回首页时只轻量刷新未读计数，不重新拉取活动数据
onActivated(() => {
  messageStore.fetchUnreadCount()
})

onUnmounted(() => {
  clearTimeout(searchDebounce)
})
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 46px 18px 88px;
  overflow-x: hidden;
  color: #101936;
  background: linear-gradient(180deg, #fbfdff 0%, #f7faff 48%, #f5f8fe 100%);
}

.top-bar {
  display: grid;
  height: 64px;
  grid-template-columns: minmax(0, 1fr) 42px;
  gap: 10px;
  align-items: center;
}

.search-box {
  display: flex;
  height: 54px;
  padding: 0 18px;
  align-items: center;
  gap: 10px;
  color: #9ba4b6;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(235, 241, 250, 0.9);
  border-radius: 999px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 12px 28px rgba(102, 122, 154, 0.1);

  .van-icon {
    font-size: 24px;
  }
}

.notice-button {
  position: relative;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  color: #16213b;
  font-size: 25px;
  background: transparent;
  border: 0;
}

.notice-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  background: #ff3b30;
  border-radius: 999px;
  box-shadow: 0 1px 4px rgba(255, 59, 48, 0.4);
}

// ── Search ──

.search-bar {
  margin-top: -6px;
}

.search-cancel-btn {
  padding: 4px 6px;
  color: #101936;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  border: 0;
}

.search-suggestions {
  padding: 20px 18px 0;
}

.suggest-title {
  margin: 0 0 14px;
  color: #101936;
  font-size: 16px;
  font-weight: 800;
}

.suggest-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.suggest-tag {
  padding: 8px 16px;
  color: #2f80ff;
  font-size: 14px;
  font-weight: 600;
  background: rgba(47, 128, 255, 0.06);
  border-radius: 999px;
  transition: background 0.2s ease;

  &:active {
    background: rgba(47, 128, 255, 0.16);
  }
}

.search-results {
  padding: 0 18px 32px;
}

.search-result-info {
  margin-bottom: 12px;
  color: #7d879a;
  font-size: 13px;
  line-height: 1.4;

  em {
    color: #2f80ff;
    font-weight: 800;
    font-style: normal;
  }
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 18px;
  text-align: center;
  color: #d5dbe6;

  p {
    margin: 16px 0 8px;
    color: #7d879a;
    font-size: 15px;
    font-weight: 600;
  }

  span {
    color: #9ba4b6;
    font-size: 13px;
  }
}

.search-result-list {
  display: grid;
  gap: 12px;
}

.search-result-card {
  display: grid;
  height: 108px;
  padding: 12px;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  background: #ffffff;
  border: 1px solid rgba(233, 238, 248, 0.9);
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(105, 121, 151, 0.08);
}

.search-result-card__cover {
  position: relative;
  width: 76px;
  height: 84px;
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

.search-result-card__status {
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 2px 6px;
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  line-height: 1.3;
  background: rgba(72, 202, 129, 0.9);
  border-radius: 999px;
}

.search-result-card__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  height: 84px;

  h3 {
    margin: 0;
    overflow: hidden;
    color: #101936;
    font-size: 15px;
    font-weight: 900;
    line-height: 1.32;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    display: flex;
    margin: 0;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    color: #7d879a;
    font-size: 12px;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;

    .van-icon {
      flex: 0 0 auto;
      font-size: 13px;
    }
  }
}

.search-result-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.search-result-card__category {
  padding: 2px 7px;
  color: #2f80ff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.3;
  background: rgba(47, 128, 255, 0.07);
  border-radius: 4px;
}

.search-result-card__price {
  color: #2f80ff;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;

  &--free {
    color: #48ca81;
  }
}

:deep(.van-search__content) {
  background: rgba(246, 248, 252, 0.95);
  border: 1px solid rgba(233, 238, 248, 0.9);
}

:deep(.van-search__action) {
  padding-right: 0;
}

// ── Activity Banner ──

.activity-banner {
  margin-top: 24px;
}

.banner-scroll {
  display: grid;
  grid-auto-columns: 100%;
  grid-auto-flow: column;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  border-radius: 20px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.banner-card {
  scroll-snap-align: start;
  position: relative;
  height: 0;
  padding-bottom: 68%;
  overflow: hidden;
  background: #dce3ed;
  border-radius: 20px;
}

.banner-card__bg {
  position: absolute;
  inset: 0;
  background-size: cover;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(16, 25, 54, 0.04) 0%,
    rgba(16, 25, 54, 0.12) 42%,
    rgba(16, 25, 54, 0.58) 78%,
    rgba(16, 25, 54, 0.78) 100%
  );
}

.banner-card__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px 18px 18px;
}

.banner-top {
  display: flex;
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  justify-content: space-between;
  align-items: center;
}

.banner-status {
  padding: 5px 10px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  background: rgba(72, 202, 129, 0.92);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(72, 202, 129, 0.36);
}

.banner-category {
  padding: 5px 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  background: rgba(16, 25, 54, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 999px;
}

.banner-title {
  margin: 0 0 8px;
  color: #ffffff;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: 0;
  text-shadow: 0 2px 8px rgba(16, 25, 54, 0.32);
}

.banner-summary {
  display: -webkit-box;
  margin: 0 0 12px;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-shadow: 0 1px 4px rgba(16, 25, 54, 0.28);
}

.banner-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 14px;
}

.banner-meta__item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(16, 25, 54, 0.24);

  .van-icon {
    font-size: 14px;
    flex: 0 0 auto;
  }
}

.banner-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.banner-participants {
  display: flex;
  align-items: center;
  gap: 8px;

  strong {
    color: rgba(255, 255, 255, 0.92);
    font-size: 13px;
    font-weight: 800;
    line-height: 1.2;
    text-shadow: 0 1px 3px rgba(16, 25, 54, 0.24);
  }
}

.banner-price {
  padding: 6px 12px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, rgba(47, 128, 255, 0.92) 0%, rgba(47, 116, 255, 0.88) 100%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(47, 116, 255, 0.34);

  &--free {
    background: linear-gradient(135deg, rgba(72, 202, 129, 0.92) 0%, rgba(56, 185, 110, 0.88) 100%);
    box-shadow: 0 2px 10px rgba(72, 202, 129, 0.34);
  }
}

// ── Banner Dots ──

.banner-dots {
  display: flex;
  height: 8px;
  margin-top: 14px;
  justify-content: center;
  gap: 10px;
}

.banner-dots__item {
  width: 8px;
  height: 8px;
  background: #d5dbe6;
  border-radius: 999px;
  transition: width 0.3s ease, background 0.3s ease;
}

.banner-dots__item--active {
  width: 20px;
  background: #2f80ff;
}

// ── Section headings ──

.upcoming-section {
  margin-top: 34px;
}

.section-heading {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h2 {
    margin: 0;
    color: #ef4444;
    font-size: 24px;
    font-weight: 900;
    line-height: 1.22;
    letter-spacing: 0;
  }

  button {
    display: inline-flex;
    padding: 0;
    align-items: center;
    gap: 4px;
    color: #8a93a6;
    font-size: 14px;
    background: transparent;
    border: 0;
  }
}

// ── Avatars ──

.avatar-stack {
  display: flex;

  i {
    width: 20px;
    height: 20px;
    margin-left: -6px;
    background:
      radial-gradient(circle at 50% 34%, #ffe0c8 0 25%, transparent 26%),
      linear-gradient(180deg, #293854 0 46%, #eaf1ff 47%);
    border: 2px solid #ffffff;
    border-radius: 999px;

    &:first-child {
      margin-left: 0;
    }
  }
}

.upcoming-list {
  display: grid;
  gap: 12px;
}

.upcoming-card {
  display: grid;
  height: 118px;
  padding: 14px;
  grid-template-columns: 56px 96px minmax(0, 1fr) 54px;
  gap: 12px;
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(233, 238, 248, 0.9);
  border-radius: 18px;
  box-shadow: 0 14px 30px rgba(105, 121, 151, 0.1);
}

.date-block {
  display: grid;
  align-content: center;
  gap: 10px;

  strong {
    color: #101936;
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
  }

  span {
    color: #7d879a;
    font-size: 15px;
    line-height: 1;
  }
}

.upcoming-card__cover {
  width: 96px;
  height: 72px;
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

.upcoming-card__content {
  min-width: 0;

  h3 {
    margin: 0 0 9px;
    overflow: hidden;
    color: #101936;
    font-size: 15px;
    font-weight: 900;
    line-height: 1.32;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0;
  }

  p {
    display: flex;
    margin: 5px 0 0;
    align-items: center;
    gap: 5px;
    overflow: hidden;
    color: #7d879a;
    font-size: 12px;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.upcoming-card__side {
  display: grid;
  height: 72px;
  align-content: end;
  justify-items: end;
  gap: 18px;

  strong {
    color: #ff4e1f;
    font-size: 14px;
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
  }

  span {
    color: #7d879a;
    font-size: 11px;
    line-height: 1.2;
    white-space: nowrap;
  }
}

:deep(.van-tabbar) {
  height: 64px;
  border-top: 0;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 -10px 28px rgba(105, 121, 151, 0.12);
  backdrop-filter: blur(18px);
}

:deep(.van-tabbar-item) {
  color: #8a93a6;
}

:deep(.van-tabbar-item--active) {
  color: #ef4444;
}

.search-result-card__participants {
  color: #7d879a;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

// ── Skeleton ──

@keyframes skeleton-shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton-block {
  display: block;
  border-radius: 6px;
  background: linear-gradient(90deg, #eef1f4 25%, #e2e5e9 37%, #eef1f4 63%);
  background-size: 200px 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.skeleton-banner {
  width: 100%;
  padding-bottom: 68%;
  border-radius: 20px;
  background: linear-gradient(90deg, #eef1f4 25%, #e2e5e9 37%, #eef1f4 63%);
  background-size: 200px 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.skeleton-upcoming {
  pointer-events: none;

  .skeleton-block--date {
    width: 40px;
    height: 20px;
    margin-bottom: 10px;
  }
  .skeleton-block--weekday {
    width: 28px;
    height: 15px;
  }
  .skeleton-block--cover {
    width: 100%;
    height: 100%;
  }
  .skeleton-block--title {
    width: 80%;
    height: 15px;
    margin-bottom: 9px;
  }
  .skeleton-block--text {
    width: 60%;
    height: 12px;
    margin-top: 5px;
  }
  .skeleton-block--status {
    width: 36px;
    height: 14px;
  }
  .skeleton-block--count {
    width: 48px;
    height: 11px;
    margin-top: 18px;
  }
}

.empty-banner,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  color: #c3cad3;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 18px;

  p {
    margin: 10px 0 0;
    color: #7d879a;
    font-size: 14px;
    font-weight: 600;
  }
}

.empty-banner {
  min-height: 220px;
}

@media (max-width: 389px) {
  .home-page {
    padding-right: 16px;
    padding-left: 16px;
  }

  .upcoming-card {
    grid-template-columns: 52px 88px minmax(0, 1fr) 48px;
    gap: 10px;
    padding: 12px;
  }

  .upcoming-card__cover {
    width: 88px;
    height: 68px;
  }

  .upcoming-card__side {
    height: 68px;
  }
}
</style>
