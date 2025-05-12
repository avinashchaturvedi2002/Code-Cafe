const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
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

  // 🆕 Password is now optional (for Google users)
  password: {
    type: String,
    required: function () {
      return this.authProvider === 'local';
    },
  },

  // 🆕 Add authProvider field: 'local' for email/password, 'google' for Google auth
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },

  // Social
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Forgot/reset password support
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
}, { timestamps: true });


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.authProvider !== 'local' || !this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// Password match method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.authProvider !== 'local') {
    throw new Error('Password authentication not allowed for this account');
  }
  return await bcrypt.compare(enteredPassword, this.password);
};


// Follow / Unfollow methods
userSchema.methods.follow = async function (userToFollowId) {
  if (this.following.includes(userToFollowId)) {
    throw new Error('Already following this user');
  }
  this.following.push(userToFollowId);
  await this.save();
};

userSchema.methods.unfollow = async function (userToUnfollowId) {
  if (!this.following.includes(userToUnfollowId)) {
    throw new Error('Not following this user');
  }
  this.following.pull(userToUnfollowId);
  await this.save();
};

userSchema.methods.getFollowers = function () {
  return this.followers;
};

userSchema.methods.getFollowing = function () {
  return this.following;
};

module.exports = mongoose.model('User', userSchema);
