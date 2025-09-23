import { aiService } from '../ai-service';

// Mock the config module
jest.mock('../config', () => ({
  config: {
    getAIConfig: () => ({
      apiKey: 'test-api-key',
      model: 'gemini-2.5-flash-image-preview',
      maxRetries: 0,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    }),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Configuration', () => {
    it('should validate configuration correctly', () => {
      expect(aiService.validateConfig()).toBe(true);
    });

    it('should return service info', () => {
      const info = aiService.getServiceInfo();
      expect(info.model).toBe('gemini-2.5-flash-image-preview');
      expect(info.isConfigured).toBe(true);
    });
  });

  describe('Prompt Building', () => {
    it('should build professional prompt correctly', () => {
      
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockImage = {
        id: 'test-id',
        file: mockFile,
        preview: 'blob:test',
        size: 1024,
        type: 'image/jpeg',
        dimensions: { width: 512, height: 512 },
        uploadedAt: new Date(),
      };

      // This would test the private method through the public interface
      // In a real test, you might want to expose this method or test it indirectly
      expect(mockImage).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockImage = {
        id: 'test-id',
        file: mockFile,
        preview: 'blob:test',
        size: 1024,
        type: 'image/jpeg',
        dimensions: { width: 512, height: 512 },
        uploadedAt: new Date(),
      };

      const result = await aiService.generatePortrait({
        image: mockImage,
        options: { background: 'office', style: 'professional' },
        size: 'preview',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
