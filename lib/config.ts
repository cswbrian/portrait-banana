import { env } from './env-validation';
import { EnvConfig } from '@/types';

/**
 * Legacy config wrapper for backward compatibility
 * @deprecated Use env from env-validation.ts instead
 */
export const config = {
  get: <K extends keyof EnvConfig>(key: K) => env.get(key),
  getAll: () => env.getAll(),
  isDevelopment: () => env.isDevelopment(),
  isProduction: () => env.isProduction(),
  getStripeConfig: () => env.getStripeConfig(),
  getAIConfig: () => env.getAIConfig(),
  getUploadConfig: () => env.getUploadConfig(),
  getRateLimitConfig: () => env.getRateLimitConfig(),
};

export default config;
