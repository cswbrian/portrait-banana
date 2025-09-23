"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaymentForm } from "@/components/ui/PaymentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UploadedImage, CustomizationOptions as CustomizationOptionsType, GenerationResponse, PaymentResponse } from "@/types";
import { ArrowLeft, CreditCard, Shield, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PRICING_CONFIG } from "@/lib/constants";

export default function PaymentPage() {
  const router = useRouter();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [customization, setCustomization] = useState<CustomizationOptionsType | null>(null);
  const [generation, setGeneration] = useState<GenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Get data from session storage
    const storedImage = sessionStorage.getItem("uploadedImage");
    const storedCustomization = sessionStorage.getItem("customization");
    const storedGeneration = sessionStorage.getItem("generation");

    if (!storedImage || !storedCustomization || !storedGeneration) {
      setError("Missing required data. Please start over.");
      return;
    }

    try {
      const parsedImage = JSON.parse(storedImage);
      const parsedCustomization = JSON.parse(storedCustomization);
      const parsedGeneration = JSON.parse(storedGeneration);
      
      setUploadedImage(parsedImage);
      setCustomization(parsedCustomization);
      setGeneration(parsedGeneration);
    } catch (err) {
      setError("Invalid data. Please start over.");
    }
  }, []);

  const handlePaymentSuccess = async (payment: any) => {
    setIsProcessing(true);
    
    try {
      // Store payment data
      const paymentData: PaymentResponse = {
        id: payment.id,
        status: 'succeeded',
        downloadUrl: `/api/download/${payment.id}`, // Mock download URL
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      sessionStorage.setItem("payment", JSON.stringify(paymentData));
      
      // Redirect to download page
      router.push("/download");
    } catch (err) {
      setError("Payment succeeded but failed to process. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleBack = () => {
    router.push("/preview");
  };

  if (error && !uploadedImage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4">
              <Button asChild className="flex-1">
                <Link href="/upload">Start Over</Link>
              </Button>
              <Button variant="outline" onClick={handleBack}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!uploadedImage || !customization || !generation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">Portrait Banana</span>
          </Link>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Preview
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-green-600 font-medium">Upload</span>
              </div>
              <div className="w-16 h-0.5 bg-green-600"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-green-600 font-medium">Customize</span>
              </div>
              <div className="w-16 h-0.5 bg-green-600"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-green-600 font-medium">Preview</span>
              </div>
              <div className="w-16 h-0.5 bg-blue-600"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <span className="text-blue-600 font-medium">Payment</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Section */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-8 h-8" />
                  Complete Your Purchase
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Secure payment to download your professional portrait. Your payment is processed safely by Stripe.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <PaymentForm
                amount={PRICING_CONFIG.DOWNLOAD_PRICE}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={isProcessing}
              />
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    Review your purchase details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="aspect-square w-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={generation.imageUrl}
                        alt="Portrait preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">AI Business Portrait</h4>
                      <p className="text-sm text-gray-600">
                        {customization.background === 'office' ? 'Office' : 'Studio'} background, {customization.style} style
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">High Resolution</Badge>
                        <Badge variant="outline">No Watermark</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Portrait Generation</span>
                      <span className="text-gray-900">${(PRICING_CONFIG.DOWNLOAD_PRICE / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="text-gray-900">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">$0.00</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${(PRICING_CONFIG.DOWNLOAD_PRICE / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Shield className="w-5 h-5" />
                    Secure Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Powered by Stripe</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>No card data stored</span>
                  </div>
                </CardContent>
              </Card>

              {/* What Happens Next */}
              <Card>
                <CardHeader>
                  <CardTitle>What Happens Next?</CardTitle>
                  <CardDescription>
                    After successful payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">1</span>
                    </div>
                    <span className="text-sm text-gray-600">Payment is processed securely</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">2</span>
                    </div>
                    <span className="text-sm text-gray-600">Full-resolution image is generated</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">3</span>
                    </div>
                    <span className="text-sm text-gray-600">Download link is provided</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">4</span>
                    </div>
                    <span className="text-sm text-gray-600">You can download for 24 hours</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
