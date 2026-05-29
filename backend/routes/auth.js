import express from 'express'
import User from '../models/User.js'
import { generateToken, verifyToken } from '../middleware/auth.js'

const router = express.Router()

// 📝 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body

    // 验证
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: '所有字段都是必需的' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: '两次输入的密码不一致' })
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    })

    if (existingUser) {
      return res.status(409).json({ error: '用户名或邮箱已被使用' })
    }

    // 创建新用户
    const user = new User({ username, email, password })
    await user.save()

    // 生成令牌
    const token = generateToken(user._id)

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        hp: user.hp,
        maxHp: user.maxHp,
        stamina: user.stamina,
        maxStamina: user.maxStamina,
        strength: user.strength,
        intelligence: user.intelligence,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        viwaCoins: user.viwaCoins,
        portfolio: user.portfolio
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🔓 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // 验证
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码是必需的' })
    }

    // 查找用户（包括密码字段）
    const user = await User.findOne({ username }).select('+password')

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 生成令牌
    const token = generateToken(user._id)

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        hp: user.hp,
        maxHp: user.maxHp,
        stamina: user.stamina,
        maxStamina: user.maxStamina,
        strength: user.strength,
        intelligence: user.intelligence,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        viwaCoins: user.viwaCoins,
        portfolio: user.portfolio
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 👤 获取当前用户信息（需要认证）
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚪 登出（前端删除令牌即可，后端不需要特殊处理）
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: '登出成功' })
})

// 👤 获取个人资料（含 RPG 属性）
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      level: user.level,
      xp: user.xp,
      hp: user.hp,
      maxHp: user.maxHp,
      stamina: user.stamina,
      maxStamina: user.maxStamina,
      strength: user.strength,
      intelligence: user.intelligence,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      viwaCoins: user.viwaCoins,
      portfolio: user.portfolio
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✏️ 更新个人资料
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { displayName, bio, avatar } = req.body
    const updateData = {}
    if (displayName !== undefined) updateData.displayName = displayName
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json({
      message: '更新成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        hp: user.hp,
        maxHp: user.maxHp,
        stamina: user.stamina,
        maxStamina: user.maxStamina,
        strength: user.strength,
        intelligence: user.intelligence,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        viwaCoins: user.viwaCoins,
        portfolio: user.portfolio
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
