import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-3.8-flash',
    timeoutMs: 15000,
  },
  database: {
    url: process.env.DATABASE_URL || '',
    isPersistent: Boolean(process.env.DATABASE_URL),
  },
  server: {
    bodyLimit: '15mb',
    requestTimeoutMs: 30000,
  },
  app: {
    name: 'CropGuard AI Backend',
    version: '2.5.0',
  }
};
