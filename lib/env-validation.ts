/**
 * Environment Variable Validation
 * Validates and provides type-safe access to environment variables
 */

interface EnvConfig {
  // Required variables
  GEMINI_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  NEXT_PUBLIC_APP_URL: string;
  
  // Optional variables with defaults
  NODE_ENV: 'development' | 'production' | 'test';
  DEV_MODE_SKIP_AI: boolean;
  UPLOAD_MAX_SIZE: number;
  RATE_LIMIT_MAX_ATTEMPTS: number;
  RATE_LIMIT_WINDOW_MS: number;
  GENERATION_PREVIEW_COST: number;
  GENERATION_FULL_COST: number;
  DOWNLOAD_PRICE: number;
  CURRENCY: string;
  
  // Optional cloud storage
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  
  // Optional analytics
  GOOGLE_ANALYTICS_ID?: string;
  SENTRY_DSN?: string;
}

class EnvValidation {
  private static instance: EnvValidation;
  private config: EnvConfig;

  private constructor() {
    this.config = this.validateAndLoadConfig();
  }

  public static getInstance(): EnvValidation {
    if (!EnvValidation.instance) {
      EnvValidation.instance = new EnvValidation();
    }
    return EnvValidation.instance;
  }

  private validateAndLoadConfig(): EnvConfig {
    // Required variables
    const requiredVars = [
      'GEMINI_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_APP_URL',
    ];

    const missingVars = requiredVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please check your .env.local file and ensure all required variables are set.\n` +
        `See env.example for reference.`
      );
    }

    // Validate NODE_ENV
    const nodeEnv = process.env.NODE_ENV as 'development' | 'production' | 'test';
    if (!['development', 'production', 'test'].includes(nodeEnv || '')) {
      throw new Error('NODE_ENV must be one of: development, production, test');
    }

    // Validate URLs
    try {
      new URL(process.env.NEXT_PUBLIC_APP_URL!);
    } catch {
      throw new Error('NEXT_PUBLIC_APP_URL must be a valid URL');
    }

    // Validate numeric values
    const numericVars = [
      'UPLOAD_MAX_SIZE',
      'RATE_LIMIT_MAX_ATTEMPTS',
      'RATE_LIMIT_WINDOW_MS',
      'GENERATION_PREVIEW_COST',
      'GENERATION_FULL_COST',
      'DOWNLOAD_PRICE',
    ];

    for (const varName of numericVars) {
      const value = process.env[varName];
      if (value && isNaN(Number(value))) {
        throw new Error(`${varName} must be a valid number`);
      }
    }

    return {
      // Required variables
      GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY!,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
      
      // Optional variables with defaults
      NODE_ENV: nodeEnv || 'development',
      DEV_MODE_SKIP_AI: process.env.DEV_MODE_SKIP_AI === 'true' || nodeEnv === 'development',
      UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'), // 10MB
      RATE_LIMIT_MAX_ATTEMPTS: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '3'),
      RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '86400000'), // 24 hours
      GENERATION_PREVIEW_COST: parseFloat(process.env.GENERATION_PREVIEW_COST || '0.039'),
      GENERATION_FULL_COST: parseFloat(process.env.GENERATION_FULL_COST || '0.039'),
      DOWNLOAD_PRICE: parseInt(process.env.DOWNLOAD_PRICE || '799'),
      CURRENCY: process.env.CURRENCY || 'usd',
      
      // Optional cloud storage
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      
      // Optional analytics
      GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
      SENTRY_DSN: process.env.SENTRY_DSN,
    };
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  public getAll(): EnvConfig {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  public getCloudStorageConfig(): {
    provider: 'aws' | 'cloudinary' | 'none';
    config: any;
  } {
    const hasAws = !!(this.config.AWS_ACCESS_KEY_ID && this.config.AWS_SECRET_ACCESS_KEY);
    const hasCloudinary = !!(this.config.CLOUDINARY_CLOUD_NAME && this.config.CLOUDINARY_API_KEY);

    if (hasAws) {
      return {
        provider: 'aws',
        config: {
          accessKeyId: this.config.AWS_ACCESS_KEY_ID,
          secretAccessKey: this.config.AWS_SECRET_ACCESS_KEY,
          region: this.config.AWS_REGION || 'us-east-1',
          bucket: this.config.AWS_S3_BUCKET,
        },
      };
    }

    if (hasCloudinary) {
      return {
        provider: 'cloudinary',
        config: {
          cloudName: this.config.CLOUDINARY_CLOUD_NAME,
          apiKey: this.config.CLOUDINARY_API_KEY,
          apiSecret: this.config.CLOUDINARY_API_SECRET,
        },
      };
    }

    return {
      provider: 'none',
      config: {},
    };
  }

  public getAIConfig() {
    return {
      apiKey: this.config.GEMINI_API_KEY,
      model: 'gemini-2.5-flash-image-preview',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      maxRetries: 0,
    };
  }

  public getStripeConfig() {
    return {
      publishableKey: this.config.STRIPE_PUBLISHABLE_KEY,
      secretKey: this.config.STRIPE_SECRET_KEY,
      webhookSecret: this.config.STRIPE_WEBHOOK_SECRET,
    };
  }

  public getUploadConfig() {
    return {
      maxSize: this.config.UPLOAD_MAX_SIZE,
      maxFiles: 1,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    };
  }

  public getRateLimitConfig() {
    return {
      maxAttempts: this.config.RATE_LIMIT_MAX_ATTEMPTS,
      windowMs: this.config.RATE_LIMIT_WINDOW_MS,
    };
  }

  public getPricingConfig() {
    return {
      downloadPrice: this.config.DOWNLOAD_PRICE,
      currency: this.config.CURRENCY,
      previewCost: this.config.GENERATION_PREVIEW_COST,
      fullCost: this.config.GENERATION_FULL_COST,
    };
  }

  public getAnalyticsConfig() {
    return {
      googleAnalyticsId: this.config.GOOGLE_ANALYTICS_ID,
      sentryDsn: this.config.SENTRY_DSN,
    };
  }

  /**
   * Validate environment variables on startup
   */
  public validateOnStartup(): void {
    console.log('🔍 Validating environment variables...');
    
    try {
      // This will throw if validation fails
      this.config;
      console.log('✅ Environment variables validated successfully');
      
      // Log configuration (without sensitive data)
      console.log('📋 Configuration loaded:');
      console.log(`   - Environment: ${this.config.NODE_ENV}`);
      console.log(`   - App URL: ${this.config.NEXT_PUBLIC_APP_URL}`);
      console.log(`   - Upload Max Size: ${Math.round(this.config.UPLOAD_MAX_SIZE / 1024 / 1024)}MB`);
      console.log(`   - Rate Limit: ${this.config.RATE_LIMIT_MAX_ATTEMPTS} attempts per day`);
      console.log(`   - Download Price: $${(this.config.DOWNLOAD_PRICE / 100).toFixed(2)}`);
      
      const cloudStorage = this.getCloudStorageConfig();
      console.log(`   - Cloud Storage: ${cloudStorage.provider}`);
      
    } catch (error) {
      console.error('❌ Environment validation failed:');
      console.error(error);
      process.exit(1);
    }
  }
}

// Export singleton instance
export const env = EnvValidation.getInstance();
export default env;
