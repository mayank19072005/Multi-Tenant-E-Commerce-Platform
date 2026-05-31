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
  getAdminStats,
  getVendors
} = require('../controllers/adminController');

router.get(
  '/stats',
  protect,
  authorizeRoles('admin'),
  getAdminStats
);

router.get(
  '/vendors',
  getVendors
);

router.put(
  '/approve/:id',
  approveVendor
);

router.put(
  '/reject/:id',
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
