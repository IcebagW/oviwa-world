import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useUserStore } from './store/user.js'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

// 🔐 应用初始化：恢复用户登录状态
const userStore = useUserStore()
userStore.loadFromStorage()

app.mount('#app')