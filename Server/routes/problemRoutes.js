const express = require('express');
const { createProblem, getAllProblems, getProblemById } = require('../controllers/problemController');

const router = express.Router();

// Create a new problem
router.post('/', createProblem);

// Get all problems
router.get('/', getAllProblems);

// Get a single problem by ID
router.get('/:id', getProblemById);

module.exports = router;
