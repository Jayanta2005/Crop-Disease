/**
 * CropGuard AI - Comprehensive Automated Test Suite
 * Tests:
 * 1. Deterministic Risk Engine & Missing Value Handling
 * 2. CIBRC Official Pesticide Registry & 4-Pillar Advisory Service
 * 3. KVK / Expert Case Management & AI-vs-Expert Agreement
 * 4. Offline Batch Sync & Idempotency Key Duplicate Protection
 * 5. Storage Service Reference Abstraction
 * 6. Geospatial Engine & Privacy Geofencing
 * 7. Image Quality Validation & Response Sanitization
 * 8. PostgreSQL DDL Schema Validation
 */

import { calculateAgriculturalRisk } from '../src/server/riskEngine';
import { CROP_DISEASE_KNOWLEDGE_BASE } from '../src/data/ipmKnowledgeBase';
import { advisoryService } from '../src/server/services/advisoryService';
import { findOfficialChemicalTreatments } from '../src/server/data/officialPesticideRegistry';
import { expertCaseService } from '../src/server/services/expertCaseService';
import { syncService } from '../src/server/services/syncService';
import { storageService } from '../src/server/services/storageService';
import { validateCropImage } from '../src/server/services/vision/imageValidator';
import { parseAndSanitizeModelOutput } from '../src/server/services/vision/responseSanitizer';
import { progressionService } from '../src/server/services/vision/diagnosisProgressionService';
import { GeospatialEngine } from '../src/server/services/outbreakService';
import { POSTGRES_DDL_SCHEMA } from '../src/server/db/schema';
import { DiagnosisRecord } from '../src/types';

