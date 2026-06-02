import { defineStore } from 'pinia'

export type ActivityStatus = 'hot' | 'soon' | 'joined' | 'finished'

export interface ActivityItem {
  id: string
  title: string
  category: string
  cover: string
  coverUrl: string
  status: ActivityStatus
  startTime: string
  endTime: string
  weekday: string
  location: string
  price: number
  participants: number
  quota: number
  tags: string[]
  summary: string
  isFeatured: boolean
}

export interface UserProfile {
  nickname: string
  mobile: string
  avatarText: string
  level: string
  slogan: string
}

const activities: ActivityItem[] = [
  {
    id: 'a1001',
    title: '周末露营 | 山野之约',
    category: '户外',
    cover: 'linear-gradient(135deg, #d7e8d4 0%, #8aa27d 100%)',
    coverUrl:
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=640&q=80',
    status: 'hot',
    startTime: '今天 09:00',
    endTime: '今天 18:00',
    weekday: '周六',
    location: '北京市 · 怀柔区',
    price: 98,
    participants: 32,
    quota: 48,
    tags: ['露营', '山野', '周末'],
    summary: '湖边营地集合，轻徒步、野餐和日落围炉一次安排。',
    isFeatured: true,
  },
  {
    id: 'a1002',
    title: '夏日音乐节 · 热爱现场',
    category: '演出',
    cover: 'linear-gradient(135deg, #23243a 0%, #8668d9 100%)',
    coverUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=640&q=80',
    status: 'hot',
    startTime: '今天 18:30',
    endTime: '今天 22:00',
    weekday: '周六',
    location: '北京 · 世园公园',
    price: 199,
    participants: 112,
    quota: 180,
    tags: ['音乐节', '现场', '夏日'],
    summary: '多组乐队轮番登场，和朋友一起进入夏日现场。',
    isFeatured: true,
  },
  {
    id: 'a1003',
    title: '油画体验课 · 绘出色彩',
    category: '艺术',
    cover: 'linear-gradient(135deg, #e8dfd5 0%, #9f8f7d 100%)',
    coverUrl:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=640&q=80',
    status: 'joined',
    startTime: '今天 14:00',
    endTime: '今天 16:30',
    weekday: '周六',
    location: '北京 · 朝阳区艺术空间',
    price: 128,
    participants: 18,
    quota: 24,
    tags: ['油画', '体验课', '创作'],
    summary: '零基础也能完成一幅小尺寸油画，现场提供全部材料。',
    isFeatured: true,
  },
  {
    id: 'a1004',
    title: '城市夜跑计划',
    category: '运动',
    cover: 'linear-gradient(135deg, #dfe8d6 0%, #8e9c71 100%)',
    coverUrl:
      'https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=640&q=80',
    status: 'soon',
    startTime: '05.25 19:30',
    endTime: '05.25 21:00',
    weekday: '周六',
    location: '北京市 · 望京公园',
    price: 0,
    participants: 24,
    quota: 40,
    tags: ['夜跑', '健身', '社交'],
    summary: '5 公里轻松配速，终点设置能量补给和拉伸指导。',
    isFeatured: false,
  },
  {
    id: 'a1005',
    title: '读书分享会 · 好书共读',
    category: '生活',
    cover: 'linear-gradient(135deg, #ded7cf 0%, #a07854 100%)',
    coverUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=640&q=80',
    status: 'soon',
    startTime: '05.26 15:00',
    endTime: '05.26 17:00',
    weekday: '周日',
    location: '北京市 · 三里屯',
    price: 0,
    participants: 16,
    quota: 30,
    tags: ['读书', '分享', '咖啡'],
    summary: '带一本近期喜欢的书，交换观点，也交换下一本书单。',
    isFeatured: false,
  },
  {
    id: 'a1006',
    title: '多肉植物 DIY 体验',
    category: '手作',
    cover: 'linear-gradient(135deg, #e5ded0 0%, #7f9b75 100%)',
    coverUrl:
      'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=640&q=80',
    status: 'soon',
    startTime: '05.27 10:00',
    endTime: '05.27 11:30',
    weekday: '周一',
    location: '北京市 · 朝阳大悦城',
    price: 68,
    participants: 12,
    quota: 20,
    tags: ['手作', '植物', '生活'],
    summary: '挑选多肉和器皿，完成一盆适合桌面的治愈小景。',
    isFeatured: false,
  },
]

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities,
    joinedActivityIds: ['a1003'] as string[],
    favoriteActivityIds: ['a1002', 'a1003'] as string[],
    profile: {
      nickname: '活动玩家',
      mobile: '138****2026',
      avatarText: '活',
      level: '活动达人',
      slogan: '本月已探索 3 场城市活动',
    } satisfies UserProfile,
  }),
  getters: {
    featuredActivity: (state) => state.activities.find((activity) => activity.isFeatured),
    featuredActivities: (state) => state.activities.filter((activity) => activity.isFeatured),
    upcomingActivities: (state) => state.activities.filter((activity) => !activity.isFeatured),
    joinedActivities: (state) =>
      state.activities.filter((activity) => state.joinedActivityIds.includes(activity.id)),
    favoriteActivities: (state) =>
      state.activities.filter((activity) => state.favoriteActivityIds.includes(activity.id)),
    upcomingJoinedActivities(): ActivityItem[] {
      return this.joinedActivities.filter((activity) => activity.status !== 'finished')
    },
    completedActivities(): ActivityItem[] {
      return this.joinedActivities.filter((activity) => activity.status === 'finished')
    },
  },
  actions: {
    joinActivity(id: string) {
      if (!this.joinedActivityIds.includes(id)) {
        this.joinedActivityIds.push(id)
      }
    },
    toggleFavorite(id: string) {
      if (this.favoriteActivityIds.includes(id)) {
        this.favoriteActivityIds = this.favoriteActivityIds.filter((activityId) => activityId !== id)
        return
      }

      this.favoriteActivityIds.push(id)
    },
    isJoined(id: string) {
      return this.joinedActivityIds.includes(id)
    },
    isFavorite(id: string) {
      return this.favoriteActivityIds.includes(id)
    },
  },
})
