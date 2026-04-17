/**
 * Resource Model
 * Interview tips, question bank, and tutorial resources
 */

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['tip', 'question', 'video', 'article', 'guide'],
      required: true,
    },
    category: {
      type: String,
      enum: ['hr', 'technical', 'behavioral', 'general', 'salary', 'company'],
      default: 'general',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'all'],
      default: 'all',
    },
    content: { type: String, default: '' },
    url: { type: String, default: '' },
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resourceSchema.index({ type: 1, category: 1 });
resourceSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
