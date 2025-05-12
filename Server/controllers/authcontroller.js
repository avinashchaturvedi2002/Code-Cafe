const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios=require("axios")
const { registerSchema, loginSchema } = require('../validators/authValidators');
const express =require('express');
const crypto = require('crypto');
const {sendEmail}=require('../utils/sendEmail.js')
const { OAuth2Client } = require('google-auth-library');
const { error } = require('console');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const validateEmailWithNeverBounce = async (email) => {
  const apiKey = process.env.NEVERBOUNCE_API_KEY;

  const response = await axios.get('https://api.neverbounce.com/v4/single/check', {
    params: {
      key: apiKey,
      email: email,
    },
  });

  const result = response.data;
  return result.result === 'valid';
};

const googleLogin = async (req, res) => {
  const { token } = req.body;
  console.log(token);
  try {
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log(payload);
    const { email, name, sub: googleId } = payload;

    // Check if the user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user with authProvider set to 'google'
      user = await User.create({
        name,
        username: email.split('@')[0], // You can change this logic
        email,
        authProvider: 'google',
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'Google login successful',
      token: jwtToken,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// Register User
const registerUser = async (req, res) => {
  // Validate request body with Zod
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    const formattedErrors = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    return res.status(400).json({ message: formattedErrors });
  }
  const isValid = await validateEmailWithNeverBounce(req.body.email);
if (!isValid) {
  return res.status(400).json({ message: 'Please enter a valid and active email address.' });
}

  const { name, username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.authProvider === 'google') {
        return res.status(400).json({ message: 'This email is associated with a Google account. Please sign in with Google.' });
      } else {
        return res.status(400).json({ message: 'Email already in use.' });
      }
    }

    // Create new user
    const user = await User.create({ name, username, email, password });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("Entered password during login:", password);
    console.log("Stored password hash in DB during login:", user.password);

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log("Password match result after reset:", isMatch);  // Log the match result

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'User logged in successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword=async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal existence of user
      return res.status(200).json({ message: "If the email exists, a reset link has been sent." });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(token, 10);

    // Set reset token and expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });


    // Send email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
    await sendEmail(
      user.email,
      "Password Reset Request",
      `Click the link to reset your password: ${resetLink}`
    );

    res.status(200).json({ message: "If the email exists, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
}

const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if token is valid
    const isValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValid || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = password;
    user.authProvider = 'local';
  // Log the new password hash

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    const updatedUser = await User.findOne({ email });

    console.log("Updated user password in DB after save:", updatedUser.password);

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  googleLogin
};
