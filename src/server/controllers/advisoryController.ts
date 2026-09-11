import { Request, Response, NextFunction } from 'express';
import { advisoryService } from '../services/advisoryService';
import { sendSuccess, sendError } from '../utils/response';

export const advisoryController = {
  /**
   * Generates a comprehensive agricultural advisory with the 4 core pillars
   */
  generateComprehensiveAdvisory: (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        cropId,
        cropName,
        cropStage,
        diagnosis,
        severity,
        riskScore,
        environmentalFactors,
        outbreakInfo
      } = req.body;

      if (!cropId || !diagnosis) {
        return sendError(res, 'cropId and diagnosis are required in advisory request body', 400);
      }

      const advisory = advisoryService.generateComprehensiveAdvisory({
        cropId,
        cropName,
        cropStage,
        diagnosis,
        severity,
        riskScore: riskScore !== undefined ? Number(riskScore) : undefined,
        environmentalFactors,
        outbreakInfo
      });

      return sendSuccess(res, advisory, 'Structured 4-pillar agricultural advisory generated', 200, {
        crop: advisory.cropName,
        diagnosis: advisory.diagnosis,
        severity: advisory.severity,
        isChemicalApproved: advisory.approvedTreatmentGuidance.isChemicalRecommended
      });
    } catch (err: any) {
      console.error('[AdvisoryController] Error generating advisory:', err);
      return sendError(res, 'Failed to generate agricultural advisory', 500, err);
    }
  },

  /**
   * Retrieves advisory by cropId and disease query parameter (supports legacy GET)
   */
  getAdvisory: (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cropId } = req.params;
      const diseaseName = (req.query.disease as string) || (req.query.diagnosis as string) || 'Blast';
      const cropStage = req.query.stage as string | undefined;
      const severity = (req.query.severity as any) || 'MODERATE';
      const riskScore = req.query.riskScore ? Number(req.query.riskScore) : 60;

      const advisory = advisoryService.generateComprehensiveAdvisory({
        cropId,
        cropStage,
        diagnosis: diseaseName,
        severity,
        riskScore,
        environmentalFactors: {
          temperatureC: req.query.temp ? Number(req.query.temp) : undefined,
          humidityPercent: req.query.humidity ? Number(req.query.humidity) : undefined,
          rainfallMm: req.query.rainfall ? Number(req.query.rainfall) : undefined
        }
      });

      return sendSuccess(res, advisory, 'Agricultural IPM advisory retrieved', 200, {
        advisory
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve advisory', 500, err);
    }
  }
};
