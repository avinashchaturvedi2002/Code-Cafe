const Problem = require('../models/Problem');

// Create a problem
const createProblem = async (req, res) => {
  const { title, description, difficulty, testCases } = req.body;

  try {
    const problem = new Problem({
      title,
      description,
      difficulty,
      testCases,
    });

    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all problems
const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single problem
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProblem, getAllProblems, getProblemById };
