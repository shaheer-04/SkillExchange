/**
 * utils/asyncHandler.js
 * Wraps an async controller so that any rejected promise is forwarded to
 * the central error handler instead of crashing the process.
 */

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
