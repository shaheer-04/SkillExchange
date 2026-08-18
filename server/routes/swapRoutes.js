const express = require('express');
const router = express.Router();

const {
  createSwapRequest,
  getMyRequests,
  updateSwapRequest,
} = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSwapRequest); //        POST /api/swaps
router.get('/my-requests', protect, getMyRequests); //  GET  /api/swaps/my-requests
router.put('/:id', protect, updateSwapRequest); //      PUT  /api/swaps/:id

module.exports = router;
