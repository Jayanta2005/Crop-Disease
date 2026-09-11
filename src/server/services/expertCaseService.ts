import { storageService } from './storageService';

export type ExpertCaseStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'CONFIRMED'
  | 'CORRECTED'
  | 'RESOLVED';

export interface CaseAuditEntry {
  id: string;
  caseId: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  previousStatus?: ExpertCaseStatus;
  newStatus?: ExpertCaseStatus;
  details: string;
}

export interface ExpertCase {
  caseId: string; // Unique format e.g. "CASE-2026-8412"
  diagnosisId?: string;
  farmerId: string;
  farmerName: string;
  farmerPhoneMasked: string;
  farmId: string;
  fieldReference?: string;
  crop: string;
  cropId: string;
  cropStage: string;
  imageRef?: string;
  imageUrl?: string;

  // AI Diagnosis (Preserved untouched for baseline comparison)
  aiDiagnosis: string;
  confidence: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number;

  environmentalFactors: {
    temperatureC?: number;
    humidityPercent?: number;
    rainfallMm?: number;
    leafWetnessHours?: number;
    windSpeedKmph?: number;
    conditionSummary?: string;
  };

  approximateLocation: string; // Fuzzed village/block for privacy
  farmerDescription: string;

  // Case status & assignment
  status: ExpertCaseStatus;
  assignedExpertId?: string;
  assignedExpertName?: string;
  assignedAt?: string;

  // Expert's final verdict - STORED STRICTLY SEPARATELY from AI diagnosis
  expertFinalDiagnosis?: string;
  expertCorrectionType?: 'CONFIRMED' | 'CORRECTED' | 'LAB_REFERRED' | 'UNCERTAIN';
  expertNotes?: string;
  recommendedActionPlan?: string[];
  followUpDays?: number;
  reviewedAt?: string;

  // Resolution
  resolvedAt?: string;
  resolutionSummary?: string;

  // Complete Audit Trail
  auditTrail: CaseAuditEntry[];

  createdAt: string;
  updatedAt: string;
  isMockData: boolean;
}

export interface CreateCaseInput {
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmId: string;
  fieldReference?: string;
  crop: string;
  cropId?: string;
  cropStage?: string;
  imageRef?: string;
  imageUrl?: string;
  aiDiagnosis: string;
  confidence: number;
  severity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore?: number;
  environmentalFactors?: {
    temperatureC?: number;
    humidityPercent?: number;
    rainfallMm?: number;
    leafWetnessHours?: number;
    windSpeedKmph?: number;
    conditionSummary?: string;
  };
  approximateLocation?: string;
  farmerDescription?: string;
  diagnosisId?: string;
}

export interface ExpertDecisionInput {
  decision: 'CONFIRM_AI' | 'CORRECT_DIAGNOSIS' | 'MARK_UNCERTAIN' | 'REFER_TO_LAB';
  expertFinalDiagnosis?: string;
  expertNotes: string;
  recommendedActionPlan?: string[];
  followUpDays?: number;
  referralLabId?: string;
}

class ExpertCaseService {
  private cases: Map<string, ExpertCase> = new Map();

  constructor() {
    this.seedDemoCases();
  }

  private maskPhone(phone?: string): string {
    if (!phone) return '+91 98XXX XXX01';
    const cleaned = phone.replace(/[^0-9+]/g, '');
    if (cleaned.length >= 10) {
      return cleaned.slice(0, 5) + 'XXX' + cleaned.slice(-3);
    }
    return '+91 94XXX XXX10';
  }

