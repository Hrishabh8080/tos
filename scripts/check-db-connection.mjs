#!/usr/bin/env node

/**
 * Database Connection Checker
 * This script checks if MongoDB is properly configured and connected
 */

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
let mongoUri = null;
try {
  const envPath = join(__dirname, '..', '.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  const mongoMatch = envFile.match(/MONGODB_URI=(.+)/);
  if (mongoMatch) {
    mongoUri = mongoMatch[1].trim();
  }
} catch (e) {
  // .env.local might not exist, try process.env
  mongoUri = process.env.MONGODB_URI;
}

console.log('\n🔍 Database Connection Checker\n');
console.log('='.repeat(50));

// Check if MONGODB_URI is set
if (!mongoUri) {
  console.error('❌ ERROR: MONGODB_URI is not set');
  console.log('\n📝 Please add MONGODB_URI to your .env.local file:');
  console.log('   Example: MONGODB_URI=mongodb://localhost:27017/your-database-name');
  console.log('   Or: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name');
  process.exit(1);
}

console.log('✅ MONGODB_URI is set');
// Hide credentials in output
const safeUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log(`   URI: ${safeUri}`);

// Parse URI to show details
try {
  const url = new URL(mongoUri);
  console.log(`   Protocol: ${url.protocol.replace(':', '')}`);
  console.log(`   Host: ${url.hostname}`);
  if (url.port) {
    console.log(`   Port: ${url.port}`);
  }
  const dbName = url.pathname.substring(1) || 'default';
  console.log(`   Database: ${dbName}`);
} catch (e) {
  console.log('   (Could not parse URI format)');
}

console.log('\n🔄 Attempting to connect...\n');

// Connection states
const states = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

// Set up connection event listeners
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected Successfully!');
  if (mongoose.connection.db) {
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
  }
  console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  console.log(`   State: ${states[mongoose.connection.readyState]}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
});

// Attempt connection
const connectOptions = {
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  socketTimeoutMS: 45000,
};

mongoose
  .connect(mongoUri, connectOptions)
  .then(() => {
    console.log('\n✅ Connection successful!');
    console.log('\n📊 Connection Details:');
    console.log(`   Ready State: ${mongoose.connection.readyState} (${states[mongoose.connection.readyState]})`);
    if (mongoose.connection.db) {
      console.log(`   Database Name: ${mongoose.connection.db.databaseName}`);
    }
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database ping successful!');
    console.log('\n🎉 Database is ready to use!\n');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Connection Failed!');
    console.error('\n📋 Error Details:');
    console.error(`   Error Type: ${error.name}`);
    console.error(`   Error Message: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Possible Issues:');
      console.error('   1. DNS resolution failed - check your MongoDB hostname');
      console.error('   2. MongoDB server might be down');
      console.error('   3. Network connectivity issues');
      console.error('   4. Incorrect MongoDB URI format');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 Possible Issues:');
      console.error('   1. Incorrect username or password');
      console.error('   2. User does not have access to the database');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Possible Issues:');
      console.error('   1. MongoDB server is not responding');
      console.error('   2. Firewall blocking the connection');
      console.error('   3. Incorrect host or port');
    }
    
    console.error('\n📝 Check your MONGODB_URI in .env.local:');
    console.error(`   Current: ${safeUri}`);
    console.error('\n   Examples:');
    console.error('   Local: mongodb://localhost:27017/your-database');
    console.error('   Atlas: mongodb+srv://username:password@cluster.mongodb.net/database');
    
    process.exit(1);
  });


