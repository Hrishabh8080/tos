import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
const envFiles = ['.env.local', '.env'];
let loaded = false;

for (const envFile of envFiles) {
  const envPath = join(__dirname, '..', envFile);
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    console.log(`✅ Loaded ${envFile}`);
    loaded = true;
    break;
  } catch (err) {
    // Try next file
  }
}

if (!loaded) {
  console.error('❌ No .env.local or .env file found');
}

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

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
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

