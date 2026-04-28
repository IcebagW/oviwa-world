<template>
  <div>
    <h2>📖 冒险日志</h2>

    <div class="card">
      <input v-model="text" placeholder="今天发生了什么..." />

      <input type="file" @change="handleFile" />

      <button class="btn" @click="addLog">记录 💕</button>
    </div>

    <div v-for="(item, index) in logs" :key="index" class="card">
      <p>{{ item.text }}</p>
      <img v-if="item.img" :src="item.img" width="100%" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const text = ref('')
const logs = ref([])
let imgData = ''

onMounted(() => {
  const saved = localStorage.getItem('logs')
  if (saved) logs.value = JSON.parse(saved)
})

function handleFile(e) {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.onload = () => {
    imgData = reader.result
  }
  reader.readAsDataURL(file)
}

function addLog() {
  logs.value.unshift({ text: text.value, img: imgData })
  localStorage.setItem('logs', JSON.stringify(logs.value))
  text.value = ''
  imgData = ''
}
</script>