import { Router } from 'express';
import { riskController } from '../controllers/riskController';
import { validateRiskCalculation } from '../middleware/validation';
import { aiInferenceLimiter } from '../middleware/rateLimiter';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

// /api/risk
router.get('/', riskController.getRisk);
router.get('/current', riskController.getCurrentRisk);
router.post('/calculate', aiInferenceLimiter, validateRiskCalculation, riskController.calculateCustom);
router.get('/forecast', riskController.getForecast);
router.post('/forecast', riskController.getForecast);
router.get('/factors', riskController.getFactors);
router.get('/history', riskController.getHistory);
router.get('/weather', riskController.getCurrentWeather);

export default router;
