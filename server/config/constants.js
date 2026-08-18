/**
 * config/constants.js
 * All the fixed option lists used by the models, controllers and the API.
 * Keeping them in one file means the frontend dropdowns and the backend
 * validation can never drift apart.
 */

const INSTITUTIONS = [
  'UET Peshawar',
  'University of Peshawar',
  'Islamia College',
  'IMSciences',
  'Other',
];

const CATEGORIES = [
  'Web Dev',
  'Mobile Dev',
  'Programming',
  'Graphic Design',
  'Languages',
  'Freelancing',
  'Other',
];

const LISTING_TYPES = ['Offer', 'Request'];

const MODES = ['In-Person', 'Online', 'Both'];

const LISTING_STATUS = ['Active', 'Closed'];

const SWAP_STATUS = ['Pending', 'Accepted', 'Rejected'];

module.exports = {
  INSTITUTIONS,
  CATEGORIES,
  LISTING_TYPES,
  MODES,
  LISTING_STATUS,
  SWAP_STATUS,
};
