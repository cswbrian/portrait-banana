import { POST, GET } from '../route';
import { NextRequest } from 'next/server';
import { RateLimitService } from '@/lib/rate-limit';
import { ValidationUtils } from '@/lib/ai-utils';
import { AIResponseHandler } from '@/lib/ai-response-handler';
import { PromptBuilder } from '@/lib/prompt-builder';
import { aiService } from '@/lib/ai-service';
import { WatermarkService } from '@/lib/watermark';

// Mock the AI service and utilities
jest.mock('@/lib/ai-service', () => ({
  aiService: {
    generatePortrait: jest.fn(),
  },
}));

jest.mock('@/lib/ai-utils', () => ({
  AIResponseHandler: {
    processResponse: jest.fn(),
  },
  ValidationUtils: {
    validateGenerationRequest: jest.fn(),
  },
  MetricsUtils: {
    createMetrics: jest.fn(),
    logMetrics: jest.fn(),
  },
}));

jest.mock('@/lib/prompt-builder', () => ({
  PromptBuilder: {
    buildPrompt: jest.fn(),
    validateContext: jest.fn(),
  },
}));

jest.mock('@/lib/watermark', () => ({
  WatermarkService: {
    addPreviewWatermark: jest.fn(),
  },
}));

jest.mock('@/lib/rate-limit', () => ({
  RateLimitService: {
    checkRateLimit: jest.fn(),
  },
}));

jest.mock('@/lib/config', () => ({
  config: {
    getAIConfig: () => ({
      model: 'gemini-2.5-flash-image-preview',
      apiKey: 'test-key',
    }),
  },
}));

describe('/api/generate-preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-preview', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 429 for rate limit exceeded', async () => {
      RateLimitService.checkRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        retryAfter: 3600,
      });

      const request = new NextRequest('http://localhost:3000/api/generate-preview', {
        method: 'POST',
        body: JSON.stringify({
          image: { id: 'test', file: {} },
          options: { style: 'professional', background: 'office' },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Rate limit exceeded');
    });

    it('should return 400 for validation errors', async () => {

      RateLimitService.checkRateLimit.mockReturnValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 3600000,
      });

      ValidationUtils.validateGenerationRequest.mockReturnValue({
        isValid: false,
        errors: ['Image too small'],
        warnings: [],
      });

      const request = new NextRequest('http://localhost:3000/api/generate-preview', {
        method: 'POST',
        body: JSON.stringify({
          image: { id: 'test', file: {} },
          options: { style: 'professional', background: 'office' },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
    });

    it('should successfully generate preview', async () => {

      RateLimitService.checkRateLimit.mockReturnValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 3600000,
      });

      ValidationUtils.validateGenerationRequest.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      PromptBuilder.buildPrompt.mockReturnValue({
        detailed: 'Test prompt',
      });

      PromptBuilder.validateContext.mockReturnValue({
        isValid: true,
        errors: [],
      });

      aiService.generatePortrait.mockResolvedValue({
        success: true,
        imageData: 'base64data',
      });

      AIResponseHandler.processResponse.mockResolvedValue({
        success: true,
        imageData: 'base64data',
        metadata: {
          dimensions: { width: 512, height: 512 },
          quality: 'high',
        },
      });

      WatermarkService.addPreviewWatermark.mockResolvedValue({
        success: true,
        imageData: 'watermarkeddata',
      });

      const request = new NextRequest('http://localhost:3000/api/generate-preview', {
        method: 'POST',
        body: JSON.stringify({
          image: { 
            id: 'test', 
            file: {},
            dimensions: { width: 512, height: 512 },
            size: 1024,
            type: 'image/jpeg',
          },
          options: { style: 'professional', background: 'office' },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.previewUrl).toBeDefined();
      expect(data.imageData).toBe('watermarkeddata');
      expect(data.metadata.watermarked).toBe(true);
    });

    it('should handle AI service errors', async () => {

      RateLimitService.checkRateLimit.mockReturnValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 3600000,
      });

      ValidationUtils.validateGenerationRequest.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      PromptBuilder.buildPrompt.mockReturnValue({
        detailed: 'Test prompt',
      });

      PromptBuilder.validateContext.mockReturnValue({
        isValid: true,
        errors: [],
      });

      aiService.generatePortrait.mockResolvedValue({
        success: false,
        error: 'AI service error',
      });

      const request = new NextRequest('http://localhost:3000/api/generate-preview', {
        method: 'POST',
        body: JSON.stringify({
          image: { 
            id: 'test', 
            file: {},
            dimensions: { width: 512, height: 512 },
            size: 1024,
            type: 'image/jpeg',
          },
          options: { style: 'professional', background: 'office' },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to generate preview');
    });
  });

  describe('GET', () => {
    it('should return health check', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.service).toBe('preview-generation');
    });
  });
});
