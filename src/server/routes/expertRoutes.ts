import { Router } from 'express';
import { expertController } from '../controllers/expertController';
import { authenticateUser, requireRole, authorizeCaseAccess } from '../middleware/auth';

const router = Router();

// Apply base authentication context
router.use(authenticateUser);

// ============================================================================
// KVK & Expert Case Management Endpoints
// ============================================================================

// Create case (Farmer, Extension Worker, or automated triage)
router.post('/cases', authorizeCaseAccess('create'), expertController.createCase);

// List cases (supports ?status=PENDING_REVIEW etc.)
router.get('/cases', expertController.listCases);

// List pending cases for KVK agronomist triage
router.get(
  '/cases/pending',
  requireRole(['EXPERT', 'EXTENSION_WORKER', 'LAB_STAFF', 'ADMIN']),
  expertController.listPendingCases
);

// Agreement metrics between AI diagnosis and agronomist verdicts
router.get(
  '/cases/metrics/agreement',
  requireRole(['EXPERT', 'ADMIN', 'LAB_STAFF']),
  expertController.getAgreementMetrics
);
router.get(
  '/metrics',
  requireRole(['EXPERT', 'ADMIN', 'LAB_STAFF']),
  expertController.getAgreementMetrics
);

// Retrieve single case details
router.get('/cases/:id', authorizeCaseAccess('view'), expertController.getCase);

// Assign case to an expert agronomist
router.post(
  '/cases/:id/assign',
  requireRole(['EXPERT', 'ADMIN']),
  expertController.assignCase
);

// Submit expert diagnosis decision (Confirm, Correct, Refer to Lab)
router.post(
  '/cases/:id/decision',
  requireRole(['EXPERT', 'ADMIN', 'LAB_STAFF']),
  expertController.updateDecision
);
router.put(
  '/cases/:id/decision',
  requireRole(['EXPERT', 'ADMIN', 'LAB_STAFF']),
  expertController.updateDecision
);

// Close and resolve an expert case
router.post(
  '/cases/:id/close',
  requireRole(['EXPERT', 'ADMIN']),
  expertController.closeCase
);

// ============================================================================
// Legacy compatibility endpoints
// ============================================================================
router.post('/request', expertController.requestReview);
router.post('/review/:id', requireRole(['EXPERT', 'ADMIN', 'LAB_STAFF']), expertController.submitReview);
router.get('/tasks', expertController.getExtensionTasks);
router.post('/visit', requireRole(['EXTENSION_WORKER', 'EXPERT', 'ADMIN']), expertController.recordFieldVisit);
router.get('/labs', requireRole(['LAB_STAFF', 'EXPERT', 'ADMIN']), expertController.getLabReferrals);
router.put('/lab/:id', requireRole(['LAB_STAFF', 'ADMIN']), expertController.updateLabReferral);

export default router;
