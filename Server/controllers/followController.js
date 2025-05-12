const User = require('../models/User');

// Follow a user
const followUser = async (req, res) => {
  const userId = req.user.id; // The logged-in user's ID
  const { userToFollowId } = req.body; // The ID of the user to follow

  try {
    if (userId === userToFollowId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    // Find the current user (who is trying to follow)
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the user to be followed
    const userToFollow = await User.findById(userToFollowId);
    if (!userToFollow) {
      return res.status(404).json({ message: "User to follow not found." });
    }

    // Follow the user
    await currentUser.follow(userToFollowId);

    // Add the current user to the followers list of the user being followed
    userToFollow.followers.push(userId);
    await userToFollow.save();

    res.status(200).json({ message: `You are now following ${userToFollow.username}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  const userId = req.user.id; // The logged-in user's ID
  const { userToUnfollowId } = req.body; // The ID of the user to unfollow

  try {
    if (userId === userToUnfollowId) {
      return res.status(400).json({ message: "You cannot unfollow yourself." });
    }

    // Find the current user (who is trying to unfollow)
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the user to be unfollowed
    const userToUnfollow = await User.findById(userToUnfollowId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User to unfollow not found." });
    }

    // Unfollow the user
    await currentUser.unfollow(userToUnfollowId);

    // Remove the current user from the followers list of the user being unfollowed
    userToUnfollow.followers.pull(userId);
    await userToUnfollow.save();

    res.status(200).json({ message: `You have unfollowed ${userToUnfollow.username}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { followUser, unfollowUser };
