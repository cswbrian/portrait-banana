"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { UploadedImage } from "@/types";
import { UPLOAD_CONFIG } from "@/lib/constants";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
// Using regular img tag for blob URLs

interface PhotoUploadProps {
  onUpload: (image: UploadedImage) => void;
  onError: (error: string) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export function PhotoUpload({
  onUpload,
  onError,
  maxSize = UPLOAD_CONFIG.MAX_SIZE,
  acceptedTypes = [...UPLOAD_CONFIG.ACCEPTED_TYPES],
  disabled = false,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setUploading(true);

      try {
        // Validate file size
        if (file.size > maxSize) {
          throw new Error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        }

        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
          throw new Error(`File type must be one of: ${acceptedTypes.join(", ")}`);
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file);

        // Get image dimensions
        const dimensions = await getImageDimensions(file);

        // Validate dimensions
        if (dimensions.width < UPLOAD_CONFIG.MIN_DIMENSIONS || 
            dimensions.height < UPLOAD_CONFIG.MIN_DIMENSIONS) {
          throw new Error(`Image must be at least ${UPLOAD_CONFIG.MIN_DIMENSIONS}x${UPLOAD_CONFIG.MIN_DIMENSIONS} pixels`);
        }

        const uploadedImage: UploadedImage = {
          id: crypto.randomUUID(),
          file,
          preview: previewUrl,
          size: file.size,
          type: file.type,
          dimensions,
          uploadedAt: new Date(),
        };

        setPreview(previewUrl);
        onUpload(uploadedImage);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    [maxSize, acceptedTypes, onUpload, onError]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: disabled || uploading,
  });

  const clearImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-4 sm:p-8">
          {!preview ? (
            <div
              {...getRootProps()}
              className={`
                flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive && !isDragReject ? "bg-blue-50 border-blue-300" : ""}
                ${isDragReject ? "bg-red-50 border-red-300" : ""}
                ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <input {...getInputProps()} />
              
              {uploading ? (
                <div className="flex flex-col items-center space-y-4">
                  <Spinner size="lg" className="text-blue-600" />
                  <p className="text-gray-600">Processing your image...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {isDragActive
                      ? isDragReject
                        ? "File type not supported"
                        : "Drop your photo here"
                      : "Upload your photo"}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Drag and drop your image here, or click to select
                  </p>
                  
                  <Button type="button" variant="outline" size="sm" className="sm:size-default" disabled={disabled || uploading}>
                    Choose File
                  </Button>
                  
                  <div className="mt-4 text-xs sm:text-sm text-gray-500">
                    <p>Supports: JPG, PNG, WebP</p>
                    <p>Max size: {Math.round(maxSize / 1024 / 1024)}MB</p>
                    <p>Min resolution: {UPLOAD_CONFIG.MIN_DIMENSIONS}x{UPLOAD_CONFIG.MIN_DIMENSIONS}px</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-square max-w-xs sm:max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100 relative">
                  <Image
                    src={preview}
                    alt="Uploaded image preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Image uploaded successfully!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Helper function to get image dimensions
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(file);
  });
}
