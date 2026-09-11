/**
 * CropGuard AI - Core Domain Types
 */

export type UserRole = 'FARMER' | 'EXTENSION_WORKER' | 'EXPERT' | 'LAB_STAFF' | 'ADMIN';

// All 22 official Eighth Schedule regional languages of the Republic of India + English
export type LanguageCode =
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'bn' // Bengali (বাংলা)
  | 'te' // Telugu (తెలుగు)
  | 'mr' // Marathi (मराठी)
  | 'ta' // Tamil (தமிழ்)
  | 'ur' // Urdu (اُردُو)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'as' // Assamese (অসমীয়া)
  | 'mai' // Maithili (मैथिली)
  | 'sat' // Santali (ᱥᱟᱱᱛᱟᱲᱤ)
  | 'ks' // Kashmiri (کٲشُر)
  | 'ne' // Nepali (नेपाली)
  | 'kok' // Konkani (कोंकणी)
  | 'sd' // Sindhi (سنڌي)
  | 'doi' // Dogri (डोगरी)
  | 'mni' // Manipuri / Meitei (মৈতৈলোন্)
  | 'brx' // Bodo (बड़ो)
  | 'sa'; // Sanskrit (संस्कृतम्)

export type NetworkMode = 'ONLINE' | 'WEAK_2G' | 'OFFLINE';

export interface DataCompressionStats {
  originalBytes: number;
  compressedBytes: number;
  ratioPercent: number;
  format: string;
  resolution: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  state: string;
  district: string;
  village?: string;
  language: LanguageCode;
  avatarUrl?: string;
}

export interface Crop {
  id: string;
  name: string;
  hindiName: string;
  bengaliName: string;
  category: 'Cereal' | 'Pulse' | 'Cash' | 'Oilseed' | 'Vegetable' | 'Fruit';
  stages: string[];
  icon: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  areaAcres: number;
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  soilType: string;
  currentCropId: string;
  cropStage: string;
  sowingDate: string;
}

export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface DiseasePrediction {
  diseaseId: string;
  diseaseName: string;
  scientificName?: string;
  confidence: number; // 0 to 1
  confidenceLevel: ConfidenceLevel; // >=0.85 High, 0.60-0.84 Moderate, <0.60 Low
  severity: SeverityLevel;
  affectedPart: 'Leaf' | 'Stem' | 'Root' | 'Fruit' | 'Panicle';
  symptoms: string[];
  alternativePredictions: {
    name: string;
    confidence: number;
  }[];
  requiresExpertReview: boolean;
}

export interface AdvisoryItem {
  action: string;
  why: string;
  timeOfDay?: string;
  type?: 'CULTURAL' | 'BIOLOGICAL' | 'MECHANICAL' | 'SANITATION' | 'MONITORING';
  etlThreshold?: string;
}

export interface ApprovedChemicalTreatment {
  chemicalName: string;
  tradeNames: string[];
  dosage: string;
  waterVolume: string;
  applicationMethod?: string;
  timing?: string;
  why?: string;
  waitingPeriodDays: number;
  safetyEquipment: string[];
  restrictions: string;
  cibrcApproved: boolean;
  officialAdherenceNote?: string;
}

export interface CategorizedAdvisory {
  immediateActions: AdvisoryItem[];
  monitoringSteps: AdvisoryItem[];
  preventiveNonChemical: AdvisoryItem[];
  approvedTreatmentGuidance: ApprovedChemicalTreatment[];
  todaysActionPlan: {
    priority: 'URGENT' | 'HIGH' | 'RECOMMENDED' | 'FIELD_CARE';
    timeOfDay: string;
    title: string;
    instruction: string;
    why: string;
  }[];
}

export interface IPMActions {
  prevention: string[];
  cultural: string[];
  mechanical: string[];
  biological: string[];
  monitoring: string[];
  chemical: {
    chemicalName: string;
    tradeNames: string[];
    dosage: string;
    waterVolume: string;
    applicationMethod: string;
    waitingPeriodDays: number;
    safetyEquipment: string[];
    restrictions: string;
    cibrcApproved: boolean;
    timing?: string;
    why?: string;
  }[];
  categorized?: CategorizedAdvisory;
}

