const Contest = require('../models/Contest');

// Create a contest
const createContest = async (req, res) => {
  const { name, description, startTime, endTime, problemIds } = req.body;

  try {
    const contest = new Contest({
      name,
      description,
      startTime,
      endTime,
      problems: problemIds,
    });

    await contest.save();
    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all contests
const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().populate('problems');
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single contest by ID
const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems');
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join a contest
const joinContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Add user to participants if not already added
    if (!contest.participants.includes(req.user)) {
      contest.participants.push(req.user);
      await contest.save();
    }

    res.status(200).json({ message: 'Successfully joined contest' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createContest, getAllContests, getContestById, joinContest };
