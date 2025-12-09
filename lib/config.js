/**
 * Application Configuration
 * Centralized configuration for development and production environments
 * 
 * Next.js automatically loads:
 * - .env.local (loaded in all environments, gitignored)
 * - .env.development (loaded when NODE_ENV=development)
 * - .env.production (loaded when NODE_ENV=production)
 */

// Get environment mode
const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  // Environment
  env: nodeEnv,
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    timeout: 30000, // 30 seconds
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'tos-products',
    maxWidth: parseInt(process.env.CLOUDINARY_MAX_WIDTH) || 800,
    maxHeight: parseInt(process.env.CLOUDINARY_MAX_HEIGHT) || 800,
    quality: process.env.CLOUDINARY_QUALITY || 'auto',
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    contactEmail: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
  },

  // Admin Configuration
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },

  // Cache Configuration
  cache: {
    duration: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  },

  // Logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    enabled: true,
  },
};

// Validation
function validateConfig() {
  const required = [
    'database.uri',
    'auth.jwtSecret',
    'cloudinary.cloudName',
    'cloudinary.apiKey',
    'cloudinary.apiSecret',
  ];

  const missing = [];

  required.forEach((key) => {
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
      value = value[k];
      if (!value) break;
    }
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0 && config.isProduction) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

}

// Validate on load
validateConfig();

export default config;

