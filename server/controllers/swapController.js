/**
 * controllers/swapController.js
 * Sending swap requests and accepting / rejecting them.
 */

const SwapRequest = require('../models/SwapRequest');
const SkillListing = require('../models/SkillListing');
const asyncHandler = require('../utils/asyncHandler');
const { MODES } = require('../config/constants');

const USER_FIELDS = 'name institution contactInfo bio skillsToOffer skillsToLearn';
const LISTING_FIELDS = 'title category type mode status';

/**
 * Contact details are private until the swap is agreed.
 * This removes contactInfo from the response while a request is still
 * Pending or has been Rejected.
 */
function hideContactUntilAccepted(swap) {
  if (!swap) return swap;
  const plain = swap.toObject ? swap.toObject() : swap;

  if (plain.status !== 'Accepted') {
    if (plain.sender) delete plain.sender.contactInfo;
    if (plain.receiver) delete plain.receiver.contactInfo;
  }

  return plain;
}

/**
 * @route   POST /api/swaps
 * @access  Private
 */
const createSwapRequest = asyncHandler(async (req, res) => {
  const { listing: listingId } = req.body;
  const message = (req.body.message || '').trim();
  const preferredTime = (req.body.preferredTime || '').trim();
  const meetingMode = (req.body.meetingMode || '').trim();
  const location = (req.body.location || '').trim();

  const errors = [];
  if (!listingId) errors.push('A listing is required');
  if (!message) errors.push('Message is required');
  else if (message.length < 10) errors.push('Message must be at least 10 characters');
  if (!preferredTime) errors.push('Preferred time is required');
  if (!MODES.includes(meetingMode)) errors.push('Please choose a valid meeting mode');
  if (meetingMode === 'In-Person' && !location) errors.push('Location is required for an in-person meeting');

  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(', '));
  }

  const listing = await SkillListing.findById(listingId);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.status !== 'Active') {
    res.status(400);
    throw new Error('This listing is closed and no longer accepts swap requests');
  }

  // A student cannot send a request to their own listing
  if (listing.user.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot send a swap request for your own listing');
  }

  // Duplicate protection: one pending request per sender/receiver/listing
  const duplicate = await SwapRequest.findOne({
    listing: listing._id,
    sender: req.user._id,
    receiver: listing.user,
    status: 'Pending',
  });

  if (duplicate) {
    res.status(409);
    throw new Error('You already have a pending swap request for this listing');
  }

  const swap = await SwapRequest.create({
    listing: listing._id,
    sender: req.user._id, // always taken from the JWT
    receiver: listing.user, // always taken from the listing
    message,
    preferredTime,
    meetingMode,
    location,
    status: 'Pending',
  });

  const populated = await SwapRequest.findById(swap._id)
    .populate('sender', USER_FIELDS)
    .populate('receiver', USER_FIELDS)
    .populate('listing', LISTING_FIELDS);

  res.status(201).json(hideContactUntilAccepted(populated));
});

/**
 * @route   GET /api/swaps/my-requests
 * @access  Private
 * Returns both directions in one call.
 */
const getMyRequests = asyncHandler(async (req, res) => {
  const [incoming, outgoing] = await Promise.all([
    SwapRequest.find({ receiver: req.user._id })
      .populate('sender', USER_FIELDS)
      .populate('receiver', USER_FIELDS)
      .populate('listing', LISTING_FIELDS)
      .sort({ createdAt: -1 }),

    SwapRequest.find({ sender: req.user._id })
      .populate('sender', USER_FIELDS)
      .populate('receiver', USER_FIELDS)
      .populate('listing', LISTING_FIELDS)
      .sort({ createdAt: -1 }),
  ]);

  res.status(200).json({
    incoming: incoming.map(hideContactUntilAccepted),
    outgoing: outgoing.map(hideContactUntilAccepted),
  });
});

/**
 * @route   PUT /api/swaps/:id
 * @access  Private (receiver only)
 * Body: { status: "Accepted" | "Rejected" }
 */
const updateSwapRequest = asyncHandler(async (req, res) => {
  const status = (req.body.status || '').trim();

  if (!['Accepted', 'Rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be either Accepted or Rejected');
  }

  const swap = await SwapRequest.findById(req.params.id);

  if (!swap) {
    res.status(404);
    throw new Error('Swap request not found');
  }

  // Only the receiver may answer a request
  if (swap.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the receiver of this request can accept or reject it');
  }

  if (swap.status !== 'Pending') {
    res.status(400);
    throw new Error(`This request has already been ${swap.status.toLowerCase()}`);
  }

  swap.status = status;
  await swap.save();

  const populated = await SwapRequest.findById(swap._id)
    .populate('sender', USER_FIELDS)
    .populate('receiver', USER_FIELDS)
    .populate('listing', LISTING_FIELDS);

  res.status(200).json(hideContactUntilAccepted(populated));
});

module.exports = { createSwapRequest, getMyRequests, updateSwapRequest };
