"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomizationOptions } from "@/components/ui/CustomizationOptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomizationOptions as CustomizationOptionsType, UploadedImage } from "@/types";

// Type for serialized image data from session storage
interface SerializedImage {
  id: string;
  preview: string;
  size: number;
  type: string;
  dimensions: {
    width: number;
    height: number;
  };
  uploadedAt: string;
  base64Data: string;
  file?: File; // Optional for backward compatibility
}
import { ArrowLeft, ArrowRight, Palette, AlertCircle } from "lucide-react";
import { LoadingCard, ProgressSteps, ImageSkeleton } from "@/components/ui/LoadingStates";
import Link from "next/link";

export default function CustomizePage() {
  const router = useRouter();
  const [uploadedImage, setUploadedImage] = useState<SerializedImage | null>(null);
  const [customization, setCustomization] = useState<CustomizationOptionsType>({
    background: 'office',
    style: 'professional'
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get uploaded image from session storage
        const storedImage = sessionStorage.getItem("uploadedImage");
        if (!storedImage) {
          setError("No image found. Please upload an image first.");
          return;
        }

        const parsedImage = JSON.parse(storedImage);
        setUploadedImage(parsedImage);
      } catch (err) {
        setError("Invalid image data. Please upload an image again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, []);

  const handleCustomizationChange = (newCustomization: CustomizationOptionsType) => {
    setCustomization(newCustomization);
  };

  const handleContinue = async () => {
    if (!uploadedImage) {
      setError("No image found. Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Store customization in session storage
      sessionStorage.setItem("customization", JSON.stringify(customization));
      router.push("/preview");
    } catch (error) {
      setError("Failed to save customization. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push("/upload");
  };

  if (isLoading) {
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
              title="Loading Customization Options"
              description="Preparing your image and customization settings..."
              showSkeleton={true}
            />
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
            <Button asChild className="w-full mt-4">
              <Link href="/upload">Upload Image</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!uploadedImage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your image...</p>
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
            Back to Upload
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
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="text-blue-600 font-medium">Customize</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="text-gray-500">Preview</span>
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
            {/* Customization Section */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="w-8 h-8" />
                  Customize Your Portrait
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Choose your preferred background and style. We'll transform your photo to match your professional needs.
                </p>
              </div>

              <CustomizationOptions
                options={customization}
                onChange={handleCustomizationChange}
                disabled={false}
              />
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Photo</CardTitle>
                  <CardDescription>
                    This is the image we'll transform into a professional portrait
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={uploadedImage.preview}
                      alt="Uploaded image preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p><strong>File:</strong> {uploadedImage.file?.name || `image.${uploadedImage.type?.split('/')[1] || 'jpg'}`}</p>
                    <p><strong>Size:</strong> {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Dimensions:</strong> {uploadedImage.dimensions.width} × {uploadedImage.dimensions.height}px</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What Happens Next?</CardTitle>
                  <CardDescription>
                    Here's what we'll do with your selections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">1</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Apply your selected background and style
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">2</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Generate a watermarked preview for you to review
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">3</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Process your payment and generate the final image
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-sm text-blue-700">
                    You can always go back and change your selections before generating your portrait. 
                    Take your time to choose the perfect combination!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center mt-8">
            <Button 
              size="lg" 
              onClick={handleContinue}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Generate Preview
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
