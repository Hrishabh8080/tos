#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps set up .env.local and .env.production files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function copyFile(source, dest) {
  try {
    if (fs.existsSync(dest)) {
      console.log(`⚠️  ${dest} already exists. Skipping...`);
      return false;
    }
    fs.copyFileSync(source, dest);
    console.log(`✅ Created ${dest}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating ${dest}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Environment Setup Script\n');
  console.log('This script will help you set up environment files.\n');

  const envLocalExample = path.join(rootDir, '.env.local.example');
  const envProdExample = path.join(rootDir, '.env.production.example');
  const envLocal = path.join(rootDir, '.env.local');
  const envProd = path.join(rootDir, '.env.production');

  // Check if example files exist
  if (!fs.existsSync(envLocalExample)) {
    console.error('❌ .env.local.example not found!');
    process.exit(1);
  }

  if (!fs.existsSync(envProdExample)) {
    console.error('❌ .env.production.example not found!');
    process.exit(1);
  }

  // Setup local environment
  console.log('📝 Setting up LOCAL development environment...');
  const setupLocal = await question('Create .env.local for local development? (y/n): ');
  
  if (setupLocal.toLowerCase() === 'y' || setupLocal.toLowerCase() === 'yes') {
    copyFile(envLocalExample, envLocal);
    console.log('⚠️  Remember to edit .env.local with your actual values!\n');
  }

  // Setup production environment
  console.log('📝 Setting up PRODUCTION environment...');
  const setupProd = await question('Create .env.production for production? (y/n): ');
  
  if (setupProd.toLowerCase() === 'y' || setupProd.toLowerCase() === 'yes') {
    copyFile(envProdExample, envProd);
    console.log('⚠️  Remember to edit .env.production with your actual values!');
    console.log('⚠️  For production deployments, use platform environment variables instead.\n');
  }

  console.log('\n✅ Setup complete!');
  console.log('\n📚 Next steps:');
  console.log('1. Edit .env.local (if created) with your development credentials');
  console.log('2. Edit .env.production (if created) with your production credentials');
  console.log('3. For production: Set environment variables in your hosting platform');
  console.log('4. Read ENV_SETUP.md for detailed instructions\n');

  rl.close();
}

main().catch((error) => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});

