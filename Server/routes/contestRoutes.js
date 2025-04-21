const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { createContest, getAllContests, getContestById, joinContest } = require('../controllers/contestController');

const router = express.Router();

// Create a contest (Admin or authorized users only)
router.post('/create', protect, createContest);

// Get all contests
router.get('/', getAllContests);

// Get a single contest by ID
router.get('/:id', getContestById);

// Participate in a contest
router.post('/:id/participate', protect, joinContest);

module.exports = router;
