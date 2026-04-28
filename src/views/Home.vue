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
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 40px;
}

.title {
  font-size: 3rem;
  animation: float 3s infinite;
}

.subtitle {
  color: var(--accent);
}

.entry-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 40px;
}

.entry {
  cursor: pointer;
  transition: 0.3s;
}

.entry:hover {
  transform: scale(1.05);
}
</style>