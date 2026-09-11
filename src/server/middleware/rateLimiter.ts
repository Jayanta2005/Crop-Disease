import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface RateLimitRecord {
  count: number;
  resetTimeMs: number;
}

/**
 * Creates an in-memory sliding window rate limiter
 * Protects expensive inference & calculation endpoints.
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const requests = new Map<string, RateLimitRecord>();

  // Periodically clean up expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requests.entries()) {
      if (now > record.resetTimeMs) {
        requests.delete(key);
      }
    }
  }, 60000);

  return (req: Request, res: Response, next: NextFunction) => {
    // Key by IP address or authenticated user ID
    const clientKey = req.user?.id || req.ip || req.socket.remoteAddress || 'anonymous-client';
    const now = Date.now();

    let record = requests.get(clientKey);

    if (!record || now > record.resetTimeMs) {
      record = {
        count: 1,
        resetTimeMs: now + options.windowMs
      };
      requests.set(clientKey, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, options.maxRequests - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTimeMs - now) / 1000);

    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTimeMs / 1000));

    if (record.count > options.maxRequests) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return sendError(
        res,
        options.message || `Rate limit exceeded. Maximum ${options.maxRequests} requests per ${Math.round(options.windowMs / 1000)}s. Please retry in ${retryAfterSeconds} seconds.`,
        429
      );
    }

    next();
  };
}

// Preset rate limiters
export const aiInferenceLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 predictions per minute per client
  message: 'AI inference rate limit exceeded. Please wait a moment before initiating another crop scan.'
});

export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120
});
