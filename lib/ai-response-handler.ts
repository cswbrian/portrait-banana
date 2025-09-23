import { GenerationResponse } from './ai-service';
import { AIGenerationMetrics } from './ai-utils';

/**
 * AI Response Handler
 * Processes and validates responses from AI services
 */

export interface ProcessedResponse {
  success: boolean;
  imageData?: string;
  imageUrl?: string;
  metadata?: ResponseMetadata;
  error?: string;
  warnings?: string[];
}

export interface ResponseMetadata {
  model: string;
  generationTime: number;
  cost: number;
  size: 'preview' | 'full';
  quality: 'high' | 'medium' | 'low';
  dimensions?: {
    width: number;
    height: number;
  };
  format: string;
  timestamp: number;
}

export interface ValidationOptions {
  minWidth?: number;
  minHeight?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  qualityThreshold?: number;
}

export class AIResponseHandler {
  private static readonly DEFAULT_VALIDATION: ValidationOptions = {
    minWidth: 512,
    minHeight: 512,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    qualityThreshold: 0.8,
  };

  /**
   * Process AI service response
   */
  static async processResponse(
    response: GenerationResponse,
    metrics: AIGenerationMetrics,
    validationOptions: Partial<ValidationOptions> = {}
  ): Promise<ProcessedResponse> {
    const options = { ...this.DEFAULT_VALIDATION, ...validationOptions };
    const warnings: string[] = [];

    try {
      if (!response.success || !response.imageData) {
        return {
          success: false,
          error: response.error || 'No image data received',
        };
      }

      // Validate image data
      const validation = await this.validateImageData(response.imageData, options);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Image validation failed: ${validation.errors.join(', ')}`,
        };
      }

      warnings.push(...validation.warnings);

      // Extract metadata
      const metadata = this.extractMetadata(response, metrics, validation);

      // Determine quality level
      const quality = this.assessQuality(metadata, options);

      return {
        success: true,
        imageData: response.imageData,
        metadata: {
          ...metadata,
          quality,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
      };

    } catch (error) {
      console.error('Error processing AI response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process response',
      };
    }
  }

  /**
   * Validate image data from AI response
   */
  private static async validateImageData(
    imageData: string,
    options: ValidationOptions
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[]; dimensions?: { width: number; height: number } }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if it's valid base64
      if (!this.isValidBase64(imageData)) {
        errors.push('Invalid base64 image data');
        return { isValid: false, errors, warnings };
      }

      // Convert to blob and validate
      const blob = this.base64ToBlob(imageData);
      
      // Check file size
      if (blob.size > (options.maxFileSize || 10 * 1024 * 1024)) {
        errors.push(`Image too large: ${Math.round(blob.size / 1024 / 1024)}MB`);
      }

      // Check format
      if (options.allowedFormats && !options.allowedFormats.includes(blob.type)) {
        errors.push(`Unsupported format: ${blob.type}`);
      }

      // Get dimensions
      const dimensions = await this.getImageDimensions(blob);
      if (dimensions) {
        // Check minimum dimensions
        if (options.minWidth && dimensions.width < options.minWidth) {
          errors.push(`Width too small: ${dimensions.width}px (minimum: ${options.minWidth}px)`);
        }

        if (options.minHeight && dimensions.height < options.minHeight) {
          errors.push(`Height too small: ${dimensions.height}px (minimum: ${options.minHeight}px)`);
        }

        // Check aspect ratio
        const aspectRatio = dimensions.width / dimensions.height;
        if (aspectRatio < 0.5 || aspectRatio > 2.0) {
          warnings.push('Unusual aspect ratio may affect display quality');
        }

        // Check if image is square (preferred for portraits)
        if (Math.abs(aspectRatio - 1) > 0.1) {
          warnings.push('Non-square image may not be optimal for portrait use');
        }
      } else {
        warnings.push('Could not determine image dimensions');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        dimensions: dimensions || undefined,
      };

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Extract metadata from response and metrics
   */
  private static extractMetadata(
    response: GenerationResponse,
    metrics: AIGenerationMetrics,
    validation: { dimensions?: { width: number; height: number } }
  ): Omit<ResponseMetadata, 'quality'> {
    return {
      model: metrics.model,
      generationTime: metrics.duration,
      cost: metrics.cost,
      size: metrics.size,
      dimensions: validation.dimensions,
      format: 'image/jpeg', // Default format
      timestamp: Date.now(),
    };
  }

  /**
   * Assess image quality based on various factors
   */
  private static assessQuality(
    metadata: Omit<ResponseMetadata, 'quality'>,
    options: ValidationOptions
  ): 'high' | 'medium' | 'low' {
    let score = 0;

    // Dimension score
    if (metadata.dimensions) {
      const minDimension = Math.min(metadata.dimensions.width, metadata.dimensions.height);
      if (minDimension >= 2048) score += 3;
      else if (minDimension >= 1024) score += 2;
      else if (minDimension >= 512) score += 1;
    }

    // Generation time score (faster is better for user experience)
    if (metadata.generationTime < 5000) score += 2;
    else if (metadata.generationTime < 15000) score += 1;

    // Size score (full resolution is better)
    if (metadata.size === 'full') score += 2;
    else if (metadata.size === 'preview') score += 1;

    // Determine quality level
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Check if string is valid base64
   */
  private static isValidBase64(str: string): boolean {
    try {
      // Use Buffer for Node.js environment
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'base64').toString('base64') === str;
      }
      // Fallback for browser environment
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }

  /**
   * Convert base64 to blob (Node.js compatible)
   */
  private static base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
    // Use Buffer for Node.js environment
    if (typeof Buffer !== 'undefined') {
      const buffer = Buffer.from(base64, 'base64');
      return new Blob([buffer], { type: mimeType });
    }
    
    // Fallback for browser environment
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Get image dimensions from blob (Node.js compatible)
   */
  private static async getImageDimensions(blob: Blob): Promise<{ width: number; height: number } | null> {
    try {
      // For server-side, we'll use a simplified approach
      // In a real implementation, you might want to use a library like 'sharp' or 'jimp'
      // For now, we'll return null to avoid the browser API dependency
      if (typeof window === 'undefined') {
        // Server-side: return null for now (dimensions not critical for basic functionality)
        return null;
      }
      
      // Browser-side fallback
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
          });
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.warn('Could not determine image dimensions:', error);
      return null;
    }
  }

  /**
   * Create download URL for processed image (Node.js compatible)
   */
  static createDownloadUrl(imageData: string, filename: string = 'portrait.jpg'): string {
    // For server-side, return a data URL instead of blob URL
    if (typeof window === 'undefined') {
      return `data:image/jpeg;base64,${imageData}`;
    }
    
    // Browser-side: use blob URL
    const blob = this.base64ToBlob(imageData);
    return URL.createObjectURL(blob);
  }

  /**
   * Format response for user display
   */
  static formatResponseForDisplay(processed: ProcessedResponse): {
    message: string;
    type: 'success' | 'warning' | 'error';
    details?: string[];
  } {
    if (!processed.success) {
      return {
        message: processed.error || 'Generation failed',
        type: 'error',
      };
    }

    if (processed.warnings && processed.warnings.length > 0) {
      return {
        message: 'Portrait generated successfully with some warnings',
        type: 'warning',
        details: processed.warnings,
      };
    }

    return {
      message: 'Portrait generated successfully!',
      type: 'success',
      details: processed.metadata ? [
        `Size: ${processed.metadata.dimensions?.width}x${processed.metadata.dimensions?.height}`,
        `Quality: ${processed.metadata.quality}`,
        `Generation time: ${Math.round(processed.metadata.generationTime / 1000)}s`,
      ] : undefined,
    };
  }

  /**
   * Clean up resources (Node.js compatible)
   */
  static cleanup(url: string): void {
    try {
      // Only revoke blob URLs in browser environment
      if (typeof window !== 'undefined' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      // Data URLs don't need cleanup
    } catch (error) {
      console.warn('Failed to cleanup URL:', error);
    }
  }
}

export default AIResponseHandler;
