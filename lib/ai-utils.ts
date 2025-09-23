import { UploadedImage, CustomizationOptions } from '@/types';
import { GENERATION_CONFIG } from './constants';

/**
 * AI Service Integration Utilities
 * Provides helper functions for AI service operations
 */

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
}

export interface ImageProcessingOptions {
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
  maxSize: number;
  compressionLevel: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AIGenerationMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  tokensUsed?: number;
  cost: number;
  model: string;
  size: 'preview' | 'full';
}

/**
 * Prompt Engineering Utilities
 */
export class PromptUtils {
  private static readonly PROMPT_TEMPLATES: PromptTemplate[] = [
    {
      id: 'professional',
      name: 'Professional Portrait',
      description: 'Clean, business-ready professional portrait',
      template: `Transform this photo into a high-quality professional portrait.

Requirements:
- {style_description}
- Background: {background_description}
- High resolution, sharp details, professional lighting
- Maintain the person's facial features and identity
- Remove any distracting elements from the original background
- Ensure the portrait looks natural and professional
- Use professional color grading and retouching
- The final image should be suitable for business cards, LinkedIn profiles, and professional use

Style: {style}
Background: {background}

Generate a professional portrait that maintains the person's likeness while creating a polished, business-ready image.`,
      variables: ['style', 'background', 'style_description', 'background_description'],
    },
    {
      id: 'executive',
      name: 'Executive Portrait',
      description: 'High-level executive portrait with authority',
      template: `Create an executive-level professional portrait from this photo.

Requirements:
- {style_description}
- Background: {background_description}
- Convey authority, confidence, and leadership
- High-end professional styling
- Sharp, detailed image with executive presence
- Maintain facial features while enhancing professional appearance
- Remove background distractions
- Use sophisticated color grading

Style: {style}
Background: {background}

Generate an executive portrait that projects authority and professionalism.`,
      variables: ['style', 'background', 'style_description', 'background_description'],
    },
    {
      id: 'creative',
      name: 'Creative Professional',
      description: 'Modern, creative professional portrait',
      template: `Transform this into a creative professional portrait.

Requirements:
- {style_description}
- Background: {background_description}
- Modern, innovative professional styling
- Creative but appropriate for business use
- Maintain personality while ensuring professionalism
- High-quality, detailed image
- Contemporary color grading and lighting

Style: {style}
Background: {background}

Generate a creative professional portrait that balances innovation with business appropriateness.`,
      variables: ['style', 'background', 'style_description', 'background_description'],
    },
  ];

  /**
   * Get available prompt templates
   */
  static getPromptTemplates(): PromptTemplate[] {
    return [...this.PROMPT_TEMPLATES];
  }

  /**
   * Get a specific prompt template by ID
   */
  static getPromptTemplate(id: string): PromptTemplate | null {
    return this.PROMPT_TEMPLATES.find(template => template.id === id) || null;
  }

  /**
   * Build a prompt using template and options
   */
  static buildPrompt(
    templateId: string,
    options: CustomizationOptions,
    customPrompt?: string
  ): string {
    if (customPrompt) {
      return customPrompt;
    }

    const template = this.getPromptTemplate(templateId);
    if (!template) {
      throw new Error(`Prompt template '${templateId}' not found`);
    }

    const variables = this.getPromptVariables(options);
    return this.interpolateTemplate(template.template, variables);
  }

  /**
   * Get prompt variables from customization options
   */
  private static getPromptVariables(options: CustomizationOptions): Record<string, string> {
    const styleDescriptions = {
      professional: 'professional business attire, confident expression, clean and polished look',
      casual: 'smart casual attire, approachable expression, modern and friendly',
      executive: 'executive-level professional attire, authoritative presence, sophisticated styling',
      creative: 'creative professional attire, artistic expression, innovative and dynamic',
    };

    const backgroundDescriptions = {
      office: 'professional office setting with modern furniture and clean lighting',
      studio: 'clean, minimalist studio background with soft lighting',
      outdoor: 'outdoor professional setting with natural lighting',
      conference: 'conference room with modern corporate environment',
    };

    return {
      style: options.style || 'professional',
      background: options.background || 'office',
      style_description: styleDescriptions[options.style || 'professional'],
      background_description: backgroundDescriptions[options.background || 'office'],
    };
  }

