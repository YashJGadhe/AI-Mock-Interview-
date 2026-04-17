/**
 * Interview Model
 * Stores full interview session data including questions, answers, and AI feedback
 */

const mongoose = require('mongoose');

// ── Sub-schemas ──────────────────────────────────────────────────

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  questionText: { type: String, required: true },
  answerText: { type: String, default: '' },
  timeSpent: { type: Number, default: 0 }, // seconds
  isSkipped: { type: Boolean, default: false },
});

const feedbackSchema = new mongoose.Schema({
  overallScore: { type: Number, min: 0, max: 100, default: 0 },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    default: 'C',
  },
  summary: { type: String, default: '' },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  suggestions: [{ type: String }],
  perAnswerFeedback: [
    {
      questionText: String,
      answerText: String,
      score: Number,
      comment: String,
    },
  ],
  generatedAt: { type: Date, default: Date.now },
});

// ── Main Interview Schema ─────────────────────────────────────────

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Setup ───────────────────────────────────────────────────
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ['hr', 'technical', 'behavioral'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    questionCount: {
      type: Number,
      default: 5,
      min: 3,
      max: 15,
    },

    // ── Content ─────────────────────────────────────────────────
    questions: [
      {
        text: { type: String, required: true },
        category: { type: String, default: '' },
        expectedKeyPoints: [String],
      },
    ],
    answers: [answerSchema],
    feedback: feedbackSchema,

    // ── Status ──────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['setup', 'in_progress', 'completed', 'abandoned'],
      default: 'setup',
    },

    // ── Timing ──────────────────────────────────────────────────
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number, default: 0 }, // minutes

    // ── Meta ─────────────────────────────────────────────────────
    sessionId: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: completion percentage ───────────────────────────────
interviewSchema.virtual('completionPercentage').get(function () {
  if (!this.questions.length) return 0;
  const answered = this.answers.filter((a) => !a.isSkipped && a.answerText).length;
  return Math.round((answered / this.questions.length) * 100);
});

// ── Indexes ───────────────────────────────────────────────────────
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
