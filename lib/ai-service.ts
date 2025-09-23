import { GoogleGenAI } from '@google/genai';
import { env } from './env-validation';
import { GENERATION_CONFIG } from './constants';
import { UploadedImage, CustomizationOptions } from '@/types';

/**
 * AI Service for Gemini 2.5 Flash Image (Nano Banana)
 * Handles image generation and processing using Google's Gemini API
 */

export interface GenerationRequest {
  image: UploadedImage;
  options: CustomizationOptions;
  size: 'preview' | 'full';
  prompt?: string;
}

export interface GenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageData?: string; // Base64 encoded image
  error?: string;
  cost?: number;
  generationTime?: number;
}

export interface AIServiceConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
  baseUrl: string;
}

class AIService {
  private config: AIServiceConfig;
  private retryCount = 0;
  private genAI: GoogleGenAI;

  constructor() {
    this.config = env.getAIConfig();
    this.genAI = new GoogleGenAI({
      apiKey: this.config.apiKey,
    });
  }

  /**
   * Generate a professional portrait using Gemini 2.5 Flash Image
   */
  async generatePortrait(request: GenerationRequest): Promise<GenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Reset retry count for new request
      this.retryCount = 0;
      
      // Check if we're in development mode and should skip AI calls
      if (env.get('DEV_MODE_SKIP_AI')) {
        console.log('🚧 Development mode: Skipping Gemini API call, returning original image');
        
        // Get image base64 data
        let imageBase64: string;
        
        // Check if image already has base64Data (from client)
        if (request.image.base64Data && typeof request.image.base64Data === 'string') {
          imageBase64 = request.image.base64Data;
        } else {
          // Fallback to converting the file (for backward compatibility)
          imageBase64 = await this.convertImageToBase64(request.image.file);
        }
        
        const generationTime = Date.now() - startTime;
        
        return {
          success: true,
          imageData: imageBase64, // Return original image
          cost: 0, // No cost in dev mode
          generationTime,
        };
      }
      
      // Prepare the prompt for professional portrait generation
      const prompt = this.buildPrompt(request.options, request.prompt);
      
      // Get image base64 data
      let imageBase64: string;
      
      // Check if image already has base64Data (from client)
      if (request.image.base64Data && typeof request.image.base64Data === 'string') {
        imageBase64 = request.image.base64Data;
      } else {
        // Fallback to converting the file (for backward compatibility)
        imageBase64 = await this.convertImageToBase64(request.image.file);
      }
      
      // Make API call to Gemini using the SDK
      const response = await this.callGeminiAPI({
        prompt,
        image: imageBase64,
        model: this.config.model,
      });
      
      const generationTime = Date.now() - startTime;
      const cost = this.calculateCost(request.size);
      
      return {
        success: true,
        imageData: response.imageData,
        cost,
        generationTime,
      };
      
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Retry logic
      if (this.retryCount < this.config.maxRetries) {
        this.retryCount++;
        console.log(`Retrying generation (attempt ${this.retryCount}/${this.config.maxRetries})`);
        await this.delay(1000 * this.retryCount); // Exponential backoff
        return this.generatePortrait(request);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate portrait',
      };
    }
  }

  /**
   * Build a detailed prompt for professional portrait generation
   */
  private buildPrompt(options: CustomizationOptions, customPrompt?: string): string {
    if (customPrompt) {
      return customPrompt;
    }

    const background = options.background || 'office';
    const style = options.style || 'professional';
    
    const backgroundDescriptions = {
      office: 'professional office setting with modern furniture and clean lighting',
      studio: 'clean, minimalist studio background with soft lighting',
      outdoor: 'outdoor professional setting with natural lighting',
      conference: 'conference room with modern corporate environment',
    };

    const styleDescriptions = {
      professional: 'professional business attire, confident expression, clean and polished look',
      casual: 'smart casual attire, approachable expression, modern and friendly',
      executive: 'executive-level professional attire, authoritative presence, sophisticated styling',
      creative: 'creative professional attire, artistic expression, innovative and dynamic',
    };

    return `Transform this photo into a high-quality professional portrait. 
    
    Requirements:
    - ${styleDescriptions[style]}
    - Background: ${backgroundDescriptions[background]}
    - High resolution, sharp details, professional lighting
    - Maintain the person's facial features and identity
    - Remove any distracting elements from the original background
    - Ensure the portrait looks natural and professional
    - Use professional color grading and retouching
    - The final image should be suitable for business cards, LinkedIn profiles, and professional use
    
    Style: ${style}
    Background: ${background}
    
    Generate a professional portrait that maintains the person's likeness while creating a polished, business-ready image.`;
  }

  /**
   * Convert File to base64 string
   * Works in both browser and Node.js environments
   * This is primarily used as a fallback when base64Data is not available
   */
  private async convertImageToBase64(file: File): Promise<string> {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof FileReader !== 'undefined') {
      // Browser environment - use FileReader
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get just the base64 data
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } else {
      // Node.js environment - simplified fallback
      try {
        // Check if file has arrayBuffer method (browser File)
        if (typeof file.arrayBuffer === 'function') {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return buffer.toString('base64');
        }
        // If file is a string (already base64)
        else if (typeof file === 'string') {
          return file;
        }
        // Last resort: try to read as buffer
        else {
          const buffer = Buffer.from(file as unknown as ArrayBuffer);
          return buffer.toString('base64');
        }
      } catch (error) {
        console.error('File conversion error:', error);
        console.error('File type:', typeof file);
        console.error('File constructor:', file?.constructor?.name);
        console.error('File properties:', Object.keys(file || {}));
        throw new Error(`Failed to convert file to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Call Gemini 2.5 Flash Image API using the official SDK
   */
  private async callGeminiAPI(params: {
    prompt: string;
    image: string;
    model: string;
  }): Promise<{ imageData: string }> {
    try {
      // Prepare the contents array for image editing
      const contents = [
        { text: params.prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: params.image,
          },
        },
      ];

      // Generate content using the SDK
      const response = await this.genAI.models.generateContent({
        model: params.model,
        contents: contents,
      });

      // Extract the generated image from the response
      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        const content = response.candidates[0].content;
        
        if (content.parts) {
          // Look for image data in the response parts
          const imagePart = content.parts.find((part: { inlineData?: { data?: string } }) => 
            part.inlineData
          );
          
          if (imagePart) {
            const imageData = imagePart.inlineData?.data;
            if (imageData) {
              console.log('Image generated successfully, data length:', imageData.length);
              return {
                imageData: imageData,
              };
            }
          }
        }
      }

      throw new Error('No image generated in response');
    } catch (error) {
      console.error('Gemini SDK Error:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate the cost of generation based on size
   */
  private calculateCost(size: 'preview' | 'full'): number {
    return size === 'preview' 
      ? GENERATION_CONFIG.PREVIEW_COST 
      : GENERATION_CONFIG.FULL_COST;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate the AI service configuration
   */
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.model && this.config.baseUrl);
  }

  /**
   * Get service status and capabilities
   */
  getServiceInfo() {
    return {
      model: this.config.model,
      maxRetries: this.config.maxRetries,
      baseUrl: this.config.baseUrl,
      isConfigured: this.validateConfig(),
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
