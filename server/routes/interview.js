const express = require('express');
const router = express.Router();
const {
  startInterview,
  getQuestions,
  submitInterview,
  getHistory,
  getInterview,
  abandonInterview,
} = require('../controllers/interviewController');
const authenticate = require('../middleware/auth');
const { validateInterviewSetup } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

router.post('/start', validateInterviewSetup, startInterview);
router.get('/questions/:interviewId', getQuestions);
router.post('/submit', submitInterview);
router.get('/history', getHistory);
router.get('/:id', getInterview);
router.patch('/:id/abandon', abandonInterview);

module.exports = router;
