import { 
  RawVisionDiagnosis, 
  StructuredAIDiagnosis, 
  DiseaseOrPestType 
} from './types';
import { ConfidenceLevel, SeverityLevel } from '../../../types';
import { CROP_DISEASE_KNOWLEDGE_BASE } from '../../../data/ipmKnowledgeBase';
import { CROPS } from '../../../data/mockData';

const VALID_SEVERITIES: Set<SeverityLevel> = new Set(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']);
const VALID_TYPES: Set<DiseaseOrPestType> = new Set([
  'DISEASE', 
  'PEST', 
  'PHYSIOLOGICAL_DISORDER', 
  'NUTRIENT_DEFICIENCY', 
  'HEALTHY'
]);

// Strip HTML tags and unsafe script characters from AI output strings
function sanitizeText(input: any, defaultValue: string = ''): string {
  if (typeof input !== 'string') return defaultValue;
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML
    .replace(/javascript:/gi, '')
    .trim() || defaultValue;
}

export function parseAndSanitizeModelOutput(
  rawOutput: string | RawVisionDiagnosis,
  cropId: string,
  providedCropStage?: string,
  providerName: string = 'gemini-vision'
): StructuredAIDiagnosis {
  let parsed: RawVisionDiagnosis = {};

  if (typeof rawOutput === 'string') {
    try {
      // Strip markdown code fences if model enclosed JSON in ```json ... ```
      let cleanJson = rawOutput.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      }
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('[ResponseSanitizer] Failed to parse raw model JSON. Constructing controlled uncertain state.');
      parsed = {
        primaryDiagnosis: 'Unidentified Foliar Symptom',
        confidence: 0.45,
        severity: 'MODERATE',
        visualSymptoms: ['Uncharacteristic foliar discoloration or leaf spotting'],
        requires_expert_review: true
      };
    }
  } else if (rawOutput && typeof rawOutput === 'object') {
    parsed = rawOutput;
  }

  const crop = CROPS.find(c => c.id === cropId) || CROPS[0];
  const primaryDiagnosis = sanitizeText(
    parsed.primaryDiagnosis || parsed.prediction,
    'Unidentified Foliar Symptom'
  );

  // Confidence calculation and clamping
  let confidence = typeof parsed.confidence === 'number' && !isNaN(parsed.confidence)
    ? Math.min(0.99, Math.max(0.20, parsed.confidence))
    : 0.50;

  // Confidence tiering & uncertainty gating
  let confidenceLevel: ConfidenceLevel = 'HIGH';
  let isUncertain = false;
  let uncertaintyReason: string | undefined = undefined;

  if (confidence >= 0.82) {
    confidenceLevel = 'HIGH';
    isUncertain = false;
  } else if (confidence >= 0.60) {
    confidenceLevel = 'MODERATE';
    isUncertain = false;
  } else {
    confidenceLevel = 'LOW';
    isUncertain = true;
    uncertaintyReason = 'Low AI model confidence score (<60%). This result is marked as UNCERTAIN. Ground verification by a district KVK agronomist or extension officer is recommended before taking chemical action.';
  }

  // Severity normalization
  let rawSeverity = (parsed.severity || 'MODERATE').toString().toUpperCase();
  const severity: SeverityLevel = VALID_SEVERITIES.has(rawSeverity as SeverityLevel)
    ? (rawSeverity as SeverityLevel)
    : 'MODERATE';

  // Disease/Pest Type normalization
  let rawType = (parsed.diseaseOrPestType || 'DISEASE').toString().toUpperCase();
  if (primaryDiagnosis.toLowerCase().includes('healthy')) {
    rawType = 'HEALTHY';
  } else if (
    primaryDiagnosis.toLowerCase().includes('borer') ||
    primaryDiagnosis.toLowerCase().includes('hopper') ||
    primaryDiagnosis.toLowerCase().includes('worm') ||
    primaryDiagnosis.toLowerCase().includes('mite') ||
    primaryDiagnosis.toLowerCase().includes('aphid')
  ) {
    rawType = 'PEST';
  }
  const diseaseOrPestType: DiseaseOrPestType = VALID_TYPES.has(rawType as DiseaseOrPestType)
    ? (rawType as DiseaseOrPestType)
    : 'DISEASE';

  // Crop stage detection / preservation
  const cropStage = sanitizeText(
    parsed.cropStage || providedCropStage,
    crop.stages?.[1] || 'Vegetative'
  );

  // Symptoms array sanitization
  const rawSymptoms = Array.isArray(parsed.visualSymptoms)
    ? parsed.visualSymptoms
    : Array.isArray(parsed.symptoms)
    ? parsed.symptoms
    : [];
  const visualSymptoms = rawSymptoms
    .map(s => sanitizeText(s))
    .filter(s => s.length > 0);
  if (visualSymptoms.length === 0) {
    visualSymptoms.push('Foliar surface discoloration with necrotic spot clustering');
  }

  // Visual observations
  const rawObservations = Array.isArray(parsed.visualObservations) ? parsed.visualObservations : [];
  const visualObservations = rawObservations
    .map(o => sanitizeText(o))
    .filter(o => o.length > 0);
  if (visualObservations.length === 0) {
    visualObservations.push('Lesions observed across upper leaf surfaces without systemic wilting');
  }

  // Why AI thinks this
  const rawWhy = parsed.whyAiThinksThis || {};
  const whyAiThinksThis = {
    lesionColor: sanitizeText(rawWhy.lesionColor, 'Visible discolored necrotic spotting'),
    lesionShape: sanitizeText(rawWhy.lesionShape, 'Irregular elliptical or spindle lesion pattern'),
    lesionPattern: sanitizeText(rawWhy.lesionPattern, 'Scattered across foliar blade'),
    affectedArea: sanitizeText(rawWhy.affectedArea, parsed.affectedLeafAreaPercent || '8% - 15% leaf area affected'),
    summary: sanitizeText(rawWhy.summary, `Symptom morphology aligns with foliar pathology on ${crop.name}.`)
  };

  // Alternative diagnoses sanitization
  const rawAlts = Array.isArray(parsed.alternativeDiagnoses)
    ? parsed.alternativeDiagnoses
    : Array.isArray(parsed.alternativePredictions)
    ? parsed.alternativePredictions
    : [];
  let alternativeDiagnoses = (rawAlts as any[])
    .filter(a => a && typeof a === 'object' && (a.name || a.prediction))
    .map(a => ({
      name: sanitizeText(a.name || a.prediction),
      confidence: typeof a.confidence === 'number' ? Math.min(0.95, Math.max(0.01, a.confidence)) : 0.15,
      reasoning: sanitizeText(a.reasoning, undefined)
    }))
    .slice(0, 3);

  // If model was uncertain or low confidence and gave no alternative candidates, populate differential hypotheses
  if (alternativeDiagnoses.length === 0 && (isUncertain || confidenceLevel === 'LOW' || confidence < 0.65)) {
    const fallbackAlts = Object.values(CROP_DISEASE_KNOWLEDGE_BASE)
      .filter(k => k.cropId === crop.id && !k.name.toLowerCase().includes(primaryDiagnosis.toLowerCase()))
      .slice(0, 2)
      .map(k => ({
        name: k.name,
        confidence: Number((Math.max(0.15, (1 - confidence) / 2)).toFixed(2)),
        reasoning: 'Shares overlapping foliar chlorotic or necrotic lesion morphology under humid conditions.'
      }));

    if (fallbackAlts.length > 0) {
      alternativeDiagnoses = fallbackAlts;
    } else {
      alternativeDiagnoses = [
        { name: 'Physiological Leaf Scald / Micro-nutrient Deficiency', confidence: 0.22, reasoning: 'Abiotic foliar stress mimic' },
        { name: 'Secondary Bacterial Foliar Streak', confidence: 0.18, reasoning: 'Microbial foliar spot complex' }
      ];
    }
  }

  // Next scan hours
  let recommendedNextScanHours = typeof parsed.recommendedNextScanHours === 'number' && parsed.recommendedNextScanHours >= 6
    ? parsed.recommendedNextScanHours
    : severity === 'CRITICAL' ? 12 : severity === 'HIGH' ? 24 : 48;

  // Expert review recommendation
  const isExpertReviewRecommended = 
    isUncertain ||
    confidenceLevel === 'LOW' ||
    severity === 'CRITICAL' ||
    Boolean(parsed.requires_expert_review) ||
    Boolean(parsed.isExpertReviewRecommended);

  // Recommendation text
  const recommendation = sanitizeText(
    parsed.recommendation,
    isUncertain
      ? 'Photograph leaves under diffuse morning light and consult your local KVK agronomist.'
      : 'Apply recommended bio-fungicide and monitor field daily for spore spread.'
  );

  // IPM Knowledge base matching
  const matchedKB = Object.values(CROP_DISEASE_KNOWLEDGE_BASE).find(
    k => k.cropId === crop.id && primaryDiagnosis.toLowerCase().includes(k.name.toLowerCase().split(' ')[0])
  ) || CROP_DISEASE_KNOWLEDGE_BASE['rice-blast'];

  const now = new Date();
  const diagnosisId = `diag-${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    diagnosisId,
    timestamp: now.toISOString(),
    crop: crop.name,
    cropId: crop.id,
    cropStage,
    primaryDiagnosis,
    diseaseOrPestType,
    confidence: Number(confidence.toFixed(2)),
    confidenceLevel,
    isUncertain,
    uncertaintyReason,
    severity,
    visualSymptoms,
    affectedLeafAreaPercent: parsed.affectedLeafAreaPercent || '8% - 14%',
    whyAiThinksThis,
    visualObservations,
    alternativeDiagnoses,
    recommendedNextScanHours,
    isExpertReviewRecommended,
    recommendation,
    ipmAdvisory: matchedKB.ipm,
    provider: providerName,

    // Aliases for backward compatibility
    prediction: primaryDiagnosis,
    symptoms: visualSymptoms,
    alternative_predictions: alternativeDiagnoses,
    requires_expert_review: isExpertReviewRecommended
  };
}
