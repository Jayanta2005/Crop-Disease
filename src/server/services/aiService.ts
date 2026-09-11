import { 
  IVisionModelProvider, 
  StructuredAIDiagnosis, 
  VisionPredictionParams 
} from './vision/types';
import { geminiVisionProvider } from './vision/providers/geminiVisionProvider';
import { agronomicFallbackProvider } from './vision/providers/agronomicFallbackProvider';
import { validateCropImage } from './vision/imageValidator';
import { parseAndSanitizeModelOutput } from './vision/responseSanitizer';
import { progressionService } from './vision/diagnosisProgressionService';
import { repository } from '../data/repository';
import { CROPS } from '../../data/mockData';

export type AIDiagnosisResult = StructuredAIDiagnosis;

export class AIService {
  private primaryProvider: IVisionModelProvider;
  private fallbackProvider: IVisionModelProvider;

  constructor(
    primaryProvider: IVisionModelProvider = geminiVisionProvider,
    fallbackProvider: IVisionModelProvider = agronomicFallbackProvider
  ) {
    this.primaryProvider = primaryProvider;
    this.fallbackProvider = fallbackProvider;
  }

  public isAvailable(): boolean {
    return this.primaryProvider.isAvailable();
  }

  /**
   * Main AI crop-disease diagnosis pipeline:
   * 1. Validates image quality, format, and size
   * 2. Executes multimodal vision inference with timeout & error guards
   * 3. Sanitizes and validates model response into structured schema
   * 4. Enforces confidence thresholds & uncertainty labeling
   * 5. Computes disease progression against previous plot diagnoses
   */
  public async predictCropDisease(
    cropId: string,
    imageBase64?: string,
    cropStage?: string,
    farmId?: string,
    farmerId?: string
  ): Promise<StructuredAIDiagnosis> {
    const crop = CROPS.find(c => c.id === cropId) || CROPS[0];
    let rawResult: any = null;
    let providerUsed = this.fallbackProvider.name;

    // 1. Image Quality Validation
    let validatedImage: { mimeType?: string; rawBase64?: string } = {};
    if (imageBase64) {
      const validation = validateCropImage(imageBase64);
      if (!validation.isValid) {
        // Fast failure: invalid format, corrupt data, or excessive size
        throw new Error(validation.errorMessage || 'Invalid image payload');
      }
      validatedImage = {
        mimeType: validation.mimeType,
        rawBase64: validation.rawBase64
      };
    }

    // 2. Vision Provider Execution
    const visionParams: VisionPredictionParams = {
      cropId: crop.id,
      cropName: crop.name,
      cropStage: cropStage || crop.stages?.[1] || 'Vegetative',
      mimeType: validatedImage.mimeType,
      rawBase64: validatedImage.rawBase64,
      farmId,
      farmerId
    };

    if (validatedImage.rawBase64 && this.primaryProvider.isAvailable()) {
      try {
        rawResult = await this.primaryProvider.analyzeLeafImage(visionParams);
        providerUsed = this.primaryProvider.name;
      } catch (primaryErr: any) {
        // Safe logging without exposing sensitive data, keys, or image blobs
        console.warn(
          `[AIService] Primary vision provider (${this.primaryProvider.name}) failed or timed out. Engaging agronomic fallback engine. Cause:`,
          primaryErr instanceof Error ? primaryErr.message : 'Unknown error'
        );
      }
    }

    // Fallback if primary vision was not executed or encountered an error
    if (!rawResult) {
      rawResult = await this.fallbackProvider.analyzeLeafImage(visionParams);
      providerUsed = this.fallbackProvider.name;
    }

    // 3. Response Validation and Sanitization
    const sanitized = parseAndSanitizeModelOutput(
      rawResult,
      crop.id,
      cropStage || crop.stages?.[1],
      providerUsed
    );

    // 4. Progression Comparison Against Historical Diagnoses
    try {
      // Find previous diagnoses for this farm/farmer/crop
      const currentUser = await repository.getCurrentUser();
      const targetFarmerId = farmerId || currentUser?.id;
      const historyFilter = targetFarmerId
        ? { farmerId: targetFarmerId, cropId: crop.id, farmId }
        : { cropId: crop.id, farmId };

      const previousScans = await repository.getDiagnoses(historyFilter);
      const progression = progressionService.evaluateProgression(
        sanitized.severity,
        new Date(),
        previousScans
      );

      sanitized.progressionAnalysis = progression;
    } catch (historyErr) {
      console.warn('[AIService] Failed to evaluate historical progression:', historyErr);
    }

    return sanitized;
  }
}

export const aiService = new AIService();
