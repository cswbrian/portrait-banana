"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PreviewImage } from "@/components/ui/PreviewImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UploadedImage, CustomizationOptions as CustomizationOptionsType, GenerationResponse } from "@/types";
import { ArrowLeft, Eye, AlertCircle, CheckCircle } from "lucide-react";
import { LoadingCard, ProgressSteps } from "@/components/ui/LoadingStates";
import Link from "next/link";

// Helper function to convert File to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64 data
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function PreviewPage() {
  const router = useRouter();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [customization, setCustomization] = useState<CustomizationOptionsType | null>(null);
  const [generation, setGeneration] = useState<GenerationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      setIsInitializing(true);
      try {
        // Simulate initialization time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get data from session storage
        const storedImage = sessionStorage.getItem("uploadedImage");
        const storedCustomization = sessionStorage.getItem("customization");

        if (!storedImage || !storedCustomization) {
          setError("Missing required data. Please start over.");
          return;
        }

        const parsedImage = JSON.parse(storedImage);
        const parsedCustomization = JSON.parse(storedCustomization);
        
        setUploadedImage(parsedImage);
        setCustomization(parsedCustomization);
        
        // Start generation process
        generatePreview(parsedImage, parsedCustomization);
      } catch {
        setError("Invalid data. Please start over.");
      } finally {
        setIsInitializing(false);
      }
    };

    initializePage();
  }, []);

  const generatePreview = async (image: UploadedImage, customizations: CustomizationOptionsType) => {
    setLoading(true);
    setIsGenerating(true);
    setError(null);

    try {
      // Check if image already has base64Data (from session storage)
      let imageBase64: string;
      if (image.base64Data) {
        imageBase64 = image.base64Data;
      } else if (image.file) {
        // Fallback: convert file to base64 (for backward compatibility)
        imageBase64 = await convertFileToBase64(image.file);
      } else {
        throw new Error('No image data available');
      }
      
      // Create a serializable image object
      const serializableImage = {
        id: image.id,
        preview: image.preview,
        size: image.size,
        type: image.type,
        dimensions: image.dimensions,
        uploadedAt: image.uploadedAt,
        base64Data: imageBase64,
      };

      // Call the real API to generate preview
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: serializableImage,
          options: customizations,
          useCase: 'general',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If rate limited, provide helpful message
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const resetTime = response.headers.get('X-RateLimit-Reset');
          const remaining = response.headers.get('X-RateLimit-Remaining');
          
          console.warn('Rate limited:', { retryAfter, resetTime, remaining });
          
          // In development, provide clear rate limit info
          if (process.env.NODE_ENV === 'development') {
            throw new Error(
              `Rate limit exceeded. Remaining: ${remaining}, Reset: ${new Date(parseInt(resetTime || '0')).toLocaleTimeString()}. ` +
              `In development, you can clear rate limits by running: fetch('/api/debug/clear-rate-limit', {method: 'POST'})`
            );
          } else {
            throw new Error(data.error || 'Rate limit exceeded. Please try again later.');
          }
        }
        
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate preview');
      }

      // Create generation response from API data
      const generationResponse: GenerationResponse = {
        id: crypto.randomUUID(),
        imageUrl: data.previewUrl || `data:image/jpeg;base64,${data.imageData}`,
        isPreview: true,
        watermarked: data.metadata?.watermarked || true,
        status: 'completed',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        metadata: data.metadata,
      };

      setGeneration(generationResponse);
    } catch (err) {
      console.error('Preview generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate preview. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    if (uploadedImage && customization) {
      generatePreview(uploadedImage, customization);
    }
  };

  const handleDownload = () => {
    // Store generation data and redirect to payment
    if (generation) {
      sessionStorage.setItem("generation", JSON.stringify(generation));
      router.push("/payment");
    }
  };

  const handleBack = () => {
    router.push("/customize");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="container mx-auto px-4 py-4 sm:py-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Portrait Banana</span>
            </Link>
          </nav>
        </header>
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <LoadingCard
              title="Initializing Preview"
              description="Loading your image and customization settings..."
              showSkeleton={true}
            />
          </div>
        </main>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="container mx-auto px-4 py-4 sm:py-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Portrait Banana</span>
            </Link>
          </nav>
        </header>
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <LoadingCard
              title="Generating Your Portrait"
              description="Our AI is creating your professional portrait. This may take a few moments..."
              showSkeleton={true}
            />
            <div className="mt-6">
              <ProgressSteps
                currentStep={3}
                totalSteps={4}
                steps={[
                  "Upload your photo",
                  "Choose customization",
                  "Generate preview",
                  "Download your portrait"
                ]}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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

  if (!uploadedImage || !customization) {
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
            Back to Customize
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
              <div className="w-16 h-0.5 bg-blue-600"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="text-blue-600 font-medium">Preview</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <span className="text-gray-500">Download</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview Section */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-8 h-8" />
                  Preview Your Portrait
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Here&apos;s your AI-generated professional portrait. Review it and proceed to payment to download the full version.
                </p>
              </div>

              <PreviewImage
                imageUrl={generation?.imageUrl || uploadedImage.preview}
                watermarked={generation?.watermarked || false}
                onDownload={handleDownload}
                onRetry={handleRetry}
                loading={loading}
                error={error || undefined}
                generationId={generation?.id}
              />
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Your Selections */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Selections</CardTitle>
                  <CardDescription>
                    Review your customization choices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Background:</span>
                    <Badge variant="outline">
                      {customization.background === 'office' ? 'Office' : 'Studio'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Style:</span>
                    <Badge variant="outline">
                      {customization.style === 'professional' ? 'Professional' : 
                       customization.style === 'executive' ? 'Executive' :
                       customization.style === 'creative' ? 'Creative' : 'Casual'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Original Image:</span>
                    <span className="text-sm text-gray-900">
                      {uploadedImage.file?.name || uploadedImage.type || 'Uploaded Image'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Pricing</CardTitle>
                  <CardDescription className="text-green-700">
                    One-time payment for your professional portrait
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-800 mb-2">$7.99</div>
                    <div className="text-sm text-green-600 mb-4">
                      High-resolution, watermark-free download
                    </div>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>2048x2048 resolution</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>No watermark</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Professional quality</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <CardTitle>What&apos;s Included</CardTitle>
                  <CardDescription>
                    Your professional portrait package
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">High-resolution image (2048x2048)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">No watermarks or branding</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Professional quality enhancement</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Instant download after payment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">24-hour download access</span>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>1. Review your portrait above</p>
                    <p>2. Click &quot;Pay &amp; Download Full Version&quot;</p>
                    <p>3. Complete secure payment</p>
                    <p>4. Download your professional portrait</p>
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
