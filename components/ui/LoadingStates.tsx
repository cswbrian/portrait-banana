"use client";

import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingCardProps {
  title?: string;
  description?: string;
  showSkeleton?: boolean;
  className?: string;
}

export function LoadingCard({ 
  title = "Loading...", 
  description = "Please wait while we process your request",
  showSkeleton = false,
  className = ""
}: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Spinner size="lg" className="text-blue-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm sm:text-base">{description}</p>
          </div>
          {showSkeleton && (
            <div className="w-full space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PageLoadingProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function PageLoading({ 
  message = "Loading page...", 
  showProgress = false,
  progress = 0 
}: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <Spinner size="lg" className="text-blue-600" />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
                {showProgress && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
                <p className="text-gray-600 text-sm">
                  {showProgress ? `${progress}% complete` : "Please wait..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function ButtonLoading({ 
  loading, 
  children, 
  loadingText = "Loading...",
  className = "",
  disabled = false,
  onClick
}: ButtonLoadingProps) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  className?: string;
}

export function ProgressSteps({ 
  currentStep, 
  totalSteps, 
  steps,
  className = ""
}: ProgressStepsProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% complete
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex items-center space-x-3 ${
              index < currentStep ? 'text-green-600' : 
              index === currentStep - 1 ? 'text-blue-600' : 
              'text-gray-400'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              index < currentStep ? 'bg-green-100' : 
              index === currentStep - 1 ? 'bg-blue-100' : 
              'bg-gray-100'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="text-sm">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className = "" }: SkeletonCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton 
              key={index} 
              className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ImageSkeletonProps {
  aspectRatio?: string;
  className?: string;
}

export function ImageSkeleton({ 
  aspectRatio = "aspect-square", 
  className = "" 
}: ImageSkeletonProps) {
  return (
    <div className={`${aspectRatio} ${className}`}>
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  );
}
