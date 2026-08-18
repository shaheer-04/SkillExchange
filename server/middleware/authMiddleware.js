/**
 * middleware/authMiddleware.js
 * Reads the "Authorization: Bearer <token>" header, verifies the JWT,
 * loads the user and attaches it to req.user.
 * Requests without a valid token are rejected with 401.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised, no token provided' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorised, user no longer exists' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorised, token is invalid or expired' });
  }
}

module.exports = { protect };
