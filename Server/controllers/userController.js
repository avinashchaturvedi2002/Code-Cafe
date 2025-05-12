const User = require('../models/User');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');  // Assuming you have a Contest model

// Fetch Profile (for own or another user)
const getProfile = async (req, res) => {
  const userId = req.params.userId || req.user.id;  // Use logged-in user id if no userId param

  try {
    const user = await User.findById(userId)
      .populate('followers', 'username')
      .populate('following', 'username');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get followers and following counts
    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    // Get problems solved by difficulty
    const solvedProblems = await Submission.aggregate([
      { $match: { status: 'Passed' } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    
    console.log(solvedProblems);
    
    // Count problems solved by difficulty
    const problemsSolved = {
      easy: solvedProblems.find(p => p._id === 'Easy')?.count || 0,
      medium: solvedProblems.find(p => p._id === 'Medium')?.count || 0,
      hard: solvedProblems.find(p => p._id === 'Hard')?.count || 0,
    };

    // Get number of contests participated
    const contestsParticipated = await Contest.countDocuments({
      participants: userId,
    });

    // Return the profile data
    const profileData = {
      username: user.username,
      followersCount,
      followingCount,
      problemsSolved,
      contestsParticipated,
    };

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile };
