/**
 * controllers/userController.js
 * Viewing and updating the logged-in student's own profile.
 * A user can only ever read or change their own record, because the id
 * always comes from the verified JWT (req.user) and never from the body.
 */

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { normaliseSkills } = require('./authController');
const { INSTITUTIONS } = require('../config/constants');

/**
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user.toJSON());
});

/**
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const errors = [];

  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (name.length < 3) errors.push('Name must be at least 3 characters');
    else user.name = name;
  }

  if (req.body.institution !== undefined) {
    const institution = String(req.body.institution).trim();
    if (!INSTITUTIONS.includes(institution)) errors.push('Please choose a valid institution');
    else user.institution = institution;
  }

  if (req.body.contactInfo !== undefined) {
    const contactInfo = String(req.body.contactInfo).trim();
    if (!contactInfo) errors.push('Contact information is required');
    else user.contactInfo = contactInfo;
  }

  if (req.body.bio !== undefined) {
    const bio = String(req.body.bio).trim();
    if (bio.length > 250) errors.push('Bio cannot exceed 250 characters');
    else user.bio = bio;
  }

  if (req.body.skillsToOffer !== undefined) {
    user.skillsToOffer = normaliseSkills(req.body.skillsToOffer);
  }

  if (req.body.skillsToLearn !== undefined) {
    user.skillsToLearn = normaliseSkills(req.body.skillsToLearn);
  }

  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(', '));
  }

  // Email and password are deliberately NOT updatable here.
  const updated = await user.save();

  res.status(200).json(updated.toJSON());
});

module.exports = { getProfile, updateProfile };
