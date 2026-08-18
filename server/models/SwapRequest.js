/**
 * models/SwapRequest.js
 * A request from one student to another to swap skills for a given listing.
 */

const mongoose = require('mongoose');
const { MODES, SWAP_STATUS } = require('../config/constants');

const swapRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillListing',
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },

    preferredTime: {
      type: String,
      required: [true, 'Preferred time is required'],
      trim: true,
      maxlength: [100, 'Preferred time cannot exceed 100 characters'],
    },

    meetingMode: {
      type: String,
      required: [true, 'Meeting mode is required'],
      enum: { values: MODES, message: '{VALUE} is not a valid meeting mode' },
    },

    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },

    status: {
      type: String,
      enum: { values: SWAP_STATUS, message: '{VALUE} is not a valid status' },
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SwapRequest || mongoose.model('SwapRequest', swapRequestSchema);
