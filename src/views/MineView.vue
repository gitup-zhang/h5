<template>
  <main class="mine-page">
    <div class="top-row">
      <span class="greeting">{{ greeting }}</span>
      <button type="button" class="settings-btn" aria-label="账号设置" @click="openSettings">
        <van-icon name="setting-o" size="20" />
      </button>
    </div>

    <!-- ── 个人信息卡片 ── -->
    <section class="profile-card">
      <div class="profile-card__identity">
        <div class="avatar">{{ userStore.avatarText }}</div>
        <div class="profile-card__identity-main">
          <div class="name-row">
            <h1>{{ displayName }}</h1>
            <span v-if="profile?.gender" class="gender-badge" :class="genderBadgeClass">
              {{ userStore.displayGender }}
            </span>
          </div>
          <p class="phone-row">{{ userStore.displayMobile }}</p>
          <span class="role-tag">{{ userStore.displayRole }}</span>
        </div>
      </div>

      <hr class="profile-card__divider" />

      <div v-if="profile?.industry_name" class="profile-card__details">
        <div class="detail-row">
          <span class="detail-row__label">行业</span>
          <span class="detail-row__value">{{ profile.industry_name }}</span>
        </div>
      </div>

      <div v-if="profile?.fields && profile.fields.length" class="profile-card__tags">
        <span v-for="f in profile.fields" :key="f.field_code" class="tag-item">
          {{ f.field_name }}
        </span>
      </div>
    </section>

    <!-- ── 活动统计 ── -->
    <section class="stats-card" aria-label="活动统计">
      <h2>活动统计</h2>
      <div class="stats-grid">
        <article v-for="stat in stats" :key="stat.label">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </article>
      </div>
    </section>

    <!-- ── 我的报名 ── -->
    <section class="activity-section">
      <div class="section-head">
        <h2>我的报名</h2>
        <span>{{ myEvents.length }} 场</span>
      </div>

      <div v-if="myEventsPreview.length" class="activity-list">
        <button
          v-for="event in myEventsPreview"
          :key="event.id"
          type="button"
          class="activity-item"
          @click="openActivity(event.id)"
        >
          <img :src="event.cover_image_url" :alt="event.title" />
          <div class="activity-info">
            <div class="activity-title">
              <h3>{{ event.title }}</h3>
              <span>{{ event.status.includes('结束') ? '已完成' : '待参加' }}</span>
            </div>
            <p><van-icon name="calendar-o" />{{ formatTime(event.event_start_time) }}</p>
            <p><van-icon name="location-o" />{{ event.event_address }}</p>
          </div>
        </button>
      </div>

      <div v-else class="empty-state">
        <van-icon name="calendar-o" />
        <p>暂无报名活动</p>
      </div>

      <button
        v-if="myEvents.length > 2"
        type="button"
        class="more-button"
        @click="openActivityList('joined')"
      >
        查看更多 <van-icon name="arrow" />
      </button>
    </section>

    <van-tabbar route safe-area-inset-bottom>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

import { useActivityStore } from '@/stores/activity'
import { useUserStore } from '@/stores/user'

type ListType = 'joined'

const router = useRouter()
const activityStore = useActivityStore()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)

const myEvents = computed(() => activityStore.myEvents)
const myEventsPreview = computed(() => myEvents.value.slice(0, 2))

const displayName = computed(() => profile.value?.name || profile.value?.nickname || '未设置')

const genderBadgeClass = computed(() => {
  const code = profile.value?.gender_code
  if (code === 'M') return 'gender-badge--male'
  if (code === 'F') return 'gender-badge--female'
  return ''
})

const stats = computed(() => [
  { label: '已报名', value: activityStore.myEventsTotal },
  { label: '待参加', value: myEvents.value.filter((e) => !e.status.includes('结束')).length },
  { label: '已完成', value: myEvents.value.filter((e) => e.status.includes('结束')).length },
])

const formatTime = (iso: string) => {
  const d = dayjs(iso)
  const now = dayjs()
  if (d.isSame(now, 'day')) return `今天 ${d.format('HH:mm')}`
  return d.format('MM.DD HH:mm')
}

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好 ☀️'
  if (hour < 18) return '下午好 🌤️'
  return '晚上好 🌙'
})

onMounted(() => {
  if (!userStore.profile) {
    userStore.fetchProfile()
  }
  activityStore.fetchMyRegistrations({ page_size: 3 })
})

const openSettings = () => {
  router.push({ name: 'mine-settings' })
}

