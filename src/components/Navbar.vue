<template>
  <nav class="navbar">
    <!-- 🌍 左侧LOGO -->
    <div class="logo" @click="$router.push('/')">
      🌍 Oviwa
    </div>

    <!-- 🎮 中间导航 -->
    <div class="nav-links">
      <router-link to="/">世界</router-link>
      <router-link to="/log">冒险日志</router-link>
      <router-link to="/map">世界地图</router-link>
    </div>

    <!-- 💖 右侧用户 -->
    <div class="user-area">
      <router-link v-if="!user.isLoggedIn" to="/login" class="login-btn">
        登录
      </router-link>

      <div v-else class="user-info">
        🌸 {{ user.username }}
        <span class="logout" @click="logout">退出</span>
      </div>
    </div>
  </nav>
</template>

<script>
import { useUserStore } from '../store/user.js'
import { onMounted } from 'vue'

export default {
  setup() {
    const user = useUserStore()

    onMounted(() => {
      user.loadFromStorage()
    })

    const logout = () => {
      user.logout()
    }

    return { user, logout }
  }
}
</script>

<style scoped>
/* 🌈 主导航栏（玻璃质感） */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 12px 24px;
  margin: 10px;

  border-radius: 20px;

  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);

  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

/* 🌍 LOGO */
.logo {
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  animation: float 3s infinite;
}

/* 🎮 中间菜单 */
.nav-links {
  display: flex;
  gap: 20px;
}

/* 链接样式 */
.nav-links a {
  text-decoration: none;
  color: #3a5a40;
  font-weight: 500;
  transition: all 0.3s;
}

/* hover像游戏菜单 */
.nav-links a:hover {
  color: #ff8fab;
  transform: translateY(-2px);
}

/* 💖 用户区域 */
.user-area {
  display: flex;
  align-items: center;
}

/* 登录按钮 */
.login-btn {
  background: #7ec8a5;
  color: white;
  padding: 6px 14px;
  border-radius: 10px;
  text-decoration: none;
  transition: 0.3s;
}

.login-btn:hover {
  background: #ffd6a5;
}

/* 已登录 */
.user-info {
  color: #3a5a40;
}

/* 退出按钮 */
.logout {
  margin-left: 10px;
  cursor: pointer;
  color: #ff8fab;
}

.logout:hover {
  text-decoration: underline;
}

/* ✨ 漂浮动画 */
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}
</style>