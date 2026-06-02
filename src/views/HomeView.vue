<template>
  <main class="home-page">
    <section class="top-bar" aria-label="搜索活动">
      <div class="search-box">
        <van-icon name="search" />
        <span>搜索活动、地点</span>
      </div>
      <button class="notice-button" type="button" aria-label="消息通知">
        <van-icon name="bell" />
      </button>
    </section>

    <section class="hero-banner" aria-labelledby="hero-title">
      <div class="hero-copy">
        <h1 id="hero-title">
          遇见美好
          <span>一起去<em>活动</em></span>
        </h1>
        <p>发现有趣的活动，遇见志同道合的朋友</p>
        <button type="button">探索活动 <van-icon name="arrow" /></button>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="hero-cloud hero-cloud--one"></span>
        <span class="hero-cloud hero-cloud--two"></span>
        <span class="hero-hill hero-hill--back"></span>
        <span class="hero-hill hero-hill--front"></span>
        <span class="hero-person hero-person--one"></span>
        <span class="hero-person hero-person--two"></span>
        <span class="hero-tent"></span>
      </div>
    </section>

    <div class="hero-dots" aria-hidden="true">
      <span class="hero-dots__item hero-dots__item--active"></span>
      <span class="hero-dots__item"></span>
      <span class="hero-dots__item"></span>
      <span class="hero-dots__item"></span>
    </div>

    <section class="running-section" aria-labelledby="running-title">
      <div class="section-heading">
        <h2 id="running-title">正在进行</h2>
        <button type="button">查看更多 <van-icon name="arrow" /></button>
      </div>

      <div class="running-scroll">
        <article
          v-for="activity in activityStore.featuredActivities"
          :key="activity.id"
          class="running-card"
        >
          <div class="running-card__cover" :style="{ background: activity.cover }">
            <img :src="activity.coverUrl" :alt="activity.title" />
            <span>{{ getStatusText(activity) }}</span>
          </div>
          <div class="running-card__body">
            <h3>{{ activity.title }}</h3>
            <p><van-icon name="calendar-o" />{{ activity.startTime }}</p>
            <p><van-icon name="location-o" />{{ activity.location }}</p>
            <div class="participant-row">
              <div class="avatar-stack" aria-hidden="true">
                <i></i>
                <i></i>
                <i></i>
              </div>
              <strong>{{ activity.participants }}人参与</strong>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="upcoming-section" aria-labelledby="upcoming-title">
      <div class="section-heading">
        <h2 id="upcoming-title">即将开始</h2>
        <button type="button">查看更多 <van-icon name="arrow" /></button>
      </div>

      <div class="upcoming-list">
        <article
          v-for="activity in activityStore.upcomingActivities"
          :key="activity.id"
          class="upcoming-card"
        >
          <div class="date-block">
            <strong>{{ activity.startTime.slice(0, 5) }}</strong>
            <span>{{ activity.weekday }}</span>
          </div>
          <div class="upcoming-card__cover" :style="{ background: activity.cover }">
            <img :src="activity.coverUrl" :alt="activity.title" />
          </div>
          <div class="upcoming-card__content">
            <h3>{{ activity.title }}</h3>
            <p>{{ activity.startTime }} {{ activity.weekday }}</p>
            <p><van-icon name="location-o" />{{ activity.location }}</p>
          </div>
          <div class="upcoming-card__side">
            <strong>{{ getStatusText(activity) }}</strong>
            <span>{{ activity.participants }}人报名</span>
          </div>
        </article>
      </div>
    </section>

    <van-tabbar route safe-area-inset-bottom>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </main>
</template>

<script setup lang="ts">
import { useActivityStore, type ActivityItem } from '@/stores/activity'

const activityStore = useActivityStore()

const getStatusText = (activity: ActivityItem) => {
  if (activityStore.isJoined(activity.id)) {
    return '进行中'
  }

  const statusMap: Record<ActivityItem['status'], string> = {
    hot: '进行中',
    soon: '报名中',
    joined: '进行中',
    finished: '已结束',
  }

  return statusMap[activity.status]
}
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
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  color: #16213b;
  font-size: 25px;
  background: transparent;
  border: 0;
}

.hero-banner {
  height: 178px;
  margin-top: 24px;
  padding: 28px 24px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 76% 18%, rgba(255, 255, 255, 0.96) 0 15%, transparent 16%),
    linear-gradient(135deg, #eaf6ff 0%, #dff0ff 48%, #e9f8e8 100%);
  border: 1px solid rgba(226, 237, 250, 0.9);
  border-radius: 18px;
  box-shadow: 0 18px 38px rgba(86, 124, 172, 0.14);
}

