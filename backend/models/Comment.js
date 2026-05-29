import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    adventure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Adventure',
      required: true
    }
  },
  { timestamps: true }
)

commentSchema.index({ adventure: 1, createdAt: -1 })

const Comment = mongoose.model('Comment', commentSchema)

export default Comment
