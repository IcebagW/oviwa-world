<template>
  <div class="home">
    <h1 class="title">🌍 Oviwa World</h1>
    <p class="subtitle">Owawa ❤️ Ovivi 的冒险世界</p>

    <div class="entry-container">
      <div class="entry card" @click="$router.push('/log')">
        📖 冒险日志
        <p>记录我们的每一天</p>
      </div>

      <div class="entry card" @click="$router.push('/map')">
        🗺️ 世界地图
        <p>记录我们访问世界的轨迹</p>
      </div>

      <div class="entry card" @click="$router.push('/stocks')">
        📈 股市
        <p>💰 Viwa币: {{ formatCoins(user.viwaCoins) }}</p>
      </div>

      <div class="entry card portal" @click="$router.push('/portal')">
        ✨ 神秘传送门
        <p>🎆 进入特效测试场</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useUserStore } from '../store/user.js'

export default {
  setup() {
    const user = useUserStore()

    const formatCoins = (val) => {
      return (val || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0 })
    }

    return { user, formatCoins }
  }
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 60px 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  min-height: 70vh;
}

.title {
  font-size: 3rem;
  animation: float 3s infinite;
  margin-bottom: 12px;
  position: relative;
  z-index: 10;
}

.subtitle {
  color: var(--accent);
  font-size: 1.1rem;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.entry-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 40px;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 10;
}

.entry {
  cursor: pointer;
  transition: all 0.3s;
  padding: 24px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #3a5a40;
}

.entry p {
  font-size: 0.9rem;
  font-weight: 400;
  color: #888;
  margin-top: 8px;
}

.entry:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.portal {
  background: linear-gradient(135deg, rgba(126,200,165,0.12), rgba(192,132,252,0.12));
  border: 2px solid rgba(192,132,252,0.3);
  animation: portalGlow 3s ease-in-out infinite;
}

.portal:hover {
  border-color: #c084fc;
  box-shadow: 0 8px 30px rgba(192,132,252,0.25);
}

@keyframes portalGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(192,132,252,0.1); }
  50% { box-shadow: 0 0 20px rgba(192,132,252,0.2); }
}

/* 📱 响应式 */
@media (max-width: 600px) {
  .home {
    padding: 40px 20px;
  }
  .title {
    font-size: 2rem;
  }
  .subtitle {
    font-size: 0.95rem;
  }
  .entry-container {
    margin-top: 30px;
  }
  .entry {
    padding: 20px;
    font-size: 1.1rem;
  }
}

@media (min-width: 768px) {
  .entry-container {
    flex-direction: row;
    max-width: 600px;
  }
  .entry {
    flex: 1;
  }
}
</style>