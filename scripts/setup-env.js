#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps you set up environment variables for the project
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const envExamplePath = path.join(process.cwd(), '.env.example');
const envLocalPath = path.join(process.cwd(), '.env.local');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('🚀 Setting up environment variables for Portrait Banana\n');
  
  // Check if .env.local already exists
  if (fs.existsSync(envLocalPath)) {
    const overwrite = await question('⚠️  .env.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled.');
      rl.close();
      return;
    }
  }

  // Read .env.example
  if (!fs.existsSync(envExamplePath)) {
    console.log('❌ .env.example file not found!');
    rl.close();
    return;
  }

  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  const lines = envExample.split('\n');
  const newEnvContent = [];

  console.log('📝 Please provide values for the following environment variables:\n');

  for (const line of lines) {
    if (line.trim() === '' || line.startsWith('#')) {
      newEnvContent.push(line);
      continue;
    }

    const [key, defaultValue] = line.split('=');
    if (!key) {
      newEnvContent.push(line);
      continue;
    }

    const description = getDescription(key);
    const prompt = `${key}${description ? ` (${description})` : ''}${defaultValue ? ` [${defaultValue}]` : ''}: `;
    
    const value = await question(prompt);
    const finalValue = value.trim() || defaultValue || '';
    
    newEnvContent.push(`${key}=${finalValue}`);
  }

  // Write .env.local
  fs.writeFileSync(envLocalPath, newEnvContent.join('\n'));
  
  console.log('\n✅ Environment variables saved to .env.local');
  console.log('\n📋 Next steps:');
  console.log('1. Review your .env.local file');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Test the API endpoints');
  
  rl.close();
}

function getDescription(key) {
  const descriptions = {
    'GEMINI_API_KEY': 'Get from Google AI Studio (https://aistudio.google.com)',
    'STRIPE_PUBLISHABLE_KEY': 'Get from Stripe Dashboard (https://dashboard.stripe.com)',
    'STRIPE_SECRET_KEY': 'Get from Stripe Dashboard (https://dashboard.stripe.com)',
    'STRIPE_WEBHOOK_SECRET': 'Get from Stripe Dashboard webhooks section',
    'NEXT_PUBLIC_APP_URL': 'Your app URL (http://localhost:3000 for development)',
    'NODE_ENV': 'Environment (development, production, test)',
    'UPLOAD_MAX_SIZE': 'Max file size in bytes (10485760 = 10MB)',
    'RATE_LIMIT_MAX_ATTEMPTS': 'Max API calls per IP per day',
    'RATE_LIMIT_WINDOW_MS': 'Rate limit window in milliseconds (86400000 = 24 hours)',
    'GENERATION_PREVIEW_COST': 'Cost for preview generation in USD',
    'GENERATION_FULL_COST': 'Cost for full generation in USD',
    'DOWNLOAD_PRICE': 'Download price in cents (799 = $7.99)',
    'CURRENCY': 'Currency code (usd, eur, gbp)',
    'AWS_ACCESS_KEY_ID': 'AWS access key for S3 storage',
    'AWS_SECRET_ACCESS_KEY': 'AWS secret key for S3 storage',
    'AWS_REGION': 'AWS region (us-east-1, eu-west-1, etc.)',
    'AWS_S3_BUCKET': 'S3 bucket name',
    'CLOUDINARY_CLOUD_NAME': 'Cloudinary cloud name',
    'CLOUDINARY_API_KEY': 'Cloudinary API key',
    'CLOUDINARY_API_SECRET': 'Cloudinary API secret',
    'GOOGLE_ANALYTICS_ID': 'Google Analytics tracking ID',
    'SENTRY_DSN': 'Sentry error tracking DSN',
  };

  return descriptions[key] || '';
}

// Run the setup
setupEnvironment().catch(console.error);
