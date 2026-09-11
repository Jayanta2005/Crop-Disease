import { Request, Response, NextFunction } from 'express';
import { repository } from '../data/repository';
import { sendSuccess, sendError } from '../utils/response';
import { CROP_DISEASE_KNOWLEDGE_BASE } from '../../data/ipmKnowledgeBase';
import { progressionService } from '../services/vision/diagnosisProgressionService';
import { SeverityLevel } from '../../types';

export const diagnosisController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        id,
        diagnosisId,
        cropId,
        cropName,
        cropStage,
        farmId,
        imageUrl,
        latitude,
        longitude,
        locationName,
        aiPrediction,
        primaryDiagnosis,
        aiConfidence,
        aiConfidenceLevel,
        aiSeverity,
        aiSymptoms,
        visualSymptoms,
        alternativePredictions,
        alternativeDiagnoses,
        affectedLeafAreaPercent,
        whyAiThinksThis,
        visualObservations,
        recommendedNextScanHours,
        diseaseProgression,
        progressionDetails,
        requiresExpertReview,
        isUncertain,
        farmerId,
        farmerName,
        farmerPhone
      } = req.body;

      const currentUser = await repository.getCurrentUser();
      const effectiveFarmerId = (farmerId || farmerPhone || currentUser.phone || currentUser.id).trim();
      const effectiveFarmerName = (farmerName || currentUser.name).trim();
      const effectiveFarmerPhone = farmerPhone ? String(farmerPhone).trim() : (currentUser.phone || undefined);

      const farms = await repository.getFarms(currentUser.id);
      const primaryFarm = farmId ? farms.find(f => f.id === farmId) || farms[0] : farms[0];
      const effectiveFarmId = farmId || (primaryFarm ? primaryFarm.id : 'farm-1');

      const predictionName = primaryDiagnosis || aiPrediction || 'Rice Blast (Magnaporthe oryzae)';
      const confidence = typeof aiConfidence === 'number' ? aiConfidence : 0.74;
      const severity = (aiSeverity || 'HIGH') as SeverityLevel;

      // Confidence gating: Mark uncertain if confidence < 0.60
      const isActuallyUncertain = isUncertain || confidence < 0.60;
      const verificationStatus = isActuallyUncertain ? 'UNCERTAIN' : requiresExpertReview ? 'PENDING' : 'CONFIRMED';

      const matchedKB = Object.values(CROP_DISEASE_KNOWLEDGE_BASE).find(
        k => k.cropId === cropId
      ) || CROP_DISEASE_KNOWLEDGE_BASE['rice-blast'];

      // Evaluate progression against existing scans if not explicitly provided
      let finalProgression = diseaseProgression;
      let finalProgressionDetails = progressionDetails;

      if (!finalProgression || finalProgression === 'BASELINE') {
        const previousScans = await repository.getDiagnoses({
          farmerId: currentUser.id,
          farmId: effectiveFarmId,
          cropId: cropId || 'rice'
        });

        const evaluated = progressionService.evaluateProgression(
          severity,
          new Date(),
          previousScans
        );

        finalProgression = evaluated.progression;
        finalProgressionDetails = evaluated.details;
      }

      // Sanitize stored image reference to avoid storing megabytes of raw base64
      let sanitizedImageUrl = imageUrl || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80';
      if (typeof sanitizedImageUrl === 'string' && sanitizedImageUrl.startsWith('data:') && sanitizedImageUrl.length > 200000) {
        // Compress storage footprint: keep a lightweight reference prefix to save memory
        sanitizedImageUrl = sanitizedImageUrl.substring(0, 500) + '...[truncated-for-storage]';
      }

      const newRecord = await repository.createDiagnosis({
        id: id || diagnosisId,
        farmerId: effectiveFarmerId,
        farmerName: effectiveFarmerName,
        farmerPhone: effectiveFarmerPhone,
        farmId: effectiveFarmId,
        cropId: cropId || 'rice',
        cropName: cropName || 'Rice (Paddy)',
        cropStage: cropStage || 'Tillering',
        imageUrl: sanitizedImageUrl,
        latitude: latitude || 23.2324,
        longitude: longitude || 87.8615,
        locationName: locationName || (primaryFarm ? `${primaryFarm.district}, ${primaryFarm.state}` : 'Purba Bardhaman, WB'),
        timestamp: new Date().toISOString(),
        aiPrediction: predictionName,
        aiConfidence: confidence,
        aiConfidenceLevel: aiConfidenceLevel || (confidence >= 0.82 ? 'HIGH' : confidence >= 0.60 ? 'MODERATE' : 'LOW'),
        aiSeverity: severity,
        aiSymptoms: visualSymptoms || aiSymptoms || ['Foliar discoloration and necrotic lesions'],
        alternativePredictions: alternativeDiagnoses || alternativePredictions || [],
        affectedLeafAreaPercent: affectedLeafAreaPercent || '8% - 14%',
        whyAiThinksThis: whyAiThinksThis || {
          lesionColor: 'Grayish-white center with dark reddish-brown margins',
          lesionShape: 'Spindle-shaped / elliptical diamond lesions',
          lesionPattern: 'Scattered across leaf blade along veins',
          affectedArea: 'Estimated 8% - 14% of foliar blade surface affected',
          summary: 'Visible spindle spots with dark brown margins.'
        },
        visualObservations: visualObservations || ['Discrete necrotic lesions observed on foliar surface'],
        recommendedNextScanHours: recommendedNextScanHours || 24,
        diseaseProgression: finalProgression || 'STABLE',
        progressionDetails: finalProgressionDetails || 'Baseline scan recorded.',
        verificationStatus,
        finalDiagnosis: predictionName,
        ipmAdvisory: matchedKB.ipm,
        followUpStatus: 'PENDING',
        syncStatus: 'UPLOADED'
      });

      // If requires expert review or severity is CRITICAL, schedule an extension task
      if (requiresExpertReview || isActuallyUncertain || severity === 'CRITICAL') {
        await repository.createExtensionTask({
          id: `task-diag-${Date.now()}`,
          farmId: newRecord.farmId,
          farmerId: newRecord.farmerId,
          farmerName: newRecord.farmerName,
          farmerPhone: currentUser.phone || '+91 94331 82910',
          location: newRecord.locationName,
          crop: newRecord.cropName,
          suspectedIssue: `${newRecord.aiPrediction} (${Math.round(newRecord.aiConfidence * 100)}% Conf${isActuallyUncertain ? ' - UNCERTAIN' : ''})`,
          priority: severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          status: 'PENDING',
          scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          diagnosisId: newRecord.id
        });
      }

      return sendSuccess(
        res,
        newRecord,
        'Diagnosis recorded successfully',
        201,
        { diagnosis: newRecord }
      );
    } catch (err: any) {
      console.error('[DiagnosisController] Create error:', err);
      return sendError(res, 'Failed to save diagnosis record', 500, err);
    }
  },

  getHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = await repository.getCurrentUser();
      const { farmerId, farmId, cropId, limit } = req.query;

      // Filter by farmer (defaults to current user if role is FARMER and no override given)
      const targetFarmerId = farmerId
        ? String(farmerId)
        : currentUser.role === 'FARMER'
        ? currentUser.id
        : undefined;

      const list = await repository.getDiagnoses({
        farmerId: targetFarmerId,
        farmId: farmId ? String(farmId) : undefined,
        cropId: cropId ? String(cropId) : undefined,
        limit: limit ? Number(limit) : undefined
      });

      return sendSuccess(res, list, 'Diagnosis history retrieved', 200, {
        diagnoses: list,
        count: list.length
      });
    } catch (err: any) {
      console.error('[DiagnosisController] GetHistory error:', err);
      return sendError(res, 'Failed to retrieve diagnosis history', 500, err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await repository.getDiagnosisById(req.params.id);
      if (!item) {
        return sendError(res, `Diagnosis record with ID ${req.params.id} not found`, 404);
      }

      // Compute progression against previous scans for that farm/crop
      const previousScans = await repository.getDiagnoses({
        farmerId: item.farmerId,
        farmId: item.farmId,
        cropId: item.cropId
      });

      // Exclude current item and items newer than current item
      const olderScans = previousScans.filter(
        d => d.id !== item.id && new Date(d.timestamp).getTime() < new Date(item.timestamp).getTime()
      );

      const progression = progressionService.evaluateProgression(
        item.aiSeverity as SeverityLevel,
        new Date(item.timestamp),
        olderScans
      );

      return sendSuccess(res, { ...item, progressionAnalysis: progression }, 'Diagnosis record retrieved', 200, {
        diagnosis: { ...item, progressionAnalysis: progression }
      });
    } catch (err: any) {
      console.error('[DiagnosisController] GetById error:', err);
      return sendError(res, 'Failed to retrieve diagnosis details', 500, err);
    }
  },

  compare: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { previousId, farmId, cropId } = req.query;

      const currentRecord = await repository.getDiagnosisById(id);
      if (!currentRecord) {
        return sendError(res, `Current diagnosis record (${id}) not found`, 404);
      }

      let previousRecord = null;
      if (previousId) {
        previousRecord = await repository.getDiagnosisById(String(previousId));
      } else {
        const history = await repository.getDiagnoses({
          farmerId: currentRecord.farmerId,
          farmId: (farmId as string) || currentRecord.farmId,
          cropId: (cropId as string) || currentRecord.cropId
        });

        // Find the most recent older record
        const older = history.filter(
          h => h.id !== currentRecord.id && new Date(h.timestamp).getTime() < new Date(currentRecord.timestamp).getTime()
        );
        previousRecord = older[0] || null;
      }

      const progression = progressionService.evaluateProgression(
        currentRecord.aiSeverity as SeverityLevel,
        new Date(currentRecord.timestamp),
        previousRecord ? [previousRecord] : []
      );

      return sendSuccess(
        res,
        {
          currentDiagnosis: currentRecord,
          previousDiagnosis: previousRecord,
          progressionAnalysis: progression
        },
        'Progression comparison completed',
        200,
        {
          progression
        }
      );
    } catch (err: any) {
      console.error('[DiagnosisController] Compare error:', err);
      return sendError(res, 'Failed to compare diagnoses', 500, err);
    }
  }
};
