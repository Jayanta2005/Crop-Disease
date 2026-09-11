import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Attaches a timeout listener to express requests.
 */
export function requestTimeout(timeoutMs = config.server.requestTimeoutMs) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        console.warn(`[Timeout] Request ${req.method} ${req.originalUrl} exceeded ${timeoutMs}ms`);
        res.status(504).json({
          success: false,
          error: 'Gateway Timeout: Request processing took too long',
          timestamp: new Date().toISOString()
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}
