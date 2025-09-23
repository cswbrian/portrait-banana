import Stripe from 'stripe';
import { config } from './config';

// Initialize Stripe with your secret key
export const stripe = new Stripe(config.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2025-08-27.basil', // Use the latest API version
  typescript: true,
});

// Stripe configuration for client-side
export const stripeConfig = {
  publishableKey: config.get('STRIPE_PUBLISHABLE_KEY'),
  options: {
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#3b82f6', // Blue theme to match our design
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  },
};

// Payment intent creation
export async function createPaymentIntent(amount: number, metadata: Record<string, string> = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      metadata: {
        ...metadata,
        source: 'portrait-banana',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    };
  }
}

// Payment intent retrieval
export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
    };
  }
}

// Webhook signature verification
export function verifyWebhookSignature(payload: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.get('STRIPE_WEBHOOK_SECRET')
    );
    return { success: true, event };
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid signature',
    };
  }
}

// Price formatting utility
export function formatPrice(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}

// Validate payment amount
export function validatePaymentAmount(amount: number): boolean {
  const minAmount = 50; // $0.50 minimum
  const maxAmount = 10000; // $100.00 maximum
  return amount >= minAmount && amount <= maxAmount;
}
