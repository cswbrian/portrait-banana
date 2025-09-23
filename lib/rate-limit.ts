import { NextRequest } from 'next/server';
import { RATE_LIMIT_CONFIG } from './constants';

/**
 * Rate Limiting Utilities
 * Handles IP-based rate limiting for API endpoints
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

export class RateLimitService {
  /**
   * Check if request is within rate limits
   */
  static checkRateLimit(request: NextRequest): RateLimitResult {
    const clientIP = this.getClientIP(request);
    const now = Date.now();
    
    // More lenient rate limiting in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    const windowMs = isDevelopment ? 60 * 60 * 1000 : RATE_LIMIT_CONFIG.WINDOW_MS; // 1 hour in dev, 24 hours in prod
    const maxAttempts = isDevelopment ? 50 : RATE_LIMIT_CONFIG.MAX_ATTEMPTS_PER_IP; // 50 in dev, 3 in prod

    // Get or create rate limit entry
    let entry = rateLimitStore.get(clientIP);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + windowMs,
        lastRequest: now,
      };
    }

    // Check if within limits
    if (entry.count >= maxAttempts) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Increment count
    entry.count++;
    entry.lastRequest = now;
    rateLimitStore.set(clientIP, entry);

    // Clean up expired entries periodically
    this.cleanupExpiredEntries();

    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('x-remote-addr');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    if (remoteAddr) {
      return remoteAddr;
    }
    
    return 'unknown';
  }

  /**
   * Clean up expired rate limit entries
   */
  private static cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }

  /**
   * Get rate limit status for an IP
   */
  static getRateLimitStatus(ip: string): RateLimitResult | null {
    const entry = rateLimitStore.get(ip);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const maxAttempts = RATE_LIMIT_CONFIG.MAX_ATTEMPTS_PER_IP;

    if (now > entry.resetTime) {
      return {
        allowed: true,
        remaining: maxAttempts,
        resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS,
      };
    }

    return {
      allowed: entry.count < maxAttempts,
      remaining: Math.max(0, maxAttempts - entry.count),
      resetTime: entry.resetTime,
      retryAfter: entry.count >= maxAttempts ? Math.ceil((entry.resetTime - now) / 1000) : undefined,
    };
  }

  /**
   * Reset rate limit for an IP (admin function)
   */
  static resetRateLimit(ip: string): boolean {
    return rateLimitStore.delete(ip);
  }

  /**
   * Get all rate limit entries (admin function)
   */
  static getAllEntries(): Array<{ ip: string; entry: RateLimitEntry }> {
    return Array.from(rateLimitStore.entries()).map(([ip, entry]) => ({ ip, entry }));
  }

  /**
   * Clear all rate limit entries (admin function)
   */
  static clearAll(): void {
    rateLimitStore.clear();
  }

  /**
   * Clear rate limit for specific IP (development helper)
   */
  static clearForIP(ip: string): boolean {
    return rateLimitStore.delete(ip);
  }

  /**
   * Get current rate limit status for debugging
   */
  static getDebugInfo(ip: string): {
    entry: RateLimitEntry | undefined;
    isDevelopment: boolean;
    maxAttempts: number;
    windowMs: number;
  } {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const windowMs = isDevelopment ? 60 * 60 * 1000 : RATE_LIMIT_CONFIG.WINDOW_MS;
    const maxAttempts = isDevelopment ? 50 : RATE_LIMIT_CONFIG.MAX_ATTEMPTS_PER_IP;
    
    return {
      entry: rateLimitStore.get(ip),
      isDevelopment,
      maxAttempts,
      windowMs,
    };
  }
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const rateLimitResult = RateLimitService.checkRateLimit(request);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
          resetTime: rateLimitResult.resetTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.MAX_ATTEMPTS_PER_IP.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '0',
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(request);
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.MAX_ATTEMPTS_PER_IP.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    return response;
  };
}

export default RateLimitService;
