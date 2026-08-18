/**
 * utils/generateToken.js
 * Creates the JWT that the frontend stores and sends back on every
 * private request. Only the user id is put inside the token.
 */

const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
