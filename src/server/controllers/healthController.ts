import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { config } from '../config';
import { repository } from '../data/repository';
import { aiService } from '../services/aiService';

export const healthController = {
  getHealth: (req: Request, res: Response) => {
    return sendSuccess(
      res,
      {
        status: 'healthy',
        service: config.app.name,
        version: config.app.version,
        environment: config.env,
        timestamp: new Date().toISOString()
      },
      'CropGuard AI backend is operating normally',
      200,
      {
        status: 'ok',
        service: config.app.name,
        version: config.app.version
      }
    );
  },

  getSystemStatus: async (req: Request, res: Response) => {
    const repoStatus = await repository.getStatus();
    const memoryUsage = process.memoryUsage();

    const statusData = {
      system: {
        appName: config.app.name,
        version: config.app.version,
        nodeVersion: process.version,
        uptimeSeconds: repoStatus.uptimeSeconds,
        timestamp: new Date().toISOString()
      },
      aiProvider: {
        configured: aiService.isAvailable(),
        model: config.gemini.model,
        mode: aiService.isAvailable() ? 'Gemini 3.8 Flash Vision' : 'Autonomous Agronomic Heuristic Engine'
      },
      dataStore: {
        type: repoStatus.storageType,
        isReady: repoStatus.isReady,
        counts: {
          diagnoses: repoStatus.diagnosesCount,
          hotspots: repoStatus.hotspotsCount,
          sensors: repoStatus.sensorsCount,
          extensionTasks: repoStatus.extensionTasksCount
        }
      },
      memory: {
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 10) / 10,
        heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 10) / 10,
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 10) / 10
      }
    };

    return sendSuccess(res, statusData, 'System operational metrics retrieved successfully');
  }
};
