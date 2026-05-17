const express = require('express');

const router = express.Router();

const {
  registerVendor
} = require('../controllers/vendorController');

router.post('/register', registerVendor);

// Special Development Helper (Allows browser-based testing)
router.get('/register', (req, res) => {
  req.body = {
    businessName: req.query.businessName,
    description: req.query.description,
    email: req.query.email
  };
  return registerVendor(req, res);
});

module.exports = router;