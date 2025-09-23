import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, validatePaymentAmount } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'usd' } = body;

    // Validate amount
    if (!amount || !validatePaymentAmount(amount)) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Validate currency
    if (currency !== 'usd') {
      return NextResponse.json(
        { error: 'Only USD currency is supported' },
        { status: 400 }
      );
    }

    // Create payment intent
    const result = await createPaymentIntent(amount, {
      product: 'ai-business-portrait',
      timestamp: new Date().toISOString(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
