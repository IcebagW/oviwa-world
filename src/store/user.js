import { defineStore } from 'pinia'
import { authAPI } from '../api/client.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user: {
      id: null,
      username: '',
      email: ''
    },
    token: null,
    loading: false,
    error: null
  }),

  actions: {
    // 🔓 登录
    async login(username, password) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authAPI.login(username, password)
        const { token, user } = response.data
        
        // 保存令牌和用户信息
        this.token = token
        this.user = user
        this.isLoggedIn = true
        
        // 持久化到 localStorage
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return true
      } catch (err) {
        this.error = err.response?.data?.error || '登录失败'
        this.isLoggedIn = false
        return false
      } finally {
        this.loading = false
      }
    },

    // 📝 注册
    async register(username, email, password, confirmPassword) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authAPI.register(username, email, password, confirmPassword)
        const { token, user } = response.data
        
        // 自动登录
        this.token = token
        this.user = user
        this.isLoggedIn = true
        
        // 持久化
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return true
      } catch (err) {
        this.error = err.response?.data?.error || '注册失败'
        return false
      } finally {
        this.loading = false
      }
    },

    // 🚪 登出
    async logout() {
      try {
        await authAPI.logout()
      } catch (err) {
        console.error('登出请求失败:', err)
      } finally {
        // 无论是否成功，都清除本地数据
        this.isLoggedIn = false
        this.user = { id: null, username: '', email: '' }
        this.token = null
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    },

    // 📌 从 localStorage 恢复登录状态
    loadFromStorage() {
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isLoggedIn = true
      }
    },

    // 👤 刷新用户信息（可选）
    async fetchUser() {
      try {
        const response = await authAPI.getMe()
        this.user = response.data
      } catch (err) {
        console.error('获取用户信息失败:', err)
      }
    }
  }
})