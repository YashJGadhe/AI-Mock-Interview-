/**
 * AI Feedback Controller
 * Generates and stores AI-powered interview feedback
 */

const Interview = require('../models/Interview');
const User = require('../models/User');
const { generateFeedback } = require('../services/aiService');

// ── Generate Feedback ─────────────────────────────────────────────
const getFeedback = async (req, res, next) => {
  try {
    const { interviewId } = req.body;

    // Fetch the completed interview
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    // Return cached feedback if it exists
    if (interview.feedback && interview.feedback.overallScore > 0) {
      return res.json({ feedback: interview.feedback, cached: true });
    }

    if (interview.status !== 'completed') {
      return res.status(400).json({ error: 'Interview must be completed before generating feedback.' });
    }

    // Prepare answers for AI analysis
    const answersForAI = interview.answers.map((a) => ({
      questionText: a.questionText,
      answerText: a.answerText,
      timeSpent: a.timeSpent,
      isSkipped: a.isSkipped,
    }));

    // Generate AI feedback
    const feedbackData = await generateFeedback(
      interview.jobRole,
      interview.interviewType,
      interview.difficulty,
      answersForAI
    );

    // Save feedback to interview
    interview.feedback = {
      ...feedbackData,
      generatedAt: new Date(),
    };
    await interview.save();

    // Update user statistics
    await req.user.updateStats(
      feedbackData.overallScore,
      interview.interviewType,
      interview.duration
    );

    res.json({
      message: 'Feedback generated successfully',
      feedback: interview.feedback,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFeedback };
