<template>
  <div id="app">
    <Navbar />

    <!-- 🌍 页面切换动画 -->
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <Footer />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  }
}
</script>

<style>
/* 🌈 RPG / 星露谷风格 */
body {
  font-family: "Segoe UI", "PingFang SC", sans-serif;
  margin: 0;
  padding: 0;

  /* 渐变背景（核心氛围） */
  background: linear-gradient(180deg, #e8f6ef, #fef6e4);
  color: #3a5a40;
}

/* 页面容器 */
#app {
  min-height: 100vh;
}

/* 🌟 页面切换动画（比普通fade更高级） */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* ✨ 全局卡片风格（后面所有页面都能用） */
.card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  margin: 20px auto;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

/* 🎮 按钮（游戏风） */
.btn {
  background: #7ec8a5;
  color: white;
  padding: 10px 18px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:hover {
  background: #ffd6a5;
  transform: scale(1.05);
}

/* 🌟 微动画（全站可用） */
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}
</style>