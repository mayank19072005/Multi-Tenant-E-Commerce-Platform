const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },

    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },

        quantity: {
          type: Number,
          default: 1
        },

        price: {
          type: Number
        }
      }
    ],

    total_amount: {
      type: Number,
      required: true
    },

    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },

    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'packed',
        'shipped',
        'delivered',
        'cancelled'
      ],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);