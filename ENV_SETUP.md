# Environment Variables Setup Guide

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Run the setup script:**
   ```bash
   npm run setup-env
   ```

3. **Or manually edit .env.local:**
   ```bash
   # Required variables
   GEMINI_API_KEY=your_gemini_api_key_here
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Key Points

- **Server-only variables** (no `NEXT_PUBLIC_` prefix): Only available in API routes and server components
- **Client variables** (with `NEXT_PUBLIC_` prefix): Available in browser and client components
- **Never commit** `.env.local` to version control
- **Always validate** environment variables on startup

## Usage Examples

```typescript
// Server-side (API routes)
import { env } from '@/lib/env-validation';

const apiKey = env.get('GEMINI_API_KEY');
const stripeConfig = env.getStripeConfig();

// Client-side (components)
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
```

## Validation

```bash
# Check if all required variables are set
npm run env:validate
```

## Getting API Keys

- **Gemini API**: https://aistudio.google.com
- **Stripe**: https://dashboard.stripe.com
- **Google Analytics**: https://analytics.google.com
