import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { validateCropImage } from '../services/vision/imageValidator';

/**
 * Validates AI Crop Disease Prediction payload
 */
export function validateAIPredict(req: Request, res: Response, next: NextFunction) {
  const { cropId, imageBase64 } = req.body;

  if (!cropId || typeof cropId !== 'string') {
    return sendError(res, 'Validation Error: cropId is required and must be a string', 400);
  }

  if (imageBase64 !== undefined) {
    if (typeof imageBase64 !== 'string') {
      return sendError(res, 'Validation Error: imageBase64 must be a string data URI or base64 payload', 400);
    }
    const validation = validateCropImage(imageBase64);
    if (!validation.isValid) {
      return sendError(res, `Validation Error: ${validation.errorMessage}`, 400);
    }
  }

  next();
}

/**
 * Validates Diagnosis Persistence payload
 */
export function validateDiagnosisCreate(req: Request, res: Response, next: NextFunction) {
  const { cropId, aiPrediction, primaryDiagnosis } = req.body;

  if (!cropId || typeof cropId !== 'string') {
    return sendError(res, 'Validation Error: cropId is required', 400);
  }

  const prediction = primaryDiagnosis || aiPrediction;
  if (!prediction || typeof prediction !== 'string') {
    return sendError(res, 'Validation Error: primaryDiagnosis or aiPrediction is required', 400);
  }

  next();
}

/**
 * Validates Risk Calculation payload
 */
export function validateRiskCalculation(req: Request, res: Response, next: NextFunction) {
  const body = req.body;
  const cropId = body.cropId || req.query.cropId;

  if (!cropId || typeof cropId !== 'string') {
    return sendError(res, 'Validation Error: cropId is required', 400);
  }

  // Validate numeric fields if present in POST body
  const numericFields = ['temperatureC', 'humidityPercent', 'rainfallMm', 'windSpeedKmph', 'nearbyConfirmedCasesCount', 'recentTrapCount', 'trapThreshold'];
  for (const field of numericFields) {
    if (body[field] !== undefined && isNaN(Number(body[field]))) {
      return sendError(res, `Validation Error: ${field} must be a valid number`, 400);
    }
  }

  next();
}

/**
 * Validates Expert Review action
 */
export function validateExpertReview(req: Request, res: Response, next: NextFunction) {
  const { action, expertPrediction } = req.body;
  const validActions = ['CONFIRM_AI', 'CORRECT_DIAGNOSIS', 'REFER_TO_LAB', 'UNCERTAIN'];

  if (!action || !validActions.includes(action)) {
    return sendError(
      res,
      `Validation Error: action must be one of [${validActions.join(', ')}]`,
      400
    );
  }

  if (action === 'CORRECT_DIAGNOSIS' && (!expertPrediction || typeof expertPrediction !== 'string')) {
    return sendError(
      res,
      'Validation Error: expertPrediction is required when action is CORRECT_DIAGNOSIS',
      400
    );
  }

  next();
}

/**
 * Validates IoT Sensor telemetry update
 */
export function validateSensorUpdate(req: Request, res: Response, next: NextFunction) {
  const { deviceId, value } = req.body;

  if (!deviceId || typeof deviceId !== 'string') {
    return sendError(res, 'Validation Error: deviceId is required', 400);
  }

  if (value === undefined || isNaN(Number(value))) {
    return sendError(res, 'Validation Error: numeric value is required for sensor data ingestion', 400);
  }

  next();
}

/**
 * Validates Offline Sync payload
 */
export function validateOfflineSync(req: Request, res: Response, next: NextFunction) {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return sendError(res, 'Validation Error: items must be an array of offline queue items', 400);
  }

  next();
}
