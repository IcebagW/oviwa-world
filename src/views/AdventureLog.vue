<template>
  <div class="blog-page">
    <div class="blog-header">
      <h2>📖 冒险日志</h2>
      <p class="subtitle">记录你在 Oviwa 世界的每一段冒险 ✨</p>
    </div>

    <!-- ✏️ 新建/编辑表单 -->
    <div class="card form-card">
      <h3>{{ editingId ? '✏️ 编辑日志' : '🌸 写下新的冒险' }}</h3>
      <input
        v-model="form.title"
        placeholder="给你的冒险起个标题..."
        class="input"
        maxlength="100"
      />
      <textarea
        v-model="form.content"
        placeholder="在这里写下你的冒险故事..."
        class="textarea"
        rows="6"
      ></textarea>
      <div class="image-upload">
        <label class="upload-btn" :class="{ 'has-image': form.image }">
          📷 {{ form.image ? '已选择图片' : '上传图片（可选）' }}
          <input type="file" accept="image/*" @change="handleImage" hidden />
        </label>
        <button v-if="form.image" class="small-btn remove" @click="removeImage">移除</button>
      </div>
      <div v-if="form.image" class="preview-img">
        <img :src="form.image" />
      </div>
      <div class="form-actions">
        <button v-if="editingId" class="btn cancel" @click="cancelEdit">取消</button>
        <button class="btn" @click="submitPost" :disabled="submitting">
          {{ submitting ? '发布中...' : editingId ? '💾 保存修改' : '📝 发布日志' }}
        </button>
      </div>
      <p v-if="formError" class="error-msg">⚠️ {{ formError }}</p>
    </div>

    <!-- 📋 日志列表 -->
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="logs.length === 0" class="empty-state">
      <p>还没有冒险日志，写下第一篇吧！🌟</p>
    </div>

    <div v-else class="posts">
      <div v-for="post in logs" :key="post._id" class="card post-card">
        <div class="post-header">
          <h3 class="post-title">{{ post.title }}</h3>
          <div class="post-meta">
            <span class="author">👤 {{ post.author?.username || '未知' }}</span>
            <span class="date">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-content" :class="{ expanded: expanded[post._id] }">
          {{ post.content }}
        </div>
        <div v-if="post.content.length > 200" class="read-more" @click="toggleExpand(post._id)">
          {{ expanded[post._id] ? '收起 ▲' : '阅读全文 ▼' }}
        </div>
        <img v-if="post.image" :src="post.image" class="post-image" />
        <div class="post-actions" v-if="isOwner(post)">
          <button class="small-btn edit" @click="startEdit(post)">✏️ 编辑</button>
          <button class="small-btn delete" @click="confirmDelete(post)">🗑️ 删除</button>
        </div>
      </div>
    </div>

    <!-- 📄 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="currentPage <= 1" @click="goPage(currentPage - 1)">← 上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="goPage(currentPage + 1)">下一页 →</button>
    </div>

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
import { ref, reactive, onMounted, computed } from 'vue'
import { adventureAPI } from '../api/client.js'
import { useUserStore } from '../store/user.js'

const userStore = useUserStore()

// 表单状态
const form = reactive({ title: '', content: '', image: '' })
const formError = ref('')
const submitting = ref(false)
const editingId = ref(null)

// 列表状态
const logs = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const expanded = reactive({})

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

// 展开/收起
function toggleExpand(id) {
  expanded[id] = !expanded[id]
}

// 图片上传（转 base64）
function handleImage(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    formError.value = '图片大小不能超过 2MB'
    return
  }
  formError.value = ''
  const reader = new FileReader()
  reader.onload = () => { form.image = reader.result }
  reader.readAsDataURL(file)
}

function removeImage() {
  form.image = ''
}

// 提交日志
async function submitPost() {
  formError.value = ''
  if (!form.title.trim()) { formError.value = '标题不能为空'; return }
  if (!form.content.trim()) { formError.value = '内容不能为空'; return }

  submitting.value = true
  try {
    if (editingId.value) {
      await adventureAPI.update(editingId.value, {
        title: form.title,
        content: form.content,
        image: form.image
      })
    } else {
      await adventureAPI.create(form.title, form.content, form.image)
    }
    resetForm()
    await fetchLogs()
  } catch (err) {
    formError.value = err.response?.data?.error || '操作失败，请重试'
  } finally {
    submitting.value = false
  }
}

// 编辑
function startEdit(post) {
  editingId.value = post._id
  form.title = post.title
  form.content = post.content
  form.image = post.image || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  form.title = ''
  form.content = ''
  form.image = ''
  formError.value = ''
  editingId.value = null
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

.form-card h3 {
  margin-bottom: 16px;
  font-size: 1.2rem;
}

.input, .textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
  font-family: inherit;
}

.input:focus, .textarea:focus {
  border-color: #7ec8a5;
  box-shadow: 0 0 8px rgba(126,200,165,0.3);
}

.textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.image-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.upload-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #e8e8e8;
}

.upload-btn.has-image {
  background: #e8f5e9;
  color: #2e7d32;
}

.small-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.small-btn.remove {
  background: #ffe0e0;
  color: #d32f2f;
}

.small-btn.edit {
  background: #e3f2fd;
  color: #1565c0;
}

.small-btn.delete {
  background: #ffe0e0;
  color: #d32f2f;
}

.preview-img {
  margin-bottom: 12px;
}

.preview-img img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  object-fit: cover;
}

.form-actions {
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

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(126,200,165,0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.cancel {
  background: #f5f5f5;
  color: #333;
  flex: 0.5;
}

.btn.danger {
  background: linear-gradient(135deg, #ef5350, #d32f2f);
  flex: 1;
}

.error-msg {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 10px;
}

.loading, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

/* 帖子卡片 */
.post-card {
  cursor: default;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.post-header {
  margin-bottom: 12px;
}

.post-title {
  font-size: 1.3rem;
  margin-bottom: 6px;
  color: #333;
}

.post-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #999;
}

.post-content {
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.post-content.expanded {
  -webkit-line-clamp: unset;
}

.read-more {
  color: #7ec8a5;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 8px;
  user-select: none;
}

.read-more:hover {
  text-decoration: underline;
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 12px;
}

.post-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
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