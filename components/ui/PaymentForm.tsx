"use client";

import { useState, useEffect } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { PaymentFormProps, PaymentResponse } from "@/types";
import { CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormInnerProps {
  amount: number;
  onSuccess: (payment: PaymentResponse) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

function PaymentFormInner({ amount, onSuccess, onError, disabled }: PaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "An error occurred");
        onError(submitError.message || "An error occurred");
        return;
      }

      // Create payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/download`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        onError(confirmError.message || "Payment failed");
      } else if (paymentIntent?.status === 'succeeded') {
        const paymentResponse: PaymentResponse = {
          id: paymentIntent.id,
          status: 'succeeded',
          clientSecret: paymentIntent.client_secret || undefined,
        };
        onSuccess(paymentResponse);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Enter your payment information to complete your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Secure payment powered by Stripe</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${(amount / 100).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">One-time payment</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !elements || isLoading || disabled}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Pay ${(amount / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export function PaymentForm({ amount, onSuccess, onError, disabled }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            currency: 'usd',
          }),
        });

        const data = await response.json();

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || 'Failed to create payment intent');
        }
      } catch {
        setError('Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount]);

  // Check if Stripe publishable key is available
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Stripe configuration missing. Please check your environment variables.
        </AlertDescription>
      </Alert>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Spinner size="lg" className="text-blue-600" />
            <p className="text-gray-600">Initializing payment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to initialize payment. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormInner
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        disabled={disabled}
      />
    </Elements>
  );
}
