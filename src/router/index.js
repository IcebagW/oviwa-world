import { createRouter, createWebHistory } from 'vue-router' 

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

// ✅ 新增页面
import AdventureLog from '../views/AdventureLog.vue'
import WorldMap from '../views/WorldMap.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  // 🌍 新增：冒险日志
  { path: '/log', name: 'AdventureLog', component: AdventureLog },

  // 🗺️ 新增：世界地图
  { path: '/map', name: 'WorldMap', component: WorldMap }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router