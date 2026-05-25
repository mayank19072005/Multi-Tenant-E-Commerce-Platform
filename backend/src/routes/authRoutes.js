const express = require('express');

const router = express.Router();

const {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP
} = require('../controllers/authController');

router.post(
  '/register',
  registerUser
);

router.post(
  '/login',
  loginUser
);

router.post('/send-otp', sendOTP);
router.get('/send-otp', (req, res) => {
  req.body = { email: req.query.email || process.env.EMAIL_USER };
  return sendOTP(req, res);
});

router.post('/verify-otp', verifyOTP);
router.get('/verify-otp', (req, res) => {
  req.body = { 
    email: req.query.email || process.env.EMAIL_USER,
    otp: req.query.otp,
    name: req.query.name
  };
  return verifyOTP(req, res);
});

module.exports = router;