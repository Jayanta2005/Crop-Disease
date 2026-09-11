import { ConfidenceLevel, SeverityLevel } from '../../../types';

export type DiseaseOrPestType = 
  | 'DISEASE' 
  | 'PEST' 
  | 'PHYSIOLOGICAL_DISORDER' 
  | 'NUTRIENT_DEFICIENCY' 
  | 'HEALTHY';

export type ProgressionTrend = 'IMPROVING' | 'STABLE' | 'INCREASING' | 'BASELINE';
export type SeverityChange = 'DECREASED' | 'SAME' | 'INCREASED' | 'NONE';

export interface VisionPredictionParams {
  cropId: string;
  cropName?: string;
  cropStage?: string;
  imageBase64?: string;
  mimeType?: string;
  rawBase64?: string;
  farmId?: string;
  farmerId?: string;
}

export interface RawVisionDiagnosis {
  prediction?: string;
  primaryDiagnosis?: string;
  cropStage?: string;
  diseaseOrPestType?: DiseaseOrPestType | string;
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
  severity?: SeverityLevel | string;
  affectedLeafAreaPercent?: string;
  symptoms?: string[];
  visualSymptoms?: string[];
  alternativePredictions?: { name: string; confidence: number; reasoning?: string }[];
  alternativeDiagnoses?: { name: string; confidence: number; reasoning?: string }[];
  whyAiThinksThis?: {
    lesionColor?: string;
    lesionShape?: string;
    lesionPattern?: string;
    affectedArea?: string;
    summary?: string;
  };
  visualObservations?: string[];
  recommendedNextScanHours?: number;
  recommendation?: string;
  requires_expert_review?: boolean;
  isExpertReviewRecommended?: boolean;
}

export interface IVisionModelProvider {
  readonly name: string;
  isAvailable(): boolean;
  analyzeLeafImage(params: VisionPredictionParams): Promise<RawVisionDiagnosis>;
}

export interface ImageValidationResult {
  isValid: boolean;
  errorMessage?: string;
  mimeType?: string;
  rawBase64?: string;
  sizeBytes?: number;
}

export interface ProgressionAnalysisResult {
  progression: ProgressionTrend;
  severityTrend: SeverityChange;
  previousDiagnosisId?: string;
  previousScanDate?: string;
  previousSeverity?: SeverityLevel;
  currentSeverity: SeverityLevel;
  daysBetweenScans?: number;
  details: string;
}

export interface StructuredAIDiagnosis {
  // Primary tracking
  diagnosisId: string;
  timestamp: string;

  // Crop metadata
  crop: string;
  cropId: string;
  cropStage: string;

  // Core diagnosis
  primaryDiagnosis: string;
  diseaseOrPestType: DiseaseOrPestType;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  isUncertain: boolean;
  uncertaintyReason?: string;
  severity: SeverityLevel;

  // Visual symptoms & reasoning
  visualSymptoms: string[];
  affectedLeafAreaPercent: string;
  whyAiThinksThis: {
    lesionColor: string;
    lesionShape: string;
    lesionPattern: string;
    affectedArea: string;
    summary: string;
  };
  visualObservations: string[];

  // Alternative differential diagnoses
  alternativeDiagnoses: { name: string; confidence: number; reasoning?: string }[];
  recommendedNextScanHours: number;
  isExpertReviewRecommended: boolean;
  recommendation: string;

  // Integrated Pest Management
  ipmAdvisory: any;
  provider: string;

  // Historical progression analysis
  progressionAnalysis?: ProgressionAnalysisResult;

  // Backward-compatibility aliases for existing frontend callers
  prediction: string;
  symptoms: string[];
  alternative_predictions: { name: string; confidence: number; reasoning?: string }[];
  requires_expert_review: boolean;
}
