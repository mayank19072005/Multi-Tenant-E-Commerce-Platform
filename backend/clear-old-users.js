const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multi-tenant-ecommerce';
const User = require('./src/models/User');

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Delete any users with test emails so we can register fresh with password strings
    const emailsToDelete = ['customer@example.com', 'testcustomer@example.com'];
    const result = await User.deleteMany({ email: { $in: emailsToDelete } });
    console.log(`Deleted ${result.deletedCount} old test user accounts.`);

  } catch (error) {
    console.error('Error cleaning up users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
