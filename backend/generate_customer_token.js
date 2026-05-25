const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multi-tenant-ecommerce';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123';

const User = require('./src/models/User');

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find or create customer
    let customer = await User.findOne({ email: 'customer@example.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Test Customer',
        email: 'customer@example.com',
        role: 'customer',
        status: 'active'
      });
      console.log('Created new Customer User:', customer._id.toString());
    } else {
      console.log('Found existing Customer User:', customer._id.toString());
    }

    // Generate Customer Token
    const customerToken = jwt.sign(
      {
        id: customer._id,
        role: customer.role,
        tenant_id: customer.tenant_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\n======================================================');
    console.log('CUSTOMER JWT TOKEN:');
    console.log(customerToken);
    console.log('======================================================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
