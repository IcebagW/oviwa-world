import express from 'express'
import Adventure from '../models/Adventure.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// 📝 获取所有日志（分页）
router.get('/', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      Adventure.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Adventure.countDocuments()
    ])

    res.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 📖 获取单篇日志
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const log = await Adventure.findById(req.params.id)
      .populate('author', 'username')
    if (!log) return res.status(404).json({ error: '日志不存在' })
    res.json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✏️ 创建日志
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, image } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ error: '标题不能为空' })
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '内容不能为空' })
    }

    const log = new Adventure({
      title: title.trim(),
      content: content.trim(),
      image: image || '',
      author: req.userId
    })

    await log.save()
    const populated = await log.populate('author', 'username')

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✏️ 更新日志（仅作者）
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const log = await Adventure.findById(req.params.id)
    if (!log) return res.status(404).json({ error: '日志不存在' })
    if (log.author.toString() !== req.userId) {
      return res.status(403).json({ error: '只能编辑自己的日志' })
    }

    const { title, content, image } = req.body
    if (title !== undefined) log.title = title.trim()
    if (content !== undefined) log.content = content.trim()
    if (image !== undefined) log.image = image

    await log.save()
    const populated = await log.populate('author', 'username')

    res.json(populated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🗑️ 删除日志（仅作者）
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const log = await Adventure.findById(req.params.id)
    if (!log) return res.status(404).json({ error: '日志不存在' })
    if (log.author.toString() !== req.userId) {
      return res.status(403).json({ error: '只能删除自己的日志' })
    }

    await Adventure.findByIdAndDelete(req.params.id)
    res.json({ message: '删除成功' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
