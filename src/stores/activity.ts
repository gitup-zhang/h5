import { defineStore } from 'pinia'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    joinCount: 0,
  }),
  actions: {
    increaseJoinCount() {
      this.joinCount += 1
    },
  },
})