  private seedDemoCases() {
    const demoCases: ExpertCase[] = [
      {
        caseId: 'CASE-2026-0841',
        diagnosisId: 'diag-001',
        farmerId: 'farmer-01',
        farmerName: 'Rameshwar Mahato',
        farmerPhoneMasked: '+91 984XX XX410',
        farmId: 'farm-01',
        fieldReference: 'North Damodar Plot #3',
        crop: 'Rice (Paddy)',
        cropId: 'rice',
        cropStage: 'Tillering',
        imageRef: 'img_ref_rice_blast_01',
        imageUrl: storageService.resolveImageUrl('img_ref_rice_blast_01'),
        aiDiagnosis: 'Rice Blast (Magnaporthe oryzae)',
        confidence: 0.94,
        severity: 'CRITICAL',
        riskScore: 82,
        environmentalFactors: {
          temperatureC: 28.5,
          humidityPercent: 88,
          rainfallMm: 6.2,
          leafWetnessHours: 8.5,
          windSpeedKmph: 11,
          conditionSummary: 'High humidity and persistent morning dew fostering rapid sporulation'
        },
        approximateLocation: 'Galsi Village, Purba Bardhaman Block, West Bengal',
        farmerDescription: 'Spindle lesions spreading rapidly across lower tillers after continuous night rains.',
        status: 'PENDING_REVIEW',
        auditTrail: [
          {
            id: 'audit-001-1',
            caseId: 'CASE-2026-0841',
            timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
            action: 'CASE_CREATED',
            actorId: 'farmer-01',
            actorName: 'Rameshwar Mahato',
            actorRole: 'FARMER',
            newStatus: 'PENDING_REVIEW',
            details: 'Field scan registered by farmer; high severity and risk score triggered automated KVK priority routing.'
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        isMockData: true
      },
      {
        caseId: 'CASE-2026-0842',
        diagnosisId: 'diag-002',
        farmerId: 'farmer-02',
        farmerName: 'Gurpreet Singh',
        farmerPhoneMasked: '+91 987XX XX201',
        farmId: 'farm-02',
        fieldReference: 'Canal Line Sector B',
        crop: 'Wheat',
        cropId: 'wheat',
        cropStage: 'Booting',
        imageRef: 'img_ref_wheat_rust_01',
        imageUrl: storageService.resolveImageUrl('img_ref_wheat_rust_01'),
        aiDiagnosis: 'Yellow / Stripe Rust (Puccinia striiformis)',
        confidence: 0.91,
        severity: 'HIGH',
        riskScore: 74,
        environmentalFactors: {
          temperatureC: 17.2,
          humidityPercent: 82,
          rainfallMm: 0,
          leafWetnessHours: 7.0,
          windSpeedKmph: 14,
          conditionSummary: 'Cool canopy with morning dew and moderate wind assisting spore dispersion'
        },
        approximateLocation: 'Samana Block, Patiala District, Punjab',
        farmerDescription: 'Yellowish powdery stripe patches noticed on upper leaves of two contiguous rows.',
        status: 'UNDER_REVIEW',
        assignedExpertId: 'expert-01',
        assignedExpertName: 'Dr. Debabrata Roy (KVK Senior Pathologist)',
        assignedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        auditTrail: [
          {
            id: 'audit-002-1',
            caseId: 'CASE-2026-0842',
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            action: 'CASE_CREATED',
            actorId: 'farmer-02',
            actorName: 'Gurpreet Singh',
            actorRole: 'FARMER',
            newStatus: 'PENDING_REVIEW',
            details: 'Case initiated following automated field triage.'
          },
          {
            id: 'audit-002-2',
            caseId: 'CASE-2026-0842',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            action: 'CASE_ASSIGNED',
            actorId: 'expert-01',
            actorName: 'Dr. Debabrata Roy',
            actorRole: 'EXPERT',
            previousStatus: 'PENDING_REVIEW',
            newStatus: 'UNDER_REVIEW',
            details: 'Assigned to KVK Plant Pathology diagnostic queue.'
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        isMockData: true
      },
      {
        caseId: 'CASE-2026-0839',
        diagnosisId: 'diag-003',
        farmerId: 'farmer-03',
        farmerName: 'Balwant Patel',
        farmerPhoneMasked: '+91 942XX XX890',
        farmId: 'farm-03',
        fieldReference: 'Western Well Perimeter',
        crop: 'Cotton',
        cropId: 'cotton',
        cropStage: 'Flowering',
        imageRef: 'img_ref_cotton_bollworm_01',
        imageUrl: storageService.resolveImageUrl('img_ref_cotton_bollworm_01'),
        aiDiagnosis: 'Pink Bollworm (Pectinophora gossypiella)',
        confidence: 0.88,
        severity: 'HIGH',
        riskScore: 71,
        environmentalFactors: {
          temperatureC: 30.1,
          humidityPercent: 71,
          rainfallMm: 0,
          leafWetnessHours: 3.5,
          windSpeedKmph: 9,
          conditionSummary: 'Warm evening conditions favoring moth oviposition'
        },
        approximateLocation: 'Sirsa Sub-Division, Haryana',
        farmerDescription: 'Rosetted flowers found on 12 out of 100 sampled plants.',
        status: 'CONFIRMED',
        assignedExpertId: 'expert-01',
        assignedExpertName: 'Dr. Debabrata Roy',
        assignedAt: new Date(Date.now() - 86400000).toISOString(),
        expertFinalDiagnosis: 'Pink Bollworm Infestation (Pectinophora gossypiella)',
        expertCorrectionType: 'CONFIRMED',
        expertNotes: 'Symptoms visually consistent with rosette bloom pathology and exit pinholes. AI prediction confirmed. Install Gossyplure pheromone traps @ 8 traps/acre immediately.',
        recommendedActionPlan: [
          'Install 8 Gossyplure pheromone traps per acre',
          'Hand-pick and burn rosetted flowers daily',
          'If trap catches exceed 8 moths/trap/night, apply Chlorantraniliprole 18.5% SC @ 0.3 ml/L'
        ],
        followUpDays: 4,
        reviewedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        auditTrail: [
          {
            id: 'audit-003-1',
            caseId: 'CASE-2026-0839',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            action: 'CASE_CREATED',
            actorId: 'farmer-03',
            actorName: 'Balwant Patel',
            actorRole: 'FARMER',
            newStatus: 'PENDING_REVIEW',
            details: 'Field triage scan submitted.'
          },
          {
            id: 'audit-003-2',
            caseId: 'CASE-2026-0839',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            action: 'CASE_ASSIGNED',
            actorId: 'expert-01',
            actorName: 'Dr. Debabrata Roy',
            actorRole: 'EXPERT',
            previousStatus: 'PENDING_REVIEW',
            newStatus: 'UNDER_REVIEW',
            details: 'Assigned for entomological review.'
          },
          {
            id: 'audit-003-3',
            caseId: 'CASE-2026-0839',
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            action: 'DECISION_SUBMITTED',
            actorId: 'expert-01',
            actorName: 'Dr. Debabrata Roy',
            actorRole: 'EXPERT',
            previousStatus: 'UNDER_REVIEW',
            newStatus: 'CONFIRMED',
            details: 'AI diagnosis confirmed; IPM pheromone trap action plan prescribed.'
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        isMockData: true
      }
    ];

    for (const c of demoCases) {
      this.cases.set(c.caseId, c);
    }
  }

  /**
   * Creates a new KVK / Expert case
   */
  public async createCase(
    input: CreateCaseInput,
    actor?: { id: string; name: string; role: string }
  ): Promise<ExpertCase> {
    const caseNum = Math.floor(1000 + Math.random() * 9000);
    const caseId = `CASE-2026-${caseNum}`;
    const now = new Date().toISOString();

    const newCase: ExpertCase = {
      caseId,
      diagnosisId: input.diagnosisId,
      farmerId: input.farmerId,
      farmerName: input.farmerName,
      farmerPhoneMasked: this.maskPhone(input.farmerPhone),
      farmId: input.farmId,
      fieldReference: input.fieldReference || 'Main Agricultural Plot',
      crop: input.crop,
      cropId: input.cropId || input.crop.toLowerCase().split(' ')[0],
      cropStage: input.cropStage || 'Vegetative',
      imageRef: input.imageRef,
      imageUrl: input.imageUrl || (input.imageRef ? storageService.resolveImageUrl(input.imageRef) : undefined),
      aiDiagnosis: input.aiDiagnosis,
      confidence: input.confidence,
      severity: input.severity || 'MODERATE',
      riskScore: input.riskScore || 50,
      environmentalFactors: input.environmentalFactors || {
        temperatureC: 27,
        humidityPercent: 78,
        conditionSummary: 'Ambient field weather parameters'
      },
      approximateLocation: input.approximateLocation || 'Galsi Block, Purba Bardhaman',
      farmerDescription: input.farmerDescription || 'Submitted for agronomist verification.',
      status: 'PENDING_REVIEW',
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          caseId,
          timestamp: now,
          action: 'CASE_CREATED',
          actorId: actor?.id || input.farmerId,
          actorName: actor?.name || input.farmerName,
          actorRole: actor?.role || 'FARMER',
          newStatus: 'PENDING_REVIEW',
          details: 'Case successfully created and queued for KVK expert triage.'
        }
      ],
      createdAt: now,
      updatedAt: now,
      isMockData: false
    };

    this.cases.set(caseId, newCase);
    return newCase;
  }

  /**
   * Retrieves a single case by unique case ID
   */
  public getCaseById(caseId: string): ExpertCase | null {
    return this.cases.get(caseId) || null;
  }

  /**
   * Lists all cases with filtering support
   */
  public listCases(filters?: {
    status?: ExpertCaseStatus;
    assignedExpertId?: string;
    farmerId?: string;
    cropId?: string;
    severity?: string;
  }): ExpertCase[] {
    let result = Array.from(this.cases.values());

    if (filters?.status) {
      result = result.filter(c => c.status === filters.status);
    }
    if (filters?.assignedExpertId) {
      result = result.filter(c => c.assignedExpertId === filters.assignedExpertId);
    }
    if (filters?.farmerId) {
      result = result.filter(c => c.farmerId === filters.farmerId);
    }
    if (filters?.cropId) {
      result = result.filter(c => c.cropId.toLowerCase() === filters.cropId!.toLowerCase());
    }
    if (filters?.severity) {
      result = result.filter(c => c.severity === filters.severity);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Lists only pending review cases for agronomist triage
   */
  public listPendingCases(): ExpertCase[] {
    return this.listCases({ status: 'PENDING_REVIEW' });
  }

  /**
   * Assigns a case to an expert agronomist
   */
  public assignCase(
    caseId: string,
    expertId: string,
    expertName: string,
    actor: { id: string; name: string; role: string }
  ): ExpertCase {
    const existing = this.cases.get(caseId);
    if (!existing) {
      throw new Error(`Case ${caseId} not found`);
    }

    const previousStatus = existing.status;
    const now = new Date().toISOString();

    existing.assignedExpertId = expertId;
    existing.assignedExpertName = expertName;
    existing.assignedAt = now;
    if (existing.status === 'PENDING_REVIEW') {
      existing.status = 'UNDER_REVIEW';
    }
    existing.updatedAt = now;

    existing.auditTrail.push({
      id: `audit-${Date.now()}`,
      caseId,
      timestamp: now,
      action: 'CASE_ASSIGNED',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      previousStatus,
      newStatus: existing.status,
      details: `Case assigned to expert ${expertName} (${expertId}) by ${actor.name}.`
    });

    return existing;
  }

  /**
   * Updates an expert agronomist's decision
   * STRICT DIRECTIVE: Stores expert's final diagnosis strictly SEPARATELY from the original AI diagnosis.
   */
  public updateExpertDecision(
    caseId: string,
    input: ExpertDecisionInput,
    actor: { id: string; name: string; role: string }
  ): ExpertCase {
    const existing = this.cases.get(caseId);
    if (!existing) {
      throw new Error(`Case ${caseId} not found`);
    }

    const previousStatus = existing.status;
    const now = new Date().toISOString();

    let newStatus: ExpertCaseStatus = 'UNDER_REVIEW';
    let finalDiag = existing.aiDiagnosis;

    if (input.decision === 'CONFIRM_AI') {
      newStatus = 'CONFIRMED';
      finalDiag = existing.aiDiagnosis;
      existing.expertCorrectionType = 'CONFIRMED';
    } else if (input.decision === 'CORRECT_DIAGNOSIS') {
      newStatus = 'CORRECTED';
      finalDiag = input.expertFinalDiagnosis || existing.aiDiagnosis;
      existing.expertCorrectionType = 'CORRECTED';
    } else if (input.decision === 'REFER_TO_LAB') {
      newStatus = 'UNDER_REVIEW';
      existing.expertCorrectionType = 'LAB_REFERRED';
    } else {
      newStatus = 'UNDER_REVIEW';
      existing.expertCorrectionType = 'UNCERTAIN';
    }

    existing.status = newStatus;
    existing.expertFinalDiagnosis = finalDiag; // SEPARATE field preserved
    existing.expertNotes = input.expertNotes;
    existing.recommendedActionPlan = input.recommendedActionPlan || existing.recommendedActionPlan;
    existing.followUpDays = input.followUpDays || 5;
    existing.reviewedAt = now;
    existing.updatedAt = now;

    existing.auditTrail.push({
      id: `audit-${Date.now()}`,
      caseId,
      timestamp: now,
      action: `EXPERT_DECISION_${input.decision}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      previousStatus,
      newStatus,
      details: `Expert decision logged: ${input.decision}. Final diagnosis set to "${finalDiag}". Notes: ${input.expertNotes.slice(0, 100)}`
    });

    return existing;
  }

  /**
   * Closes / resolves a case with resolution summary
   */
  public closeCase(
    caseId: string,
    resolutionSummary: string,
    actor: { id: string; name: string; role: string }
  ): ExpertCase {
    const existing = this.cases.get(caseId);
    if (!existing) {
      throw new Error(`Case ${caseId} not found`);
    }

    const previousStatus = existing.status;
    const now = new Date().toISOString();

    existing.status = 'RESOLVED';
    existing.resolvedAt = now;
    existing.resolutionSummary = resolutionSummary;
    existing.updatedAt = now;

    existing.auditTrail.push({
      id: `audit-${Date.now()}`,
      caseId,
      timestamp: now,
      action: 'CASE_RESOLVED',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      previousStatus,
      newStatus: 'RESOLVED',
      details: `Case closed and resolved. Summary: ${resolutionSummary}`
    });

    return existing;
  }

  /**
   * Calculates AI-vs-Expert agreement metrics across all reviewed cases
   */
  public getAgreementMetrics(): {
    totalCases: number;
    reviewedCasesCount: number;
    confirmedCount: number;
    correctedCount: number;
    pendingCount: number;
    agreementRatePercent: number;
    correctionRatePercent: number;
    confusionPairs: { aiDiagnosis: string; expertDiagnosis: string; count: number }[];
  } {
    const all = Array.from(this.cases.values());
    const reviewed = all.filter(c => c.status === 'CONFIRMED' || c.status === 'CORRECTED' || c.status === 'RESOLVED');

    let confirmedCount = 0;
    let correctedCount = 0;
    const confusionMap = new Map<string, number>();

    for (const c of reviewed) {
      if (c.expertCorrectionType === 'CONFIRMED' || (c.expertFinalDiagnosis && c.expertFinalDiagnosis.toLowerCase().trim() === c.aiDiagnosis.toLowerCase().trim())) {
        confirmedCount++;
      } else if (c.expertCorrectionType === 'CORRECTED' || (c.expertFinalDiagnosis && c.expertFinalDiagnosis.toLowerCase().trim() !== c.aiDiagnosis.toLowerCase().trim())) {
        correctedCount++;
        const key = `${c.aiDiagnosis} -> ${c.expertFinalDiagnosis}`;
        confusionMap.set(key, (confusionMap.get(key) || 0) + 1);
      }
    }

    const reviewedCount = reviewed.length;
    const agreementRate = reviewedCount > 0 ? Math.round((confirmedCount / reviewedCount) * 100) : 100;
    const correctionRate = reviewedCount > 0 ? Math.round((correctedCount / reviewedCount) * 100) : 0;

    const confusionPairs = Array.from(confusionMap.entries()).map(([pair, count]) => {
      const [aiDiagnosis, expertDiagnosis] = pair.split(' -> ');
      return { aiDiagnosis, expertDiagnosis, count };
    });

    return {
      totalCases: all.length,
      reviewedCasesCount: reviewedCount,
      confirmedCount,
      correctedCount,
      pendingCount: all.filter(c => c.status === 'PENDING_REVIEW').length,
      agreementRatePercent: agreementRate,
      correctionRatePercent: correctionRate,
      confusionPairs
    };
  }
}

export const expertCaseService = new ExpertCaseService();
