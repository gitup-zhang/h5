<template>
  <main class="mine-page">
    <section class="profile-panel" aria-labelledby="profile-name">
      <div class="profile-panel__avatar">{{ activityStore.profile.avatarText }}</div>
      <div class="profile-panel__info">
        <p>{{ activityStore.profile.level }}</p>
        <h1 id="profile-name">{{ activityStore.profile.nickname }}</h1>
        <span>{{ activityStore.profile.mobile }} · {{ activityStore.profile.slogan }}</span>
      </div>
    </section>

    <section class="stats-grid" aria-label="活动统计">
      <article v-for="stat in stats" :key="stat.label" class="stat-card">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </article>
    </section>

    <section class="mine-section" aria-labelledby="mine-activity-title">
      <div class="section-heading">
        <h2 id="mine-activity-title">我的活动</h2>
        <span>{{ activityStore.joinedActivities.length }} 场</span>
      </div>

      <div v-if="activityStore.joinedActivities.length" class="joined-list">
        <article
          v-for="activity in activityStore.joinedActivities"
          :key="activity.id"
          class="joined-card"
        >
          <div class="joined-card__date">
            <span>{{ activity.startTime.slice(0, 3) }}</span>
            <strong>{{ activity.startTime.slice(3, 6) }}</strong>
          </div>
          <div class="joined-card__content">
            <h3>{{ activity.title }}</h3>
            <p><van-icon name="clock-o" />{{ activity.startTime }} - {{ activity.endTime }}</p>
            <p><van-icon name="location-o" />{{ activity.location }}</p>
          </div>
          <span class="joined-card__status">{{ activity.status === 'finished' ? '已完成' : '待参加' }}</span>
        </article>
      </div>

      <van-empty v-else image-size="72" description="暂无报名活动" />
    </section>

    <section class="mine-section" aria-labelledby="quick-title">
      <div class="section-heading">
        <h2 id="quick-title">常用服务</h2>
      </div>

      <div class="quick-list">
        <button v-for="item in quickActions" :key="item.label" type="button" class="quick-item">
          <span><van-icon :name="item.icon" />{{ item.label }}</span>
          <van-icon name="arrow" />
        </button>
      </div>
    </section>

    <van-tabbar route safe-area-inset-bottom>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useActivityStore } from '@/stores/activity'

const activityStore = useActivityStore()

const stats = computed(() => [
  { label: '已报名', value: activityStore.joinedActivities.length },
  { label: '待参加', value: activityStore.upcomingJoinedActivities.length },
  { label: '已完成', value: activityStore.completedActivities.length },
  { label: '收藏', value: activityStore.favoriteActivities.length },
])

const quickActions = [
  { label: '我的收藏', icon: 'star-o' },
  { label: '活动日历', icon: 'calendar-o' },
  { label: '消息通知', icon: 'bell' },
  { label: '联系客服', icon: 'service-o' },
  { label: '设置', icon: 'setting-o' },
]
</script>

<style scoped lang="scss">
.mine-page {
  min-height: 100vh;
  padding: 18px 16px 86px;
  background: #f5f5f3;
  color: #111111;
}

.profile-panel {
  display: flex;
  padding: 20px;
  align-items: center;
  gap: 16px;
  color: #ffffff;
  background: #111111;
  border-radius: 8px;
}

.profile-panel__avatar {
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  place-items: center;
  color: #111111;
  font-size: 24px;
  font-weight: 900;
  background: #f3f1ec;
  border-radius: 8px;
}

.profile-panel__info {
  min-width: 0;

  p {
    margin: 0 0 6px;
    color: #cfc8bc;
    font-size: 12px;
    font-weight: 800;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.25;
    letter-spacing: 0;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #cfc8bc;
    font-size: 12px;
    line-height: 1.5;
  }
}

.stats-grid {
  display: grid;
  margin-top: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.stat-card {
  min-height: 72px;
  padding: 12px 4px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #ece9e3;
  border-radius: 8px;

  strong {
    display: block;
    font-size: 22px;
    line-height: 1.2;
  }

  span {
    display: block;
    margin-top: 6px;
    color: #77736b;
    font-size: 12px;
  }
}

.mine-section {
  margin-top: 26px;
}

.section-heading {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h2 {
    margin: 0;
    font-size: 19px;
    line-height: 1.3;
    letter-spacing: 0;
  }

  span {
    color: #77736b;
    font-size: 13px;
  }
}

.joined-list,
.quick-list {
  display: grid;
  gap: 10px;
}

.joined-card {
  display: grid;
  padding: 14px;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 12px;
  position: relative;
  background: #ffffff;
  border: 1px solid #ece9e3;
  border-radius: 8px;
}

.joined-card__date {
  display: grid;
  height: 54px;
  place-items: center;
  color: #111111;
  background: #f3f1ec;
  border-radius: 8px;

  span,
  strong {
    display: block;
    line-height: 1;
  }

  span {
    color: #77736b;
    font-size: 12px;
  }

  strong {
    font-size: 18px;
  }
}

.joined-card__content {
  min-width: 0;
  padding-right: 56px;

  h3 {
    margin: 0 0 8px;
    font-size: 16px;
    line-height: 1.35;
    letter-spacing: 0;
  }

  p {
    display: flex;
    margin: 5px 0 0;
    align-items: center;
    gap: 6px;
    color: #77736b;
    font-size: 12px;
    line-height: 1.45;
  }
}

.joined-card__status {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 4px 7px;
  color: #111111;
  font-size: 11px;
  font-weight: 800;
  background: #f3f1ec;
  border-radius: 6px;
}

.quick-item {
  display: flex;
  height: 52px;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
  color: #111111;
  font-size: 15px;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #ece9e3;
  border-radius: 8px;

  span {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  > .van-icon {
    color: #9b9488;
  }
}

:deep(.van-empty) {
  padding: 24px 0;
  background: #ffffff;
  border: 1px solid #ece9e3;
  border-radius: 8px;
}

:deep(.van-tabbar) {
  border-top: 1px solid #ece9e3;
}

:deep(.van-tabbar-item--active) {
  color: #111111;
}

@media (min-width: 480px) {
  .mine-page {
    max-width: 430px;
    margin: 0 auto;
  }
}
</style>
