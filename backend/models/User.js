import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱']
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false // 查询时不返回密码
    },
    // 🎮 RPG 属性
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    hp: { type: Number, default: 100 },
    maxHp: { type: Number, default: 100 },
    stamina: { type: Number, default: 100 },
    maxStamina: { type: Number, default: 100 },
    strength: { type: Number, default: 5 },
    intelligence: { type: Number, default: 5 },

    // 👤 个人信息
    displayName: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },

    // 💰 经济系统
    viwaCoins: { type: Number, default: 10000 },
    portfolio: [{
      stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
      symbol: String,
      shares: { type: Number, default: 0 },
      avgCost: { type: Number, default: 0 }
    }],

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

// 保存前加密密码
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next()
  }
  
  try {
    const salt = await bcryptjs.genSalt(10)
    this.password = await bcryptjs.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

// 验证密码方法
userSchema.methods.comparePassword = async function(inputPassword) {
  return await bcryptjs.compare(inputPassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
