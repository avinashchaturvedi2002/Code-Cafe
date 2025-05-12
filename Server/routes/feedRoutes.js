const express = require('express');
const { createFeedPost, getUserFeed, likeFeedPost, commentOnFeedPost, unlikePost, deleteComment, softDeletePost } = require('../controllers/feedController');
const {protect} = require('../middlewares/authMiddleware');  // Assuming you have an authentication middleware

const router = express.Router();

// Create a feed post (when user successfully solves a problem)
router.post('/', protect, createFeedPost);

// Get user feed (including posts from users they follow)
router.get('/', protect, getUserFeed);

// Like a feed post
router.post('/:postId/like', protect, likeFeedPost);

// Comment on a feed post
router.post('/:postId/comment', protect, commentOnFeedPost);

router.post('/:postId/unlike', protect, unlikePost);

router.delete('/:postId/comment/:commentId', protect, deleteComment);

router.delete('/:postId', protect, softDeletePost);

module.exports = router;
