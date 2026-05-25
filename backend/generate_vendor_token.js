const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

    // Clear any conflicting user by email or ID to prevent primary key / unique index collisions
    await User.deleteMany({
      $or: [
        { email: 'vendor@test.com' },
        { email: 'vendor@example.com' },
        { _id: new mongoose.Types.ObjectId("6a14bf2e0761213338988b35") }
      ]
    });
    console.log('Cleared existing conflicting vendor accounts.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create the vendor user with the exact email, name, role, and ID expected by the client and test framework
    const vendor = await User.create({
      _id: new mongoose.Types.ObjectId("6a14bf2e0761213338988b35"),
      name: 'Vendor User',
      email: 'vendor@test.com',
      role: 'vendor',
      password: hashedPassword,
      status: 'active',
      tenant_id: new mongoose.Types.ObjectId("6a14bf2e0761213338988b35")
    });
    console.log('Created new Vendor User with ID:', vendor._id.toString());

    // Generate Vendor Token
    const vendorToken = jwt.sign(
      {
        id: vendor._id,
        role: vendor.role,
        tenant_id: vendor.tenant_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\n======================================================');
    console.log('VENDOR CREDENTIALS FOR WEB LOGIN:');
    console.log('Name: Vendor User');
    console.log('Email: vendor@test.com');
    console.log('Role: vendor');
    console.log('Password: password123');
    console.log('------------------------------------------------------');
    console.log('VENDOR JWT TOKEN:');
    console.log(vendorToken);
    console.log('======================================================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
