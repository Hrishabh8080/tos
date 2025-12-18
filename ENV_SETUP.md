# Environment Variables Setup

## ✅ `.env.local` File Created

A `.env.local` file has been created with all required environment variables. You just need to fill in the values.

## Required Environment Variables

### 🔴 Required (Must Fill)

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/your-database-name
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# JWT Secret for Authentication (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (for contact requests)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin Credentials (for creating admin account)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
```

### 🟡 Optional (Have Defaults)

```env
# JWT Token Expiration (default: 7d)
JWT_EXPIRES_IN=7d

# Cloudinary Settings
CLOUDINARY_FOLDER=tos-products
CLOUDINARY_MAX_WIDTH=800
CLOUDINARY_MAX_HEIGHT=800
CLOUDINARY_QUALITY=auto

# Email Service Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=          # Leave empty for Gmail, fill for custom SMTP
EMAIL_PORT=587       # Only needed if using custom SMTP
EMAIL_SECURE=false   # Only needed if using custom SMTP
CONTACT_EMAIL=       # Leave empty to use EMAIL_USER

# Google Sheets Integration (for contact form)
NEXT_PUBLIC_GOOGLE_SHEETS_URL=  # Optional: Your Google Sheets web app URL

# Application Environment
NODE_ENV=development
```

## Quick Setup

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your actual values

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Important Notes

- `.env.local` is gitignored and should NOT be committed to version control
- All environment variables are loaded automatically by Next.js
- Changes to `.env.local` require a server restart to take effect

