const bcrypt =
  require('bcryptjs');

const Tenant =
  require('../models/Tenant');

const User =
  require('../models/User');

const registerVendor =
  async (req, res) => {

    try {

      const {

        businessName,

        email,

        password,

        description

      } = req.body;

      const existingUser =
        await User.findOne({
          email
        });

      if (existingUser) {

        return res.status(400).json({

          message:
            'Email already exists'

        });

      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const tenant =
        await Tenant.create({

          name:
            businessName,

          slug:
            businessName
              .toLowerCase()
              .replace(/ /g, '-'),

          description,

          status: 'pending'

        });

      const user =
        await User.create({

          name:
            businessName,

          email,

          password:
            hashedPassword,

          role: 'vendor',

          tenant_id:
            tenant._id

        });

      res.status(201).json({

        success: true,

        message:
          'Vendor Registration Submitted',

        tenant,

        user

      });

    } catch (error) {

      res.status(500).json({

        message:
          error.message

      });

    }

  };

module.exports = {
  registerVendor
};