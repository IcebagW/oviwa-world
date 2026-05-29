<template>
  <div class="detail-page">
    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-icon">😵</p>
      <p>{{ error }}</p>
      <button class="btn" @click="goBack">← 返回日志列表</button>
    </div>

    <!-- 正文 -->
    <template v-else-if="post">
      <div class="top-bar">
        <button class="back-btn" @click="goBack">← 返回列表</button>
        <div class="top-actions" v-if="isOwner">
          <button class="small-btn edit" @click="goEdit">✏️ 编辑</button>
          <button class="small-btn delete" @click="confirmDelete">🗑️ 删除</button>
        </div>
      </div>

      <article class="post-article">
        <header class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <span class="author">👤 {{ post.author?.username || '未知' }}</span>
            <span class="date">📅 {{ formatDate(post.createdAt) }}</span>
            <span v-if="post.updatedAt !== post.createdAt" class="edited">
              ✏️ 编辑于 {{ formatDate(post.updatedAt) }}
            </span>
          </div>
        </header>

        <img v-if="post.image" :src="post.image" class="post-image" />

        <div class="post-content">{{ post.content }}</div>
      </article>

      <!-- 💬 评论区 -->
      <div class="comments-section">
        <h3 class="comments-title">💬 评论 ({{ comments.length }})</h3>

        <!-- 评论输入框 -->
        <div class="comment-input-area">
          <textarea
            v-model="commentText"
            placeholder="写下你的评论..."
            class="comment-input"
            rows="3"
          ></textarea>
          <div class="comment-input-actions">
            <span class="comment-hint">文明评论，友善交流 🌟</span>
            <button class="btn comment-submit" @click="submitComment" :disabled="commentSubmitting">
              {{ commentSubmitting ? '发送中...' : '💬 发表评论' }}
            </button>
          </div>
          <p v-if="commentError" class="error-msg">⚠️ {{ commentError }}</p>
        </div>

        <!-- 评论列表 -->
        <div v-if="commentsLoading" class="loading">加载评论中...</div>

        <div v-else-if="comments.length === 0" class="no-comments">
          <p>还没有评论，来聊聊吧 ✨</p>
        </div>

        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment._id" class="comment-item">
            <div class="comment-header">
              <span class="comment-author">👤 {{ comment.author?.username || '未知' }}</span>
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-actions" v-if="isCommentOwner(comment)">
              <button class="small-btn comment-delete" @click="deleteComment(comment._id)">🗑️ 删除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 删除确认弹窗 -->
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal">
          <h3>确认删除</h3>
          <p>确定要删除「{{ post.title }}」吗？此操作不可撤销。</p>
          <div class="modal-actions">
            <button class="btn cancel" @click="showDeleteModal = false">取消</button>
            <button class="btn danger" @click="doDelete">确认删除</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adventureAPI, commentAPI } from '../api/client.js'
import { useUserStore } from '../store/user.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const post = ref(null)
const loading = ref(true)
const error = ref('')
const showDeleteModal = ref(false)

// 评论状态
const comments = ref([])
const commentsLoading = ref(true)
const commentText = ref('')
const commentSubmitting = ref(false)
const commentError = ref('')

const isOwner = computed(() => {
  if (!post.value || !userStore.user) return false
  return (
    post.value.author?._id === userStore.user.id ||
    post.value.author === userStore.user.id
  )
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function goBack() {
  router.push('/log')
}

function goEdit() {
  router.push({ path: '/log/new', query: { edit: post.value._id } })
}

async function fetchPost() {
  loading.value = true
  error.value = ''
  try {
    const res = await adventureAPI.getOne(route.params.id)
    post.value = res.data
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = '日志不存在'
    } else {
      error.value = '加载失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// 💬 获取评论
async function fetchComments() {
  commentsLoading.value = true
  try {
    const res = await commentAPI.getByAdventure(route.params.id)
    comments.value = res.data
  } catch (err) {
    console.error('获取评论失败:', err)
  } finally {
    commentsLoading.value = false
  }
}

// 💬 提交评论
async function submitComment() {
  commentError.value = ''
  const text = commentText.value.trim()
  if (!text) {
    commentError.value = '评论内容不能为空'
    return
  }
  if (text.length > 2000) {
    commentError.value = '评论不能超过2000字'
    return
  }

  commentSubmitting.value = true
  try {
    await commentAPI.create(route.params.id, text)
    commentText.value = ''
    await fetchComments()
  } catch (err) {
    commentError.value = err.response?.data?.error || '评论发送失败'
  } finally {
    commentSubmitting.value = false
  }
}

// 💬 删除评论
async function deleteComment(commentId) {
  try {
    await commentAPI.delete(commentId)
    await fetchComments()
  } catch (err) {
    console.error('删除评论失败:', err)
  }
}

// 💬 判断是否是自己的评论
function isCommentOwner(comment) {
  if (!userStore.user) return false
  return comment.author?._id === userStore.user.id || comment.author === userStore.user.id
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function doDelete() {
  try {
    await adventureAPI.delete(post.value._id)
    router.push('/log')
  } catch (err) {
    console.error('删除失败:', err)
  }
}

onMounted(async () => {
  await fetchPost()
  await fetchComments()
})
</script>

<style scoped>
.detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 顶部栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.top-actions {
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

/* 文章 */
.post-article {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.post-header {
  margin-bottom: 20px;
}

.post-title {
  font-size: 1.8rem;
  color: #222;
  margin-bottom: 12px;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #999;
  flex-wrap: wrap;
}

.edited {
  color: #bbb;
  font-style: italic;
}

.post-image {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 12px;
  margin-bottom: 24px;
  background: #f8f8f8;
}

.post-content {
  line-height: 1.9;
  color: #333;
  white-space: pre-wrap;
  font-size: 1.05rem;
}

/* 加载 & 错误 */
.loading-state,
.error-state {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.error-state .btn {
  margin-top: 20px;
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7ec8a5, #5eb3a6);
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #7ec8a5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* 💬 评论区 */
.comments-section {
  margin-top: 32px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.comments-title {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #333;
}

.comment-input-area {
  margin-bottom: 24px;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  line-height: 1.6;
}

.comment-input:focus {
  border-color: #7ec8a5;
  box-shadow: 0 0 8px rgba(126,200,165,0.3);
}

.comment-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}

.comment-hint {
  font-size: 0.8rem;
  color: #aaa;
}

.comment-submit {
  padding: 8px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7ec8a5, #5eb3a6);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.comment-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(126,200,165,0.4);
}

.comment-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 8px;
}

.no-comments {
  text-align: center;
  padding: 30px 20px;
  color: #aaa;
  font-size: 0.95rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
  transition: background 0.2s;
}

.comment-item:hover {
  background: #f5f5f5;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.comment-date {
  font-size: 0.8rem;
  color: #aaa;
}

.comment-content {
  line-height: 1.6;
  color: #444;
  white-space: pre-wrap;
  font-size: 0.95rem;
}

.comment-actions {
  margin-top: 8px;
  text-align: right;
}

.comment-delete {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.comment-delete:hover {
  background: #ffe0e0;
}

.loading {
  text-align: center;
  padding: 30px 20px;
  color: #888;
}

/* 📱 响应式 */
@media (max-width: 600px) {
  .detail-page {
    padding: 12px;
  }
  .post-article {
    padding: 20px;
  }
  .post-title {
    font-size: 1.4rem;
  }
  .comments-section {
    padding: 16px;
  }
  .comment-input-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .comment-hint {
    display: none;
  }
}
</style>
