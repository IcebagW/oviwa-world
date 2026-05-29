<template>
  <div class="create-page">
    <div class="create-header">
      <button class="back-btn" @click="goBack">← 返回列表</button>
      <h2>{{ isEditing ? '✏️ 编辑日志' : '🌸 写下新的冒险' }}</h2>
    </div>

    <div class="card form-card">
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
        rows="8"
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
        <button v-if="isEditing" class="btn cancel" @click="cancelEdit">取消</button>
        <button class="btn" @click="submitPost" :disabled="submitting">
          {{ submitting ? '保存中...' : isEditing ? '💾 保存修改' : '📝 发布日志' }}
        </button>
      </div>
      <p v-if="formError" class="error-msg">⚠️ {{ formError }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adventureAPI } from '../api/client.js'

const route = useRoute()
const router = useRouter()

const form = reactive({ title: '', content: '', image: '' })
const formError = ref('')
const submitting = ref(false)
const editingId = ref(null)

const isEditing = computed(() => !!editingId.value)

function goBack() {
  router.push('/log')
}

// 加载编辑数据
onMounted(async () => {
  const editId = route.query.edit
  if (editId) {
    editingId.value = editId
    try {
      const res = await adventureAPI.getOne(editId)
      const post = res.data
      form.title = post.title
      form.content = post.content
      form.image = post.image || ''
    } catch (err) {
      formError.value = '加载日志失败'
    }
  }
})

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

function cancelEdit() {
  router.push('/log')
}

// 提交/更新日志
async function submitPost() {
  formError.value = ''
  if (!form.title.trim()) { formError.value = '标题不能为空'; return }
  if (!form.content.trim()) { formError.value = '内容不能为空'; return }

  submitting.value = true
  try {
    if (isEditing.value) {
      await adventureAPI.update(editingId.value, {
        title: form.title,
        content: form.content,
        image: form.image
      })
    } else {
      await adventureAPI.create(form.title, form.content, form.image)
    }
    router.push('/log')
  } catch (err) {
    formError.value = err.response?.data?.error || (isEditing.value ? '保存失败，请重试' : '发布失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.create-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.create-header h2 {
  margin: 0;
  font-size: 1.5rem;
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
  white-space: nowrap;
}

.back-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
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
  min-height: 200px;
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

.error-msg {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 10px;
}

/* 📱 响应式 */
@media (max-width: 600px) {
  .create-page {
    padding: 12px;
  }
  .create-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .card {
    padding: 16px;
  }
}
</style>
