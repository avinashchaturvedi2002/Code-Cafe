const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getProfile } = require('../controllers/userController');
const { followUser, unfollowUser } = require('../controllers/followController');
const User = require('../models/User');


const router = express.Router();

router.post('/follow', protect, followUser); // Follow a user
router.post('/unfollow', protect, unfollowUser); // Unfollow a user
router.get('/profile', protect, getProfile);
router.get('/profile/:userId', protect, getProfile);

module.exports = router;
