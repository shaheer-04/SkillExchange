/**
 * controllers/listingController.js
 * CRUD for skill listings + the search / filter logic used by Explore Skills.
 */

const SkillListing = require('../models/SkillListing');
const SwapRequest = require('../models/SwapRequest');
const asyncHandler = require('../utils/asyncHandler');
const { CATEGORIES, LISTING_TYPES, MODES, LISTING_STATUS } = require('../config/constants');

// Fields of the owner that are safe to send to the browser.
// The password is never selected, and contactInfo is deliberately left out:
// contact details are only revealed once a swap request has been accepted.
const OWNER_FIELDS = 'name institution bio skillsToOffer skillsToLearn createdAt';

/** Escape user input before putting it inside a regular expression. */
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @route   GET /api/listings
 * @access  Public
 * @query   search, category, type, mode, page, limit
 */
const getListings = asyncHandler(async (req, res) => {
  const { search, category, type, mode } = req.query;

  const filter = { status: 'Active' };

  if (category && category !== 'All') {
    if (!CATEGORIES.includes(category)) {
      res.status(400);
      throw new Error('Invalid category filter');
    }
    filter.category = category;
  }

  if (type && type !== 'All') {
    if (!LISTING_TYPES.includes(type)) {
      res.status(400);
      throw new Error('Invalid type filter');
    }
    filter.type = type;
  }

  if (mode && mode !== 'All') {
    if (!MODES.includes(mode)) {
      res.status(400);
      throw new Error('Invalid mode filter');
    }
    filter.mode = mode;
  }

  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { category: rx }];
  }

  const listings = await SkillListing.find(filter)
    .populate('user', OWNER_FIELDS)
    .sort({ createdAt: -1 })
    .limit(200);

  res.status(200).json({ count: listings.length, listings });
});

/**
 * @route   GET /api/listings/my
 * @access  Private
 * Every listing of the logged-in user, including closed ones.
 */
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await SkillListing.find({ user: req.user._id })
    .populate('user', OWNER_FIELDS)
    .sort({ createdAt: -1 });

  res.status(200).json({ count: listings.length, listings });
});

/**
 * @route   GET /api/listings/:id
 * @access  Public
 */
const getListingById = asyncHandler(async (req, res) => {
  const listing = await SkillListing.findById(req.params.id).populate('user', OWNER_FIELDS);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  res.status(200).json(listing);
});

/**
 * @route   POST /api/listings
 * @access  Private
 */
const createListing = asyncHandler(async (req, res) => {
  const title = (req.body.title || '').trim();
  const description = (req.body.description || '').trim();
  const category = (req.body.category || '').trim();
  const type = (req.body.type || '').trim();
  const mode = (req.body.mode || '').trim();

  const errors = [];
  if (!title) errors.push('Title is required');
  else if (title.length < 5) errors.push('Title must be at least 5 characters');
  if (!description) errors.push('Description is required');
  else if (description.length < 20) errors.push('Description must be at least 20 characters');
  if (!CATEGORIES.includes(category)) errors.push('Please choose a valid category');
  if (!LISTING_TYPES.includes(type)) errors.push('Please choose Offer or Request');
  if (!MODES.includes(mode)) errors.push('Please choose a valid mode');

  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(', '));
  }

  const listing = await SkillListing.create({
    user: req.user._id, // always the logged-in user, never a value from the body
    title,
    description,
    category,
    type,
    mode,
    status: 'Active',
  });

  const populated = await listing.populate('user', OWNER_FIELDS);

  res.status(201).json(populated);
});

/**
 * @route   PUT /api/listings/:id
 * @access  Private (owner only)
 */
const updateListing = asyncHandler(async (req, res) => {
  const listing = await SkillListing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only edit your own listings');
  }

  const errors = [];

  if (req.body.title !== undefined) {
    const title = String(req.body.title).trim();
    if (title.length < 5) errors.push('Title must be at least 5 characters');
    else listing.title = title;
  }

  if (req.body.description !== undefined) {
    const description = String(req.body.description).trim();
    if (description.length < 20) errors.push('Description must be at least 20 characters');
    else listing.description = description;
  }

  if (req.body.category !== undefined) {
    if (!CATEGORIES.includes(req.body.category)) errors.push('Please choose a valid category');
    else listing.category = req.body.category;
  }

  if (req.body.type !== undefined) {
    if (!LISTING_TYPES.includes(req.body.type)) errors.push('Please choose Offer or Request');
    else listing.type = req.body.type;
  }

  if (req.body.mode !== undefined) {
    if (!MODES.includes(req.body.mode)) errors.push('Please choose a valid mode');
    else listing.mode = req.body.mode;
  }

  if (req.body.status !== undefined) {
    if (!LISTING_STATUS.includes(req.body.status)) errors.push('Please choose a valid status');
    else listing.status = req.body.status;
  }

  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(', '));
  }

  const updated = await listing.save();
  const populated = await updated.populate('user', OWNER_FIELDS);

  res.status(200).json(populated);
});

/**
 * @route   DELETE /api/listings/:id
 * @access  Private (owner only)
 */
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await SkillListing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own listings');
  }

  // Remove the swap requests that belong to this listing so no orphans remain
  await SwapRequest.deleteMany({ listing: listing._id });
  await listing.deleteOne();

  res.status(200).json({ message: 'Listing deleted successfully', id: req.params.id });
});

module.exports = {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
