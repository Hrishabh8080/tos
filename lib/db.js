import mongoose from 'mongoose';
import config from './config.js';

// Optimized MongoDB connection with connection pooling
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Validate MongoDB URI
  const mongoUri = config.database.uri || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    const errorMsg = 
      'MONGODB_URI is not defined. Please add it to your .env.local file.\n' +
      'Example: MONGODB_URI=mongodb://localhost:27017/your-database-name';
    
    if (config.isProduction) {
      throw new Error(errorMsg);
    } else {
      throw new Error(errorMsg);
    }
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      ...config.database.options,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      return mongoose;
    }).catch((error) => {
      cached.promise = null;
      const errorMsg = `MongoDB Connection Error: ${error.message}`;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

