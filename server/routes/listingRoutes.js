const express = require('express');
const router = express.Router();

const {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

// "/my" must be declared before "/:id", otherwise Express would treat
// the word "my" as an id.
router.get('/my', protect, getMyListings); // GET /api/listings/my

router
  .route('/')
  .get(getListings) //            GET  /api/listings  (public)
  .post(protect, createListing); // POST /api/listings (private)

router
  .route('/:id')
  .get(getListingById) //           GET    /api/listings/:id (public)
  .put(protect, updateListing) //   PUT    /api/listings/:id (owner)
  .delete(protect, deleteListing); //DELETE /api/listings/:id (owner)

module.exports = router;
