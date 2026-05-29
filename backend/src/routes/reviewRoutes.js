const express =
  require('express');

const router =
  express.Router();

const {
  protect
} = require(
  '../middleware/authMiddleware'
);

const {

  addReview,

  getReviews

} = require(
  '../controllers/reviewController'
);

router.post(
  '/',
  protect,
  addReview
);

router.get(
  '/:productId',
  getReviews
);

module.exports = router;
