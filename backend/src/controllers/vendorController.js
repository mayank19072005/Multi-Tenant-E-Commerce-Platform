const Tenant = require('../models/Tenant');
const User = require('../models/User');

const registerVendor = async (req, res) => {
  try {

    const {
      businessName,
      description,
      email
    } = req.body;

    if (!businessName) {
      return res.status(400).json({
        success: false,
        message: 'Business Name is required'
      });
    }

    const slug = businessName
      .toLowerCase()
      .replace(/\s+/g, '-');

    const tenant = await Tenant.create({
      name: businessName,
      slug,
      description,
      status: 'pending'
    });

    const user = await User.create({
      name: businessName,
      email,
      role: 'vendor',
      tenant_id: tenant._id
    });

    res.status(201).json({
      success: true,
      message: 'Vendor Registration Submitted',
      tenant,
      user
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Business Name or Email already exists'
      });
    }

    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerVendor
};