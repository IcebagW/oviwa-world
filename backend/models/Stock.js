import mongoose from 'mongoose'

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      default: 50
    },
    previousPrice: {
      type: Number,
      default: 50
    },
    changePercent: {
      type: Number,
      default: 0
    },
    // 价格历史（最近100条，用于图表）
    priceHistory: [{
      price: Number,
      time: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
)

const Stock = mongoose.model('Stock', stockSchema)

export default Stock
