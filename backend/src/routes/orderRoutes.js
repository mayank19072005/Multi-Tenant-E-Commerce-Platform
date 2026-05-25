const express = require('express');

const router = express.Router();

const {
  createCheckoutSession,
  webhookHandler,
  getOrders,
  updateOrderStatus,
  getMyOrders
} = require('../controllers/orderController');

const {
  protect
} = require('../middleware/authMiddleware');

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler
);

// Apply JSON parsing middleware only for subsequent routes (like /checkout)
router.use(express.json());

router.post(
  '/checkout',
  protect,
  createCheckoutSession
);

router.get(
  '/my-orders',
  protect,
  getMyOrders
);

router.get(
  '/vendor',
  protect,
  getOrders
);

router.get(
  '/',
  protect,
  getOrders
);

router.put(
  '/:id/status',
  protect,
  updateOrderStatus
);

module.exports = router;