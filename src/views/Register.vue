<template>
  <div class="register-page">
    <!-- 🌍 标题 -->
    <div class="title">
      🌍 Oviwa World
      <p class="subtitle">在这里，创建属于你的身份 ✨</p>
    </div>

    <!-- 💌 注册卡片 -->
    <div class="card register-card">
      <h2>🌸 注册</h2>

      <!-- 🚨 错误提示 -->
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <input 
        v-model="username" 
        placeholder="为自己取一个用户名..." 
        class="input"
      />

      <input 
        v-model="email" 
        placeholder="输入你的邮箱..." 
        type="email"
        class="input"
      />

      <input 
        v-model="password" 
        placeholder="设置密码..." 
        type="password"
        class="input"
      />

      <input 
        v-model="confirmPassword" 
        placeholder="确认密码..." 
        type="password"
        class="input"
        @keyup.enter="registerUser"
      />

      <button 
        class="btn" 
        @click="registerUser"
        :disabled="isLoading"
      >
        {{ isLoading ? '注册中...' : '加入世界 💖' }}
      </button>

      <p class="tip">
        已有账号？
        <router-link to="/login">去登录</router-link>
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
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const isLoading = ref(false)
    const error = ref('')
    const router = useRouter()
    const userStore = useUserStore()

    const registerUser = async () => {
      error.value = ''

      // 验证
      if (!username.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) {
        error.value = '请填写所有字段'
        return
      }

      if (password.value !== confirmPassword.value) {
        error.value = '两次输入的密码不一致'
        return
      }

      if (password.value.length < 6) {
        error.value = '密码长度至少6个字符'
        return
      }

      isLoading.value = true

      try {
        const success = await userStore.register(
          username.value,
          email.value,
          password.value,
          confirmPassword.value
        )

        if (success) {
          // 注册成功，跳转到首页
          router.push('/')
        } else {
          error.value = userStore.error || '注册失败，请重试'
        }
      } catch (err) {
        error.value = '网络错误，请检查连接'
        console.error('注册错误:', err)
      } finally {
        isLoading.value = false
      }
    }

    return { username, email, password, confirmPassword, isLoading, error, registerUser }
  }
}
</script>

<style scoped>
/* 🌈 页面整体 */
.register-page {
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

/* 💌 卡片 */
.register-card {
  width: 100%;
  max-width: 360px;
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
  margin: 8px 0;
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

/* 📱 响应式 */
@media (max-width: 600px) {
  .title {
    font-size: 1.8rem;
  }
  .subtitle {
    font-size: 0.9rem;
  }
  .register-card {
    padding: 20px;
  }
}
</style>