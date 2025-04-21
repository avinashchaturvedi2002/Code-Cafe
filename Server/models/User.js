const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users following this user
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users that this user follows
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password match method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Follow method
userSchema.methods.follow = async function (userToFollowId) {
  if (this.following.includes(userToFollowId)) {
    throw new Error('Already following this user');
  }

  this.following.push(userToFollowId);
  await this.save();
};

// Unfollow method
userSchema.methods.unfollow = async function (userToUnfollowId) {
  if (!this.following.includes(userToUnfollowId)) {
    throw new Error('Not following this user');
  }

  this.following.pull(userToUnfollowId);
  await this.save();
};

// Method to get a user’s followers
userSchema.methods.getFollowers = function () {
  return this.followers;
};

// Method to get a user’s following
userSchema.methods.getFollowing = function () {
  return this.following;
};

module.exports = mongoose.model('User', userSchema);
