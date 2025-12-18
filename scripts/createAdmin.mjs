import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Simple connection function
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

// Define Admin schema inline for script
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
}, { timestamps: true });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function createDefaultAdmin() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('❌ Admin already exists with email:', process.env.ADMIN_EMAIL);
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: 'Administrator',
    });

    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('Email:', process.env.ADMIN_EMAIL);
    console.log('Password:', process.env.ADMIN_PASSWORD);
    console.log('\n⚠️  Please change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createDefaultAdmin();

