<template>
  <div class="profile-page">
    <!-- 🎮 角色卡片 -->
    <div class="character-card">
      <div class="avatar-section">
        <div class="avatar">
          {{ displayChar }}
        </div>
        <div class="level-badge">Lv.{{ user.level }}</div>
      </div>

      <div class="character-info">
        <h2 class="char-name">{{ user.displayName || user.username }}</h2>
        <p class="char-username" v-if="user.displayName">@{{ user.username }}</p>
        <p class="char-bio">{{ user.bio || '这个人很懒，什么都没写~' }}</p>
      </div>
    </div>

    <!-- 📊 经验条 -->
    <div class="xp-section">
      <div class="xp-header">
        <span>经验值</span>
        <span>{{ user.xp }} / {{ xpForNext }}</span>
      </div>
      <div class="xp-bar">
        <div class="xp-fill" :style="{ width: xpPercent + '%' }"></div>
      </div>
    </div>

    <!-- ⚔️ 属性面板 -->
    <div class="stats-grid">
      <div class="stat-card hp">
        <div class="stat-icon">❤️</div>
        <div class="stat-detail">
          <span class="stat-label">体力</span>
          <div class="stat-bar-bg">
            <div class="stat-bar-fill hp-fill" :style="{ width: (user.hp / user.maxHp * 100) + '%' }"></div>
          </div>
          <span class="stat-value">{{ user.hp }}/{{ user.maxHp }}</span>
        </div>
      </div>

      <div class="stat-card stamina">
        <div class="stat-icon">⚡</div>
        <div class="stat-detail">
          <span class="stat-label">精力</span>
          <div class="stat-bar-bg">
            <div class="stat-bar-fill stamina-fill" :style="{ width: (user.stamina / user.maxStamina * 100) + '%' }"></div>
          </div>
          <span class="stat-value">{{ user.stamina }}/{{ user.maxStamina }}</span>
        </div>
      </div>

      <div class="stat-card strength">
        <div class="stat-icon">💪</div>
        <div class="stat-detail">
          <span class="stat-label">力量</span>
          <span class="stat-value">{{ user.strength }}</span>
        </div>
      </div>

      <div class="stat-card intelligence">
        <div class="stat-icon">🧠</div>
        <div class="stat-detail">
          <span class="stat-label">智力</span>
          <span class="stat-value">{{ user.intelligence }}</span>
        </div>
      </div>
    </div>

    <!-- ✏️ 编辑个人信息 -->
    <div class="edit-section">
      <button class="edit-toggle" @click="showEditor = !showEditor">
        {{ showEditor ? '收起' : '✏️ 编辑个人资料' }}
      </button>

      <div v-if="showEditor" class="edit-form">
        <div class="form-group">
          <label>显示名称</label>
          <input v-model="editForm.displayName" placeholder="输入你的冒险者称号" maxlength="20" />
        </div>

        <div class="form-group">
          <label>个人简介</label>
          <textarea v-model="editForm.bio" placeholder="介绍一下自己..." rows="3" maxlength="200"></textarea>
        </div>

        <div class="form-actions">
          <button class="btn btn-save" @click="saveProfile" :disabled="userStore.saving">
            {{ userStore.saving ? '保存中...' : '💾 保存' }}
          </button>
          <p v-if="saveMessage" class="save-message" :class="{ error: saveError }">
            {{ saveMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../store/user.js'

export default {
  name: 'Profile',
  setup() {
    const userStore = useUserStore()
    const user = computed(() => userStore.user)
    const showEditor = ref(false)
    const saveMessage = ref('')
    const saveError = ref(false)

    const editForm = ref({
      displayName: '',
      bio: ''
    })

    const displayChar = computed(() => {
      return (user.value.displayName || user.value.username).charAt(0).toUpperCase()
    })

    const xpForNext = computed(() => user.value.level * 100)

    const xpPercent = computed(() => {
      return Math.min((user.value.xp / xpForNext.value) * 100, 100)
    })

    onMounted(async () => {
      await userStore.fetchProfile()
      editForm.value.displayName = user.value.displayName || ''
      editForm.value.bio = user.value.bio || ''
    })

    const saveProfile = async () => {
      saveMessage.value = ''
      saveError.value = false
      const ok = await userStore.updateProfile({
        displayName: editForm.value.displayName,
        bio: editForm.value.bio
      })
      if (ok) {
        saveMessage.value = '✅ 保存成功！'
        editForm.value.displayName = user.value.displayName
        editForm.value.bio = user.value.bio
      } else {
        saveMessage.value = userStore.error || '保存失败'
        saveError.value = true
      }
      setTimeout(() => { saveMessage.value = '' }, 3000)
    }

    return {
      user, userStore, showEditor, editForm,
      displayChar, xpForNext, xpPercent,
      saveProfile, saveMessage, saveError
    }
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 520px;
  margin: 30px auto;
  padding: 0 20px 60px;
}

/* 🎴 角色卡片 */
.character-card {
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #7ec8a5, #ffd6a5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 12px rgba(126,200,165,0.3);
}

.level-badge {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: #ff8fab;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(255,143,171,0.3);
}

.character-info {
  flex: 1;
  min-width: 0;
}

.char-name {
  font-size: 1.4rem;
  margin: 0 0 2px;
  color: #3a5a40;
}

.char-username {
  font-size: 0.85rem;
  color: #999;
  margin: 0 0 6px;
}

.char-bio {
  font-size: 0.9rem;
  color: #777;
  margin: 0;
  line-height: 1.4;
}

/* 📊 经验条 */
.xp-section {
  background: rgba(255,255,255,0.7);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.xp-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.xp-bar {
  height: 12px;
  background: #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
}

.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #7ec8a5, #ffd6a5);
  border-radius: 10px;
  transition: width 0.5s ease;
}

/* ⚔️ 属性网格 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(255,255,255,0.75);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.hp { border-left: 4px solid #ff6b6b; }
.stat-card.stamina { border-left: 4px solid #ffd93d; }
.stat-card.strength { border-left: 4px solid #ff8fab; }
.stat-card.intelligence { border-left: 4px solid #6c5ce7; }

.stat-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: #888;
  font-weight: 500;
}

.stat-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #3a5a40;
}

.stat-bar-bg {
  height: 6px;
  background: #eee;
  border-radius: 6px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.hp-fill { background: linear-gradient(90deg, #ff6b6b, #ee5a24); }
.stamina-fill { background: linear-gradient(90deg, #ffd93d, #f6b93b); }

/* ✏️ 编辑区域 */
.edit-section {
  background: rgba(255,255,255,0.7);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.edit-toggle {
  width: 100%;
  padding: 12px;
  background: none;
  border: 2px dashed #ccc;
  border-radius: 12px;
  color: #666;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-toggle:hover {
  border-color: #7ec8a5;
  color: #3a5a40;
}

.edit-form {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group textarea {
  padding: 10px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.3s;
  background: white;
  color: #3a5a40;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #7ec8a5;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.btn-save {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #7ec8a5, #ffd6a5);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-save:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 14px rgba(126,200,165,0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-message {
  font-size: 0.85rem;
  color: #7ec8a5;
  margin: 0;
}

.save-message.error {
  color: #ff6b6b;
}

/* 📱 响应式 */
@media (max-width: 600px) {
  .profile-page { margin: 16px auto; }
  .character-card { padding: 20px; }
  .avatar { width: 64px; height: 64px; font-size: 1.5rem; }
  .char-name { font-size: 1.2rem; }
  .stats-grid { gap: 8px; }
  .stat-card { padding: 12px; }
}
</style>
