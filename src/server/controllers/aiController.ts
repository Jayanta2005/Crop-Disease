import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService';
import { sendSuccess, sendError } from '../utils/response';

export const aiController = {
  predict: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cropId, imageBase64, cropStage, farmId, farmerId } = req.body;
      const result = await aiService.predictCropDisease(
        cropId,
        imageBase64,
        cropStage,
        farmId,
        farmerId
      );

      // Return consistent ApiResponse with top-level fields for full backward compatibility
      return sendSuccess(
        res,
        result,
        'AI Diagnosis completed successfully',
        200,
        {
          diagnosisId: result.diagnosisId,
          timestamp: result.timestamp,
          crop: result.crop,
          cropId: result.cropId,
          cropStage: result.cropStage,
          primaryDiagnosis: result.primaryDiagnosis,
          diseaseOrPestType: result.diseaseOrPestType,
          confidence: result.confidence,
          confidenceLevel: result.confidenceLevel,
          isUncertain: result.isUncertain,
          uncertaintyReason: result.uncertaintyReason,
          severity: result.severity,
          visualSymptoms: result.visualSymptoms,
          affectedLeafAreaPercent: result.affectedLeafAreaPercent,
          whyAiThinksThis: result.whyAiThinksThis,
          visualObservations: result.visualObservations,
          alternativeDiagnoses: result.alternativeDiagnoses,
          recommendedNextScanHours: result.recommendedNextScanHours,
          isExpertReviewRecommended: result.isExpertReviewRecommended,
          recommendation: result.recommendation,
          ipmAdvisory: result.ipmAdvisory,
          provider: result.provider,
          progressionAnalysis: result.progressionAnalysis,

          // Legacy aliases for existing frontend components
          prediction: result.prediction,
          symptoms: result.symptoms,
          alternative_predictions: result.alternative_predictions,
          requires_expert_review: result.requires_expert_review
        }
      );
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Crop disease prediction failed';
      const isValidationError = 
        message.includes('Unsupported image format') ||
        message.includes('Image size') ||
        message.includes('Image payload is too small') ||
        message.includes('Invalid image') ||
        message.includes('invalid base64');

      const statusCode = isValidationError ? 400 : 500;
      return sendError(res, message, statusCode, err);
    }
  }
};
