<template>
  <main class="not-found-page">
    <van-empty description="页面不存在">
      <van-button type="primary" round to="/">返回首页</van-button>
    </van-empty>
  </main>
</template>

<style scoped lang="scss">
.not-found-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
}
</style>
