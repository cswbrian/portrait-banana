# AI Business Portrait Generator

A Next.js application that generates professional business portraits using AI, with secure watermarking and payment processing.

## Getting Started

### Development Mode (Recommended)

To save costs during development, the app includes a development mode that skips AI API calls:

1. Copy the environment file:
```bash
cp env.example .env.local
```

2. Set development mode in `.env.local`:
```bash
DEV_MODE_SKIP_AI=true
NODE_ENV=development
```

3. Run the development server:
```bash
pnpm dev
```

**Development Mode Benefits:**
- ✅ Skips expensive Gemini API calls
- ✅ Returns original uploaded image with watermark
- ✅ Allows testing the full UI/UX flow
- ✅ Saves development costs

### Production Setup

For production, set:
```bash
DEV_MODE_SKIP_AI=false
NODE_ENV=production
```

And configure your actual API keys in `.env.local`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
