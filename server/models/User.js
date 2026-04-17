/**
 * User Model
 * Stores user account information, profile, and statistics
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },

    // ── Profile ─────────────────────────────────────────────────
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    targetRole: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      enum: ['fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years'],
      default: 'fresher',
    },
    skills: [{ type: String }],
    resumeUrl: {
      type: String,
      default: '',
    },
    linkedIn: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },

    // ── Statistics ───────────────────────────────────────────────
    stats: {
      totalInterviews: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      totalTime: { type: Number, default: 0 }, // minutes
      interviewsByType: {
        hr: { type: Number, default: 0 },
        technical: { type: Number, default: 0 },
        behavioral: { type: Number, default: 0 },
      },
    },

    // ── Auth ─────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: interview count ─────────────────────────────────────
userSchema.virtual('interviews', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'userId',
});

// ── Pre-save: Hash password ──────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Method: Compare password ─────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Method: Update stats after interview ─────────────────────────
userSchema.methods.updateStats = async function (score, type, duration) {
  const stats = this.stats;
  const prev = stats.totalInterviews;

  stats.totalInterviews += 1;
  stats.averageScore = Math.round((stats.averageScore * prev + score) / stats.totalInterviews);
  stats.bestScore = Math.max(stats.bestScore, score);
  stats.totalTime += duration || 0;

  if (type && stats.interviewsByType[type] !== undefined) {
    stats.interviewsByType[type] += 1;
  }

  await this.save();
};

module.exports = mongoose.model('User', userSchema);
