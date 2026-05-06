<template>
  <div class="login-page">
    <!-- 🌍 标题 -->
    <div class="title">
      🌍 Oviwa World
      <p class="subtitle">欢迎来到我们的世界 💖</p>
    </div>

    <!-- 💌 登录卡片 -->
    <div class="card login-card">
      <h2>✨ 登录</h2>

      <!-- 🚨 错误提示 -->
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <input 
        v-model="username" 
        placeholder="输入你的用户名..." 
        class="input"
        @keyup.enter="loginUser"
      />

      <input 
        v-model="password" 
        placeholder="输入你的密码..." 
        type="password"
        class="input"
        @keyup.enter="loginUser"
      />

      <button 
        class="btn" 
        @click="loginUser"
        :disabled="isLoading"
      >
        {{ isLoading ? '登录中...' : '进入世界 🌸' }}
      </button>

      <p class="tip">
        没有账号？
        <router-link to="/register">去注册</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useUserStore } from '../store/user.js'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const username = ref('')
    const password = ref('')
    const isLoading = ref(false)
    const error = ref('')
    const router = useRouter()
    const userStore = useUserStore()

    const loginUser = async () => {
      error.value = ''
      
      if (!username.value.trim() || !password.value.trim()) {
        error.value = '请输入用户名和密码'
        return
      }

      isLoading.value = true

      try {
        const success = await userStore.login(username.value, password.value)
        if (success) {
          // 登录成功，跳转到首页
          router.push('/')
        } else {
          error.value = userStore.error || '登录失败，请重试'
        }
      } catch (err) {
        error.value = '网络错误，请检查连接'
        console.error('登录错误:', err)
      } finally {
        isLoading.value = false
      }
    }

    return { username, password, isLoading, error, loginUser }
  }
}
</script>

<style scoped>
/* 🌈 页面整体 */
.login-page {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 🌍 标题 */
.title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 20px;
  animation: float 3s infinite;
}

.subtitle {
  font-size: 1rem;
  color: #ff8fab;
}

/* 💌 登录卡片 */
.login-card {
  width: 320px;
  text-align: center;
}

/* 🚨 错误提示 */
.error-message {
  background-color: #ffe0e0;
  color: #d32f2f;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

/* 输入框 */
.input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 10px;
  border: 1px solid #ddd;
  outline: none;
  transition: 0.3s;
  box-sizing: border-box;
}

/* focus效果 */
.input:focus {
  border-color: #7ec8a5;
  box-shadow: 0 0 8px rgba(126,200,165,0.5);
}

/* 按钮 */
.btn {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7ec8a5, #5eb3a6);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(126,200,165,0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 提示文本 */
.tip {
  margin-top: 15px;
  font-size: 0.9rem;
  color: #666;
}

.tip a {
  color: #7ec8a5;
  text-decoration: none;
  font-weight: bold;
}

.tip a:hover {
  text-decoration: underline;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>