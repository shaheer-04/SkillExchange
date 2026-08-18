/**
 * models/SkillListing.js
 * A skill a student either offers to teach or requests to learn.
 */

const mongoose = require('mongoose');
const { CATEGORIES, LISTING_TYPES, MODES, LISTING_STATUS } = require('../config/constants');

const skillListingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: '{VALUE} is not a valid category' },
    },

    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: { values: LISTING_TYPES, message: '{VALUE} is not a valid type' },
    },

    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: { values: MODES, message: '{VALUE} is not a valid mode' },
    },

    status: {
      type: String,
      enum: { values: LISTING_STATUS, message: '{VALUE} is not a valid status' },
      default: 'Active',
    },
  },
  { timestamps: true }
);

// Text index so the search box can match titles and descriptions quickly
skillListingSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.models.SkillListing || mongoose.model('SkillListing', skillListingSchema);
