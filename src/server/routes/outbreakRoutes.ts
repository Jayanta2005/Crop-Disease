import { Router } from 'express';
import { outbreakController } from '../controllers/outbreakController';

const router = Router();

// /api/outbreak
router.get('/', outbreakController.getHotspots);
router.get('/hotspots', outbreakController.getHotspots);
router.get('/map', outbreakController.getMapData);
router.get('/nearby', outbreakController.getNearby);
router.get('/summary', outbreakController.getSummary);
router.get('/trends', outbreakController.getTrends);
router.get('/intelligence', outbreakController.getIntelligence);
router.post('/report', outbreakController.createReport);
router.post('/', outbreakController.createReport);

export default router;
