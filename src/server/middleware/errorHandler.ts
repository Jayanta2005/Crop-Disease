import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Centralized express error handling middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const message = err.message || 'An unexpected internal server error occurred';

  console.error(`[Error Handler] ${req.method} ${req.originalUrl} (${statusCode}):`, message, err.stack || '');

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.details || err.stack : err.details
  );
}
