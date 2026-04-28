import { defineStore } from 'pinia'

// 封装 localStorage 持久化
const USER_KEY = 'myapp_user'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    username: ''
  }),
  actions: {
    login(name) {
      this.isLoggedIn = true
      this.username = name
      localStorage.setItem(USER_KEY, JSON.stringify({ username: name }))
    },
    logout() {
      this.isLoggedIn = false
      this.username = ''
      localStorage.removeItem(USER_KEY)
    },
    loadFromStorage() {
      const user = JSON.parse(localStorage.getItem(USER_KEY))
      if (user && user.username) {
        this.isLoggedIn = true
        this.username = user.username
      }
    }
  }
})