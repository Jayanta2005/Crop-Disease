import { Router } from 'express';
import { sensorController } from '../controllers/sensorController';
import { validateSensorUpdate } from '../middleware/validation';

const router = Router();

router.get('/list', sensorController.getList);
router.post('/data', validateSensorUpdate, sensorController.updateData);
router.post('/traps', sensorController.recordTrap);

export default router;
