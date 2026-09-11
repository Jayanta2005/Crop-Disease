import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { validateAIPredict } from '../middleware/validation';
import { aiInferenceLimiter } from '../middleware/rateLimiter';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.post('/predict', aiInferenceLimiter, validateAIPredict, aiController.predict);

export default router;
