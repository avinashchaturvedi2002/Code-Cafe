const Feed = require('../models/Feed');
const Submission = require('../models/Submission');
const User = require('../models/User');

// Create a feed post when user submits a solution
const createFeedPost = async (req, res) => {
  const { content, submissionId } = req.body;
  const user = req.user.id;

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.user.toString() !== user) {
      return res.status(403).json({ message: 'You can only share your own submissions' });
    }

    const feedPost = new Feed({
      user,
      content,
      submission: submissionId,
    });

    await feedPost.save();
    res.status(201).json(feedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get feed for a user (including posts from users they follow)
const getUserFeed = async (req, res) => {
  const user = req.user.id;

  try {
    const userObj = await User.findById(user).populate('following');
    const followingIds = userObj.following.map(follow => follow._id);

    const feed = await Feed.find({
      user: { $in: [user, ...followingIds] },
      deleted: false,
    })
      .populate('user', 'username')
      .populate('submission')
      .populate('likes')
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 });

    // Filter out deleted comments before sending
    const filteredFeed = feed.map(post => {
      const visibleComments = post.comments.filter(comment => !comment.deleted);
      return { ...post.toObject(), comments: visibleComments };
    });

    res.json(filteredFeed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Like a feed post
const likeFeedPost = async (req, res) => {
  const { postId } = req.params;
  const user = req.user.id;

  try {
    const feedPost = await Feed.findById(postId);
    if (!feedPost) {
      return res.status(404).json({ message: 'Feed post not found' });
    }

    if (feedPost.likes.includes(user)) {
      return res.status(400).json({ message: 'You already liked this post' });
    }

    feedPost.likes.push(user);
    await feedPost.save();

    res.json(feedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comment on a feed post
const commentOnFeedPost = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const user = req.user.id;

  try {
    const feedPost = await Feed.findById(postId);
    if (!feedPost) {
      return res.status(404).json({ message: 'Feed post not found' });
    }

    const comment = { user, text };
    feedPost.comments.push(comment);
    await feedPost.save();

    res.json(feedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const post = await Feed.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      return res.status(400).json({ message: 'You have not liked this post' });
    }

    post.likes.splice(likeIndex, 1);
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const post = await Feed.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleted = true;  // Soft delete instead of removing
    await post.save();

    res.json({ message: 'Comment soft-deleted', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const softDeletePost = async (req, res) => {
  try {
    const post = await Feed.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.deleted = true;
    await post.save();

    res.json({ message: 'Post soft-deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




module.exports = {
  createFeedPost,
  getUserFeed,
  likeFeedPost,
  commentOnFeedPost,
  unlikePost,
  deleteComment,
  softDeletePost
};
