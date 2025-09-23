import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';
import { MetricsUtils } from '@/lib/ai-utils';
import { AIResponseHandler } from '@/lib/ai-response-handler';
import { PromptBuilder } from '@/lib/prompt-builder';
import { WatermarkService } from '@/lib/watermark';
import { RateLimitService } from '@/lib/rate-limit';
import { env } from '@/lib/env-validation';
import { GENERATION_CONFIG } from '@/lib/constants';
import { UploadedImage, CustomizationOptions } from '@/types';

/**
 * Preview Generation API Route
 * Generates 512x512 watermarked preview images using Gemini 2.5 Flash Image
 */

export interface PreviewGenerationRequest {
  image: {
    id: string;
    preview: string;
    size: number;
    type: string;
    dimensions: {
      width: number;
      height: number;
    };
    uploadedAt: string; // ISO string for serialization
    base64Data: string; // Pre-converted base64 data
  };
  options: CustomizationOptions;
  prompt?: string;
  useCase?: 'linkedin' | 'business-card' | 'website' | 'presentation' | 'general';
}

export interface PreviewGenerationResponse {
  success: boolean;
  previewUrl?: string;
  imageData?: string;
  metadata?: {
    generationTime: number;
    cost: number;
    dimensions: { width: number; height: number };
    quality: 'high' | 'medium' | 'low';
    watermarked: boolean;
  };
  error?: string;
  warnings?: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Log development mode status
    if (env.get('DEV_MODE_SKIP_AI')) {
      console.log('🚧 Development mode active: AI calls will be skipped');
    }
    
    // Check rate limiting
    const rateLimitResult = RateLimitService.checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
          resetTime: rateLimitResult.resetTime,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '0',
          },
        }
      );
    }

    // Parse request body
    const body: PreviewGenerationRequest = await request.json();
    const { image, options, prompt } = body;

    // Validate request
    if (!image || !options) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: image and options are required' 
        },
        { status: 400 }
      );
    }

    // Validate image data
    if (!image.base64Data || !image.id || !image.type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid image data: missing required fields' 
        },
        { status: 400 }
      );
    }

    // Validate options
    if (!options.background || !options.style) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid options: background and style are required' 
        },
        { status: 400 }
      );
    }


    // Build prompt using PromptBuilder
    const promptVariations = PromptBuilder.buildPrompt(options, {
      industry: options.industry,
      mood: options.mood,
      additionalRequirements: options.additionalRequirements,
    });

    // Use detailed prompt for better quality
    const finalPrompt = prompt || promptVariations.detailed;

    // Validate prompt
    const promptValidation = PromptBuilder.validateContext({
      style: options.style || 'professional',
      background: options.background || 'office',
      industry: options.industry || 'general',
    });

    if (!promptValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid prompt context: ${promptValidation.errors.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Convert the serialized image back to UploadedImage format for AI service
    const uploadedImage: UploadedImage = {
      id: image.id,
      file: new File([], 'image.jpg', { type: image.type }), // Dummy file - we'll use base64Data
      preview: image.preview,
      size: image.size,
      type: image.type,
      dimensions: image.dimensions,
      uploadedAt: new Date(image.uploadedAt),
      base64Data: image.base64Data,
    };

    // Generate portrait using AI service
    const generationResult = await aiService.generatePortrait({
      image: uploadedImage,
      options,
      size: 'preview',
      prompt: finalPrompt,
    });

    if (!generationResult.success || !generationResult.imageData) {
      return NextResponse.json(
        { 
          success: false, 
          error: generationResult.error || 'Failed to generate preview' 
        },
        { status: 500 }
      );
    }

    // Process and validate the generated image
    const metrics = MetricsUtils.createMetrics(
      startTime,
      Date.now(),
      env.getAIConfig().model,
      'preview'
    );

    const processedResponse = await AIResponseHandler.processResponse(
      generationResult,
      metrics,
      {
        minWidth: GENERATION_CONFIG.PREVIEW_SIZE,
        minHeight: GENERATION_CONFIG.PREVIEW_SIZE,
        maxFileSize: 5 * 1024 * 1024, // 5MB max for preview
        allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
      }
    );

    if (!processedResponse.success || !processedResponse.imageData) {
      return NextResponse.json(
        { 
          success: false, 
          error: processedResponse.error || 'Failed to process generated image' 
        },
        { status: 500 }
      );
    }

    // Add watermark to the preview
    const watermarkResult = await WatermarkService.addPreviewWatermark(processedResponse.imageData);
    
    if (!watermarkResult.success) {
      console.warn('Watermarking failed, using original image:', watermarkResult.error);
    }
    
    const watermarkedImageData = watermarkResult.imageData || processedResponse.imageData;

    // Create preview URL (in production, this would be stored in cloud storage)
    const previewUrl = createPreviewUrl(watermarkedImageData);

    // Prepare response metadata
    const metadata = {
      generationTime: metrics.duration,
      cost: metrics.cost,
      dimensions: processedResponse.metadata?.dimensions || { 
        width: GENERATION_CONFIG.PREVIEW_SIZE, 
        height: GENERATION_CONFIG.PREVIEW_SIZE 
      },
      quality: processedResponse.metadata?.quality || 'medium',
      watermarked: true,
    };

    // Log generation metrics
    MetricsUtils.logMetrics(metrics);

    const response = NextResponse.json({
      success: true,
      previewUrl,
      imageData: watermarkedImageData,
      metadata,
      warnings: processedResponse.warnings,
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '3');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    return response;

  } catch (error) {
    console.error('Preview generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Preview generation failed: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}


/**
 * Create preview URL (placeholder - in production, store in cloud storage)
 */
function createPreviewUrl(imageData: string): string {
  // In production, this would upload to S3/Cloudinary and return the URL
  // For now, we'll return a data URL
  // Check if imageData already has data URL prefix
  if (imageData.startsWith('data:')) {
    return imageData;
  }
  return `data:image/png;base64,${imageData}`;
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'preview-generation',
    model: env.getAIConfig().model,
    timestamp: new Date().toISOString(),
  });
}
