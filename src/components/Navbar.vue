<template>
  <nav class="navbar">
    <!-- 🌍 左侧LOGO -->
    <div class="logo" @click="$router.push('/')">
      🌍 Oviwa
    </div>

    <!-- 📱 汉堡菜单按钮 -->
    <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ active: menuOpen }">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- 🎮 中间导航 + 右侧用户 -->
    <div class="nav-right" :class="{ open: menuOpen }">
      <div class="nav-links">
        <router-link to="/" @click="menuOpen = false">世界</router-link>
        <router-link to="/log" @click="menuOpen = false">冒险日志</router-link>
        <router-link to="/map" @click="menuOpen = false">世界地图</router-link>
        <router-link to="/stocks" @click="menuOpen = false">📈 股市</router-link>
      </div>

      <div class="user-area">
        <router-link v-if="!user.isLoggedIn" to="/login" class="login-btn" @click="menuOpen = false">
          登录
        </router-link>

        <div v-else class="user-info">
          <router-link to="/profile" class="profile-link" @click="menuOpen = false">
            👤 {{ user.displayUsername }}
          </router-link>
          <span class="viwa-badge">💰 {{ formatCoins(user.user.viwaCoins) }}</span>
          <span class="logout" @click="logout">退出</span>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div v-if="menuOpen" class="overlay" @click="menuOpen = false"></div>
  </nav>
</template>

<script>
import { useUserStore } from '../store/user.js'
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const user = useUserStore()
    const menuOpen = ref(false)

    onMounted(() => {
      user.loadFromStorage()
    })

    const logout = () => {
      menuOpen.value = false
      user.logout()
    }

    const formatCoins = (val) => {
      return (val || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0 })
    }

    return { user, logout, menuOpen, formatCoins }
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
  position: relative;
  z-index: 200;
}

/* 🌍 LOGO */
.logo {
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  animation: float 3s infinite;
  z-index: 201;
}

/* 🍔 汉堡菜单按钮（移动端） */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 201;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2.5px;
  background: #3a5a40;
  border-radius: 2px;
  transition: all 0.3s;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* 🎮 右侧导航 + 用户 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
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

/* 当前活动链接 */
.nav-links a.router-link-exact-active {
  color: #5eb3a6;
  font-weight: 600;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-link {
  text-decoration: none;
  color: #3a5a40;
  font-weight: 500;
  transition: color 0.3s;
}

.profile-link:hover {
  color: #ff8fab;
}

.viwa-badge {
  font-size: 0.82rem;
  font-weight: 600;
  color: #e9c46a;
  background: rgba(233,196,106,0.12);
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
}

/* 退出按钮 */
.logout {
  cursor: pointer;
  color: #ff8fab;
  font-size: 0.85rem;
}

.logout:hover {
  text-decoration: underline;
}

/* 遮罩层 */
.overlay {
  display: none;
}

/* ✨ 漂浮动画 */
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}

/* 📱 移动端响应式 */
@media (max-width: 768px) {
  .navbar {
    margin: 6px;
    padding: 10px 16px;
  }

  .hamburger {
    display: flex;
  }

  .nav-right {
    position: fixed;
    top: 0;
    right: 0;
    width: 260px;
    height: 100vh;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 80px 24px 24px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, visibility 0.3s ease;
    gap: 16px;
    z-index: 200;
    transform: translateX(100%);
    visibility: hidden;
  }

  .nav-right.open {
    transform: translateX(0);
    visibility: visible;
  }

  .nav-links {
    flex-direction: column;
    gap: 8px;
  }

  .nav-links a {
    display: block;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 1.05rem;
  }

  .nav-links a:hover {
    background: rgba(126, 200, 165, 0.15);
    transform: none;
  }

  .user-area {
    padding-top: 12px;
    border-top: 1px solid #eee;
  }

  .user-info {
    width: 100%;
    justify-content: space-between;
  }

  .overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 150;
  }
}
</style>