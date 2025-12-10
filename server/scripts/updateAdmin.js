require('dotenv').config({ path: require('path').join(__dirname, '../../.env.local') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function updateAdminCredentials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and delete old admin
    const oldAdmin = await Admin.findOne({});
    if (oldAdmin) {
      await Admin.deleteMany({});
      console.log('✅ Old admin user(s) deleted');
    }

    // Create new admin with new credentials
    const admin = new Admin({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: 'Administrator',
    });

    await admin.save();
    console.log('✅ Admin updated successfully!');
    console.log('New Email:', process.env.ADMIN_EMAIL);
    console.log('New Password:', process.env.ADMIN_PASSWORD);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin:', error.message);
    process.exit(1);
  }
}

updateAdminCredentials();