  /**
   * Interpolate template with variables
   */
  private static interpolateTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Validate prompt content for safety and appropriateness
   */
  static validatePrompt(prompt: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for inappropriate content
    const inappropriateKeywords = [
      'nude', 'naked', 'sexual', 'explicit', 'inappropriate',
      'violence', 'weapon', 'drug', 'illegal'
    ];

    const lowerPrompt = prompt.toLowerCase();
    for (const keyword of inappropriateKeywords) {
      if (lowerPrompt.includes(keyword)) {
        errors.push(`Inappropriate keyword detected: ${keyword}`);
      }
    }

    // Check prompt length
    if (prompt.length > 2000) {
      warnings.push('Prompt is very long, may affect generation quality');
    }

    if (prompt.length < 50) {
      warnings.push('Prompt is very short, may not provide enough detail');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Image Processing Utilities for AI Service
 */
export class ImageUtils {
  /**
   * Convert File to base64 with compression
   */
  static async convertToBase64(
    file: File,
    options: Partial<ImageProcessingOptions> = {}
  ): Promise<string> {
    const defaultOptions: ImageProcessingOptions = {
      quality: 0.9,
      format: 'jpeg',
      maxSize: 2048,
      compressionLevel: 6,
    };

    const opts = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          opts.maxSize
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(`image/${opts.format}`, opts.quality);
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions for image processing
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxSize: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    if (originalWidth > originalHeight) {
      return {
        width: Math.min(originalWidth, maxSize),
        height: Math.min(originalHeight, maxSize / aspectRatio),
      };
    } else {
      return {
        width: Math.min(originalWidth, maxSize * aspectRatio),
        height: Math.min(originalHeight, maxSize),
      };
    }
  }

  /**
   * Validate image for AI processing
   */
  static validateImageForAI(image: UploadedImage): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check dimensions
    if (image.dimensions.width < GENERATION_CONFIG.PREVIEW_SIZE) {
      errors.push(`Image width must be at least ${GENERATION_CONFIG.PREVIEW_SIZE}px`);
    }

    if (image.dimensions.height < GENERATION_CONFIG.PREVIEW_SIZE) {
      errors.push(`Image height must be at least ${GENERATION_CONFIG.PREVIEW_SIZE}px`);
    }

    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      errors.push(`Image size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check aspect ratio
    const aspectRatio = image.dimensions.width / image.dimensions.height;
    if (aspectRatio < 0.5 || aspectRatio > 2.0) {
      warnings.push('Extreme aspect ratio may affect generation quality');
    }

    // Check if image is too small for full resolution
    if (image.dimensions.width < GENERATION_CONFIG.FULL_SIZE || 
        image.dimensions.height < GENERATION_CONFIG.FULL_SIZE) {
      warnings.push('Image resolution may be insufficient for full-size generation');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get optimal generation size based on input image
   */
  static getOptimalGenerationSize(image: UploadedImage): 'preview' | 'full' {
    const minDimension = Math.min(image.dimensions.width, image.dimensions.height);
    return minDimension >= GENERATION_CONFIG.FULL_SIZE ? 'full' : 'preview';
  }
}

/**
 * Validation Utilities for AI Requests
 */
export class ValidationUtils {
  /**
   * Validate AI generation request
   */
  static validateGenerationRequest(
    image: UploadedImage,
    options: CustomizationOptions,
    size: 'preview' | 'full'
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate image
    const imageValidation = ImageUtils.validateImageForAI(image);
    errors.push(...imageValidation.errors);
    warnings.push(...imageValidation.warnings);

    // Validate options
    if (!options.background) {
      warnings.push('No background specified, using default');
    }

    if (!options.style) {
      warnings.push('No style specified, using default');
    }

    // Validate size
    if (size === 'full') {
      const minDimension = Math.min(image.dimensions.width, image.dimensions.height);
      if (minDimension < GENERATION_CONFIG.FULL_SIZE) {
        warnings.push('Image may not be suitable for full-resolution generation');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate API configuration
   */
  static validateAIConfig(config: { apiKey?: string; model?: string; baseUrl?: string; maxRetries?: number }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.apiKey) {
      errors.push('API key is required');
    }

    if (!config.model) {
      errors.push('Model is required');
    }

    if (!config.baseUrl) {
      errors.push('Base URL is required');
    }

    if (config.maxRetries !== undefined && config.maxRetries < 0) {
      warnings.push('Max retries should be at least 0 (0 disables retries for cost savings)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Error Handling Utilities
 */
export class ErrorUtils {
  /**
   * Parse AI service errors
   */
  static parseAIError(error: Error | { message?: string; code?: string }): { code: string; message: string; retryable: boolean } {
    if (error.message?.includes('API key')) {
      return {
        code: 'INVALID_API_KEY',
        message: 'Invalid or missing API key',
        retryable: false,
      };
    }

    if (error.message?.includes('quota')) {
      return {
        code: 'QUOTA_EXCEEDED',
        message: 'API quota exceeded',
        retryable: true,
      };
    }

    if (error.message?.includes('timeout')) {
      return {
        code: 'TIMEOUT',
        message: 'Request timed out',
        retryable: true,
      };
    }

    if (error.message?.includes('rate limit')) {
      return {
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded',
        retryable: true,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      retryable: true,
    };
  }

  /**
   * Determine if error is retryable
   */
  static isRetryableError(error: Error | { message?: string; code?: string }): boolean {
    const parsed = this.parseAIError(error);
    return parsed.retryable;
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: Error | { message?: string; code?: string }): string {
    const parsed = this.parseAIError(error);

    const userMessages: Record<string, string> = {
      INVALID_API_KEY: 'There was a problem with the AI service configuration. Please try again later.',
      QUOTA_EXCEEDED: 'The AI service is temporarily unavailable. Please try again in a few minutes.',
      TIMEOUT: 'The request took too long to process. Please try again.',
      RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
      UNKNOWN_ERROR: 'Something went wrong while generating your portrait. Please try again.',
    };

    return userMessages[parsed.code] || userMessages.UNKNOWN_ERROR;
  }
}

/**
 * Metrics and Analytics Utilities
 */
export class MetricsUtils {
  /**
   * Create generation metrics
   */
  static createMetrics(
    startTime: number,
    endTime: number,
    model: string,
    size: 'preview' | 'full'
  ): AIGenerationMetrics {
    const duration = endTime - startTime;
    const cost = size === 'preview' 
      ? GENERATION_CONFIG.PREVIEW_COST 
      : GENERATION_CONFIG.FULL_COST;

    return {
      startTime,
      endTime,
      duration,
      cost,
      model,
      size,
    };
  }

  /**
   * Log generation metrics
   */
  static logMetrics(metrics: AIGenerationMetrics): void {
    console.log('AI Generation Metrics:', {
      duration: `${metrics.duration}ms`,
      cost: `$${metrics.cost}`,
      model: metrics.model,
      size: metrics.size,
    });
  }

  /**
   * Calculate cost for multiple generations
   */
  static calculateTotalCost(generations: AIGenerationMetrics[]): number {
    return generations.reduce((total, gen) => total + gen.cost, 0);
  }
}

