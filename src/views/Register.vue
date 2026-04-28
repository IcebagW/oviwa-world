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

      <input 
        v-model="username" 
        placeholder="为自己取一个名字..." 
        class="input"
      />

      <button class="btn" @click="registerUser">
        加入世界 💖
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
    const router = useRouter()
    const user = useUserStore()

    const registerUser = async () => {
      if (username.value.trim() === '') {
        alert('请输入用户名')
        return
      }

      try {
        // 调用后端接口
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value })
        })
        const data = await res.json()

        if (data.status === 'ok') {
          // 注册成功，同时更新 store
          user.login(data.username)
          router.push('/')
        } else {
          alert(data.msg || '注册失败')
        }
      } catch (err) {
        console.error(err)
        alert('网络错误')
      }
    }

    return { username, registerUser }
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

/* focus效果 */
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