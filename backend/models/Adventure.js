import mongoose from 'mongoose'

const adventureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    content: {
      type: String,
      required: true,
      maxlength: 50000
    },
    image: {
      type: String,
      default: ''
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

adventureSchema.index({ createdAt: -1 })

const Adventure = mongoose.model('Adventure', adventureSchema)

export default Adventure
