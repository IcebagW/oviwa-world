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

      <input 
        v-model="username" 
        placeholder="输入你的名字进入世界..." 
        class="input"
      />

      <button class="btn" @click="loginUser">
        进入世界 🌸
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
    const router = useRouter()
    const user = useUserStore()

    const loginUser = () => {
      if (username.value.trim() === '') {
        alert('请输入用户名')
        return
      }
      user.login(username.value)
      router.push('/')
    }

    return { username, loginUser }
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

/* 输入框 */
.input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border-radius: 10px;
  border: 1px solid #ddd;
  outline: none;
  transition: 0.3s;
}

/* focus效果（很重要） */
.input:focus {
  border-color: #7ec8a5;
  box-shadow: 0 0 8px rgba(126,200,165,0.5);
}

/* 提示 */
.tip {
  margin-top: 10px;
  font-size: 0.9rem;
}

/* 链接 */
.tip a {
  color: #ff8fab;
  text-decoration: none;
}

.tip a:hover {
  text-decoration: underline;
}

/* ✨ 漂浮动画 */
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}
</style>