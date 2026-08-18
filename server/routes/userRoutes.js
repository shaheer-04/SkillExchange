const express = require('express');
const router = express.Router();

const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/profile')
  .get(protect, getProfile) // GET /api/users/profile
  .put(protect, updateProfile); // PUT /api/users/profile

module.exports = router;
