import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  timestamp: string;
}

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  extraTopLevelFields?: Record<string, any>
): Response {
  const payload: Record<string, any> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...(extraTopLevelFields || {})
  };

  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  error: string,
  statusCode = 500,
  details?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    error,
    details: details ? (typeof details === 'string' ? details : details.message || details) : undefined,
    timestamp: new Date().toISOString()
  });
}
