import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import adventureRoutes from './routes/adventures.js'
import commentRoutes from './routes/comments.js'
import stockRoutes, { seedStocks, startPriceUpdater } from './routes/stocks.js'

dotenv.config()

const app = express()

// ✨ 中间件
app.use(express.json({ limit: '5mb' }))
app.use(cors({
  origin: 'http://localhost:5173', // Vite 默认端口
  credentials: true
}))

// 🗄️ MongoDB 连接
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB 已连接')
  // 📈 初始化股票 & 启动价格更新
  await seedStocks()
  startPriceUpdater()
})
.catch(err => console.log('❌ MongoDB 连接失败:', err))

// 🔐 认证路由
app.use('/api/auth', authRoutes)

// 📖 冒险日志路由
app.use('/api/adventures', adventureRoutes)

// 💬 评论路由
app.use('/api/comments', commentRoutes)

// 📈 股票路由
app.use('/api/stocks', stockRoutes)

// 📌 测试路由
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ 服务器运行中' })
})

// 🚀 启动服务器
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
})