const openActivity = (id: number) => {
  router.push({ name: 'activity-detail', params: { id } })
}

const openActivityList = (type: ListType) => {
  router.push({ name: 'mine-activity-list', params: { type } })
}
</script>

<style scoped lang="scss">
.mine-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 18px 16px 88px;
  color: #111827;
  background: #f7f8fa;
}

// ── Top row ──

.top-row {
  display: flex;
  padding: 0 2px 14px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.greeting {
  color: #7d879a;
  font-size: 14px;
  font-weight: 600;
}

.settings-btn {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  color: #536076;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(233, 238, 248, 0.9);
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(105, 121, 151, 0.08);
  transition: all 0.2s ease;

  &:active {
    color: #2f80ff;
    background: rgba(47, 128, 255, 0.06);
    border-color: rgba(47, 128, 255, 0.2);
    box-shadow: 0 2px 6px rgba(47, 128, 255, 0.12);
  }
}

// ── Profile card ──

.profile-card {
  padding: 22px 20px 20px;
  background: #ffffff;
  border: 1px solid rgba(233, 238, 248, 0.9);
  border-radius: 20px;
  box-shadow: 0 10px 28px rgba(105, 121, 151, 0.08);
}

.profile-card__identity {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 14px;
  align-items: flex-start;
}

.avatar {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  color: #ffffff;
  font-size: 26px;
  font-weight: 900;
  background: linear-gradient(135deg, #4ba0ff 0%, #2f74ff 100%);
  border-radius: 18px;
  box-shadow: 0 6px 16px rgba(47, 116, 255, 0.22);
}

.profile-card__identity-main {
  min-width: 0;

  .name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h1 {
    margin: 0;
    overflow: hidden;
    color: #101936;
    font-size: 20px;
    font-weight: 900;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0;
  }

  .phone-row {
    margin: 6px 0 0;
    color: #7d879a;
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

.profile-card__divider {
  height: 1px;
  margin: 16px 0;
  background: #eceff3;
  border: 0;
}

.profile-card__details {
  display: grid;
  gap: 10px;
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 14px;
  line-height: 1.4;

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
}

.profile-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.tag-item {
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

// ── Stats & Activity (unchanged layout) ──

.stats-card,
.activity-section {
  margin-top: 14px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #eceff3;
  border-radius: 18px;
}

.stats-card > h2,
.section-head h2 {
  margin: 0;
  color: #111827;
  font-size: 17px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: 0;
}

.stats-grid {
  display: grid;
  margin-top: 14px;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  article {
    display: grid;
    min-height: 72px;
    place-items: center;
    align-content: center;
    gap: 8px;
    background: #f9fafb;
    border-radius: 14px;
  }

  strong {
    color: #111827;
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
  }

  span {
    color: #6b7280;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
  }
}

.section-head {
  display: flex;
  margin-bottom: 14px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  span {
    color: #6b7280;
    font-size: 13px;
    line-height: 1;
  }
}

.activity-list {
  display: grid;
  gap: 10px;
}

.activity-item {
  display: grid;
  width: 100%;
  padding: 0;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  text-align: left;
  background: transparent;
  border: 0;

  + .activity-item {
    padding-top: 10px;
    border-top: 1px solid #eef1f4;
  }

  img {
    width: 76px;
    height: 76px;
    display: block;
    object-fit: cover;
    background: #eef1f4;
    border-radius: 14px;
  }
}

.activity-info {
  min-width: 0;

  p {
    display: flex;
    margin: 7px 0 0;
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

  h3 {
    margin: 0;
    overflow: hidden;
    color: #111827;
    font-size: 15px;
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

.more-button {
  display: flex;
  width: 100%;
  height: 42px;
  margin-top: 14px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #111827;
  font-size: 14px;
  font-weight: 900;
  background: #f9fafb;
  border: 1px solid #eef1f4;
  border-radius: 12px;
}

.empty-state {
  display: flex;
  min-height: 110px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c3cad3;
  background: #f9fafb;
  border-radius: 14px;

  .van-icon {
    font-size: 28px;
  }

  p {
    margin: 9px 0 0;
    color: #6b7280;
    font-size: 13px;
    font-weight: 700;
  }
}

:deep(.van-tabbar) {
  height: 64px;
  border-top: 1px solid #eceff3;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

:deep(.van-tabbar-item) {
  color: #6b7280;
}

:deep(.van-tabbar-item--active) {
  color: #ef4444;
}
</style>