export interface DiagnosisRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmId: string;
  cropId: string;
  cropName: string;
  cropStage: string;
  imageUrl: string;
  thumbnailUrl?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  timestamp: string;
  
  // AI Results
  aiPrediction: string;
  aiConfidence: number;
  aiConfidenceLevel: ConfidenceLevel;
  aiSeverity: SeverityLevel;
  aiSymptoms: string[];
  alternativePredictions: { name: string; confidence: number }[];
  affectedLeafAreaPercent?: string;
  whyAiThinksThis?: {
    lesionColor: string;
    lesionShape: string;
    lesionPattern: string;
    affectedArea: string;
    summary?: string;
  };
  visualObservations?: string[];
  recommendedNextScanHours?: number;
  diseaseProgression?: 'IMPROVING' | 'STABLE' | 'INCREASING' | 'BASELINE';
  progressionDetails?: string;
  
  // Expert Verification
  verificationStatus: 'PENDING' | 'CONFIRMED' | 'CORRECTED' | 'UNCERTAIN' | 'LAB_REFERRED';
  expertPrediction?: string;
  expertNotes?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewTimestamp?: string;
  
  // Final Diagnosis
  finalDiagnosis: string;
  ipmAdvisory: IPMActions;
  
  // Lab linkage
  labReferralId?: string;
  
  // Follow-up
  followUpDate?: string;
  followUpNotes?: string;
  followUpStatus?: 'PENDING' | 'VISITED' | 'RESOLVED';
  
  // Synchronisation
  syncStatus?: 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'FAILED';
}

export interface WeatherInfo {
  temperatureC: number;
  humidityPercent: number;
  rainfallMm: number;
  windSpeedKmph: number;
  condition: string;
  icon: string;
  forecast3Day: {
    day: string;
    tempMax: number;
    tempMin: number;
    humidity: number;
    rainProb: number;
    riskScore: number;
  }[];
}

export type WeatherData = WeatherInfo;

export interface RiskFactorDetail {
  factor: string;
  impact: 'FAVORABLE' | 'NEUTRAL' | 'UNFAVORABLE' | 'UNAVAILABLE';
  description: string;
  value?: string;
  isObserved?: boolean;
  status?: 'MEASURED' | 'ESTIMATED' | 'UNAVAILABLE';
  sourceType?: 'OBSERVED_SENSOR' | 'OBSERVED_TRAP' | 'OBSERVED_FIELD' | 'FORECAST_WEATHER' | 'AGRONOMIC_MODEL' | 'UNAVAILABLE';
  weight?: number;
  scoreContribution?: number;
}

export interface RiskAssessment {
  cropId: string;
  cropName: string;
  cropStage: string;
  diseaseRiskScore: number; // 0 - 100
  pestRiskScore: number; // 0 - 100
  diseaseRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  pestRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  primaryThreats: {
    name: string;
    type: 'DISEASE' | 'PEST';
    riskScore: number;
    favoredBy: string;
  }[];
  riskFactors: RiskFactorDetail[];
  preventiveAdvice: string[];
  calculationRulesApplied: string[];
  appliedRules?: string[];

  // Enhanced early-warning & forecast fields
  explanation?: string;
  recommendedMonitoringInterval?: string;
  dataCompletenessPercent?: number;
  missingFactors?: string[];
  whyIsMyCropAtRisk?: string;
  farmerFriendlySummary?: string;
  riskTrend24h?: 'INCREASING' | 'STABLE' | 'DECREASING';
  forecast24hScore?: number;
  forecast48hScore?: number;
  environmentalDiagnosisLink?: {
    hasDiagnosisInoculum: boolean;
    hasFavorableMicroclimate: boolean;
    hasNearbyOutbreak: boolean;
    diagnosisName?: string;
    synthesis: string;
  };
  timelineHistory?: {
    timeLabel: string;
    score: number;
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    isForecast: boolean;
    triggerEvent: string;
  }[];
}

