<template>
  <div id="app">
    <Navbar />

    <!-- �️ 全局沙滩装饰 -->
    <div class="sand-particle g-p1" aria-hidden="true"></div>
    <div class="sand-particle g-p2" aria-hidden="true"></div>
    <div class="sand-particle g-p3" aria-hidden="true"></div>
    <div class="sand-particle g-p4" aria-hidden="true"></div>
    <div class="sand-particle g-p5" aria-hidden="true"></div>
    <div class="sand-particle g-p6" aria-hidden="true"></div>
    <div class="sand-dune g-dune-1" aria-hidden="true"></div>
    <div class="sand-dune g-dune-2" aria-hidden="true"></div>
    <div class="sand-dune g-dune-3" aria-hidden="true"></div>

    <!-- �🌍 页面切换动画 -->
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

/* ========== 🏖️ 全局沙滩（固定底部） ========== */
.sand-dune {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 50% 50% 0 0;
  z-index: 0;
  pointer-events: none;
}

.g-dune-1 {
  height: 80px;
  background: #f4e4c1;
  bottom: -10px;
  border-radius: 60% 40% 0 0;
  opacity: 0.5;
}

.g-dune-2 {
  height: 120px;
  background: #e9d4a7;
  bottom: -20px;
  border-radius: 40% 60% 0 0;
  opacity: 0.4;
}

.g-dune-3 {
  height: 50px;
  background: #faf0d7;
  bottom: 0;
  border-radius: 70% 30% 0 0;
  opacity: 0.3;
}

/* ⏳ 沙粒粒子 */
.sand-particle {
  position: fixed;
  width: 4px;
  height: 4px;
  background: #d4a373;
  image-rendering: pixelated;
  z-index: 1;
  opacity: 0;
  pointer-events: none;
}

.g-p1 { left: 15%; bottom: 10%; animation: rise 6s ease-in-out infinite; }
.g-p2 { left: 35%; bottom: 8%; animation: rise 7s ease-in-out infinite 1s; }
.g-p3 { left: 55%; bottom: 12%; animation: rise 5s ease-in-out infinite 2s; }
.g-p4 { left: 75%; bottom: 9%; animation: rise 6.5s ease-in-out infinite 0.5s; }
.g-p5 { left: 25%; bottom: 15%; animation: rise 5.5s ease-in-out infinite 3s; }
.g-p6 { left: 65%; bottom: 7%; animation: rise 7.5s ease-in-out infinite 1.5s; }

@keyframes rise {
  0% { opacity: 0; transform: translateY(0) translateX(0); }
  20% { opacity: 0.8; }
  80% { opacity: 0.6; }
  100% { opacity: 0; transform: translateY(-80px) translateX(20px); }
}
</style>