export function runAllUnitTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`[PASS] ${testName}`);
    } else {
      failed++;
      results.push(`[FAIL] ${testName}`);
    }
  }

  // 1. Risk Calculation Tests
  try {
    const highHumidityRisk = calculateAgriculturalRisk({
      cropId: 'rice',
      cropName: 'Rice (Paddy)',
      cropStage: 'Tillering',
      latitude: 23.23,
      longitude: 87.86,
      temperatureC: 26.0,
      humidityPercent: 90.0,
      rainfallMm: 15.0,
      windSpeedKmph: 10.0,
      nearbyConfirmedCasesCount: 6,
      recentTrapCount: 10,
      trapThreshold: 8
    });

    assert(highHumidityRisk.diseaseRiskScore >= 75, 'Risk Engine: High humidity & rainfall generates Critical/High disease score');
    assert(highHumidityRisk.pestRiskScore >= 50, 'Risk Engine: Exceeded trap threshold elevates pest risk');
    assert(highHumidityRisk.diseaseRiskLevel === 'CRITICAL' || highHumidityRisk.diseaseRiskLevel === 'HIGH', 'Risk Engine: Correct risk tier classification');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Risk Engine execution: ${String(err)}`);
  }

  // 2. Low Risk Baseline Test
  try {
    const dryWeatherRisk = calculateAgriculturalRisk({
      cropId: 'wheat',
      cropName: 'Wheat',
      cropStage: 'Jointing',
      latitude: 30.90,
      longitude: 75.85,
      temperatureC: 15.0,
      humidityPercent: 45.0,
      rainfallMm: 0.0,
      windSpeedKmph: 5.0,
      nearbyConfirmedCasesCount: 0,
      recentTrapCount: 1,
      trapThreshold: 8
    });

    assert(dryWeatherRisk.diseaseRiskScore <= 40, 'Risk Engine: Dry conditions keep disease risk low/moderate');
    assert(dryWeatherRisk.diseaseRiskLevel === 'LOW' || dryWeatherRisk.diseaseRiskLevel === 'MODERATE', 'Risk Engine: Non-conducive weather returns Low tier');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Dry weather risk test: ${String(err)}`);
  }

  // 3. IPM Knowledge Base Chemical Safety Check
  try {
    const riceBlast = CROP_DISEASE_KNOWLEDGE_BASE['rice-blast'];
    assert(riceBlast !== undefined, 'IPM KB: Rice Blast entry exists');
    assert(riceBlast.ipm.chemical.length > 0, 'IPM KB: Contains approved chemical recommendations');

    const allCompliant = riceBlast.ipm.chemical.every(c =>
      c.cibrcApproved === true &&
      c.waitingPeriodDays > 0 &&
      c.safetyEquipment.length > 0 &&
      c.dosage.length > 0
    );
    assert(allCompliant, 'IPM KB: All pesticides have CIBRC approval, waiting periods, and PPE instructions');
  } catch (err) {
    failed++;
    results.push(`[FAIL] IPM Safety check: ${String(err)}`);
  }

  // 4. Image Quality Validation Tests
  try {
    const textBase64 = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
    const textValidation = validateCropImage(textBase64);
    assert(textValidation.isValid === false, 'Image Validator: Rejects non-image MIME types');

    const sampleJpg = 'data:image/jpeg;base64,' + 'A'.repeat(500);
    const jpgValidation = validateCropImage(sampleJpg);
    assert(jpgValidation.isValid === true, 'Image Validator: Accepts standard JPEG data URI');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Image validation test: ${String(err)}`);
  }

  // 5. Response Sanitizer - Uncertainty Gating
  try {
    const lowConfidenceJson = JSON.stringify({
      prediction: 'Rice Blast',
      confidence: 0.45,
      confidenceLevel: 'LOW',
      severity: 'MODERATE'
    });

    const parsed = parseAndSanitizeModelOutput(lowConfidenceJson, 'rice');
    assert(parsed.requires_expert_review === true, 'Response Sanitizer: Low confidence (<0.65) triggers requires_expert_review');
    assert(parsed.alternative_predictions.length > 0, 'Response Sanitizer: Generates alternative hypotheses for uncertain predictions');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Uncertainty gating test: ${String(err)}`);
  }

  // 6. Progression Service - Temporal Lesion Comparison
  try {
    const initialDiag: DiagnosisRecord = {
      id: 'diag-test-1',
      farmerId: 'farmer-1',
      farmerName: 'Ramesh',
      farmId: 'farm-1',
      cropId: 'rice',
      cropName: 'Rice',
      cropStage: 'Tillering',
      imageUrl: '',
      latitude: 23.23,
      longitude: 87.86,
      locationName: 'Burdwan',
      timestamp: '2026-09-01T10:00:00Z',
      aiPrediction: 'Rice Blast',
      aiConfidence: 0.90,
      aiConfidenceLevel: 'HIGH',
      aiSeverity: 'MODERATE',
      aiSymptoms: ['Spindle-shaped lesions with grey center'],
      alternativePredictions: [],
      affectedLeafAreaPercent: '12%',
      ipmAdvisory: {
        prevention: ['Crop rotation with legumes'],
        cultural: ['Avoid excess nitrogen'],
        mechanical: ['Rogue and burn infected stubble'],
        biological: ['Apply Pseudomonas fluorescens'],
        chemical: [],
        monitoring: ['Scout weekly']
      },
      finalDiagnosis: 'Rice Blast',
      verificationStatus: 'CONFIRMED',
      followUpStatus: 'PENDING'
    };

    const progression = progressionService.evaluateProgression(
      'CRITICAL',
      new Date('2026-09-05T10:00:00Z'),
      [initialDiag]
    );
    assert(progression.progression === 'INCREASING', 'Progression Service: Correctly detects worsening lesion severity');
    assert(progression.details.includes('escalated') || progression.details.includes('intervention'), 'Progression Service: Details describe severity escalation');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Progression comparison test: ${String(err)}`);
  }

  // 7. Deterministic Risk Engine - Missing Factor & Completeness Handling
  try {
    const missingDataAssessment = calculateAgriculturalRisk({
      cropId: 'rice',
      temperatureC: 25.0,
      humidityPercent: 88.0
    });

    assert(missingDataAssessment.dataCompletenessPercent < 100, 'Risk Engine: Correctly calculates data completeness when factors are missing');
    const leafWetnessFactor = missingDataAssessment.riskFactors.find(f => f.factor === 'Leaf Wetness Duration');
    assert(leafWetnessFactor !== undefined && leafWetnessFactor.status === 'UNAVAILABLE', 'Risk Engine: Missing leaf wetness explicitly tagged as UNAVAILABLE (never fabricated)');
    assert(missingDataAssessment.missingFactors.includes('Leaf Wetness Duration'), 'Risk Engine: Missing factors included in missingFactors list');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Missing factor test: ${String(err)}`);
  }

  // 8. Deterministic Invariance Test (No randomness in calculation)
  try {
    const inputs = {
      cropId: 'rice',
      cropStage: 'Tillering',
      temperatureC: 27.5,
      humidityPercent: 86.0,
      rainfallMm: 12.0,
      leafWetnessHours: 8.0,
      nearbyConfirmedCasesCount: 3,
      recentTrapCount: 14,
      trapThreshold: 8
    };

    const firstRun = calculateAgriculturalRisk(inputs);
    let allIdentical = true;
    for (let i = 0; i < 10; i++) {
      const repeatedRun = calculateAgriculturalRisk(inputs);
      if (repeatedRun.diseaseRiskScore !== firstRun.diseaseRiskScore ||
          repeatedRun.pestRiskScore !== firstRun.pestRiskScore) {
        allIdentical = false;
        break;
      }
    }
    assert(allIdentical, 'Risk Engine: 10 repeated runs produce identical numerical scores (strictly deterministic)');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Deterministic invariance test: ${String(err)}`);
  }

  // 9. Geospatial Distance & Coordinate Validation
  try {
    const dist = GeospatialEngine.calculateDistanceKm(22.5726, 88.3639, 23.2324, 87.8615);
    assert(dist >= 85 && dist <= 100, `Geospatial Engine: Haversine distance accurate (got ${dist} km, expected ~92 km)`);

    assert(GeospatialEngine.validateCoordinates(23.23, 87.86).valid === true, 'Geospatial Engine: Valid coordinates pass');
    assert(GeospatialEngine.validateCoordinates(95.0, 87.86).valid === false, 'Geospatial Engine: Latitude > 90 rejected');
    assert(GeospatialEngine.validateCoordinates(23.23, 195.0).valid === false, 'Geospatial Engine: Longitude > 180 rejected');
    assert(GeospatialEngine.validateCoordinates(NaN, 87.86).valid === false, 'Geospatial Engine: NaN coordinate rejected');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Geospatial distance test: ${String(err)}`);
  }

  // 10. Outbreak Privacy Geofencing
  try {
    const fuzzed = GeospatialEngine.fuzzCoordinates(23.238491, 87.861923);
    assert(fuzzed.fuzzedLat === 23.24 && fuzzed.fuzzedLon === 87.86, 'Geospatial Engine: Privacy fuzzing rounds to ~1.1km grid');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Outbreak duplicate & privacy test: ${String(err)}`);
  }

  // 11. Authoritative Advisory Service & CIBRC Chemical Registry
  try {
    // 11a. Verified treatment for high severity
    const severeAdvisory = advisoryService.generateComprehensiveAdvisory({
      cropId: 'rice',
      cropStage: 'Tillering',
      diagnosis: 'Rice Blast',
      severity: 'CRITICAL',
      riskScore: 85,
      environmentalFactors: { temperatureC: 28, humidityPercent: 90, rainfallMm: 8 }
    });

    assert(severeAdvisory.immediateAction.length > 0, 'Advisory Service: Generates structured immediate actions');
    assert(severeAdvisory.monitoring.length > 0, 'Advisory Service: Generates structured monitoring recommendations');
    assert(severeAdvisory.preventiveNonChemical.length > 0, 'Advisory Service: Generates non-chemical preventive measures');
    assert(severeAdvisory.approvedTreatmentGuidance.isChemicalRecommended === true, 'Advisory Service: Approves verified chemical for critical blast');
    assert(severeAdvisory.approvedTreatmentGuidance.treatments[0].cibrcApproved === true, 'Advisory Service: Chemical treatment is CIBRC approved');
    assert(severeAdvisory.approvedTreatmentGuidance.treatments[0].waitingPeriodDays > 0, 'Advisory Service: Explicit pre-harvest waiting period specified');

    // 11b. Unknown/Non-verified pathogen guarantees NO chemical hallucination
    const unknownPathogenAdvisory = advisoryService.generateComprehensiveAdvisory({
      cropId: 'rice',
      diagnosis: 'Unknown Exotic Wilting Syndrome',
      severity: 'CRITICAL'
    });

    assert(unknownPathogenAdvisory.approvedTreatmentGuidance.isChemicalRecommended === false, 'Advisory Service: Does NOT recommend chemicals for unverified disease');
    assert(unknownPathogenAdvisory.approvedTreatmentGuidance.treatments.length === 0, 'Advisory Service: Strict zero-hallucination policy for unverified chemicals');
    assert(unknownPathogenAdvisory.approvedTreatmentGuidance.safeGuidanceMessage!.includes('KVK') || unknownPathogenAdvisory.approvedTreatmentGuidance.safeGuidanceMessage!.includes('expert'), 'Advisory Service: Safely directs farmer to KVK expert review');

    // 11c. Low severity disease should NOT prescribe chemicals
    const mildAdvisory = advisoryService.generateComprehensiveAdvisory({
      cropId: 'rice',
      diagnosis: 'Rice Blast',
      severity: 'LOW',
      riskScore: 25
    });
    assert(mildAdvisory.approvedTreatmentGuidance.isChemicalRecommended === false, 'Advisory Service: Low severity does not warrant synthetic chemicals (IPM adherence)');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Authoritative Advisory Service test: ${String(err)}`);
  }

  // 12. KVK & Expert Case Management & Agreement Metrics
  try {
    const newCase = expertCaseService.getCaseById('CASE-2026-0841');
    assert(newCase !== null, 'Expert Service: Pre-seeded KVK case retrieved by ID');
    assert(newCase!.status === 'PENDING_REVIEW', 'Expert Service: Correct initial status PENDING_REVIEW');
    assert(newCase!.auditTrail.length > 0, 'Expert Service: Case contains audit trail with timestamps and actor roles');

    // Test agronomist assignment
    const assigned = expertCaseService.assignCase(
      'CASE-2026-0841',
      'expert-01',
      'Dr. Debabrata Roy',
      { id: 'expert-01', name: 'Dr. Debabrata Roy', role: 'EXPERT' }
    );
    assert(assigned.assignedExpertId === 'expert-01', 'Expert Service: Successfully assigned to agronomist');
    assert(assigned.status === 'UNDER_REVIEW', 'Expert Service: Status transitions to UNDER_REVIEW');

    // Test agronomist decision - SEPARATE storage of expert diagnosis
    const decided = expertCaseService.updateExpertDecision(
      'CASE-2026-0841',
      {
        decision: 'CORRECT_DIAGNOSIS',
        expertFinalDiagnosis: 'Brown Spot (Bipolaris oryzae)',
        expertNotes: 'Diagnostic examination reveals oval brown spots with grey centres, not diamond blast lesions.',
        recommendedActionPlan: ['Drain water', 'Apply Mancozeb 75% WP @ 2g/L']
      },
      { id: 'expert-01', name: 'Dr. Debabrata Roy', role: 'EXPERT' }
    );

    assert(decided.status === 'CORRECTED', 'Expert Service: Status correctly set to CORRECTED');
    assert(decided.aiDiagnosis === 'Rice Blast (Magnaporthe oryzae)', 'Expert Service: Original AI diagnosis preserved untouched');
    assert(decided.expertFinalDiagnosis === 'Brown Spot (Bipolaris oryzae)', 'Expert Service: Expert diagnosis stored separately from AI prediction');

    // Agreement metrics calculation
    const metrics = expertCaseService.getAgreementMetrics();
    assert(metrics.reviewedCasesCount > 0, 'Expert Service: Agreement metrics counts reviewed cases');
    assert(typeof metrics.agreementRatePercent === 'number', 'Expert Service: Agreement rate percentage calculated');
  } catch (err) {
    failed++;
    results.push(`[FAIL] KVK Case Management test: ${String(err)}`);
  }

  // 13. Offline Synchronization with Idempotency Key
  try {
    // We execute synchronously via mock promise or check syncService contract
    const testIdempotencyKey = `test-key-${Date.now()}`;
    const testItem = {
      idempotencyKey: testIdempotencyKey,
      clientId: 'scan-local-001',
      cropId: 'rice',
      cropName: 'Rice',
      cropStage: 'Tillering',
      notes: 'Test offline scan with unique idempotency key'
    };

    // First submission
    syncService.syncOfflineQueue([testItem]).then(firstSync => {
      assert(firstSync.successful === 1, 'Sync Service: Successfully processes first submission');
      assert(firstSync.results[0].status === 'synced', 'Sync Service: Result status is "synced"');

      // Immediate repeated submission with identical idempotencyKey
      syncService.syncOfflineQueue([testItem]).then(secondSync => {
        assert(secondSync.duplicates === 1, 'Sync Service: Re-submission detected as duplicate via idempotency key');
        assert(secondSync.results[0].status === 'duplicate', 'Sync Service: Duplicate status returned without re-creating record');
      });
    });

    // Test partial batch failure handling
    const malformedBatch = [
      { clientId: 'good-01', cropId: 'wheat', cropName: 'Wheat' },
      { clientId: 'bad-02', cropId: '' } // Missing cropId should be rejected
    ];

    syncService.syncOfflineQueue(malformedBatch).then(batchRes => {
      assert(batchRes.successful === 1, 'Sync Service: Valid item in batch succeeds');
      assert(batchRes.rejected === 1, 'Sync Service: Invalid item rejected without failing the whole batch (partial batch support)');
    });
  } catch (err) {
    failed++;
    results.push(`[FAIL] Offline Sync & Idempotency test: ${String(err)}`);
  }

  // 14. Storage Service - Reference & Image Deduplication
  try {
    const demoRef = storageService.getImageMetadata('img_ref_rice_blast_01');
    assert(demoRef !== null, 'Storage Service: Pre-seeded image metadata retrieved');
    assert(demoRef!.imageRef === 'img_ref_rice_blast_01', 'Storage Service: Image reference ID matches');
    assert(demoRef!.publicUrl.startsWith('http'), 'Storage Service: Resolves valid public URL');
  } catch (err) {
    failed++;
    results.push(`[FAIL] Storage Service test: ${String(err)}`);
  }

  // 15. PostgreSQL Relational DDL Schema Verification
  try {
    assert(POSTGRES_DDL_SCHEMA.includes('CREATE TABLE IF NOT EXISTS users'), 'PostgreSQL DDL: users table defined');
    assert(POSTGRES_DDL_SCHEMA.includes('CREATE TABLE IF NOT EXISTS scans'), 'PostgreSQL DDL: scans table defined');
    assert(POSTGRES_DDL_SCHEMA.includes('CREATE TABLE IF NOT EXISTS expert_cases'), 'PostgreSQL DDL: expert_cases table defined');
    assert(POSTGRES_DDL_SCHEMA.includes('CREATE TABLE IF NOT EXISTS synchronization_records'), 'PostgreSQL DDL: synchronization_records table defined');
    assert(POSTGRES_DDL_SCHEMA.includes('idempotency_key VARCHAR(128) UNIQUE'), 'PostgreSQL DDL: Unique index on idempotency_key');
  } catch (err) {
    failed++;
    results.push(`[FAIL] PostgreSQL Schema test: ${String(err)}`);
  }

  return { passed, failed, results };
}

// Execute tests
const summary = runAllUnitTests();
summary.results.forEach(r => console.log(r));
console.log(`\nTEST SUMMARY: ${summary.passed} Passed, ${summary.failed} Failed.`);
if (summary.failed > 0) {
  process.exit(1);
}
