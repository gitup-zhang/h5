import { defineStore } from 'pinia'
import { showToast } from 'vant'
import {
  getMyRegistrations,
  registerForEvent,
  cancelRegistration,
} from '@/api/event'
import type { EventItem } from '@/types/event'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    /** 已报名活动 ID 列表 */
    joinedEventIds: [] as number[],
    /** 已报名活动数据（跨视图共享） */
    myEvents: [] as EventItem[],
    /** 我的活动总数 */
    myEventsTotal: 0,
  }),

  actions: {
    // ─── 我的报名 ──────────────────────────────────

    /** 获取我的已报名活动列表 */
    async fetchMyRegistrations(params?: {
      page?: number
      page_size?: number
      event_status?: string
    }) {
      const res = await getMyRegistrations(params)
      this.myEvents = res.data.list
      this.myEventsTotal = res.data.total
      this.joinedEventIds = res.data.list.map((e) => e.id)
    },

    /** 报名活动 */
    async joinEvent(id: number, invite_code?: string) {
      await registerForEvent(id, { invite_code: invite_code || '' })
      if (!this.joinedEventIds.includes(id)) {
        this.joinedEventIds.push(id)
      }
      showToast('报名成功')
    },

    /** 取消报名 */
    async cancelEventRegistration(id: number) {
      await cancelRegistration(id)
      this.joinedEventIds = this.joinedEventIds.filter((eid) => eid !== id)
      this.myEvents = this.myEvents.filter((e) => e.id !== id)
      this.myEventsTotal = Math.max(0, this.myEventsTotal - 1)
      showToast('已取消报名')
    },

    /** 检查是否已报名（同步方法，用于 UI 快速判断） */
    isJoined(id: number): boolean {
      return this.joinedEventIds.includes(id)
    },
  },
})
