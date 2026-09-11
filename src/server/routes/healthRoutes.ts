import { Router } from 'express';
import { healthController } from '../controllers/healthController';

const router = Router();

router.get('/health', healthController.getHealth);
router.get('/system/status', healthController.getSystemStatus);

export default router;
