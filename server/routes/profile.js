const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authenticate = require('../middleware/auth');
const User = require('../models/User');
const Interview = require('../models/Interview');

// ── Multer config for resume uploads ──────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/resumes/'),
  filename: (req, file, cb) => {
    const unique = `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed.'));
    }
  },
});

router.use(authenticate);

// ── Upload resume ─────────────────────────────────────────────────
router.post('/resume', upload.single('resume'), async (req, res, next) => {
  try {
    const fs = require('fs');
    fs.mkdirSync('uploads/resumes', { recursive: true });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { resumeUrl });

    res.json({ message: 'Resume uploaded successfully', resumeUrl });
  } catch (error) {
    next(error);
  }
});

// ── Get analytics ─────────────────────────────────────────────────
router.get('/analytics', async (req, res, next) => {
  try {
    const interviews = await Interview.find({
      userId: req.user._id,
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('jobRole interviewType difficulty feedback.overallScore createdAt duration');

    const scoreOverTime = interviews.map((i) => ({
      date: i.createdAt,
      score: i.feedback?.overallScore || 0,
      type: i.interviewType,
      jobRole: i.jobRole,
    }));

    const byType = {
      hr: interviews.filter((i) => i.interviewType === 'hr'),
      technical: interviews.filter((i) => i.interviewType === 'technical'),
      behavioral: interviews.filter((i) => i.interviewType === 'behavioral'),
    };

    const avgByType = Object.fromEntries(
      Object.entries(byType).map(([type, arr]) => [
        type,
        arr.length
          ? Math.round(arr.reduce((s, i) => s + (i.feedback?.overallScore || 0), 0) / arr.length)
          : 0,
      ])
    );

    res.json({
      scoreOverTime,
      avgByType,
      user: req.user.stats,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
