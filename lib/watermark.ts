/**
 * Watermarking Utilities
 * Handles adding watermarks to generated images
 */

import sharp from 'sharp';

export interface WatermarkOptions {
  text: string;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  position: 'bottom-right' | 'bottom-center' | 'center' | 'top-right';
  padding: number;
  pattern?: boolean;
}

export interface WatermarkResult {
  success: boolean;
  imageData?: string;
  error?: string;
}

export class WatermarkService {
  private static readonly DEFAULT_OPTIONS: WatermarkOptions = {
    text: 'PREVIEW - Portrait Banana',
    opacity: 0.7,
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    color: 'rgba(0, 0, 0, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    position: 'bottom-center',
    padding: 20,
    pattern: true,
  };

  /**
   * Add watermark to base64 image data
   * Always uses server-side watermarking for security
   */
  static async addWatermark(
    imageData: string,
    options: Partial<WatermarkOptions> = {}
  ): Promise<WatermarkResult> {
    try {
      const opts = { ...this.DEFAULT_OPTIONS, ...options };
      
      // Always use server-side watermarking for security
      return this.addWatermarkServer(imageData, opts);

    } catch (error) {
      console.error('Watermarking error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Watermarking failed',
      };
    }
  }

  /**
   * Server-side watermarking implementation using Sharp
   */
  private static async addWatermarkServer(
    imageData: string,
    options: WatermarkOptions
  ): Promise<WatermarkResult> {
    try {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      const { width = 512, height = 512 } = metadata;

      // Create watermark text SVG
      const watermarkSvg = this.createWatermarkSvg(options, width, height);

      // Apply watermark using Sharp
      const watermarkPos = this.calculateServerPosition(width, options.position, options.fontSize);
      const watermarkedBuffer = await sharp(imageBuffer)
        .composite([
          {
            input: Buffer.from(watermarkSvg),
            top: watermarkPos.y,
            left: watermarkPos.x,
          }
        ])
        .png()
        .toBuffer();

      // Convert back to base64
      const watermarkedBase64 = watermarkedBuffer.toString('base64');
      const dataUrl = `data:image/png;base64,${watermarkedBase64}`;

      return {
        success: true,
        imageData: dataUrl,
      };

    } catch (error) {
      console.error('Server watermarking error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Server watermarking failed',
      };
    }
  }

  /**
   * Create SVG watermark for server-side processing
   */
  private static createWatermarkSvg(options: WatermarkOptions, imageWidth: number, imageHeight: number): string {
    const { text, fontSize, color, backgroundColor, opacity, position } = options;
    
    // Calculate text dimensions (approximate)
    const textWidth = text.length * fontSize * 0.6;
    const textHeight = fontSize * 1.2;
    
    // Calculate position
    const pos = this.calculateServerPosition(imageWidth, position, fontSize);
    
    const svg = `
      <svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
        ${backgroundColor ? `
          <rect x="${pos.x - textWidth/2 - 10}" y="${pos.y - textHeight/2 - 5}" 
                width="${textWidth + 20}" height="${textHeight + 10}" 
                fill="${backgroundColor}" opacity="${opacity}" rx="5"/>
        ` : ''}
        <text x="${pos.x}" y="${pos.y}" 
              text-anchor="middle" dominant-baseline="middle"
              font-family="Arial, sans-serif" 
              font-size="${fontSize}" 
              font-weight="bold"
              fill="${color}" 
              opacity="${opacity}">
          ${text}
        </text>
      </svg>
    `;
    
    return svg;
  }

  /**
   * Calculate watermark position for server-side processing
   */
  private static calculateServerPosition(imageSize: number, position: WatermarkOptions['position'], fontSize: number): { x: number; y: number } {
    const padding = 20;
    const textHeight = fontSize * 1.2;
    
    switch (position) {
      case 'bottom-center':
        return { x: imageSize / 2, y: imageSize - padding - textHeight / 2 };
      case 'bottom-right':
        return { x: imageSize - padding, y: imageSize - padding - textHeight / 2 };
      case 'top-right':
        return { x: imageSize - padding, y: padding + textHeight / 2 };
      case 'center':
        return { x: imageSize / 2, y: imageSize / 2 };
      default:
        return { x: imageSize / 2, y: imageSize - padding - textHeight / 2 };
    }
  }


  /**
   * Create preview watermark (for 512x512 images)
   * Always applies watermark regardless of environment
   */
  static async addPreviewWatermark(imageData: string): Promise<WatermarkResult> {
    // Force server-side watermarking for previews to ensure security
    return this.addWatermarkServer(imageData, {
      text: 'PREVIEW - Portrait Banana',
      fontSize: 20,
      fontFamily: 'Arial, sans-serif',
      position: 'bottom-center',
      opacity: 0.8,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: 'rgba(0, 0, 0, 0.8)',
      padding: 20,
      pattern: true,
    });
  }

  /**
   * Create subtle watermark (for full images)
   */
  static async addSubtleWatermark(imageData: string): Promise<WatermarkResult> {
    return this.addWatermark(imageData, {
      text: 'Portrait Banana',
      fontSize: 16,
      position: 'bottom-right',
      opacity: 0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      color: 'rgba(0, 0, 0, 0.6)',
      pattern: false,
    });
  }

  /**
   * Validate watermark options
   */
  static validateOptions(options: Partial<WatermarkOptions>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.text && options.text.length > 100) {
      errors.push('Watermark text too long (max 100 characters)');
    }

    if (options.opacity && (options.opacity < 0 || options.opacity > 1)) {
      errors.push('Opacity must be between 0 and 1');
    }

    if (options.fontSize && (options.fontSize < 8 || options.fontSize > 72)) {
      errors.push('Font size must be between 8 and 72');
    }

    if (options.padding && options.padding < 0) {
      errors.push('Padding must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default WatermarkService;
