import { createRouter, createWebHistory } from 'vue-router' 
import { useUserStore } from '../store/user.js'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

// ✅ 新增页面
import AdventureLog from '../views/AdventureLog.vue'
import WorldMap from '../views/WorldMap.vue'

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  // 🌍 新增：冒险日志（需要认证）
  { path: '/log', name: 'AdventureLog', component: AdventureLog, meta: { requiresAuth: true } },

  // 🗺️ 新增：世界地图（需要认证）
  { path: '/map', name: 'WorldMap', component: WorldMap, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔐 路由守卫 - 验证认证状态
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth
  const isLoggedIn = userStore.isLoggedIn

  if (requiresAuth && !isLoggedIn) {
    // 如果需要认证但未登录，重定向到登录页
    next('/login')
  } else if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) {
    // 如果已登录，不允许访问登录/注册页
    next('/')
  } else {
    next()
  }
})

export default router