# Environment Configuration Guide

This guide explains how to configure different settings for development and production environments.

## 📁 Environment Files

Next.js automatically loads environment files based on `NODE_ENV`:

- **`.env.local`** - Loaded in ALL environments (highest priority, gitignored)
- **`.env.development`** - Loaded when `NODE_ENV=development`
- **`.env.production`** - Loaded when `NODE_ENV=production`

## 🔧 Setup Instructions

### For Development (Local)

1. **Copy the development example file:**
   ```bash
   cp .env.development.example .env.local
   ```

2. **Edit `.env.local`** with your development credentials:
   ```env
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/tos-dev
   CLOUDINARY_CLOUD_NAME=your-dev-cloudinary-name
   # ... etc
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   This automatically sets `NODE_ENV=development`

### For Production (Live/Deployment)

#### Option 1: Using .env.production file (for local production testing)

1. **Copy the production example file:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Edit `.env.production`** with your production credentials:
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/tos-prod
   CLOUDINARY_CLOUD_NAME=your-prod-cloudinary-name
   # ... etc
   ```

3. **Build and run:**
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

#### Option 2: Using Platform Environment Variables (Recommended for Vercel/Netlify)

**For Vercel:**
1. Go to your project settings → Environment Variables
2. Add all variables from `.env.production.example`
3. Set them for "Production" environment
4. Deploy - Vercel automatically uses `NODE_ENV=production`

**For Netlify:**
1. Go to Site settings → Environment variables
2. Add all variables from `.env.production.example`
3. Set context to "Production"
4. Deploy - Netlify automatically uses `NODE_ENV=production`

## 🔄 Switching Between Environments

### Development Mode
```bash
# NODE_ENV is automatically set to 'development'
npm run dev
```

### Production Mode (Local Testing)
```bash
# Build with production settings
npm run build

# Start with production environment
NODE_ENV=production npm start
```

### Check Current Environment
The app automatically detects the environment. You can check it in:
- Browser console: `process.env.NODE_ENV` (in client-side code)
- Server logs: Check the config output

## 📋 Environment Variables Priority

Next.js loads environment variables in this order (later ones override earlier):

1. `.env.development` or `.env.production` (based on NODE_ENV)
2. `.env.local` (overrides everything)
3. System environment variables (highest priority)

## ⚙️ Configuration Access

Access configuration in your code:

```javascript
import config from '@/lib/config';

// Check environment
if (config.isDevelopment) {
  console.log('Running in development mode');
  // Use dev MongoDB, dev Cloudinary, etc.
}

if (config.isProduction) {
  console.log('Running in production mode');
  // Use prod MongoDB, prod Cloudinary, etc.
}

// Access specific configs
const mongoUri = config.database.uri;
const cloudinaryName = config.cloudinary.cloudName;
```

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Never commit `.env.production`** - Use platform environment variables instead
3. **Use strong secrets in production** - Especially `JWT_SECRET`
4. **Different databases** - Always use separate MongoDB databases for dev/prod
5. **Different Cloudinary accounts** - Use separate Cloudinary accounts or folders

## 🎯 Quick Reference

| Environment | File to Edit | Command to Run |
|------------|--------------|----------------|
| Development | `.env.local` | `npm run dev` |
| Production (Local) | `.env.production` | `npm run build && NODE_ENV=production npm start` |
| Production (Vercel) | Vercel Dashboard → Env Vars | Deploy (automatic) |
| Production (Netlify) | Netlify Dashboard → Env Vars | Deploy (automatic) |

## 🐛 Troubleshooting

**Problem:** Wrong database/Cloudinary being used
- **Solution:** Check which `.env` file is being loaded. Make sure `NODE_ENV` matches your file name.

**Problem:** Environment variables not loading
- **Solution:** Restart the dev server after changing `.env` files. Next.js only loads env files on startup.

**Problem:** Production build using dev config
- **Solution:** Make sure `NODE_ENV=production` is set during build, or use platform environment variables.

