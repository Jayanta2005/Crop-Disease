import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateUser, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/dashboard', requireRole(['ADMIN']), adminController.getDashboard);
router.get('/database', requireRole(['ADMIN']), adminController.getDatabaseInfo);
router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);
router.post('/demo/reset', requireRole(['ADMIN']), adminController.resetDemo);
router.get('/tests/run', requireRole(['ADMIN']), adminController.runTests);

export default router;
