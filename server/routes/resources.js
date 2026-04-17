const express = require('express');
const router = express.Router();
const { getResources, getResource } = require('../controllers/resourceController');
const authenticate = require('../middleware/auth');

router.use(authenticate);
router.get('/', getResources);
router.get('/:id', getResource);

module.exports = router;
