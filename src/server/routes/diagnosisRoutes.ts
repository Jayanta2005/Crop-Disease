import { Router } from 'express';
import { diagnosisController } from '../controllers/diagnosisController';
import { expertController } from '../controllers/expertController';
import { validateDiagnosisCreate, validateExpertReview } from '../middleware/validation';
import { authenticateUser, authorizeDiagnosisAccess, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

// /api/diagnosis
router.post('/', validateDiagnosisCreate, diagnosisController.create);
router.get('/history', diagnosisController.getHistory);
router.get('/:id', authorizeDiagnosisAccess, diagnosisController.getById);
router.get('/:id/compare', authorizeDiagnosisAccess, diagnosisController.compare);
router.post(
  '/:id/expert-review',
  requireRole(['EXPERT', 'ADMIN', 'LAB_STAFF']),
  validateExpertReview,
  expertController.submitReview
);

export default router;
