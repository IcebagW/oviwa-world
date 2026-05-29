<template>
  <div class="blog-page">
    <div class="blog-header">
      <h2>📖 冒险日志</h2>
      <p class="subtitle">记录你在 Oviwa 世界的每一段冒险 ✨</p>
    </div>

    <!-- 📋 日志列表 -->
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="logs.length === 0" class="empty-state">
      <p>还没有冒险日志，写下第一篇吧！🌟</p>
    </div>

    <div v-else class="posts">
      <div v-for="post in logs" :key="post._id" class="card post-card">
        <div class="post-header">
          <router-link :to="`/log/${post._id}`" class="post-title-link">
            <h3 class="post-title">{{ post.title }}</h3>
          </router-link>
          <div class="post-meta">
            <span class="author">👤 {{ post.author?.username || '未知' }}</span>
            <span class="date">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-summary">{{ post.content }}</div>
        <img v-if="post.image" :src="post.image" class="post-image" />
        <div class="post-footer">
          <router-link :to="`/log/${post._id}`" class="read-more">阅读全文 →</router-link>
          <div class="post-actions" v-if="isOwner(post)">
            <button class="small-btn edit" @click="goEdit(post)">✏️ 编辑</button>
            <button class="small-btn delete" @click="confirmDelete(post)">🗑️ 删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 📄 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="currentPage <= 1" @click="goPage(currentPage - 1)">← 上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="goPage(currentPage + 1)">下一页 →</button>
    </div>

    <!-- ➕ 浮动添加按钮 -->
    <button class="fab" @click="$router.push('/log/new')" title="写新的冒险日志">
      <span class="fab-icon">+</span>
    </button>

    <!-- 🗑️ 删除确认弹窗 -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal">
        <h3>确认删除</h3>
        <p>确定要删除「{{ deleteTarget.title }}」吗？此操作不可撤销。</p>
        <div class="modal-actions">
          <button class="btn cancel" @click="deleteTarget = null">取消</button>
          <button class="btn danger" @click="doDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adventureAPI } from '../api/client.js'
import { useUserStore } from '../store/user.js'

const router = useRouter()
const userStore = useUserStore()

// 列表状态
const logs = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)

// 删除确认
const deleteTarget = ref(null)

// 权限判断
const isOwner = (post) => {
  return post.author?._id === userStore.user.id || post.author === userStore.user.id
}

// 格式化日期
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

// 加载日志列表
async function fetchLogs() {
  loading.value = true
  try {
    const res = await adventureAPI.getAll(currentPage.value)
    logs.value = res.data.logs
    totalPages.value = res.data.totalPages
  } catch (err) {
    console.error('获取日志失败:', err)
  } finally {
    loading.value = false
  }
}

// 分页
function goPage(page) {
  currentPage.value = page
  fetchLogs()
}

// 跳转到编辑
function goEdit(post) {
  router.push({ path: '/log/new', query: { edit: post._id } })
}

// 删除确认
function confirmDelete(post) {
  deleteTarget.value = post
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await adventureAPI.delete(deleteTarget.value._id)
    deleteTarget.value = null
    await fetchLogs()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

onMounted(fetchLogs)
</script>

<style scoped>
.blog-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 80px; /* 给浮动按钮留空间 */
}

.blog-header {
  text-align: center;
  margin-bottom: 30px;
}

.blog-header h2 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.subtitle {
  color: #888;
  font-size: 1rem;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: transform 0.2s;
}

.loading, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

/* 帖子卡片 */
.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.post-header {
  margin-bottom: 12px;
}

.post-title-link {
  text-decoration: none;
  color: inherit;
  display: inline-block;
}

.post-title-link:hover .post-title {
  color: #5eb3a6;
}

.post-title {
  font-size: 1.3rem;
  margin-bottom: 6px;
  color: #333;
  transition: color 0.2s;
}

.post-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #999;
}

.post-summary {
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 12px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.read-more {
  color: #5eb3a6;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.read-more:hover {
  color: #7ec8a5;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.small-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.small-btn.edit {
  background: #e3f2fd;
  color: #1565c0;
}

.small-btn.delete {
  background: #ffe0e0;
  color: #d32f2f;
}

/* ➕ 浮动添加按钮 (FAB) */
.fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7ec8a5, #5eb3a6);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(94, 179, 166, 0.4);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.fab:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 6px 24px rgba(94, 179, 166, 0.6);
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  font-size: 2rem;
  font-weight: 300;
  line-height: 1;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #7ec8a5;
  color: white;
  border-color: #7ec8a5;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 400px;
}

.modal h3 {
  margin-bottom: 12px;
}

.modal p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7ec8a5, #5eb3a6);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
}

.btn.cancel {
  background: #f5f5f5;
  color: #333;
  flex: 0.5;
}

.btn.danger {
  background: linear-gradient(135deg, #ef5350, #d32f2f);
}

/* 📱 响应式 */
@media (max-width: 600px) {
  .blog-page {
    padding: 12px;
    padding-bottom: 80px;
  }
  .blog-header h2 {
    font-size: 1.5rem;
  }
  .card {
    padding: 16px;
  }
  .post-title {
    font-size: 1.1rem;
  }
  .fab {
    bottom: 20px;
    right: 20px;
    width: 52px;
    height: 52px;
  }
  .fab-icon {
    font-size: 1.6rem;
  }
}

.pagination span {
  font-size: 0.9rem;
  color: #666;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 400px;
}

.modal h3 {
  margin-bottom: 12px;
}

.modal p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 10px;
}
</style>