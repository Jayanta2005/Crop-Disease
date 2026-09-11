import { Request, Response, NextFunction } from 'express';
import { syncService } from '../services/syncService';
import { sendSuccess, sendError } from '../utils/response';

export const syncController = {
  /**
   * Synchronizes offline queue with idempotency, duplicate protection, and partial-failure handling
   */
  syncOfflineQueue: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return sendError(res, 'Validation Error: "items" must be an array of queued offline submissions', 400);
      }

      const result = await syncService.syncOfflineQueue(
        items,
        user ? { id: user.id, name: user.name, role: user.role } : undefined
      );

      return sendSuccess(
        res,
        result,
        `Batch sync completed: ${result.successful} synced, ${result.duplicates} duplicates, ${result.rejected} rejected, ${result.failed} failed`,
        200,
        {
          batchId: result.batchId,
          totalProcessed: result.totalProcessed,
          successful: result.successful,
          duplicates: result.duplicates,
          rejected: result.rejected,
          failed: result.failed,
          results: result.results
        }
      );
    } catch (err: any) {
      console.error('[SyncController] Error processing offline batch:', err);
      return sendError(res, 'Failed to process offline sync queue', 500, err);
    }
  }
};
