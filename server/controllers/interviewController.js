/**
 * Interview Controller
 * Manages interview sessions: start, submit, history
 */

const Interview = require('../models/Interview');
const User = require('../models/User');
const { generateQuestions } = require('../services/aiService');
const { v4: uuidv4 } = require('crypto');

// ── Start Interview ───────────────────────────────────────────────
const startInterview = async (req, res, next) => {
  try {
    const { jobRole, interviewType, difficulty, questionCount = 5 } = req.body;

    // Generate AI questions
    let questions;
    try {
      questions = await generateQuestions(jobRole, interviewType, difficulty, questionCount);
    } catch (aiError) {
      console.error('AI question generation failed:', aiError.message);
      // Use service fallback (already handled in service)
      questions = [];
    }

    // Create interview session
    const interview = await Interview.create({
      userId: req.user._id,
      jobRole,
      interviewType,
      difficulty,
      questionCount,
      questions,
      status: 'in_progress',
      startedAt: new Date(),
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    res.status(201).json({
      message: 'Interview started',
      interview: {
        id: interview._id,
        sessionId: interview.sessionId,
        jobRole: interview.jobRole,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty,
        questions: interview.questions,
        startedAt: interview.startedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Questions for existing interview ──────────────────────────
const getQuestions = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    res.json({ questions: interview.questions, interviewId: interview._id });
  } catch (error) {
    next(error);
  }
};

// ── Submit Answers ────────────────────────────────────────────────
const submitInterview = async (req, res, next) => {
  try {
    const { interviewId, answers } = req.body;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
      status: 'in_progress',
    });

    if (!interview) {
      return res.status(404).json({ error: 'Active interview session not found.' });
    }

    const completedAt = new Date();
    const duration = Math.round((completedAt - interview.startedAt) / 60000); // minutes

    // Update interview with answers and mark as completed
    interview.answers = answers;
    interview.status = 'completed';
    interview.completedAt = completedAt;
    interview.duration = duration;
    await interview.save();

    res.json({
      message: 'Interview submitted successfully',
      interviewId: interview._id,
      duration,
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Interview History ─────────────────────────────────────────
const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (type) filter.interviewType = type;
    if (status) filter.status = status;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-questions -answers.answerText'),
      Interview.countDocuments(filter),
    ]);

    res.json({
      interviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Single Interview ──────────────────────────────────────────
const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    res.json({ interview });
  } catch (error) {
    next(error);
  }
};

// ── Abandon Interview ─────────────────────────────────────────────
const abandonInterview = async (req, res, next) => {
  try {
    await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, status: 'in_progress' },
      { status: 'abandoned', completedAt: new Date() }
    );
    res.json({ message: 'Interview abandoned.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  getQuestions,
  submitInterview,
  getHistory,
  getInterview,
  abandonInterview,
};
