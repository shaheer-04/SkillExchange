/**
 * constants.js
 * The same option lists the backend validates against
 * (server/config/constants.js). Kept in one place so every dropdown
 * in the application stays consistent.
 */

export const INSTITUTIONS = [
  'UET Peshawar',
  'University of Peshawar',
  'Islamia College',
  'IMSciences',
  'Other',
];

export const CATEGORIES = [
  'Web Dev',
  'Mobile Dev',
  'Programming',
  'Graphic Design',
  'Languages',
  'Freelancing',
  'Other',
];

export const LISTING_TYPES = ['Offer', 'Request'];

export const MODES = ['In-Person', 'Online', 'Both'];

export const LISTING_STATUS = ['Active', 'Closed'];

/** Formats an ISO date as "18 Aug 2026". */
export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
