import express from 'express'
import Stock from '../models/Stock.js'
import User from '../models/User.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// ========== 初始股票种子数据 ==========
const SEED_STOCKS = [
  { symbol: 'OVIWA', name: 'Oviwa 集团', price: 88.50 },
  { symbol: 'OWAWA', name: 'Owawa 科技', price: 45.20 },
  { symbol: 'VIWA',  name: 'Viwa 金融',  price: 120.00 },
  { symbol: 'BEACH', name: '沙滩度假村', price: 30.80 },
  { symbol: 'ADVEN', name: '冒险者公会', price: 65.40 },
  { symbol: 'MAPLE', name: '枫叶矿业',   price: 18.60 }
]

export async function seedStocks() {
  const count = await Stock.countDocuments()
  if (count === 0) {
    for (const s of SEED_STOCKS) {
      const stock = new Stock({
        ...s,
        previousPrice: s.price,
        priceHistory: [{ price: s.price, time: new Date() }]
      })
      await stock.save()
    }
    console.log('📈 初始股票已创建')
  }
}

// ========== 股价定时更新（每10秒） ==========
export function startPriceUpdater() {
  setInterval(async () => {
    try {
      const stocks = await Stock.find()
      for (const stock of stocks) {
        // 随机涨跌：-5% ~ +5%
        const change = (Math.random() - 0.5) * 0.10
        const newPrice = +(stock.price * (1 + change)).toFixed(2)
        const clampedPrice = Math.max(1, newPrice) // 最低1元

        stock.previousPrice = stock.price
        stock.price = clampedPrice
        stock.changePercent = +(((clampedPrice - stock.previousPrice) / stock.previousPrice) * 100).toFixed(2)

        // 保留最近 100 条历史
        stock.priceHistory.push({ price: clampedPrice, time: new Date() })
        if (stock.priceHistory.length > 100) {
          stock.priceHistory = stock.priceHistory.slice(-100)
        }

        await stock.save()
      }
    } catch (err) {
      console.error('股价更新错误:', err.message)
    }
  }, 10000) // 10秒
}

// ========== 📋 获取所有股票 ==========
router.get('/', verifyToken, async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ symbol: 1 })
    const user = await User.findById(req.userId)

    // 附带用户的持仓信息
    const result = stocks.map(stock => {
      const holding = user.portfolio.find(p => p.stockId.equals(stock._id))
      return {
        _id: stock._id,
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        previousPrice: stock.previousPrice,
        changePercent: stock.changePercent,
        shares: holding ? holding.shares : 0,
        avgCost: holding ? holding.avgCost : 0
      }
    })

    res.json({
      stocks: result,
      viwaCoins: user.viwaCoins
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ========== 📋 获取单只股票详情 ==========
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id)
    if (!stock) return res.status(404).json({ error: '股票不存在' })

    const user = await User.findById(req.userId)
    const holding = user.portfolio.find(p => p.stockId.equals(stock._id))

    res.json({
      ...stock.toObject(),
      shares: holding ? holding.shares : 0,
      avgCost: holding ? holding.avgCost : 0
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ========== 💰 买入 ==========
router.post('/buy', verifyToken, async (req, res) => {
  try {
    const { stockId, shares } = req.body
    if (!stockId || !shares || shares <= 0) {
      return res.status(400).json({ error: '参数无效' })
    }

    const stock = await Stock.findById(stockId)
    if (!stock) return res.status(404).json({ error: '股票不存在' })

    const totalCost = +(stock.price * shares).toFixed(2)

    const user = await User.findById(req.userId)
    if (user.viwaCoins < totalCost) {
      return res.status(400).json({
        error: `Viwa币不足！需要 ${totalCost}，当前 ${user.viwaCoins}`
      })
    }

    // 更新或创建持仓
    const existing = user.portfolio.find(p => p.stockId.equals(stockId))
    if (existing) {
      // 加权平均成本
      const totalShares = existing.shares + shares
      existing.avgCost = +(
        (existing.avgCost * existing.shares + stock.price * shares) / totalShares
      ).toFixed(2)
      existing.shares = totalShares
    } else {
      user.portfolio.push({
        stockId: stock._id,
        symbol: stock.symbol,
        shares,
        avgCost: stock.price
      })
    }

    user.viwaCoins -= totalCost
    await user.save()

    res.json({
      message: `✅ 成功买入 ${shares} 股 ${stock.symbol}`,
      viwaCoins: user.viwaCoins,
      portfolio: user.portfolio
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ========== 💸 卖出 ==========
router.post('/sell', verifyToken, async (req, res) => {
  try {
    const { stockId, shares } = req.body
    if (!stockId || !shares || shares <= 0) {
      return res.status(400).json({ error: '参数无效' })
    }

    const stock = await Stock.findById(stockId)
    if (!stock) return res.status(404).json({ error: '股票不存在' })

    const user = await User.findById(req.userId)
    const existing = user.portfolio.find(p => p.stockId.equals(stockId))

    if (!existing || existing.shares < shares) {
      return res.status(400).json({ error: '持有股份不足' })
    }

    const revenue = +(stock.price * shares).toFixed(2)

    existing.shares -= shares
    if (existing.shares === 0) {
      // 卖完则移除持仓
      user.portfolio.pull({ _id: existing._id })
    }

    user.viwaCoins += revenue
    await user.save()

    res.json({
      message: `✅ 成功卖出 ${shares} 股 ${stock.symbol}，获得 ${revenue} Viwa币`,
      viwaCoins: user.viwaCoins,
      portfolio: user.portfolio
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