.hero-copy {
  width: 55%;
  position: relative;
  z-index: 2;

  h1 {
    margin: 0;
    color: #101936;
    font-size: 30px;
    font-weight: 900;
    line-height: 1.28;
    letter-spacing: 0;

    span {
      display: block;
    }

    em {
      color: #2f80ff;
      font-style: normal;
    }
  }

  p {
    margin: 15px 0 0;
    color: #536076;
    font-size: 13px;
    line-height: 1.55;
  }

  button {
    display: inline-flex;
    width: 76px;
    height: 36px;
    margin-top: 18px;
    padding: 0;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    background: linear-gradient(135deg, #4ba0ff 0%, #2f74ff 100%);
    border: 0;
    border-radius: 999px;
    box-shadow: 0 10px 18px rgba(47, 116, 255, 0.28);
  }
}

.hero-art {
  width: 45%;
  position: absolute;
  inset: 0 0 0 auto;
  z-index: 1;
}

.hero-cloud,
.hero-hill,
.hero-person,
.hero-tent {
  display: block;
  position: absolute;
}

.hero-cloud {
  height: 24px;
  background: rgba(255, 255, 255, 0.76);
  border-radius: 999px;
}

.hero-cloud--one {
  width: 72px;
  top: 28px;
  right: 62px;
}

.hero-cloud--two {
  width: 52px;
  top: 54px;
  right: 14px;
}

.hero-hill {
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(101, 181, 121, 0.9), rgba(99, 168, 114, 0.55));
  border-radius: 60% 0 0 0;
}

.hero-hill--back {
  width: 140px;
  height: 74px;
  opacity: 0.56;
}

.hero-hill--front {
  width: 176px;
  height: 58px;
}

.hero-person {
  bottom: 36px;
  width: 20px;
  height: 44px;
  background: linear-gradient(180deg, #f5bd76 0 42%, #2f80ff 43%);
  border-radius: 999px 999px 10px 10px;
}

.hero-person::before {
  width: 14px;
  height: 14px;
  position: absolute;
  top: -11px;
  left: 3px;
  content: '';
  background: #253149;
  border-radius: 999px;
}

.hero-person--one {
  right: 104px;
}

.hero-person--two {
  right: 70px;
  bottom: 30px;
  transform: scale(0.84);
  background: linear-gradient(180deg, #ffffff 0 42%, #79b7ff 43%);
}

.hero-tent {
  right: 8px;
  bottom: 22px;
  width: 74px;
  height: 50px;
  background: linear-gradient(135deg, #f6d29d 0 50%, #d9a96f 51%);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  opacity: 0.9;
}

.hero-dots {
  display: flex;
  height: 8px;
  margin-top: 14px;
  justify-content: center;
  gap: 10px;
}

.hero-dots__item {
  width: 8px;
  height: 8px;
  background: #d5dbe6;
  border-radius: 999px;
}

.hero-dots__item--active {
  width: 18px;
  background: #2f80ff;
}

.running-section {
  margin-top: 32px;
}

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
    color: #101936;
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

.running-scroll {
  display: grid;
  grid-auto-columns: calc((min(100vw, 430px) - 60px) / 3);
  grid-auto-flow: column;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.running-card {
  height: 184px;
  overflow: hidden;
  scroll-snap-align: start;
  background: #ffffff;
  border: 1px solid rgba(233, 238, 248, 0.9);
  border-radius: 14px;
  box-shadow: 0 13px 28px rgba(105, 121, 151, 0.12);
}

.running-card__cover {
  height: 86px;
  position: relative;
  overflow: hidden;
  background-size: cover;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  span {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 4px 8px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    background: rgba(72, 202, 129, 0.94);
    border-radius: 999px;
  }
}

.running-card__body {
  height: 98px;
  padding: 10px;

  h3 {
    height: 34px;
    margin: 0 0 7px;
    overflow: hidden;
    color: #101936;
    font-size: 13px;
    font-weight: 900;
    line-height: 1.32;
    letter-spacing: 0;
  }

  p {
    display: flex;
    margin: 4px 0 0;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    color: #7d879a;
    font-size: 11px;
    line-height: 1.22;
    text-overflow: ellipsis;
    white-space: nowrap;

    .van-icon {
      flex: 0 0 auto;
    }
  }
}

.participant-row {
  display: flex;
  margin-top: 9px;
  align-items: center;
  justify-content: space-between;
  gap: 6px;

  strong {
    color: #2f80ff;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.2;
    white-space: nowrap;
  }
}

.avatar-stack {
  display: flex;

  i {
    width: 18px;
    height: 18px;
    margin-left: -5px;
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
  color: #2f80ff;
}

@media (max-width: 389px) {
  .home-page {
    padding-right: 16px;
    padding-left: 16px;
  }

  .running-scroll {
    grid-auto-columns: calc((100vw - 56px) / 3);
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
