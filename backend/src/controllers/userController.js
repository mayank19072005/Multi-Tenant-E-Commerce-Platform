

const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const user = await User.create({
      name: 'Mayank',
      email: 'mayank@test.com',
      role: 'customer'
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createUser
};