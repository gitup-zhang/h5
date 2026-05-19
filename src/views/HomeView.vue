<template>
  <main class="home-page">
    <section class="activity-hero">
      <p class="activity-hero__tag">H5 Activity</p>
      <h1>活动首页</h1>
      <p class="activity-hero__desc">Vue 3 + Vite + TypeScript 移动端活动基座已就绪。</p>
      <van-button type="primary" block round @click="increase">立即参与</van-button>
    </section>

    <section class="activity-panel">
      <div>
        <span class="activity-panel__label">参与次数</span>
        <strong>{{ activityStore.joinCount }}</strong>
      </div>
      <van-tag type="success">Vant Ready</van-tag>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useActivityStore } from '@/stores/activity'

const activityStore = useActivityStore()

const increase = () => {
  activityStore.increaseJoinCount()
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  padding: 24px 16px;
  background: linear-gradient(180deg, rgba(250, 64, 52, 0.1), transparent 240px), #f7f8fa;
}

.activity-hero {
  padding: 28px 20px 24px;
  color: #111827;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);

  h1 {
    margin: 8px 0 10px;
    font-size: 30px;
    line-height: 1.2;
  }
}

.activity-hero__tag {
  margin: 0;
  color: #ee0a24;
  font-size: 14px;
  font-weight: 600;
}

.activity-hero__desc {
  margin: 0 0 24px;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.6;
}

.activity-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;

  strong {
    display: block;
    margin-top: 4px;
    color: #111827;
    font-size: 24px;
  }
}

.activity-panel__label {
  color: #6b7280;
  font-size: 13px;
}
</style>
