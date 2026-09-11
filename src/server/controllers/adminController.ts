import { Request, Response, NextFunction } from 'express';
import { repository } from '../data/repository';
import { database } from '../db/database';
import { POSTGRES_DDL_SCHEMA } from '../db/schema';
import { sendSuccess, sendError } from '../utils/response';
import { runAllUnitTests } from '../../../tests/unit_tests.test';

export const adminController = {
  getDashboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await repository.getAdminDashboardStats();
      const dbInfo = database.getConnectionInfo();

      return sendSuccess(res, stats, 'Admin dashboard analytics retrieved', 200, {
        metrics: stats.metrics,
        modelMetrics: stats.modelMetrics,
        hotspots: stats.hotspots,
        syntheticDistricts: stats.syntheticDistricts,
        database: dbInfo
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve admin dashboard', 500, err);
    }
  },

  getDatabaseInfo: (req: Request, res: Response) => {
    try {
      const info = database.getConnectionInfo();
      return sendSuccess(res, {
        connection: info,
        ddlSchema: POSTGRES_DDL_SCHEMA
      }, 'Database schema and connection information retrieved', 200);
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve database status', 500, err);
    }
  },

  getNotifications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await repository.getNotifications();
      return sendSuccess(res, notifications, 'Notifications retrieved', 200, {
        notifications
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve notifications', 500, err);
    }
  },

  markNotificationRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await repository.markNotificationRead(req.params.id);
      return sendSuccess(res, { success }, 'Notification marked as read', 200);
    } catch (err: any) {
      return sendError(res, 'Failed to mark notification as read', 500, err);
    }
  },

  resetDemo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await repository.resetDemoData();
      return sendSuccess(res, { success: true }, 'Demo dataset reset to initial state', 200);
    } catch (err: any) {
      return sendError(res, 'Failed to reset demo data', 500, err);
    }
  },

  runTests: (req: Request, res: Response) => {
    try {
      const testReport = runAllUnitTests();
      return sendSuccess(res, testReport, 'Test suite executed', 200, {
        passed: testReport.passed,
        failed: testReport.failed,
        results: testReport.results
      });
    } catch (err: any) {
      return sendError(res, 'Failed to run test suite', 500, err);
    }
  }
};
