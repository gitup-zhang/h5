import { defineStore } from 'pinia'
import { getUnreadCount } from '@/api/message'
import { http } from '@/api/http'

export const useMessageStore = defineStore('message', {
  state: () => ({
    /** 未读消息数量 */
    unreadCount: 0,
  }),

  actions: {
    /** 获取未读消息数量 */
    async fetchUnreadCount() {
      if (!http.getToken()) return
      try {
        const res = await getUnreadCount()
        this.unreadCount = res.data.unread_count
      } catch {
        // 错误已由拦截器处理
      }
    },

    /** 清除未读计数（查看消息列表后自动已读） */
    clearUnreadCount() {
      this.unreadCount = 0
    },
  },
})
