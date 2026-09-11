import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { config } from './src/server/config';
import { requestLogger } from './src/server/middleware/logger';
import { requestTimeout } from './src/server/middleware/timeout';
import { errorHandler } from './src/server/middleware/errorHandler';
import apiRouter from './src/server/routes';

async function startServer() {
  const app = express();
  const PORT = config.port;

  // JSON and URL-encoded body parsing with 15MB limit for field leaf photos
  app.use(express.json({ limit: config.server.bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: config.server.bodyLimit }));

  // CORS and Security Headers Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id, x-user-role');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'SAMEORIGIN');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Safe development request logger
  app.use(requestLogger);

  // Request timeout guard
  app.use(requestTimeout(config.server.requestTimeoutMs));

  // Mount modular REST API
  app.use('/api', apiRouter);

  // Centralized error handling middleware for API routes
  app.use('/api', errorHandler);

  // Vite middleware in development / Static files in production
  if (config.env !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global fallback error handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[✓] ${config.app.name} v${config.app.version} running on http://0.0.0.0:${PORT} [${config.env}]`);
  });
}

startServer();
