<template>
  <footer class="footer">
    <div class="content">
      <p>🌍 Oviwa World</p>
      <p class="love">Owawa ❤️ Ovivi</p>
      <p class="desc">在这个世界，每一段回忆都闪闪发光 ✨</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  text-align: center;
  margin-top: 40px;
  padding: 20px;

  /* 🌈 星露谷风背景 */
  background: linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.8));
  backdrop-filter: blur(10px);

  border-top-left-radius: 20px;
  border-top-right-radius: 20px;

  color: #3a5a40;
}

/* 内容区 */
.content p {
  margin: 6px 0;
}

/* 💖 爱心行 */
.love {
  color: #ff8fab;
  font-weight: bold;
  animation: glow 2s infinite alternate;
}

/* ✨ 描述 */
.desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* © */
.copyright {
  font-size: 0.8rem;
  opacity: 0.6;
}

/* 🌟 呼吸发光动画 */
@keyframes glow {
  from {
    text-shadow: 0 0 5px #ff8fab;
  }
  to {
    text-shadow: 0 0 15px #ff8fab;
  }
}
</style>