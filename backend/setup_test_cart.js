const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multi-tenant-ecommerce';

const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Cart = require('./src/models/Cart');

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Find the customer
    const customer = await User.findOne({ email: 'customer@example.com' });
    if (!customer) {
      console.error('Customer not found! Please run generate_customer_token.js first.');
      return;
    }
    console.log('Found Customer:', customer._id.toString());

    // 2. Find the iPhone 15 product
    const product = await Product.findOne({ title: 'iPhone 15' });
    if (!product) {
      console.error('iPhone 15 product not found!');
      return;
    }
    console.log('Found Product:', product._id.toString(), 'Tenant:', product.tenant_id.toString());

    // 3. Create or update the cart
    let cart = await Cart.findOne({ customer_id: customer._id });
    if (!cart) {
      cart = await Cart.create({
        customer_id: customer._id,
        items: []
      });
      console.log('Created new cart.');
    }

    // Set cart items to contain exactly 1 iPhone 15
    cart.items = [{
      product_id: product._id,
      tenant_id: product.tenant_id,
      quantity: 1
    }];

    await cart.save();
    console.log('Successfully set cart to contain 1 iPhone 15!');

    // Verify populate
    const updatedCart = await Cart.findOne({ customer_id: customer._id }).populate('items.product_id');
    console.log('Cart Items structure:', JSON.stringify(updatedCart.items, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
