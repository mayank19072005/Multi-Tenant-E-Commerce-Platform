const express = require('express');

const router = express.Router();

const {
  createCategory,
  getCategories
} = require('../controllers/categoryController');

const {
  protect,
  authorizeRoles
} = require('../middleware/authMiddleware');

router.post(
  '/create',
  protect,
  authorizeRoles('admin', 'super_admin'),
  createCategory
);

// GET helper for easy browser testing
router.get(
  '/create',
  protect,
  authorizeRoles('admin', 'super_admin'),
  (req, res) => {
    req.body = { name: req.query.name };
    return createCategory(req, res);
  }
);

router.get('/', getCategories);

module.exports = router;