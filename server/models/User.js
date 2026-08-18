/**
 * models/User.js
 * A registered student of SkillExchange.
 * The password is always stored as a bcrypt hash, never as plain text.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { INSTITUTIONS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned by queries unless explicitly asked for
    },

    institution: {
      type: String,
      required: [true, 'Institution is required'],
      enum: { values: INSTITUTIONS, message: '{VALUE} is not a supported institution' },
    },

    skillsToOffer: {
      type: [String],
      default: [],
    },

    skillsToLearn: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: '',
      maxlength: [250, 'Bio cannot exceed 250 characters'],
      trim: true,
    },

    contactInfo: {
      type: String,
      required: [true, 'Contact information is required'],
      trim: true,
      maxlength: [120, 'Contact information cannot exceed 120 characters'],
    },
  },
  { timestamps: true }
);

/** Hash the password whenever it is set or changed. */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/** Compare a plain password with the stored hash (used at login). */
userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

/** Safety net: the password can never leak through JSON serialisation. */
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
