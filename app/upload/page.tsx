"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadedImage } from "@/types";
import { ArrowLeft, ArrowRight, Camera, CheckCircle } from "lucide-react";
import { LoadingCard } from "@/components/ui/LoadingStates";
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

export default function UploadPage() {
  const router = useRouter();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (image: UploadedImage) => {
    setUploadedImage(image);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleContinue = async () => {
    if (uploadedImage) {
      setIsProcessing(true);
      try {
        // Convert file to base64 for storage
        const imageBase64 = await convertFileToBase64(uploadedImage.file);
        
        // Create a serializable image object
        const serializableImage = {
          id: uploadedImage.id,
          preview: uploadedImage.preview,
          size: uploadedImage.size,
          type: uploadedImage.type,
          dimensions: uploadedImage.dimensions,
          uploadedAt: uploadedImage.uploadedAt.toISOString(),
          base64Data: imageBase64,
        };
        
        // Store the serializable image in session storage
        sessionStorage.setItem("uploadedImage", JSON.stringify(serializableImage));
        router.push("/customize");
      } catch {
        setError("Failed to process image. Please try again.");
        setIsProcessing(false);
      }
    }
  };

  if (isProcessing) {
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
              title="Processing Your Image"
              description="Please wait while we prepare your photo for customization..."
              showSkeleton={true}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">Portrait Banana</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                  1
                </div>
                <span className="text-blue-600 font-medium text-sm sm:text-base">Upload</span>
              </div>
              <div className="w-8 sm:w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                  2
                </div>
                <span className="text-gray-500 text-sm sm:text-base">Customize</span>
              </div>
              <div className="w-8 sm:w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                  3
                </div>
                <span className="text-gray-500 text-sm sm:text-base">Preview</span>
              </div>
              <div className="w-8 sm:w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                  4
                </div>
                <span className="text-gray-500 text-sm sm:text-base">Download</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Upload Your Photo
                </h1>
                <p className="text-sm sm:text-lg text-gray-600 mb-6">
                  Choose a clear photo of yourself. Any casual photo works - we&apos;ll transform it into a professional portrait.
                </p>
              </div>

              <PhotoUpload
                onUpload={handleUpload}
                onError={handleError}
                disabled={false}
              />

              {uploadedImage && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Ready to continue!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Your image has been uploaded successfully. Click continue to customize your portrait.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tips Section */}
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Camera className="w-5 h-5" />
                    <span>Photo Tips</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    For the best results, follow these guidelines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Good Lighting</h4>
                      <p className="text-sm text-gray-600">
                        Use natural light or well-lit indoor lighting. Avoid harsh shadows on your face.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Clear Face</h4>
                      <p className="text-sm text-gray-600">
                        Make sure your face is clearly visible and not obscured by hair, glasses, or shadows.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Good Resolution</h4>
                      <p className="text-sm text-gray-600">
                        Higher resolution photos produce better results. Minimum 512x512 pixels.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Single Person</h4>
                      <p className="text-sm text-gray-600">
                        Photos with just you work best. Avoid group photos or multiple people.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What Happens Next?</CardTitle>
                  <CardDescription>
                    Here&apos;s what we&apos;ll do with your photo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">Step 1</Badge>
                    <span className="text-sm text-gray-600">Upload and validate your image</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">Step 2</Badge>
                    <span className="text-sm text-gray-600">Choose your style and background</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">Step 3</Badge>
                    <span className="text-sm text-gray-600">Generate your professional portrait</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">Step 4</Badge>
                    <span className="text-sm text-gray-600">Preview and download your result</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Continue Button */}
          {uploadedImage && (
            <div className="flex justify-center mt-6 sm:mt-8 px-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto" 
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
                    Continue to Customize
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
