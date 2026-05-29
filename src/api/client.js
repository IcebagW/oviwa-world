import axios from 'axios'

// API 配置 - 使用环境变量或默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// ✨ 请求拦截器 - 自动添加认证令牌
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ⚠️ 响应拦截器 - 处理401错误（令牌过期）
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 令牌无效，清除本地存储并重定向到登录
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 📡 认证API接口
export const authAPI = {
  register: (username, email, password, confirmPassword) =>
    api.post('/auth/register', { username, email, password, confirmPassword }),

  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  getMe: () =>
    api.get('/auth/me'),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data) =>
    api.put('/auth/profile', data),

  logout: () =>
    api.post('/auth/logout')
}

// 📖 冒险日志 API
export const adventureAPI = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/adventures?page=${page}&limit=${limit}`),
  getOne: (id) =>
    api.get(`/adventures/${id}`),
  create: (title, content, image) =>
    api.post('/adventures', { title, content, image }),
  update: (id, data) =>
    api.put(`/adventures/${id}`, data),
  delete: (id) =>
    api.delete(`/adventures/${id}`)
}

// 💬 评论 API
export const commentAPI = {
  getByAdventure: (adventureId) =>
    api.get(`/comments/${adventureId}`),
  create: (adventureId, content) =>
    api.post(`/comments/${adventureId}`, { content }),
  delete: (commentId) =>
    api.delete(`/comments/${commentId}`)
}

// 📈 股票 API
export const stockAPI = {
  getAll: () =>
    api.get('/stocks'),
  getOne: (id) =>
    api.get(`/stocks/${id}`),
  buy: (stockId, shares) =>
    api.post('/stocks/buy', { stockId, shares }),
  sell: (stockId, shares) =>
    api.post('/stocks/sell', { stockId, shares })
}

export default api
