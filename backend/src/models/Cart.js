const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        tenant_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tenant',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Cart', cartSchema);
