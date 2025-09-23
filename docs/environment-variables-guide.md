# Environment Variables Guide for Next.js

## Overview
Environment variables in Next.js allow you to store sensitive data and configuration settings outside your code. This is essential for security and flexibility across different environments (development, staging, production).

## File Structure

### 1. `.env.local` (Your actual environment file)
```bash
# This file contains your REAL environment variables
# NEVER commit this file to version control
# Copy from .env.example and fill in your actual values

# Google Gemini 2.5 Flash Image API (Nano Banana)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 2. `.env.example` (Template file)
```bash
# This file is committed to version control
# Shows what environment variables are needed
# Copy this to .env.local and fill in your values

# Google Gemini 2.5 Flash Image API (Nano Banana)
GEMINI_API_KEY=your_gemini_api_key_here

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Environment Variable Types

### 1. Server-Side Only (Default)
```bash
# These are only available on the server
GEMINI_API_KEY=your_key_here
STRIPE_SECRET_KEY=your_secret_here
DATABASE_URL=your_database_url
```

### 2. Client-Side Accessible
```bash
# Prefix with NEXT_PUBLIC_ to make them available in the browser
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
```

## Loading Order (Priority)
Next.js loads environment variables in this order (later overrides earlier):

1. `.env.local` (highest priority)
2. `.env.development` / `.env.production`
3. `.env`

## Usage in Code

### 1. Server-Side (API Routes, Server Components)
```typescript
// Direct access
const apiKey = process.env.GEMINI_API_KEY;

// With fallback
const apiKey = process.env.GEMINI_API_KEY || 'default-key';

// Type-safe access
const config = {
  apiKey: process.env.GEMINI_API_KEY!,
  baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
};
```

### 2. Client-Side (Components, Pages)
```typescript
// Only NEXT_PUBLIC_ variables are available
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// This will be undefined on client-side
const secretKey = process.env.STRIPE_SECRET_KEY; // undefined
```

### 3. Type-Safe Configuration
```typescript
// lib/config.ts
interface EnvConfig {
  GEMINI_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

class Config {
  private static instance: Config;
  private config: EnvConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EnvConfig {
    const requiredVars = ['GEMINI_API_KEY', 'STRIPE_SECRET_KEY'];
    const missing = requiredVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
      NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    };
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }
}

export const config = new Config();
```

## Security Best Practices

### 1. Never Commit Sensitive Data
```bash
# .gitignore
.env.local
.env.*.local
.env.production
.env.development
```

### 2. Use Different Keys for Different Environments
```bash
# Development
STRIPE_SECRET_KEY=sk_test_development_key

# Production
STRIPE_SECRET_KEY=sk_live_production_key
```

### 3. Validate Environment Variables
```typescript
// lib/env-validation.ts
import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

## Deployment Considerations

### 1. Vercel
```bash
# Set in Vercel dashboard or CLI
vercel env add GEMINI_API_KEY
vercel env add STRIPE_SECRET_KEY
```

### 2. Other Platforms
- **Netlify**: Environment variables in site settings
- **Railway**: Environment variables in project settings
- **Docker**: Use docker-compose.yml or Dockerfile ENV

### 3. CI/CD
```yaml
# GitHub Actions example
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
```

## Common Patterns

### 1. Feature Flags
```bash
# .env.local
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

```typescript
// Usage
const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
const isDebugMode = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true';
```

### 2. API Configuration
```bash
# .env.local
API_BASE_URL=https://api.example.com
API_TIMEOUT=5000
API_RETRY_ATTEMPTS=3
```

```typescript
// Usage
const apiConfig = {
  baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  timeout: parseInt(process.env.API_TIMEOUT || '5000'),
  retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
};
```

### 3. Database Configuration
```bash
# .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000
```

## Debugging Environment Variables

### 1. Check What's Available
```typescript
// pages/api/debug-env.ts
export default function handler(req, res) {
  res.status(200).json({
    nodeEnv: process.env.NODE_ENV,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    publicUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
}
```

### 2. Client-Side Debugging
```typescript
// components/DebugEnv.tsx
export function DebugEnv() {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded">
      <pre>{JSON.stringify({
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        nodeEnv: process.env.NODE_ENV,
      }, null, 2)}</pre>
    </div>
  );
}
```

## Troubleshooting

### 1. Variables Not Loading
- Check file name (`.env.local` not `.env.local.txt`)
- Restart development server after adding variables
- Check for typos in variable names

### 2. Client-Side Access Issues
- Ensure variables start with `NEXT_PUBLIC_`
- Check if variables are defined in the correct environment file

### 3. TypeScript Errors
- Define types for environment variables
- Use non-null assertion (`!`) for required variables
- Create a validation schema

## Example: Complete Setup

### 1. Create `.env.local`
```bash
# Copy from .env.example and fill in your values
GEMINI_API_KEY=your_actual_key_here
STRIPE_SECRET_KEY=your_actual_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Update `lib/config.ts`
```typescript
export const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY!,
    model: 'gemini-2.5-flash-image-preview',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL!,
    env: process.env.NODE_ENV!,
  },
};
```

### 3. Use in Components
```typescript
import { config } from '@/lib/config';

export function MyComponent() {
  const apiKey = config.gemini.apiKey; // Server-side only
  const appUrl = config.app.url; // Available everywhere
  
  return <div>App URL: {appUrl}</div>;
}
```

This setup ensures your environment variables are secure, type-safe, and properly configured across all environments!
