<template>
  <div class="fireworks-page">
    <canvas ref="canvasRef" class="fireworks-canvas"></canvas>

    <!-- ⚙️ 控制台按钮 -->
    <button class="console-btn" @click="showConsole = !showConsole" :class="{ active: showConsole }">
      ⚙️
    </button>

    <!-- 🎛️ 控制台面板 -->
    <transition name="console-slide">
      <div v-if="showConsole" class="console-panel">
        <div class="console-header">
          <span>🎛️ 特效控制台</span>
          <button class="console-close" @click="showConsole = false">✕</button>
        </div>
        <div class="console-body">
          <!-- 🎆 特效开关（可滑动） -->
          <div class="toggle-group">
            <label class="toggle-row">
              <span>🎆 烟花</span>
              <span class="toggle-track" :class="{ on: showFireworks }" @click="showFireworks = !showFireworks">
                <span class="toggle-knob"></span>
              </span>
            </label>
            <label class="toggle-row">
              <span>🌊 海浪</span>
              <span class="toggle-track" :class="{ on: showWaves }" @click="showWaves = !showWaves">
                <span class="toggle-knob"></span>
              </span>
            </label>
            <label class="toggle-row">
              <span>🌧️ 下雨</span>
              <span class="toggle-track" :class="{ on: showRain }" @click="showRain = !showRain">
                <span class="toggle-knob"></span>
              </span>
            </label>
            <label class="toggle-row">
              <span>🌃 夜间</span>
              <span class="toggle-track" :class="{ on: nightMode }" @click="toggleNight">
                <span class="toggle-knob"></span>
              </span>
            </label>
            <label class="toggle-row">
              <span>🌈 彩虹</span>
              <span class="toggle-track" :class="{ on: showRainbow }" @click="showRainbow = !showRainbow">
                <span class="toggle-knob"></span>
              </span>
            </label>
            <label class="toggle-row">
              <span>🐟 鱼群</span>
              <span class="toggle-track" :class="{ on: showFish }" @click="showFish = !showFish">
                <span class="toggle-knob"></span>
              </span>
            </label>
          </div>
          <!-- 🌊 水位控制 -->
          <div class="console-divider"></div>
          <div class="water-section">
            <div class="water-header">
              <span>🌊 水位</span>
              <span class="water-value">{{ Math.round(waterLevel * 100) }}%</span>
            </div>
            <div class="water-bar-bg">
              <div class="water-bar-fill" :style="{ width: waterLevel * 100 + '%' }"></div>
            </div>
            <div class="water-btns">
              <button class="c-btn c-btn-warn" @click="adjustWaterLevel(-0.15)" :disabled="waterLevel <= 0">▼ 下降</button>
              <button class="c-btn c-btn-primary" @click="adjustWaterLevel(0.15)" :disabled="waterLevel >= 1">▲ 上涨</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export default {
  name: 'FireworksTest',
  setup() {
    const canvasRef = ref(null)
    const showConsole = ref(false)
    const rainbowMode = ref(false)
    const isRunning = ref(true)
    const showFireworks = ref(false)
    const showWaves = ref(false)
    const showRain = ref(false)
    const nightMode = ref(false)
    const showRainbow = ref(false)
    const showFish = ref(false)
    const waterLevel = ref(0)

    // ---------- 烟花粒子系统 ----------
    let rockets = []
    let particles = []
    let animId = null
    let ctx = null
    let w = 0
    let h = 0
    let paused = false
    let waveTime = 0
    let foam = []
    let rainDrops = []
    let stars = []
    let bubbles = []
    let fishes = []

    // 烟花颜色库
    const COLORS = [
      '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
      '#ff8fab', '#e9c46a', '#c084fc', '#fb923c',
      '#38bdf8', '#f472b6', '#34d399', '#a78bfa'
    ]

    const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]

    const resize = () => {
      if (!canvasRef.value) return
      w = canvasRef.value.width = window.innerWidth
      h = canvasRef.value.height = window.innerHeight
    }

    // 火箭
    class Rocket {
      constructor() {
        this.x = Math.random() * w
        this.y = h
        this.targetY = 80 + Math.random() * (h * 0.35)
        this.speed = 4 + Math.random() * 4
        this.angle = (Math.random() - 0.5) * 0.3
        this.color = randomColor()
        this.trail = []
        this.alive = true
        this.size = 2 + Math.random() * 1.5
      }

      update() {
        this.trail.push({ x: this.x, y: this.y })
        if (this.trail.length > 8) this.trail.shift()

        this.x += Math.sin(this.angle) * 0.8
        this.y -= this.speed
        this.speed *= 0.98

        if (this.y <= this.targetY || this.speed < 0.5) {
          this.alive = false
          // 爆炸
          const count = 60 + Math.floor(Math.random() * 60)
          for (let i = 0; i < count; i++) {
            particles.push(new Particle(this.x, this.y, rainbowMode.value ? `hsl(${Math.random() * 360}, 100%, 60%)` : this.color))
          }
        }
      }

      draw() {
        if (!ctx) return
        // 尾迹
        for (let i = 0; i < this.trail.length; i++) {
          const alpha = (i / this.trail.length) * 0.6
          ctx.beginPath()
          ctx.arc(this.trail[i].x, this.trail[i].y, this.size * (i / this.trail.length), 0, Math.PI * 2)
          ctx.fillStyle = this.color + hexAlpha(alpha)
          ctx.fill()
        }
        // 火箭头
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // 爆炸粒子
    class Particle {
      constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = color
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 5
        this.vx = Math.cos(angle) * speed
        this.vy = Math.sin(angle) * speed
        this.gravity = 0.05 + Math.random() * 0.03
        this.friction = 0.98
        this.size = 2 + Math.random() * 3
        this.alpha = 1
        this.decay = 0.008 + Math.random() * 0.015
        this.alive = true
        this.trail = []
      }

      update() {
        this.trail.push({ x: this.x, y: this.y })
        if (this.trail.length > 4) this.trail.shift()

        this.vx *= this.friction
        this.vy *= this.friction
        this.vy += this.gravity
        this.x += this.vx
        this.y += this.vy
        this.alpha -= this.decay
        if (this.alpha <= 0) {
          this.alive = false
        }
      }

      draw() {
        if (!ctx || this.alpha <= 0) return
        // 拖尾
        for (let i = 0; i < this.trail.length; i++) {
          const a = (i / this.trail.length) * this.alpha * 0.4
          ctx.beginPath()
          ctx.arc(this.trail[i].x, this.trail[i].y, this.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = this.color + hexAlpha(a)
          ctx.fill()
        }
        // 主粒子
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color + hexAlpha(this.alpha)
        ctx.fill()
      }
    }

    const hexAlpha = (alpha) => {
      const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16)
      return a.length === 1 ? '0' + a : a
    }

    // 主动触发一波烟花
    const triggerFireworks = () => {
      const count = 3 + Math.floor(Math.random() * 4)
      for (let i = 0; i < count; i++) {
        setTimeout(() => rockets.push(new Rocket()), i * 200)
      }
    }

    const toggleRainbow = () => {
      rainbowMode.value = !rainbowMode.value
    }

    // ========== 🌈 彩虹绘制（横跨天空） ==========
    const drawRainbow = () => {
      if (!ctx || !showRainbow.value) return
      const cx = w * 0.5
      const cy = h * 1.15
      const radius = Math.max(w, h) * 0.55
      const colors = ['#ff0000','#ff8800','#ffff00','#00cc44','#0088ff','#4400cc','#8800cc']
      const bandWidth = radius * 0.035

      for (let i = 0; i < colors.length; i++) {
        const r = radius - i * bandWidth
        ctx.beginPath()
        ctx.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.95)
        ctx.strokeStyle = colors[i]
        ctx.lineWidth = bandWidth
        ctx.globalAlpha = 0.3
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    // ========== 🌊 海浪绘制 ==========
    const drawWaves = () => {
      if (!ctx) return

      waveTime += 0.02

      const wl = waterLevel.value
      // 水位越高，海浪越靠上
      const riseOffset = wl * h * 0.75

      const layers = [
        { color: 'rgba(126,200,165,0.35)', amp: 10, freq: 0.018, speed: 0.7, baseY: 0.86 },
        { color: 'rgba(94,179,166,0.25)',  amp: 14, freq: 0.024, speed: 1.0, baseY: 0.89 },
        { color: 'rgba(72,160,148,0.18)',  amp: 8,  freq: 0.03,  speed: 0.5, baseY: 0.92 },
        { color: 'rgba(180,220,210,0.12)', amp: 12, freq: 0.014, speed: 0.6, baseY: 0.95 },
      ]

      for (const layer of layers) {
        const baseY = Math.max(h * layer.baseY - riseOffset, riseOffset * 0.2)
        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 3) {
          const y = baseY
            + Math.sin(x * layer.freq + waveTime * layer.speed) * layer.amp
            + Math.sin(x * layer.freq * 2.3 + waveTime * layer.speed * 0.7) * (layer.amp * 0.4)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.closePath()
        ctx.fillStyle = layer.color
        ctx.fill()
      }

      // 浪花泡沫
      if (Math.random() < 0.15) {
        const foamX = Math.random() * w
        foam.push({
          x: foamX,
          y: Math.max(h * 0.86 - riseOffset, 20) + Math.sin(foamX * 0.018 + waveTime * 0.7) * 10,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.3 - Math.random() * 0.6,
          alpha: 0.6 + Math.random() * 0.4,
          size: 2 + Math.random() * 3,
          life: 0,
          maxLife: 40 + Math.floor(Math.random() * 30)
        })
      }

      for (let i = foam.length - 1; i >= 0; i--) {
        const f = foam[i]
        f.life++
        f.x += f.vx
        f.y += f.vy
        f.vy += 0.02
        f.alpha *= 0.97
        if (f.life > f.maxLife || f.alpha < 0.01) {
          foam.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.size * (1 - f.life / f.maxLife * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${f.alpha * 0.6})`
        ctx.fill()
      }
    }

    // ========== ⭐ 星空绘制 ==========
    const initStars = () => {
      stars = []
      for (let i = 0; i < 120; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.6,
          size: 0.5 + Math.random() * 2,
          alpha: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.01 + Math.random() * 0.03,
          twinklePhase: Math.random() * Math.PI * 2
        })
      }
    }

    const drawStars = () => {
      if (!ctx || !nightMode.value) return
      for (const star of stars) {
        const twinkle = Math.sin(waveTime * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7
        const alpha = star.alpha * twinkle
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()
      }
    }

    // ========== 🌧️ 下雨绘制 ==========
    const drawRain = () => {
      if (!ctx) return

      // 生成新雨滴
      if (!paused) {
        for (let i = 0; i < 3; i++) {
          rainDrops.push({
            x: Math.random() * w,
            y: -10,
            speed: 8 + Math.random() * 6,
            length: 10 + Math.random() * 12,
            opacity: 0.2 + Math.random() * 0.3,
            wind: -0.5 + Math.random() * 0.3
          })
        }
      }

      for (let i = rainDrops.length - 1; i >= 0; i--) {
        const r = rainDrops[i]
        r.x += r.wind
        r.y += r.speed
        if (r.y > h) {
          rainDrops.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.moveTo(r.x, r.y)
        ctx.lineTo(r.x + r.wind * 3, r.y - r.length)
        const rainColor = nightMode.value ? `rgba(160, 180, 220, ${r.opacity * 0.7})` : `rgba(180, 200, 220, ${r.opacity})`
        ctx.strokeStyle = rainColor
        ctx.lineWidth = 1.2
        ctx.stroke()
      }
    }

    // ========== 🌊 水下气泡 ==========
    const drawBubbles = () => {
      if (!ctx || waterLevel.value <= 0) return

      if (!paused && Math.random() < 0.4) {
        bubbles.push({
          x: Math.random() * w,
          y: h + 10,
          size: 2 + Math.random() * 5,
          speed: 0.4 + Math.random() * 0.8,
          wobble: Math.random() * 0.5,
          alpha: 0.3 + Math.random() * 0.4,
          life: 0,
          maxLife: 80 + Math.floor(Math.random() * 60)
        })
      }

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        b.life++
        b.y -= b.speed
        b.x += Math.sin(b.life * 0.04) * b.wobble
        b.alpha *= 0.996
        if (b.life > b.maxLife || b.alpha < 0.01 || b.y < -10) {
          bubbles.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(200, 230, 255, ${b.alpha * 0.5})`
        ctx.lineWidth = 1.2
        ctx.stroke()
        // 气泡高光
        ctx.beginPath()
        ctx.arc(b.x - b.size * 0.25, b.y - b.size * 0.25, b.size * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.3})`
        ctx.fill()
      }
    }

    // ========== 🐟 鱼群绘制 ==========
    const initFish = () => {
      fishes = []
      const fishColors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c084fc','#ff8fab','#fb923c']
      for (let i = 0; i < 8; i++) {
        fishes.push(createFish(fishColors[i % fishColors.length]))
      }
    }

    const createFish = (color) => ({
      x: Math.random() * w,
      y: 60 + Math.random() * (h * 0.55),
      size: 8 + Math.random() * 14,
      speed: 0.5 + Math.random() * 1.2,
      color,
      dir: Math.random() < 0.5 ? 1 : -1,
      tailPhase: Math.random() * Math.PI * 2,
      waveAmp: 1 + Math.random() * 2,
      waveFreq: 0.02 + Math.random() * 0.02
    })

    const drawFish = () => {
      if (!ctx || !showFish.value) return

      for (let i = fishes.length - 1; i >= 0; i--) {
        const f = fishes[i]
        f.x += f.speed * f.dir
        f.tailPhase += 0.06
        f.y += Math.sin(f.tailPhase * 0.5) * f.waveAmp * 0.1

        // 游出屏幕从另一侧出现
        if (f.dir > 0 && f.x > w + f.size * 3) {
          f.x = -f.size * 3
          f.y = 60 + Math.random() * (h * 0.55)
        } else if (f.dir < 0 && f.x < -f.size * 3) {
          f.x = w + f.size * 3
          f.y = 60 + Math.random() * (h * 0.55)
        }

        const s = f.size
        const tailWag = Math.sin(f.tailPhase) * 3

        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.scale(f.dir, 1)

        // 鱼身（椭圆）
        ctx.beginPath()
        ctx.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2)
        ctx.fillStyle = f.color
        ctx.globalAlpha = 0.85
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        // 鱼尾
        ctx.beginPath()
        ctx.moveTo(-s * 0.7, 0)
        ctx.lineTo(-s * 1.3 - tailWag, -s * 0.4)
        ctx.lineTo(-s * 1.3 + tailWag, s * 0.4)
        ctx.closePath()
        ctx.fillStyle = f.color
        ctx.globalAlpha = 0.7
        ctx.fill()

        // 眼睛
        ctx.beginPath()
        ctx.arc(s * 0.4, -s * 0.1, s * 0.14, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.globalAlpha = 1
        ctx.fill()
        ctx.beginPath()
        ctx.arc(s * 0.48, -s * 0.1, s * 0.07, 0, Math.PI * 2)
        ctx.fillStyle = '#222'
        ctx.fill()

        ctx.globalAlpha = 1
        ctx.restore()
      }
    }

    const adjustWaterLevel = (delta) => {
      waterLevel.value = Math.max(0, Math.min(1, waterLevel.value + delta))
    }

    const toggleNight = () => {
      nightMode.value = !nightMode.value
      if (nightMode.value) {
        initStars()
      }
    }

    const clearScreen = () => {
      particles = []
      rockets = []
      foam = []
      rainDrops = []
    }

    const toggleRunning = () => {
      paused = !paused
      isRunning.value = !paused
      if (!paused && !animId) {
        loop()
      }
    }

    // 主动发射
    const autoLaunch = () => {
      if (paused) return
      if (Math.random() < 0.3) {
        rockets.push(new Rocket())
      }
      if (Math.random() < 0.1) {
        setTimeout(() => rockets.push(new Rocket()), 300)
      }
    }

    // 主循环
    const loop = () => {
      if (!ctx) return
      const isNight = nightMode.value
      const wl = waterLevel.value
      if (showWaves.value) drawWaves()

      // 半透明覆盖实现拖尾效果
      let overlayColor = 'rgba(232, 246, 239, 0.15)'
      if (isNight) overlayColor = 'rgba(10, 15, 45, 0.15)'
      if (wl > 0) {
        // 水下：蓝色调覆盖
        const alpha = 0.08 + wl * 0.12
        overlayColor = isNight
          ? `rgba(5, 20, 50, ${alpha})`
          : `rgba(20, 80, 120, ${alpha})`
      }
      if (!paused) {
        ctx.fillStyle = overlayColor
        ctx.fillRect(0, 0, w, h)
      }

      // 🌃 夜空背景渐层
      if (isNight) {
        const grad = ctx.createLinearGradient(0, 0, 0, h * 0.7)
        grad.addColorStop(0, 'rgba(5, 8, 30, 0.25)')
        grad.addColorStop(1, 'rgba(10, 15, 45, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h * 0.7)
      }

      // ⭐ 星空
      if (isNight) drawStars()

      // 🌈 彩虹（横跨天空）
      // 🌈 彩虹
      if (showRainbow.value && wl < 0.3) drawRainbow()

      // 🐟 鱼群（水下才出现）
      if (showFish.value && wl >= 0.15) drawFish()

      // 🌧️ 下雨
      if (showRain.value) drawRain()

      // 🫧 水下气泡
      if (wl > 0) drawBubbles()

      // 🎆 更新和绘制火箭
      if (showFireworks.value) {
        for (let i = rockets.length - 1; i >= 0; i--) {
          rockets[i].update()
          rockets[i].draw()
          if (!rockets[i].alive) rockets.splice(i, 1)
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].update()
          particles[i].draw()
          if (!particles[i].alive) particles.splice(i, 1)
        }

        autoLaunch()
      }
      animId = requestAnimationFrame(loop)
    }

    onMounted(async () => {
      await nextTick()
      const canvas = canvasRef.value
      if (!canvas) return
      ctx = canvas.getContext('2d')
      resize()
      window.addEventListener('resize', resize)

      // 清空背景
      ctx.fillStyle = '#e8f6ef'
      ctx.fillRect(0, 0, w, h)
      initStars()
      initFish()

      loop()
    })

    onUnmounted(() => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      rockets = []
      particles = []
      foam = []
      rainDrops = []
      bubbles = []
      fishes = []
    })

    return { canvasRef, triggerFireworks, toggleRainbow, clearScreen, rainbowMode, showConsole, isRunning, toggleRunning, showFireworks, showWaves, showRain, nightMode, toggleNight, showRainbow, showFish, waterLevel, adjustWaterLevel }
  }
}
</script>

<style scoped>
.fireworks-page {
  position: relative;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.fireworks-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* ⚙️ 控制台按钮 */
.console-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  font-size: 1.4rem;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.console-btn:hover,
.console-btn.active {
  border-color: #c084fc;
  background: rgba(192,132,252,0.15);
  box-shadow: 0 4px 20px rgba(192,132,252,0.25);
  transform: scale(1.1);
}

/* 🎛️ 控制台面板 */
.console-panel {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 280px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  z-index: 100;
  overflow: hidden;
  border: 1px solid rgba(192,132,252,0.15);
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 700;
  font-size: 0.95rem;
  color: #3a5a40;
}

.console-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #aaa;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.console-close:hover {
  background: #f0f0f0;
  color: #666;
}

.console-body {
  padding: 14px 18px 18px;
}

.console-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.console-label {
  font-size: 0.85rem;
  color: #777;
}

.console-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #aaa;
}

.console-value.running {
  color: #7ec8a5;
}

/* 🔘 开关组 */
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 4px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.toggle-group::-webkit-scrollbar {
  width: 4px;
}

.toggle-group::-webkit-scrollbar-track {
  background: transparent;
}

.toggle-group::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  color: #3a5a40;
  padding: 4px 0;
}

.toggle-track {
  position: relative;
  width: 44px;
  height: 24px;
  background: #ddd;
  border-radius: 14px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.toggle-track.on {
  background: #7ec8a5;
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

.toggle-track.on .toggle-knob {
  left: 23px;
}

.console-divider {
  height: 1px;
  background: #eee;
  margin: 12px 0;
}

/* 🌊 水位控制 */
.water-section {
  margin-bottom: 4px;
}

.water-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  color: #3a5a40;
}

.water-value {
  font-size: 0.85rem;
  color: #5eb3a6;
  font-weight: 700;
}

.water-bar-bg {
  height: 8px;
  background: #e8f0f5;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.water-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #5eb3a6, #3a8ea5, #1a5a7a);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.water-btns {
  display: flex;
  gap: 8px;
}

.water-btns .c-btn {
  flex: 1;
  font-size: 0.82rem;
  padding: 8px 10px;
}

.console-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.c-btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid transparent;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;
}

.c-btn:hover {
  transform: translateY(-1px);
}

.c-btn-primary {
  background: linear-gradient(135deg, #7ec8a5, #5eb3a6);
  color: white;
  border-color: transparent;
}

.c-btn-primary:hover {
  box-shadow: 0 4px 14px rgba(126,200,165,0.3);
}

.c-btn-secondary {
  background: #f5f5f5;
  color: #555;
  border-color: #e0e0e0;
}

.c-btn-secondary:hover {
  border-color: #c084fc;
  color: #3a5a40;
}

.c-btn-active {
  background: rgba(192,132,252,0.15);
  color: #c084fc;
  border-color: #c084fc;
}

.c-btn-danger {
  background: #fff0f0;
  color: #ff6b6b;
  border-color: #ffd0d0;
}

.c-btn-danger:hover {
  border-color: #ff6b6b;
}

.c-btn-warn {
  background: #fffbf0;
  color: #f6b93b;
  border-color: #fce8b0;
}

.c-btn-warn:hover {
  border-color: #f6b93b;
}

/* 🎬 面板入场动画 */
.console-slide-enter-active,
.console-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.console-slide-enter-from,
.console-slide-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}

/* 📱 */
@media (max-width: 600px) {
  .console-btn {
    bottom: 18px;
    right: 18px;
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
  }
  .console-panel {
    right: 12px;
    left: 12px;
    bottom: 74px;
    width: auto;
  }
}
</style>
