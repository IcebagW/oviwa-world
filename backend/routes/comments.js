import express from 'express'
import Comment from '../models/Comment.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// 💬 获取某篇日志的所有评论
router.get('/:adventureId', verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ adventure: req.params.adventureId })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
    res.json(comments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 💬 添加评论
router.post('/:adventureId', verifyToken, async (req, res) => {
  try {
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '评论内容不能为空' })
    }

    const comment = new Comment({
      content: content.trim(),
      author: req.userId,
      adventure: req.params.adventureId
    })

    await comment.save()
    const populated = await comment.populate('author', 'username')

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🗑️ 删除评论（仅作者或管理员）
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ error: '评论不存在' })
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ error: '只能删除自己的评论' })
    }

    await Comment.findByIdAndDelete(req.params.id)
    res.json({ message: '删除成功' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
