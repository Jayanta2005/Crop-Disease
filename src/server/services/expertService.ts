import { repository } from '../data/repository';
import { outbreakService } from './outbreakService';
import { ExtensionTask, LabReferralCase, DiagnosisRecord } from '../../types';

class ExpertService {
  /**
   * Request KVK expert review initiated by a farmer
   */
  public async requestExpertReview(params: {
    diagnosisId?: string;
    cropId: string;
    cropName: string;
    cropStage: string;
    aiPrediction: string;
    aiConfidence: number;
    aiSeverity: any;
    affectedLeafAreaPercent?: string;
    environmentalInfo?: any;
    imageUrl?: string;
    farmerNotes?: string;
  }) {
    const currentUser = await repository.getCurrentUser();
    const farms = await repository.getFarms(currentUser.id);
    const primaryFarm = farms[0] || (await repository.getFarms())[0];

    const newTask: ExtensionTask = {
      id: `task-ext-${Date.now()}`,
      farmId: primaryFarm ? primaryFarm.id : 'farm-1',
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerPhone: currentUser.phone || '+91 94331 82910',
      location: primaryFarm ? `${primaryFarm.district}, ${primaryFarm.state}` : 'Purba Bardhaman, WB',
      crop: params.cropName || 'Rice (Paddy)',
      suspectedIssue: `${params.aiPrediction || 'Foliar Issue'} (${Math.round((params.aiConfidence || 0.6) * 100)}% Conf, ${params.aiSeverity || 'Moderate'})`,
      priority: params.aiSeverity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      status: 'PENDING',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      diagnosisId: params.diagnosisId || `diag-${Date.now()}`
    };

    await repository.createExtensionTask(newTask);

    if (params.diagnosisId) {
      await repository.updateDiagnosis(params.diagnosisId, {
        verificationStatus: 'PENDING'
      });
    }

    return {
      caseNumber: `KVK-${Math.floor(1000 + Math.random() * 9000)}`,
      assignedOfficer: 'Dr. Vivek Sharma (Senior Pathologist, KVK Bardhaman)',
      taskId: newTask.id,
      message: 'Case forwarded to district agronomist and Krishi Vigyan Kendra.'
    };
  }

  /**
   * Process Pathologist / Agronomist review decision
   */
  public async reviewDiagnosis(
    diagnosisId: string,
    reviewData: {
      action: 'CONFIRM_AI' | 'CORRECT_DIAGNOSIS' | 'REFER_TO_LAB' | 'UNCERTAIN';
      expertPrediction?: string;
      expertNotes?: string;
      followUpDate?: string;
    }
  ): Promise<DiagnosisRecord> {
    const diagnosis = await repository.getDiagnosisById(diagnosisId);
    if (!diagnosis) {
      throw new Error(`Diagnosis with ID ${diagnosisId} not found`);
    }

    const currentUser = await repository.getCurrentUser();
    const followUp = reviewData.followUpDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

    const updates: Partial<DiagnosisRecord> = {
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewTimestamp: new Date().toISOString(),
      expertNotes: reviewData.expertNotes,
      followUpDate: followUp
    };

    if (reviewData.action === 'CONFIRM_AI') {
      updates.verificationStatus = 'CONFIRMED';
      updates.expertPrediction = diagnosis.aiPrediction;
      updates.finalDiagnosis = diagnosis.aiPrediction;
    } else if (reviewData.action === 'CORRECT_DIAGNOSIS') {
      updates.verificationStatus = 'CORRECTED';
      updates.expertPrediction = reviewData.expertPrediction || 'Corrected Diagnosis';
      updates.finalDiagnosis = reviewData.expertPrediction || 'Corrected Diagnosis';
    } else if (reviewData.action === 'REFER_TO_LAB') {
      updates.verificationStatus = 'LAB_REFERRED';
      const labRef: LabReferralCase = {
        id: `lab-ref-${Date.now()}`,
        diagnosisId: diagnosis.id,
        sampleId: `SMPL-WB-26-${Math.floor(1000 + Math.random() * 9000)}`,
        farmerId: diagnosis.farmerId,
        farmerName: diagnosis.farmerName,
        crop: diagnosis.cropName,
        suspectedPathogen: diagnosis.aiPrediction,
        sampleType: 'LEAF_TISSUE',
        collectionDate: new Date().toISOString().split('T')[0],
        laboratoryName: 'Kalyani State Agri Microbiology & Diagnostic Lab',
        status: 'RECEIVED',
        testedBy: 'Pending Lab Officer Assignment'
      };
      await repository.createLabReferral(labRef);
      updates.labReferralId = labRef.id;
    } else {
      updates.verificationStatus = 'UNCERTAIN';
    }

    const updated = await repository.updateDiagnosis(diagnosisId, updates);
    if (!updated) {
      throw new Error('Failed to update diagnosis');
    }

    // If confirmed or corrected, add to Geospatial Outbreak surveillance
    if (updated.verificationStatus === 'CONFIRMED' || updated.verificationStatus === 'CORRECTED') {
      await outbreakService.registerOutbreakFromDiagnosis(updated.id, {
        latitude: updated.latitude,
        longitude: updated.longitude,
        locationName: updated.locationName,
        crop: updated.cropName,
        pathogenName: updated.finalDiagnosis,
        severity: updated.aiSeverity,
        verifiedBy: currentUser.name
      });
    }

    return updated;
  }

  public async getExtensionTasks(filter?: { status?: string; priority?: string }) {
    return repository.getExtensionTasks(filter);
  }

  public async recordFieldVisit(params: {
    taskId: string;
    observations: string;
    referToLab?: boolean;
  }) {
    const currentUser = await repository.getCurrentUser();
    const updated = await repository.updateExtensionTask(params.taskId, {
      status: params.referToLab ? 'REFERRED_TO_LAB' : 'VISITED',
      fieldNotes: params.observations,
      visitedAt: new Date().toISOString(),
      inspectorName: currentUser.name
    });
    if (!updated) {
      throw new Error(`Task ${params.taskId} not found`);
    }
    return updated;
  }

  public async getLabReferrals() {
    return repository.getLabReferrals();
  }

  public async updateLabReferral(
    id: string,
    updates: {
      status: 'PENDING_COLLECTION' | 'RECEIVED' | 'IN_TESTING' | 'CONFIRMED' | 'INCONCLUSIVE';
      labResult?: string;
      testedBy?: string;
    }
  ) {
    const currentUser = await repository.getCurrentUser();
    const ref = await repository.updateLabReferral(id, {
      ...updates,
      testedBy: updates.testedBy || currentUser.name,
      resultDate: new Date().toISOString().split('T')[0]
    });
    if (!ref) {
      throw new Error(`Lab referral ${id} not found`);
    }

    // Link back to diagnosis
    if (ref.diagnosisId) {
      await repository.updateDiagnosis(ref.diagnosisId, {
        verificationStatus: 'CONFIRMED',
        finalDiagnosis: `Laboratory Confirmed: ${ref.labResult || 'Verified Pathogen'}`
      });
    }

    return ref;
  }
}

export const expertService = new ExpertService();