export interface HotspotPoint {
  id: string;
  caseId: string;
  latitude: number;
  longitude: number;
  fuzzedLatitude?: number;
  fuzzedLongitude?: number;
  locationName: string;
  district?: string;
  state?: string;
  crop: string;
  diseaseOrPest: string;
  type: 'DISEASE' | 'PEST';
  severity: SeverityLevel;
  date: string;
  timestamp?: string;
  confidence: number;
  verificationStatus: 'CONFIRMED' | 'LAB_VERIFIED' | 'PRELIMINARY' | 'MONITORED';
  dataSource?: 'FARMER_AI_SCAN' | 'EXTENSION_VERIFIED' | 'KVK_SURVEILLANCE' | 'AUTOMATED_SENSOR_TRAP';
  activeCount: number;
  radiusKm: number;
  distanceKm?: number;
  containmentProtocol?: string;
  trend?: 'INCREASING' | 'STABLE' | 'CONTAINED';
  isMockData?: boolean;
}

export type DiseaseHotspot = HotspotPoint;

export interface SensorDevice {
  id: string;
  farmId: string;
  name: string;
  type: 'TEMPERATURE' | 'HUMIDITY' | 'SOIL_MOISTURE' | 'LEAF_WETNESS' | 'SMART_PEST_TRAP';
  sensorType?: string;
  unit: string;
  currentValue: number;
  batteryLevel: number;
  batteryPercent?: number;
  lastUpdated: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  thresholdAlert?: string;
}

export type SensorReading = SensorDevice;

export interface PestTrapReading {
  id?: string;
  trapId: string;
  farmId: string;
  date: string;
  crop?: string;
  location?: string;
  targetPest: string;
  count: number;
  thresholdLimit: number;
  isExceeded: boolean;
  notes?: string;
  recordedAt?: string;
}

export interface ExtensionTask {
  id: string;
  farmId: string;
  farmerId?: string;
  farmerName: string;
  farmerPhone: string;
  location: string;
  crop: string;
  suspectedIssue: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'VISITED' | 'REFERRED_TO_LAB' | 'RESOLVED';
  scheduledDate: string;
  diagnosisId: string;
  fieldNotes?: string;
  visitedAt?: string;
  inspectorName?: string;
}

export interface LabReferralCase {
  id: string;
  diagnosisId: string;
  sampleId: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  suspectedPathogen: string;
  sampleType: 'LEAF_TISSUE' | 'STEM_CUTTING' | 'SOIL_ROOT' | 'INSECT_SPECIMEN';
  collectionDate: string;
  laboratoryName: string;
  status: 'PENDING_COLLECTION' | 'RECEIVED' | 'IN_TESTING' | 'CONFIRMED' | 'INCONCLUSIVE';
  labResult?: string;
  testedBy?: string;
  resultDate?: string;
  recommendedAction?: string;
}

export interface EarlyWarningNotification {
  id: string;
  title: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO';
  reason: string;
  affectedCrop: string;
  recommendedAction: string;
  location: string;
  timestamp: string;
  isRead: boolean;
  cooldownKey: string;
}

export interface ModelMetrics {
  version: string;
  architecture: string;
  trainingDatasetVersion: string;
  totalConfirmedSamples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  expertCorrectionRate: number;
  deploymentDate: string;
  isProduction: boolean;
}

export interface OfflineQueueItem {
  id: string;
  timestamp: number;
  cropId: string;
  cropName: string;
  cropStage: string;
  imageBlobUrl: string;
  notes?: string;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'UPLOADING' | 'FAILED' | 'COMPLETED';
  errorMessage?: string;
}

export interface ImageQualityMetric {
  name: 'brightness' | 'sharpness' | 'leafPresence' | 'leafIsolation';
  label: string;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'POOR';
  score: number; // 0 - 100
  detail: string;
}

export interface ImageQualityReport {
  isAcceptable: boolean;
  overallScore: number; // 0 - 100
  rating: 'EXCELLENT' | 'GOOD' | 'BORDERLINE' | 'UNSUITABLE';
  summary: string;
  guidanceTitle?: string;
  guidanceTips: string[];
  metrics: {
    brightness: ImageQualityMetric;
    sharpness: ImageQualityMetric;
    leafPresence: ImageQualityMetric;
    leafIsolation: ImageQualityMetric;
  };
}
