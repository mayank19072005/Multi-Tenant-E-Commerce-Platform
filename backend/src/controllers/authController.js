const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const redis = require('../config/redis');
const transporter = require('../config/mail');

const fs = require('fs');

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);
    fs.writeFileSync('.otp_debug', otp.toString());
    console.log('DEBUG OTP:', otp);

    await redis.set(email, otp, 'EX', 600);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP',
      text: `Your OTP is ${otp}`
    });

    res.json({
      success: true,
      message: 'OTP Sent Successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, name } = req.body;

    const storedOTP = await redis.get(email);

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP Expired'
      });
    }

    if (storedOTP != otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || 'User',
        email,
        role: 'customer'
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tenant_id: user.tenant_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    await redis.del(email);

    res.json({
      success: true,
      message: 'Login Successful',
      token,
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const registerUser = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      password,
      role
    } = req.body;

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'customer'
      });

    res.json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

const loginUser = async (
  req,
  res
) => {

  try {

    const {
      email,
      password
    } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: 'User Not Found'
      });

    }

    console.log(user);

    if (!user.password) {

      return res.status(400).json({
        message: 'Invalid Password'
      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({
        message: 'Invalid Password'
      });

    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tenant_id: user.tenant_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  sendOTP,
  verifyOTP,
  registerUser,
  loginUser
};