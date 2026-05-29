const express = require('express');

const router = express.Router();

const {
  protect,
  authorizeRoles
} = require('../middleware/authMiddleware');

const {
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getAnalytics,
  getAdminStats
} = require('../controllers/adminController');

router.get(
  '/stats',
  protect,
  authorizeRoles('admin'),
  getAdminStats
);

router.get(
  '/vendors',
  protect,
  authorizeRoles('admin'),
  getPendingVendors
);

router.put(
  '/approve/:id',
  protect,
  authorizeRoles('admin'),
  approveVendor
);

router.put(
  '/reject/:id',
  protect,
  authorizeRoles('admin'),
  rejectVendor
);

// Analytics route supporting live platform aggregates
router.get(
  '/analytics',
  protect,
  authorizeRoles('admin'),
  getAnalytics
);

module.exports = router;
