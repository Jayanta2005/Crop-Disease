import { Router } from 'express';
import { syncController } from '../controllers/syncController';
import { validateOfflineSync } from '../middleware/validation';
import { authenticateUser } from '../middleware/auth';
import { aiInferenceLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticateUser);

// POST /api/sync/offline - primary offline queue sync
router.post('/offline', aiInferenceLimiter, validateOfflineSync, syncController.syncOfflineQueue);

// POST /api/sync/batch - alias for batch submissions
router.post('/batch', aiInferenceLimiter, validateOfflineSync, syncController.syncOfflineQueue);

export default router;
