// Application constants
export const APP_CONFIG = {
  NAME: 'AI Business Portrait Generator',
  DESCRIPTION: 'Transform your casual photos into professional business portraits using AI',
  VERSION: '1.0.0',
  AUTHOR: 'Portrait Banana',
} as const;

export const UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_DIMENSIONS: 512,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 1,
} as const;

export const GENERATION_CONFIG = {
  PREVIEW_SIZE: 512,
  FULL_SIZE: 2048,
  PREVIEW_COST: 0.039, // Actual Gemini API cost: 1,290 tokens × $30/1M tokens
  FULL_COST: 0.039,    // Same cost for both preview and full (token-based pricing)
  MAX_ATTEMPTS: 3,
  TIMEOUT_MS: 300000, // 5 minutes
} as const;

export const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS_PER_IP: 3,
  WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
  BLOCK_DURATION_MS: 60 * 60 * 1000, // 1 hour
} as const;

export const PRICING_CONFIG = {
  DOWNLOAD_PRICE: 799, // $7.99 in cents
  CURRENCY: 'usd',
  TAX_RATE: 0.0, // No tax for digital products
} as const;

export const SESSION_CONFIG = {
  EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 hours
  CLEANUP_INTERVAL_MS: 60 * 60 * 1000, // 1 hour
} as const;

export const AI_MODELS = {
  PREVIEW: 'gemini-2.5-flash-image-preview',
  FULL: 'gemini-2.5-flash-image-preview',
} as const;

export const CUSTOMIZATION_OPTIONS = {
  BACKGROUNDS: [
    { id: 'office', name: 'Office', description: 'Professional office setting' },
    { id: 'studio', name: 'Studio', description: 'Clean studio background' },
    { id: 'outdoor', name: 'Outdoor', description: 'Outdoor professional setting' },
    { id: 'conference', name: 'Conference', description: 'Conference room setting' },
  ],
  STYLES: [
    { id: 'professional', name: 'Professional', description: 'Professional business attire' },
    { id: 'casual', name: 'Casual', description: 'Smart casual attire' },
    { id: 'executive', name: 'Executive', description: 'Executive-level professional' },
    { id: 'creative', name: 'Creative', description: 'Creative professional' },
  ],
  INDUSTRIES: [
    { id: 'technology', name: 'Technology', description: 'Tech industry professional' },
    { id: 'finance', name: 'Finance', description: 'Financial services professional' },
    { id: 'healthcare', name: 'Healthcare', description: 'Healthcare professional' },
    { id: 'legal', name: 'Legal', description: 'Legal professional' },
    { id: 'education', name: 'Education', description: 'Educational professional' },
    { id: 'consulting', name: 'Consulting', description: 'Consulting professional' },
    { id: 'marketing', name: 'Marketing', description: 'Marketing professional' },
    { id: 'sales', name: 'Sales', description: 'Sales professional' },
    { id: 'general', name: 'General', description: 'General business professional' },
  ],
  MOODS: [
    { id: 'confident', name: 'Confident', description: 'Confident and authoritative' },
    { id: 'friendly', name: 'Friendly', description: 'Approachable and warm' },
    { id: 'authoritative', name: 'Authoritative', description: 'Commanding presence' },
    { id: 'approachable', name: 'Approachable', description: 'Welcoming and accessible' },
  ],
} as const;

export const ERROR_MESSAGES = {
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  INVALID_IMAGE: 'Invalid image format or size. Please use JPG, PNG, or WebP under 10MB.',
  GENERATION_FAILED: 'Failed to generate portrait. Please try again.',
  PAYMENT_FAILED: 'Payment failed. Please check your payment details.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please start over.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;

export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'Image uploaded successfully!',
  GENERATION_SUCCESS: 'Portrait generated successfully!',
  PAYMENT_SUCCESS: 'Payment successful! Your download is ready.',
  DOWNLOAD_READY: 'Your professional portrait is ready for download!',
} as const;
