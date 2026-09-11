import { Router } from 'express';
import { advisoryController } from '../controllers/advisoryController';

const router = Router();

// POST /api/advisory/generate - Full 4-pillar structured advisory
router.post('/generate', advisoryController.generateComprehensiveAdvisory);

// GET /api/advisory/:cropId?disease=...
router.get('/:cropId', advisoryController.getAdvisory);

export default router;
