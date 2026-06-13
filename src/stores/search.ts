import { defineStore } from 'pinia'
import type { EventItem } from '@/types/event'

export const useSearchStore = defineStore('search', {
  state: () => ({
    /** 搜索是否激活 */
    active: false,
    /** 搜索关键词 */
    query: '',
    /** 搜索结果缓存 */
    results: [] as EventItem[],
  }),

  actions: {
    /** 打开搜索界面 */
    open() {
      this.active = true
    },

    /** 关闭搜索并清空所有状态 */
    close() {
      this.active = false
      this.query = ''
      this.results = []
    },

    /** 缓存搜索结果 */
    cacheResults(query: string, results: EventItem[]) {
      this.query = query
      this.results = results
    },
  },
})
