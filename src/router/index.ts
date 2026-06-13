import { createRouter, createWebHashHistory } from 'vue-router'
import { http } from '@/api/http'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: '活动首页',
      },
    },
    {
      path: '/activities',
      name: 'activities',
      component: () => import('@/views/ActivitiesView.vue'),
      meta: {
        title: '全部活动',
      },
    },
    {
      path: '/activities/:id',
      name: 'activity-detail',
      component: () => import('@/views/ActivityDetailView.vue'),
      meta: {
        title: '活动详情',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        title: '登录',
      },
    },
    {
      path: '/mine',
      name: 'mine',
      component: () => import('@/views/MineView.vue'),
      meta: {
        title: '我的',
        requiresAuth: true,
      },
    },
    {
      path: '/mine/settings',
      name: 'mine-settings',
      component: () => import('@/views/MineSettingsView.vue'),
      meta: {
        title: '个人信息',
        requiresAuth: true,
      },
    },
    {
      path: '/mine/activities/:type',
      name: 'mine-activity-list',
      component: () => import('@/views/MineActivityListView.vue'),
      meta: {
        title: '我的活动',
        requiresAuth: true,
      },
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('@/views/MessagesView.vue'),
      meta: {
        title: '消息中心',
        requiresAuth: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: '页面不存在',
      },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${String(to.meta.title || import.meta.env.VITE_APP_TITLE)}`

  // 需要登录的路由，未登录跳转登录页
  if (to.meta.requiresAuth) {
    const token = http.getToken()
    if (!token) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  // 已登录用户访问登录页，重定向到首页
  if (to.name === 'login') {
    const token = http.getToken()
    if (token) {
      next({ path: '/' })
      return
    }
  }

  next()
})

export default router
