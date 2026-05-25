const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    role: {
      type: String,
      enum: ['super_admin', 'admin', 'vendor', 'customer'],
      default: 'customer'
    },

    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null
    },

    password: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);