"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, Share2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface DownloadPageProps {
  searchParams: {
    payment_intent?: string;
    session_id?: string;
  };
}

export default function DownloadPage({ searchParams }: DownloadPageProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Simulate fetching download URL based on payment intent
    const fetchDownloadUrl = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would:
        // 1. Verify the payment intent with Stripe
        // 2. Generate the full-resolution image
        // 3. Return the download URL
        
        // For now, simulate a successful payment and generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock download URL - in production this would be a real image URL
        setDownloadUrl("https://via.placeholder.com/2048x2048/3b82f6/ffffff?text=Your+Professional+Portrait");
        
      } catch (err) {
        setError("Failed to generate your portrait. Please contact support.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDownloadUrl();
  }, []);

  const handleDownload = async () => {
    if (!downloadUrl) return;
    
    setIsDownloading(true);
    setDownloadCount(prev => prev + 1);
    
    try {
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `professional-portrait-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && downloadUrl) {
      try {
        await navigator.share({
          title: "My Professional Portrait",
          text: "Check out my AI-generated professional portrait!",
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900">Generating Your Portrait</h2>
              <p className="text-gray-600 text-center">
                Please wait while we create your professional portrait...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6 space-y-4">
              <Button asChild className="w-full">
                <Link href="/">Try Again</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">Portrait Banana</span>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Create Another</Link>
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-600">
              Your professional portrait is ready for download
            </p>
          </div>

          {/* Portrait Preview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Your Professional Portrait
              </CardTitle>
              <CardDescription>
                High-resolution 2048x2048 image ready for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100">
                {downloadUrl && (
                  <Image
                    src={downloadUrl}
                    alt="Your professional portrait"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                  <Badge variant="secondary" className="opacity-0 hover:opacity-100 transition-opacity">
                    Click to download
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button
              size="lg"
              onClick={handleDownload}
              disabled={isDownloading || !downloadUrl}
              className="w-full"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Portrait
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleShare}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Portrait
            </Button>
          </div>

          {/* Download Info */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Download Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Resolution:</span>
                  <span className="font-medium">2048 x 2048 pixels</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium">High-quality JPEG</span>
                </div>
                <div className="flex justify-between">
                  <span>Downloads remaining:</span>
                  <span className="font-medium">Unlimited</span>
                </div>
                <div className="flex justify-between">
                  <span>Times downloaded:</span>
                  <span className="font-medium">{downloadCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                Make the most of your professional portrait
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Update LinkedIn</h4>
                  <p className="text-sm text-gray-600">
                    Use your new portrait as your professional profile picture
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Resume & CV</h4>
                  <p className="text-sm text-gray-600">
                    Add to your resume and professional documents
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Share & Network</h4>
                  <p className="text-sm text-gray-600">
                    Use across all your professional platforms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">Create Another Portrait</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/contact">Get Support</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold">Portrait Banana</span>
          </div>
          <p className="text-gray-400 mb-4">
            Transform your photos into professional business portraits with AI
          </p>
          <p className="text-sm text-gray-500">
            © 2024 Portrait Banana. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
