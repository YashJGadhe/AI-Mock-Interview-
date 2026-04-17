const express = require('express');
const router = express.Router();
const { getFeedback } = require('../controllers/aiController');
const authenticate = require('../middleware/auth');

router.use(authenticate);
router.post('/feedback', getFeedback);

module.exports = router;
