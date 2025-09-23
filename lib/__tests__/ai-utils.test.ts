import {
  PromptUtils,
  ImageUtils,
  ValidationUtils,
  ErrorUtils,
  MetricsUtils,
} from '../ai-utils';
import { PromptBuilder } from '../prompt-builder';
import { AIResponseHandler } from '../ai-response-handler';
import { CustomizationOptions } from '@/types';

// Mock File and Image for testing
const createMockFile = (name: string, type: string, size: number): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const createMockImage = (width: number, height: number, size: number): any => ({
  id: 'test-id',
  file: createMockFile('test.jpg', 'image/jpeg', size),
  preview: 'blob:test',
  size,
  type: 'image/jpeg',
  dimensions: { width, height },
  uploadedAt: new Date(),
});

describe('AI Utils', () => {
  describe('PromptUtils', () => {
    it('should get available prompt templates', () => {
      const templates = PromptUtils.getPromptTemplates();
      expect(templates).toHaveLength(3);
      expect(templates[0].id).toBe('professional');
    });

    it('should get specific prompt template', () => {
      const template = PromptUtils.getPromptTemplate('professional');
      expect(template).toBeDefined();
      expect(template?.id).toBe('professional');
    });

    it('should return null for invalid template', () => {
      const template = PromptUtils.getPromptTemplate('invalid');
      expect(template).toBeNull();
    });

    it('should build prompt with options', () => {
      const options: CustomizationOptions = {
        style: 'professional',
        background: 'office',
      };

      const prompt = PromptUtils.buildPrompt('professional', options);
      expect(prompt).toContain('professional business attire');
      expect(prompt).toContain('office setting');
    });

    it('should use custom prompt when provided', () => {
      const options: CustomizationOptions = {
        style: 'professional',
        background: 'office',
      };

      const customPrompt = 'Custom prompt for testing';
      const prompt = PromptUtils.buildPrompt('professional', options, customPrompt);
      expect(prompt).toBe(customPrompt);
    });

    it('should validate prompt content', () => {
      const validPrompt = 'Generate a professional portrait with business attire';
      const validation = PromptUtils.validatePrompt(validPrompt);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect inappropriate content', () => {
      const invalidPrompt = 'Generate a nude portrait';
      const validation = PromptUtils.validatePrompt(invalidPrompt);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('ImageUtils', () => {
    it('should validate image for AI processing', () => {
      const image = createMockImage(512, 512, 1024 * 1024);
      const validation = ImageUtils.validateImageForAI(image);
      expect(validation.isValid).toBe(true);
    });

    it('should detect small images', () => {
      const image = createMockImage(256, 256, 1024 * 1024);
      const validation = ImageUtils.validateImageForAI(image);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Image width must be at least 512px');
    });

    it('should detect large files', () => {
      const image = createMockImage(512, 512, 15 * 1024 * 1024);
      const validation = ImageUtils.validateImageForAI(image);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Image size must be less than 10MB');
    });

    it('should warn about extreme aspect ratios', () => {
      const image = createMockImage(1024, 256, 1024 * 1024);
      const validation = ImageUtils.validateImageForAI(image);
      expect(validation.warnings).toContain('Extreme aspect ratio may affect generation quality');
    });

    it('should get optimal generation size', () => {
      const smallImage = createMockImage(512, 512, 1024 * 1024);
      const largeImage = createMockImage(2048, 2048, 1024 * 1024);

      expect(ImageUtils.getOptimalGenerationSize(smallImage)).toBe('preview');
      expect(ImageUtils.getOptimalGenerationSize(largeImage)).toBe('full');
    });
  });

  describe('ValidationUtils', () => {
    it('should validate generation request', () => {
      const image = createMockImage(512, 512, 1024 * 1024);
      const options: CustomizationOptions = {
        style: 'professional',
        background: 'office',
      };

      const validation = ValidationUtils.validateGenerationRequest(image, options, 'preview');
      expect(validation.isValid).toBe(true);
    });

    it('should warn about missing options', () => {
      const image = createMockImage(512, 512, 1024 * 1024);
      const options: CustomizationOptions = {};

      const validation = ValidationUtils.validateGenerationRequest(image, options, 'preview');
      expect(validation.warnings).toContain('No background specified, using default');
      expect(validation.warnings).toContain('No style specified, using default');
    });

    it('should validate AI config', () => {
      const validConfig = {
        apiKey: 'test-key',
        model: 'test-model',
        baseUrl: 'https://test.com',
        maxRetries: 0,
      };

      const validation = ValidationUtils.validateAIConfig(validConfig);
      expect(validation.isValid).toBe(true);
    });

    it('should detect missing API key', () => {
      const invalidConfig = {
        model: 'test-model',
        baseUrl: 'https://test.com',
      };

      const validation = ValidationUtils.validateAIConfig(invalidConfig);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('API key is required');
    });
  });

  describe('ErrorUtils', () => {
    it('should parse API key errors', () => {
      const error = new Error('Invalid API key');
      const parsed = ErrorUtils.parseAIError(error);
      expect(parsed.code).toBe('INVALID_API_KEY');
      expect(parsed.retryable).toBe(false);
    });

    it('should parse quota errors', () => {
      const error = new Error('Quota exceeded');
      const parsed = ErrorUtils.parseAIError(error);
      expect(parsed.code).toBe('QUOTA_EXCEEDED');
      expect(parsed.retryable).toBe(true);
    });

    it('should parse timeout errors', () => {
      const error = new Error('Request timeout');
      const parsed = ErrorUtils.parseAIError(error);
      expect(parsed.code).toBe('TIMEOUT');
      expect(parsed.retryable).toBe(true);
    });

    it('should determine retryable errors', () => {
      const retryableError = new Error('Rate limit exceeded');
      const nonRetryableError = new Error('Invalid API key');

      expect(ErrorUtils.isRetryableError(retryableError)).toBe(true);
      expect(ErrorUtils.isRetryableError(nonRetryableError)).toBe(false);
    });

    it('should get user-friendly messages', () => {
      const error = new Error('Invalid API key');
      const message = ErrorUtils.getUserFriendlyMessage(error);
      expect(message).toContain('AI service configuration');
    });
  });

  describe('MetricsUtils', () => {
    it('should create generation metrics', () => {
      const startTime = Date.now();
      const endTime = startTime + 5000;
      const metrics = MetricsUtils.createMetrics(startTime, endTime, 'test-model', 'preview');

      expect(metrics.duration).toBe(5000);
      expect(metrics.model).toBe('test-model');
      expect(metrics.size).toBe('preview');
    });

    it('should calculate total cost', () => {
      const metrics1 = MetricsUtils.createMetrics(0, 1000, 'model1', 'preview');
      const metrics2 = MetricsUtils.createMetrics(0, 2000, 'model2', 'full');
      const total = MetricsUtils.calculateTotalCost([metrics1, metrics2]);

      expect(total).toBe(metrics1.cost + metrics2.cost);
    });
  });
});

describe('PromptBuilder', () => {
  it('should build basic prompt', () => {
    const options: CustomizationOptions = {
      style: 'professional',
      background: 'office',
    };

    const context = {
      style: 'professional',
      background: 'office',
      industry: 'technology',
    };

    const prompt = PromptBuilder.buildPrompt(options, context);
    expect(prompt.basic).toContain('professional portrait');
  });

  it('should build detailed prompt', () => {
    const options: CustomizationOptions = {
      style: 'executive',
      background: 'conference',
    };

    const prompt = PromptBuilder.buildPrompt(options);
    expect(prompt.detailed).toContain('REQUIREMENTS:');
    expect(prompt.detailed).toContain('executive-level professional attire');
  });

  it('should validate context', () => {
    const validContext = {
      style: 'professional',
      background: 'office',
      industry: 'technology',
    };

    const validation = PromptBuilder.validateContext(validContext);
    expect(validation.isValid).toBe(true);
  });

  it('should detect invalid context', () => {
    const invalidContext = {
      style: 'invalid-style',
      background: 'invalid-background',
    };

    const validation = PromptBuilder.validateContext(invalidContext);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});

describe('AIResponseHandler', () => {
  it('should process successful response', async () => {
    const response = {
      success: true,
      imageData: 'base64data',
    };

    const metrics = {
      startTime: 0,
      endTime: 5000,
      duration: 5000,
      cost: 0.039,
      model: 'test-model',
      size: 'preview' as const,
    };

    const processed = await AIResponseHandler.processResponse(response, metrics);
    expect(processed.success).toBe(true);
  });

  it('should handle failed response', async () => {
    const response = {
      success: false,
      error: 'Generation failed',
    };

    const metrics = {
      startTime: 0,
      endTime: 1000,
      duration: 1000,
      cost: 0,
      model: 'test-model',
      size: 'preview' as const,
    };

    const processed = await AIResponseHandler.processResponse(response, metrics);
    expect(processed.success).toBe(false);
    expect(processed.error).toBe('Generation failed');
  });

  it('should validate base64 data', () => {
    expect(AIResponseHandler['isValidBase64']('validbase64')).toBe(true);
    expect(AIResponseHandler['isValidBase64']('invalid!@#')).toBe(false);
  });

  it('should format response for display', () => {
    const successResponse = {
      success: true,
      metadata: {
        model: 'test-model',
        generationTime: 5000,
        cost: 0.039,
        size: 'preview' as const,
        quality: 'high' as const,
        format: 'image/jpeg',
        timestamp: Date.now(),
      },
    };

    const formatted = AIResponseHandler.formatResponseForDisplay(successResponse);
    expect(formatted.type).toBe('success');
    expect(formatted.message).toContain('successfully');
  });
});
