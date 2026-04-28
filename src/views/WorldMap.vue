<template>
  <div>
    <h2>🗺️ 世界地图</h2>
    <div id="map" style="height: 500px;"></div>
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