/**
 * controllers/authController.js
 * Registration and login.
 */

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { INSTITUTIONS } = require('../config/constants');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Turns "Python, React , , Git" or ["Python"," React"] into ["Python","React","Git"] */
function normaliseSkills(value) {
  if (Array.isArray(value)) {
    return value.map((s) => String(s).trim()).filter(Boolean).slice(0, 20);
  }
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20);
  }
  return [];
}

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const institution = (req.body.institution || '').trim();
  const contactInfo = (req.body.contactInfo || '').trim();
  const bio = (req.body.bio || '').trim();

  const errors = [];
  if (!name) errors.push('Name is required');
  else if (name.length < 3) errors.push('Name must be at least 3 characters');
  if (!email) errors.push('Email is required');
  else if (!EMAIL_REGEX.test(email)) errors.push('Please provide a valid email address');
  if (!password) errors.push('Password is required');
  else if (password.length < 6) errors.push('Password must be at least 6 characters');
  if (!institution) errors.push('Institution is required');
  else if (!INSTITUTIONS.includes(institution)) errors.push('Please choose a valid institution');
  if (!contactInfo) errors.push('Contact information is required');
  if (bio.length > 250) errors.push('Bio cannot exceed 250 characters');

  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(', '));
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    institution,
    contactInfo,
    bio,
    skillsToOffer: normaliseSkills(req.body.skillsToOffer),
    skillsToLearn: normaliseSkills(req.body.skillsToLearn),
  });

  res.status(201).json({
    token: generateToken(user._id),
    user: user.toJSON(),
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // password has select:false in the schema, so ask for it explicitly
  const user = await User.findOne({ email }).select('+password');
  const isMatch = user ? await user.matchPassword(password) : false;

  if (!user || !isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.status(200).json({
    token: generateToken(user._id),
    user: user.toJSON(),
  });
});

/**
 * @route   GET /api/auth/me
 * @access  Private  (used by the frontend to restore the session on reload)
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user.toJSON() });
});

module.exports = { register, login, getMe, normaliseSkills };
