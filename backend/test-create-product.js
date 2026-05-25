const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multi-tenant-ecommerce';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123';

const Tenant = require('./src/models/Tenant');
const User = require('./src/models/User');
const Product = require('./src/models/Product');

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Find or create a Tenant
    let tenant = await Tenant.findOne({ slug: 'test-vendor' });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'Test Vendor',
        slug: 'test-vendor',
        description: 'Vendor for testing products creation',
        status: 'active'
      });
      console.log('Created new Tenant:', tenant._id.toString());
    } else {
      console.log('Found existing Tenant:', tenant._id.toString());
    }

    // 2. Find or create a Vendor User
    let vendor = await User.findOne({ email: 'vendor@example.com' });
    if (!vendor) {
      vendor = await User.create({
        name: 'Test Vendor',
        email: 'vendor@example.com',
        role: 'vendor',
        tenant_id: tenant._id,
        status: 'active'
      });
      console.log('Created new Vendor User:', vendor._id.toString());
    } else {
      console.log('Found existing Vendor User:', vendor._id.toString());
    }

    // 3. Generate a VENDOR_TOKEN
    const vendorToken = jwt.sign(
      {
        id: vendor._id,
        role: vendor.role,
        tenant_id: vendor.tenant_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\n--- VENDOR DETAILS FOR MANUAL TESTING ---');
    console.log('Authorization: Bearer ' + vendorToken);
    console.log('Tenant ID (YOUR_REAL_TENANT_ID):', tenant._id.toString());
    console.log('-----------------------------------------\n');

    // 4. Create the product "iPhone 15" if it does not already exist
    let product = await Product.findOne({ title: 'iPhone 15', tenant_id: tenant._id });
    if (!product) {
      product = await Product.create({
        title: 'iPhone 15',
        description: 'Apple smartphone',
        price: 999,
        stock: 10,
        category: 'Electronics',
        tenant_id: tenant._id,
        vendor_id: vendor._id,
        images: ['https://dummyimage.com/600x400/000/fff'],
        status: 'active'
      });
      console.log('Successfully created product: iPhone 15 in database!');
    } else {
      console.log('Product "iPhone 15" already exists in database.');
    }

    console.log('\nAll verification and setup tasks finished successfully!');
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
