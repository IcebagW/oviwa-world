<template>
  <div class="map-page">
    <h2>🗺️ 世界地图</h2>
    <p class="map-subtitle">记录我们访问世界的轨迹 🌍</p>
    <div id="map" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import L from 'leaflet'

onMounted(async () => {
  const map = L.map('map').setView([20, 0], 2)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  // 获取IP位置
  const res = await fetch('https://ipapi.co/json/')
  const data = await res.json()

  const lat = data.latitude
  const lon = data.longitude

  // 存储访问记录
  let points = JSON.parse(localStorage.getItem('points') || '[]')
  points.push([lat, lon])
  localStorage.setItem('points', JSON.stringify(points))

  // 渲染所有点
  points.forEach(p => {
    L.marker(p).addTo(map)
  })

  map.setView([lat, lon], 5)
})
</script>

<style>
@import "leaflet/dist/leaflet.css";
</style>

<style scoped>
.map-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.map-page h2 {
  text-align: center;
  margin-bottom: 8px;
}

.map-subtitle {
  text-align: center;
  color: #888;
  margin-bottom: 20px;
}

.map-container {
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

@media (max-width: 600px) {
  .map-page {
    padding: 12px;
  }
  .map-container {
    height: 350px;
  }
}
</style>