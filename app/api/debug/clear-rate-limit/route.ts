import { NextRequest, NextResponse } from 'next/server';
import { RateLimitService } from '@/lib/rate-limit';

/**
 * Debug API endpoint to clear rate limits
 * Only available in development mode
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const { ip } = await request.json();
    
    if (ip) {
      // Clear rate limit for specific IP
      const cleared = RateLimitService.clearForIP(ip);
      return NextResponse.json({
        success: true,
        message: `Rate limit cleared for IP: ${ip}`,
        cleared,
      });
    } else {
      // Clear all rate limits
      RateLimitService.clearAll();
      return NextResponse.json({
        success: true,
        message: 'All rate limits cleared',
      });
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to clear rate limits' },
      { status: 500 }
    );
  }
}

/**
 * Get rate limit debug info
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  const clientIP = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';

  const debugInfo = RateLimitService.getDebugInfo(clientIP);
  const allEntries = RateLimitService.getAllEntries();

  return NextResponse.json({
    clientIP,
    debugInfo,
    allEntries,
    totalEntries: allEntries.length,
  });
}
