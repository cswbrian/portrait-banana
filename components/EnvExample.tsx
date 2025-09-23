"use client";

import { env } from '@/lib/env-validation';

/**
 * Example component showing how to use environment variables
 * This is for demonstration purposes - remove in production
 */
export function EnvExample() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const nodeEnv = process.env.NODE_ENV;
  
  // These will be undefined on client-side (as expected)
  const geminiKey = process.env.GEMINI_API_KEY; // undefined
  const stripeSecret = process.env.STRIPE_SECRET_KEY; // undefined

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Environment Variables Demo</h3>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">NODE_ENV:</span> {nodeEnv}
        </div>
        
        <div>
          <span className="text-gray-400">NEXT_PUBLIC_APP_URL:</span> {appUrl}
        </div>
        
        <div>
          <span className="text-gray-400">GEMINI_API_KEY:</span> {geminiKey ? '✅ Set' : '❌ Not available (server-only)'}
        </div>
        
        <div>
          <span className="text-gray-400">STRIPE_SECRET_KEY:</span> {stripeSecret ? '✅ Set' : '❌ Not available (server-only)'}
        </div>
      </div>
      
      <div className="mt-2 text-gray-400">
        <p>Client-side can only access NEXT_PUBLIC_* variables</p>
      </div>
    </div>
  );
}

/**
 * Server-side example (for API routes or server components)
 */
export function ServerEnvExample() {
  // This would only work in server components or API routes
  const config = env.getAIConfig();
  const stripeConfig = env.getStripeConfig();
  
  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-2">Server-Side Environment Access</h3>
      <div className="text-sm space-y-1">
        <div>AI Model: {config.model}</div>
        <div>Stripe Publishable Key: {stripeConfig.publishableKey ? '✅ Set' : '❌ Missing'}</div>
        <div>Environment: {env.isDevelopment() ? 'Development' : 'Production'}</div>
      </div>
    </div>
  );
}
