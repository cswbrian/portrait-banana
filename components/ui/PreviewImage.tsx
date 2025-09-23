"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

interface PreviewImageProps {
  imageUrl: string;
  watermarked: boolean;
  onDownload?: () => void;
  onRetry?: () => void;
  loading?: boolean;
  error?: string;
  generationId?: string;
}

export function PreviewImage({
  imageUrl,
  watermarked,
  onDownload,
  onRetry,
  loading = false,
  error,
  generationId,
}: PreviewImageProps) {
  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Spinner size="sm" className="text-blue-600" />
            Generating Your Portrait
          </CardTitle>
          <CardDescription>
            Our AI is working on transforming your photo into a professional portrait...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Spinner size="lg" className="text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">This may take 2-3 minutes</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Processing your image...</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>Applying your customizations...</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span>Adding professional touches...</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Generation Failed
          </CardTitle>
          <CardDescription>
            We encountered an issue while generating your portrait
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Your Professional Portrait
            </CardTitle>
            <CardDescription>
              {watermarked ? "Preview with watermark - pay to download the full version" : "Ready for download"}
            </CardDescription>
          </div>
          {watermarked && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Preview
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Image Display */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={imageUrl}
                alt="Generated professional portrait"
                className="w-full h-full object-cover"
              />
            </div>
            
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {watermarked ? (
              <Button size="lg" className="flex-1" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Pay & Download Full Version
              </Button>
            ) : (
              <Button size="lg" className="flex-1" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download Now
              </Button>
            )}
            
            {onRetry && (
              <Button size="lg" variant="outline" onClick={onRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Again
              </Button>
            )}
          </div>

          {/* Generation Info */}
          {generationId && (
            <div className="text-center text-sm text-gray-500">
              Generation ID: {generationId}
            </div>
          )}

          {/* Watermark Notice */}
          {watermarked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Preview Only</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This preview has a watermark embedded in the image. To download the full-resolution, watermark-free version, 
                    please complete your payment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
