const express = require('express');

const router = express.Router();

const {
  addToCart
} = require('../controllers/cartController');

const {
  protect
} = require('../middleware/authMiddleware');

router.post(
  '/add',
  protect,
  addToCart
);

module.exports = router;