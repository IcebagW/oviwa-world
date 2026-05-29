import { defineStore } from 'pinia'
import { authAPI } from '../api/client.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user: {
      id: null,
      username: '',
      email: '',
      // 🎮 RPG 属性
      level: 1,
      xp: 0,
      hp: 100,
      maxHp: 100,
      stamina: 100,
      maxStamina: 100,
      strength: 5,
      intelligence: 5,
      // 👤 个人信息
      displayName: '',
      bio: '',
      avatar: '',
      // 💰 经济系统
      viwaCoins: 10000,
      portfolio: []
    },
    token: null,
    loading: false,
    saving: false,
    error: null
  }),

  getters: {
    // 经验进度（当前等级到下个等级）
    xpProgress: (state) => {
      const currentLevel = state.user.level
      const xpForNext = currentLevel * 100
      return Math.min(state.user.xp / xpForNext, 1)
    },
    // 显示名称（优先 displayName）
    displayUsername: (state) => state.user.displayName || state.user.username
  },

  actions: {
    // 统一设置用户数据
    _setUserData(userData, token) {
      this.user = {
        id: userData.id || userData._id,
        username: userData.username || '',
        email: userData.email || '',
        level: userData.level ?? 1,
        xp: userData.xp ?? 0,
        hp: userData.hp ?? 100,
        maxHp: userData.maxHp ?? 100,
        stamina: userData.stamina ?? 100,
        maxStamina: userData.maxStamina ?? 100,
        strength: userData.strength ?? 5,
        intelligence: userData.intelligence ?? 5,
        displayName: userData.displayName || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        viwaCoins: userData.viwaCoins ?? 10000,
        portfolio: userData.portfolio || []
      }
      if (token) this.token = token
      this.isLoggedIn = true
    },

    // 🔓 登录
    async login(username, password) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.login(username, password)
        const { token, user } = response.data

        this._setUserData(user, token)
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(this.user))

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

        this._setUserData(user, token)
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(this.user))

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
        this.isLoggedIn = false
        this.user = {
          id: null, username: '', email: '',
          level: 1, xp: 0,
          hp: 100, maxHp: 100,
          stamina: 100, maxStamina: 100,
          strength: 5, intelligence: 5,
          displayName: '', bio: '', avatar: '',
          viwaCoins: 10000, portfolio: []
        }
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
        const parsed = JSON.parse(user)
        // 保证旧数据也有新字段的默认值
        this.user = {
          id: parsed.id || null,
          username: parsed.username || '',
          email: parsed.email || '',
          level: parsed.level ?? 1,
          xp: parsed.xp ?? 0,
          hp: parsed.hp ?? 100,
          maxHp: parsed.maxHp ?? 100,
          stamina: parsed.stamina ?? 100,
          maxStamina: parsed.maxStamina ?? 100,
          strength: parsed.strength ?? 5,
          intelligence: parsed.intelligence ?? 5,
          displayName: parsed.displayName || '',
          bio: parsed.bio || '',
          avatar: parsed.avatar || '',
          viwaCoins: parsed.viwaCoins ?? 10000,
          portfolio: parsed.portfolio || []
        }
        this.isLoggedIn = true
      }
    },

    // 👤 刷新用户信息
    async fetchUser() {
      try {
        const response = await authAPI.getMe()
        this._setUserData(response.data)
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (err) {
        console.error('获取用户信息失败:', err)
      }
    },

    // 🎯 获取个人资料（含 RPG 属性）
    async fetchProfile() {
      try {
        const response = await authAPI.getProfile()
        this._setUserData(response.data)
        localStorage.setItem('user', JSON.stringify(this.user))
        return response.data
      } catch (err) {
        console.error('获取个人资料失败:', err)
        return null
      }
    },

    // ✏️ 更新个人资料
    async updateProfile(data) {
      this.saving = true
      try {
        const response = await authAPI.updateProfile(data)
        const { user } = response.data
        this._setUserData(user)
        localStorage.setItem('user', JSON.stringify(this.user))
        return true
      } catch (err) {
        this.error = err.response?.data?.error || '更新失败'
        return false
      } finally {
        this.saving = false
      }
    }
  }
})