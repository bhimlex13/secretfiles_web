import mongoose from 'mongoose';

// Define the shape of a single comment
const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
}, { timestamps: true });

// Define the shape of a post
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAnonymous: { type: Boolean, default: false },
  tags: [{ type: String }],
  reactions: {
    support: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    relate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    happy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sad: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    angry: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    insightful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  comments: [CommentSchema]
}, { timestamps: true });

// Prevent Next.js from recompiling the model multiple times
export default mongoose.models.Post || mongoose.model('Post', PostSchema);