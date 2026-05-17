const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    slug: {
      type: String,
      required: true,
      unique: true
    },

    description: {
      type: String
    },

    logo_url: {
      type: String
    },

    banner_url: {
      type: String
    },

    stripe_connect_account_id: {
      type: String
    },

    stripe_onboarding_complete: {
      type: Boolean,
      default: false
    },

    shipping_rate: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'suspended'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Tenant', tenantSchema);