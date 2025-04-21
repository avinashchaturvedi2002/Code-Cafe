const express = require('express');
const router = express.Router();
const { submitSolution } = require('../controllers/submissionController');
const {protect} = require('../middlewares/authMiddleware');

// Submit a solution (protected route)
router.post('/submit', protect, submitSolution);

module.exports = router;
