import { Router } from 'express';
import healthRoutes from './healthRoutes';
import aiRoutes from './aiRoutes';
import diagnosisRoutes from './diagnosisRoutes';
import riskRoutes from './riskRoutes';
import outbreakRoutes from './outbreakRoutes';
import advisoryRoutes from './advisoryRoutes';
import expertRoutes from './expertRoutes';
import sensorRoutes from './sensorRoutes';
import syncRoutes from './syncRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';

import { expertController } from '../controllers/expertController';
import { riskController } from '../controllers/riskController';
import { outbreakController } from '../controllers/outbreakController';
import { authController } from '../controllers/authController';
import { adminController } from '../controllers/adminController';

const apiRouter = Router();

// Modular router mounts
apiRouter.use('/', healthRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/diagnosis', diagnosisRoutes);
apiRouter.use('/risk', riskRoutes);
apiRouter.use('/outbreak', outbreakRoutes);
apiRouter.use('/advisory', advisoryRoutes);
apiRouter.use('/expert', expertRoutes);
apiRouter.use('/sensors', sensorRoutes);
apiRouter.use('/sync', syncRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);

// Direct compatibility endpoints for legacy frontend paths
apiRouter.get('/weather/current', riskController.getCurrentWeather);
apiRouter.get('/map/hotspots', outbreakController.getHotspots);

apiRouter.get('/farmers/profile', authController.getFarmerProfile);
apiRouter.get('/farms', authController.getFarms);
apiRouter.get('/crops', authController.getCrops);

apiRouter.get('/extension/cases', expertController.getExtensionTasks);
apiRouter.post('/extension/field-visit', expertController.recordFieldVisit);
apiRouter.get('/lab/referrals', expertController.getLabReferrals);
apiRouter.put('/lab/referral/:id', expertController.updateLabReferral);

apiRouter.get('/notifications', adminController.getNotifications);
apiRouter.put('/notifications/:id/read', adminController.markNotificationRead);
apiRouter.post('/demo/reset', adminController.resetDemo);
apiRouter.get('/tests/run', adminController.runTests);

export default apiRouter;
