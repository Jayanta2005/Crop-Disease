import { Request, Response, NextFunction } from 'express';

/**
 * Safe development request logger.
 * Logs method, path, status, and duration without exposing sensitive base64 payloads, tokens or API secrets.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusSymbol = status < 400 ? '✓' : status < 500 ? '⚠' : '✗';
    console.log(`[API ${statusSymbol}] ${method} ${originalUrl} -> ${status} (${duration}ms)`);
  });

  next();
}
