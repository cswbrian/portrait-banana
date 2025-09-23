// Core application types for AI Business Portrait Generator

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  size: number;
  type: string;
  dimensions: {
    width: number;
    height: number;
  };
  uploadedAt: Date;
  base64Data?: string; // Optional base64 data for server-side processing
}

export interface CustomizationOptions {
  background: 'office' | 'studio' | 'outdoor' | 'conference';
  style: 'professional' | 'casual' | 'executive' | 'creative';
  industry?: 'technology' | 'finance' | 'healthcare' | 'legal' | 'education' | 'consulting' | 'marketing' | 'sales' | 'general';
  mood?: 'confident' | 'friendly' | 'authoritative' | 'approachable';
  additionalRequirements?: string[];
}

export interface GenerationRequest {
  imageId: string;
  customization: CustomizationOptions;
  isPreview: boolean;
  sessionId: string;
}

export interface GenerationResponse {
  id: string;
  imageUrl: string;
  isPreview: boolean;
  watermarked: boolean;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  expiresAt?: Date;
  metadata?: {
    generationTime: number;
    cost: number;
    dimensions: { width: number; height: number };
    quality: 'high' | 'medium' | 'low';
    watermarked: boolean;
  };
}

export interface PaymentRequest {
  generationId: string;
  amount: number;
  currency: string;
  sessionId: string;
}

export interface PaymentResponse {
  id: string;
  status: 'succeeded' | 'failed' | 'pending';
  clientSecret?: string;
  downloadUrl?: string;
  expiresAt?: Date;
}

export interface SessionData {
  id: string;
  uploadedImage?: UploadedImage;
  customization?: CustomizationOptions;
  previewGeneration?: GenerationResponse;
  payment?: PaymentResponse;
  createdAt: Date;
  expiresAt: Date;
}

export interface RateLimitData {
  ip: string;
  count: number;
  resetTime: Date;
  blocked: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

// AI Service types
export interface AIGenerationConfig {
  model: string;
  prompt: string;
  imageUrl: string;
  width: number;
  height: number;
  quality: 'standard' | 'premium';
}

export interface AIGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  cost?: number;
  processingTime?: number;
}

// Stripe types
export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

// Environment variables
export interface EnvConfig {
  GEMINI_API_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  NEXT_PUBLIC_APP_URL: string;
  UPLOAD_MAX_SIZE: number;
  RATE_LIMIT_MAX_ATTEMPTS: number;
  RATE_LIMIT_WINDOW_MS: number;
}

// UI Component props
export interface PhotoUploadProps {
  onUpload: (image: UploadedImage) => void;
  onError: (error: string) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export interface CustomizationOptionsProps {
  options: CustomizationOptions;
  onChange: (options: CustomizationOptions) => void;
  disabled?: boolean;
}

export interface PreviewImageProps {
  imageUrl: string;
  watermarked: boolean;
  onDownload?: () => void;
  onRetry?: () => void;
  loading?: boolean;
}

export interface PaymentFormProps {
  amount: number;
  onSuccess: (payment: PaymentResponse) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// Constants
export const UPLOAD_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_DIMENSIONS: 512,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const GENERATION_CONSTRAINTS = {
  PREVIEW_SIZE: 512,
  FULL_SIZE: 2048,
  PREVIEW_COST: 0.039, // Actual Gemini API cost
  FULL_COST: 0.039,    // Same cost for both (token-based pricing)
  MAX_ATTEMPTS: 3,
} as const;

export const RATE_LIMITS = {
  MAX_ATTEMPTS_PER_IP: 3,
  WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
  BLOCK_DURATION_MS: 60 * 60 * 1000, // 1 hour
} as const;

export const PRICING = {
  DOWNLOAD_PRICE: 799, // $7.99 in cents
  CURRENCY: 'usd',
} as const;
