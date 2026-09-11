import { Request, Response, NextFunction } from 'express';
import { expertService } from '../services/expertService';
import { expertCaseService, ExpertCaseStatus } from '../services/expertCaseService';
import { sendSuccess, sendError } from '../utils/response';

export const expertController = {
  // =========================================================================
  // KVK & Expert Case Management APIs
  // =========================================================================

  /**
   * Creates a new KVK expert review case
   */
  createCase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const {
        farmerId,
        farmerName,
        farmerPhone,
        farmId,
        fieldReference,
        crop,
        cropId,
        cropStage,
        imageRef,
        imageUrl,
        aiDiagnosis,
        confidence,
        severity,
        riskScore,
        environmentalFactors,
        approximateLocation,
        farmerDescription,
        diagnosisId
      } = req.body;

      if (!aiDiagnosis) {
        return sendError(res, 'aiDiagnosis is required to initiate an expert case', 400);
      }

      const newCase = await expertCaseService.createCase(
        {
          farmerId: farmerId || user?.id || 'farmer-01',
          farmerName: farmerName || user?.name || 'Farmer',
          farmerPhone,
          farmId: farmId || 'farm-01',
          fieldReference,
          crop: crop || 'Rice',
          cropId,
          cropStage,
          imageRef,
          imageUrl,
          aiDiagnosis,
          confidence: Number(confidence) || 0.85,
          severity,
          riskScore,
          environmentalFactors,
          approximateLocation,
          farmerDescription,
          diagnosisId
        },
        user ? { id: user.id, name: user.name, role: user.role } : undefined
      );

      return sendSuccess(res, newCase, 'Case successfully registered in KVK diagnostic queue', 201, {
        caseId: newCase.caseId,
        status: newCase.status
      });
    } catch (err: any) {
      console.error('[ExpertController] Error creating case:', err);
      return sendError(res, 'Failed to create expert case', 500, err);
    }
  },

  /**
   * Retrieves a single case by caseId
   */
  getCase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const caseItem = expertCaseService.getCaseById(id);

      if (!caseItem) {
        return sendError(res, `Case '${id}' not found`, 404);
      }

      return sendSuccess(res, caseItem, 'Expert case details retrieved', 200, {
        case: caseItem
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve expert case', 500, err);
    }
  },

  /**
   * Lists cases with optional filtering by status, expertId, farmerId, cropId, severity
   */
  listCases: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, assignedExpertId, farmerId, cropId, severity } = req.query;

      // If authenticated user is a farmer and didn't specify farmerId, enforce own farmerId
      let targetFarmerId = farmerId as string | undefined;
      if (req.user?.role === 'FARMER') {
        targetFarmerId = req.user.id;
      }

      const cases = expertCaseService.listCases({
        status: status as ExpertCaseStatus,
        assignedExpertId: assignedExpertId as string,
        farmerId: targetFarmerId,
        cropId: cropId as string,
        severity: severity as string
      });

      return sendSuccess(res, cases, `Retrieved ${cases.length} expert cases`, 200, {
        cases,
        total: cases.length
      });
    } catch (err: any) {
      return sendError(res, 'Failed to list expert cases', 500, err);
    }
  },

  /**
   * Lists pending cases for agronomist triage
   */
  listPendingCases: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pending = expertCaseService.listPendingCases();
      return sendSuccess(res, pending, `Found ${pending.length} pending cases requiring expert triage`, 200, {
        cases: pending,
        count: pending.length
      });
    } catch (err: any) {
      return sendError(res, 'Failed to list pending cases', 500, err);
    }
  },

  /**
   * Assigns a case to an expert agronomist
   */
  assignCase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { expertId, expertName } = req.body;

      const targetExpertId = expertId || user?.id || 'expert-01';
      const targetExpertName = expertName || user?.name || 'KVK Senior Pathologist';

      const actor = user
        ? { id: user.id, name: user.name, role: user.role }
        : { id: targetExpertId, name: targetExpertName, role: 'EXPERT' };

      const updated = expertCaseService.assignCase(id, targetExpertId, targetExpertName, actor);

      return sendSuccess(res, updated, `Case assigned to ${targetExpertName}`, 200, {
        case: updated
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to assign case', 400, err);
    }
  },

  /**
   * Updates expert decision (Confirm, Correct, Refer to Lab)
   * Preserves expertFinalDiagnosis separately from original aiDiagnosis.
   */
  updateDecision: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { decision, expertFinalDiagnosis, expertNotes, recommendedActionPlan, followUpDays } = req.body;

      if (!decision) {
        return sendError(res, 'Field "decision" is required (CONFIRM_AI, CORRECT_DIAGNOSIS, MARK_UNCERTAIN, REFER_TO_LAB)', 400);
      }

      const actor = user
        ? { id: user.id, name: user.name, role: user.role }
        : { id: 'expert-01', name: 'KVK Expert', role: 'EXPERT' };

      const updated = expertCaseService.updateExpertDecision(
        id,
        {
          decision,
          expertFinalDiagnosis,
          expertNotes: expertNotes || 'Agronomist verification completed.',
          recommendedActionPlan,
          followUpDays: Number(followUpDays) || 5
        },
        actor
      );

      return sendSuccess(res, updated, `Expert determination recorded: ${decision}`, 200, {
        case: updated
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update expert decision', 400, err);
    }
  },

  /**
   * Closes / resolves an expert case
   */
  closeCase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { resolutionSummary } = req.body;

      const actor = user
        ? { id: user.id, name: user.name, role: user.role }
        : { id: 'expert-01', name: 'KVK Pathologist', role: 'EXPERT' };

      const updated = expertCaseService.closeCase(
        id,
        resolutionSummary || 'Case marked resolved following field treatment execution and farmer confirmation.',
        actor
      );

      return sendSuccess(res, updated, 'Case successfully closed and resolved', 200, {
        case: updated
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to close case', 400, err);
    }
  },

  /**
   * AI-vs-Expert agreement metrics API
   */
  getAgreementMetrics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = expertCaseService.getAgreementMetrics();
      return sendSuccess(res, metrics, 'AI-Expert agreement metrics calculated', 200, metrics);
    } catch (err: any) {
      return sendError(res, 'Failed to compute agreement metrics', 500, err);
    }
  },

  // =========================================================================
  // Legacy / Backward Compatibility Handlers
  // =========================================================================

  requestReview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await expertService.requestExpertReview(req.body);
      return sendSuccess(res, result, 'Case forwarded to district KVK agronomist', 200, {
        caseNumber: result.caseNumber,
        assignedOfficer: result.assignedOfficer,
        taskId: result.taskId
      });
    } catch (err: any) {
      return sendError(res, 'Failed to request expert review', 500, err);
    }
  },

  submitReview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { action, expertPrediction, expertNotes, followUpDate } = req.body;

      const updated = await expertService.reviewDiagnosis(id, {
        action,
        expertPrediction,
        expertNotes,
        followUpDate
      });

      return sendSuccess(res, updated, 'Expert review determination saved', 200, {
        diagnosis: updated
      });
    } catch (err: any) {
      return sendError(res, 'Failed to process expert review', 500, err);
    }
  },

  getExtensionTasks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, priority } = req.query;
      const tasks = await expertService.getExtensionTasks({
        status: status as string,
        priority: priority as string
      });

      return sendSuccess(res, tasks, 'Extension task queue retrieved', 200, {
        tasks
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve extension tasks', 500, err);
    }
  },

  recordFieldVisit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId, observations, referToLab } = req.body;
      const task = await expertService.recordFieldVisit({
        taskId,
        observations,
        referToLab
      });

      return sendSuccess(res, task, 'Field visit observations recorded', 200, {
        task
      });
    } catch (err: any) {
      return sendError(res, 'Failed to record field visit', 500, err);
    }
  },

  getLabReferrals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const referrals = await expertService.getLabReferrals();
      return sendSuccess(res, referrals, 'Laboratory referrals retrieved', 200, {
        referrals
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve lab referrals', 500, err);
    }
  },

  updateLabReferral: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, labResult, testedBy } = req.body;
      const ref = await expertService.updateLabReferral(id, {
        status,
        labResult,
        testedBy
      });

      return sendSuccess(res, ref, 'Laboratory referral status updated', 200, {
        referral: ref
      });
    } catch (err: any) {
      return sendError(res, 'Failed to update lab referral', 500, err);
    }
  }
};
