import { CROP_DISEASE_KNOWLEDGE_BASE } from '../../data/ipmKnowledgeBase';
import {
  findOfficialChemicalTreatments,
  VerifiedChemicalRecommendation
} from '../data/officialPesticideRegistry';
import { CategorizedAdvisory, IPMActions } from '../../types';

export interface EnvironmentalAdvisoryInput {
  temperatureC?: number;
  humidityPercent?: number;
  rainfallMm?: number;
  leafWetnessHours?: number;
  windSpeedKmph?: number;
}

export interface OutbreakAdvisoryInput {
  nearbyConfirmedCasesCount?: number;
  nearestDistanceKm?: number;
  highestNearbySeverity?: string;
  dominantThreat?: string;
}

export interface AdvisoryGenerationParams {
  cropId: string;
  cropName?: string;
  cropStage?: string;
  diagnosis: string;
  severity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore?: number;
  environmentalFactors?: EnvironmentalAdvisoryInput;
  outbreakInfo?: OutbreakAdvisoryInput;
}

export interface ImmediateActionRecommendation {
  action: string;
  why: string;
  timeOfDay: string;
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL';
  type: 'SANITATION' | 'WATER_MANAGEMENT' | 'ISOLATION' | 'NUTRIENT_ADJUSTMENT';
}

export interface MonitoringRecommendation {
  action: string;
  why: string;
  scoutingPattern: 'DIAGONAL_W' | 'ZIG_ZAG' | 'FIELD_BORDER' | 'HOTSPOT_RADIUS';
  frequency: string;
  timeOfDay: string;
  etlThreshold: string;
}

export interface PreventiveNonChemicalRecommendation {
  action: string;
  why: string;
  category: 'BIOLOGICAL' | 'CULTURAL' | 'MECHANICAL';
  instructions: string;
  timeOfDay?: string;
}

export interface ApprovedTreatmentGuidance {
  isChemicalRecommended: boolean;
  officialSource: string;
  treatments: VerifiedChemicalRecommendation[];
  safeGuidanceMessage?: string;
  regulatoryNotice: string;
  preHarvestIntervalNotice?: string;
}

export interface ComprehensiveAgriculturalAdvisory {
  cropId: string;
  cropName: string;
  cropStage: string;
  diagnosis: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number;

  // 4 Core Required Pillars
  immediateAction: ImmediateActionRecommendation[];
  monitoring: MonitoringRecommendation[];
  preventiveNonChemical: PreventiveNonChemicalRecommendation[];
  approvedTreatmentGuidance: ApprovedTreatmentGuidance;

  // Farmer-ready operational plan
  todaysActionPlan: {
    priority: 'URGENT' | 'HIGH' | 'RECOMMENDED' | 'FIELD_CARE';
    timeOfDay: string;
    title: string;
    instruction: string;
    why: string;
  }[];

  environmentalContext: {
    temperatureC?: number;
    humidityPercent?: number;
    rainfallMm?: number;
    microclimateRiskFactor: string;
    outbreakProximityNote?: string;
  };

  farmerSummary: string;

  // Backward compatibility fields for legacy frontend views
  ipm: IPMActions;
  categorized: CategorizedAdvisory;
}

class AdvisoryService {
  /**
   * Generates a comprehensive, structured agricultural advisory
   * combining crop stage, microclimate telemetry, severity, and verified CIBRC chemical treatments.
   * STRICT GUARANTEE: Never invents or fabricates pesticide names, doses, or regulatory approvals.
   */
  public generateComprehensiveAdvisory(params: AdvisoryGenerationParams): ComprehensiveAgriculturalAdvisory {
    const cropId = (params.cropId || 'rice').toLowerCase().trim();
    const cropStage = params.cropStage || 'Vegetative';
    const diagnosis = params.diagnosis || 'Rice Blast';
    const severity = params.severity || 'MODERATE';
    const riskScore = params.riskScore !== undefined ? params.riskScore : 65;
    const env = params.environmentalFactors || {};
    const outbreak = params.outbreakInfo || {};

    // 1. Resolve knowledge base entry
    const kbEntry = Object.values(CROP_DISEASE_KNOWLEDGE_BASE).find(k => {
      return (
        k.cropId.toLowerCase() === cropId &&
        diagnosis.toLowerCase().includes(k.name.toLowerCase().split(' ')[0])
      );
    }) || Object.values(CROP_DISEASE_KNOWLEDGE_BASE).find(k => k.cropId.toLowerCase() === cropId)
       || CROP_DISEASE_KNOWLEDGE_BASE['rice-blast'];

    // 2. Query Official CIBRC Chemical Registry
    const officialLookup = findOfficialChemicalTreatments(cropId, diagnosis, cropStage);

    // Chemical recommendation policy:
    // Only recommend chemical if severity is at least MODERATE and verified in official CIBRC registry.
    // If severity is LOW or Healthy, prioritize non-chemical and safe guidance.
    const isSevereEnoughForChemical = severity === 'HIGH' || severity === 'CRITICAL' || (severity === 'MODERATE' && riskScore >= 50);
    const hasVerifiedChemicals = officialLookup.isVerified && officialLookup.treatments.length > 0;

    let treatmentGuidance: ApprovedTreatmentGuidance;

    if (hasVerifiedChemicals && isSevereEnoughForChemical) {
      treatmentGuidance = {
        isChemicalRecommended: true,
        officialSource: officialLookup.officialSource,
        treatments: officialLookup.treatments,
        regulatoryNotice: 'Chemical treatments listed are officially approved by the Central Insecticides Board & Registration Committee (CIBRC) and recommended under ICAR Package of Practices. Strictly adhere to prescribed dilutions and pre-harvest waiting periods.',
        preHarvestIntervalNotice: `Observe the mandatory waiting period (${officialLookup.treatments[0].waitingPeriodDays} days) between final spray and harvest to ensure food safety limits.`
      };
    } else if (hasVerifiedChemicals && !isSevereEnoughForChemical) {
      // Verified chemicals exist in database, but the disease severity is LOW.
      // Do NOT apply chemicals prematurely!
      treatmentGuidance = {
        isChemicalRecommended: false,
        officialSource: officialLookup.officialSource,
        treatments: [],
        safeGuidanceMessage: `Disease severity is currently ${severity} (Risk Score: ${riskScore}). Chemical fungicide/pesticide application is NOT warranted at this stage. Chemical intervention should only be triggered if lesions cross the Economic Threshold Level (ETL). Rely on non-chemical sanitation and biological controls.`,
        regulatoryNotice: 'IPM Protocol: Chemical application is strictly restricted to situations where cultural and biocontrol methods fail and the pathogen exceeds ETL.'
      };
    } else {
      // No verified chemical in official registry -> Return safe expert referral message
      treatmentGuidance = {
        isChemicalRecommended: false,
        officialSource: officialLookup.officialSource,
        treatments: [],
        safeGuidanceMessage: officialLookup.safeMessage || 'No verified synthetic chemical treatment is registered in the official CIBRC database for this specific crop and condition. Please implement cultural sanitation, or consult your nearest Krishi Vigyan Kendra (KVK) agronomist for certified laboratory examination before using any chemical formulation.',
        regulatoryNotice: 'Regulatory Safeguard: CropGuard AI strictly prohibits unverified or synthetic pesticide recommendations not explicitly registered by national regulatory bodies.'
      };
    }

    // 3. Build Structured Immediate Actions
    const immediateAction: ImmediateActionRecommendation[] = [];

    if (severity === 'CRITICAL' || env.humidityPercent! >= 85 || env.rainfallMm! > 5) {
      immediateAction.push({
        action: 'Lower standing field water to 2-3 cm and halt overhead sprinkler irrigation',
        why: 'Standing water and leaf wetness promote continuous fungal spore incubation and secondary mycelial penetration.',
        timeOfDay: 'Immediate (Early Morning)',
        urgency: 'CRITICAL',
        type: 'WATER_MANAGEMENT'
      });
    }

    immediateAction.push({
      action: 'Immediately halt top-dressing of nitrogenous fertilizers (Urea)',
      why: 'Excess nitrogen produces tender, succulent foliar tissue that breaks down rapidly under pathogen attack.',
      timeOfDay: 'Immediate',
      urgency: severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      type: 'NUTRIENT_ADJUSTMENT'
    });

    immediateAction.push({
      action: 'Prune or rogue heavily infected leaves and dispose off-field in a deep soil pit',
      why: 'Physically breaks foliar sporulation sites and reduces airborne inoculum density for neighbouring healthy plants.',
      timeOfDay: 'Morning (07:00 - 09:00 AM)',
      urgency: 'HIGH',
      type: 'ISOLATION'
    });

    // 4. Build Structured Monitoring Steps
    const monitoring: MonitoringRecommendation[] = [
      {
        action: 'Scout 20 random hills or plant stands following a diagonal W-shaped trajectory across the plot',
        why: 'Captures an unbiased statistical sample of disease spread across micro-topographic variations.',
        scoutingPattern: 'DIAGONAL_W',
        frequency: severity === 'CRITICAL' || riskScore >= 75 ? 'Every 24 hours' : 'Every 3 days',
        timeOfDay: 'Morning 07:00 - 09:30 AM (during dew evaporation)',
        etlThreshold: '5% leaf area affected or >2 spindle lesions per leaf'
      },
      {
        action: 'Inspect leaf underside and collars for milky bacterial ooze or fresh fungal sporulation rings',
        why: 'Active sporulation indicates viable, expanding infection requiring immediate biocontrol or barrier protection.',
        scoutingPattern: 'HOTSPOT_RADIUS',
        frequency: 'Daily during high humidity periods (>80% RH)',
        timeOfDay: 'Dawn (06:00 - 07:30 AM)',
        etlThreshold: 'Presence of active sporulation rings'
      }
    ];

    if (cropId.includes('cotton') || diagnosis.toLowerCase().includes('borer') || diagnosis.toLowerCase().includes('bollworm')) {
      monitoring.push({
        action: 'Inspect pheromone traps and count caught adult moths; replace septa lures every 21 days',
        why: 'Trap counts directly indicate oviposition peaks and adult flight activity.',
        scoutingPattern: 'FIELD_BORDER',
        frequency: 'Daily at dusk or sunrise',
        timeOfDay: '06:00 AM or 06:30 PM',
        etlThreshold: '8 moths per trap per night for 3 consecutive nights'
      });
    }

    // 5. Build Structured Preventive / Non-Chemical Measures
    const preventiveNonChemical: PreventiveNonChemicalRecommendation[] = [
      {
        action: 'Foliar spray of beneficial bio-agent Trichoderma viride 1% WP @ 5 g/liter of water',
        why: 'Competitively colonizes leaf phyllosphere and secretes chitinase enzymes that degrade fungal cell walls.',
        category: 'BIOLOGICAL',
        instructions: 'Mix with 1% jaggery solution 1 hour prior to application; spray during cooler late afternoon hours to shield living spores from solar UV degradation.',
        timeOfDay: 'Late Afternoon (04:00 - 06:00 PM)'
      },
      {
        action: 'Foliar application of Pseudomonas fluorescens (Pf-1 formulation) @ 2.5 kg/ha in 500 liters water',
        why: 'Induces systemic resistance (ISR) in host plant tissues and produces phenazine antibiotics against bacterial and fungal blights.',
        category: 'BIOLOGICAL',
        instructions: 'Apply at 10-14 day intervals as a preventive canopy wash.',
        timeOfDay: 'Late Afternoon'
      },
      {
        action: 'Maintain clean bunds, eradicate alternate weed hosts, and ensure 20cm row spacing',
        why: 'Promotes canopy air circulation, accelerates morning dew dry-off, and eliminates overwintering insect hosts.',
        category: 'CULTURAL',
        instructions: 'Weed field bunds and ensure open sunlight channels between rows.',
        timeOfDay: 'Morning'
      }
    ];

    // 6. Action Plan for Today
    const todaysActionPlan = [
      {
        priority: 'URGENT' as const,
        timeOfDay: 'Morning (07:00 - 09:30 AM)',
        title: 'Canopy Inspection & Water Drainage',
        instruction: `Scout field along a diagonal W-path. Drain standing water to 2 cm and withhold urea top-dressing.`,
        why: 'Dew evaporation window reveals active lesions; lowering water reduces relative humidity in the microclimate.'
      },
      {
        priority: 'HIGH' as const,
        timeOfDay: 'Late Afternoon (04:00 - 06:00 PM)',
        title: isSevereEnoughForChemical && hasVerifiedChemicals
          ? `Targeted Application: ${treatmentGuidance.treatments[0].chemicalName}`
          : 'Foliar Bio-Protective Application',
        instruction: isSevereEnoughForChemical && hasVerifiedChemicals
          ? `Prepare spray solution: ${treatmentGuidance.treatments[0].chemicalName} @ ${treatmentGuidance.treatments[0].dosage}. Wear ${treatmentGuidance.treatments[0].safetyEquipment.join(', ')}.`
          : 'Apply Trichoderma viride or Pseudomonas fluorescens @ 5 g/L with thorough foliar coverage.',
        why: 'Evening application prevents rapid droplet evaporation and protects active ingredients/biocontrol spores from harsh midday solar UV.'
      },
      {
        priority: 'RECOMMENDED' as const,
        timeOfDay: 'Next Day Morning (08:00 AM)',
        title: 'Follow-Up Lesion Assessment',
        instruction: 'Verify whether lesion margins have dried into dark brown necrosis or if new yellow haloes have appeared.',
        why: 'Determines whether the pathogen has been contained or requires formal KVK pathologist escalation.'
      }
    ];

    // 7. Microclimate Context Synthesis
    const tempStr = env.temperatureC ? `${env.temperatureC}°C` : 'seasonal average';
    const humStr = env.humidityPercent ? `${env.humidityPercent}%` : 'elevated';
    const outbreakStr = outbreak.nearbyConfirmedCasesCount
      ? `${outbreak.nearbyConfirmedCasesCount} confirmed outbreak case(s) active within ${outbreak.nearestDistanceKm || 15} km`
      : 'no immediate outbreak cluster within 5 km';

    const farmerSummary = `Your ${kbEntry.cropId.toUpperCase()} at stage ${cropStage} has been evaluated for ${diagnosis} (Severity: ${severity}, Risk: ${riskScore}/100). Microclimate conditions (${tempStr}, ${humStr} RH) and ${outbreakStr} require decisive field sanitation. ${
      treatmentGuidance.isChemicalRecommended
        ? `Chemical intervention is authorized under CIBRC guidelines using ${treatmentGuidance.treatments[0].chemicalName}.`
        : 'Prioritize non-chemical biocontrol and drainage measures. Synthetic chemical application is not advised without prior ETL verification.'
    }`;

    // 8. Backward Compatibility Objects for Existing Frontend
    const backwardIPM: IPMActions = {
      prevention: kbEntry.ipm.prevention,
      cultural: kbEntry.ipm.cultural,
      mechanical: kbEntry.ipm.mechanical,
      biological: kbEntry.ipm.biological,
      monitoring: kbEntry.ipm.monitoring,
      chemical: hasVerifiedChemicals ? officialLookup.treatments.map(t => ({
        chemicalName: t.chemicalName,
        tradeNames: t.tradeNames,
        dosage: t.dosage,
        waterVolume: t.waterVolume,
        applicationMethod: t.applicationMethod,
        waitingPeriodDays: t.waitingPeriodDays,
        safetyEquipment: t.safetyEquipment,
        restrictions: t.restrictions,
        cibrcApproved: t.cibrcApproved
      })) : []
    };

    const backwardCategorized: CategorizedAdvisory = {
      immediateActions: immediateAction.map(a => ({
        action: a.action,
        why: a.why,
        timeOfDay: a.timeOfDay,
        type: a.type === 'SANITATION' ? 'SANITATION' : 'CULTURAL'
      })),
      monitoringSteps: monitoring.map(m => ({
        action: m.action,
        why: m.why,
        timeOfDay: m.timeOfDay,
        type: 'MONITORING',
        etlThreshold: m.etlThreshold
      })),
      preventiveNonChemical: preventiveNonChemical.map(p => ({
        action: p.action,
        why: p.why,
        timeOfDay: p.timeOfDay,
        type: p.category
      })),
      approvedTreatmentGuidance: treatmentGuidance.treatments.map(t => ({
        chemicalName: t.chemicalName,
        tradeNames: t.tradeNames,
        dosage: t.dosage,
        waterVolume: t.waterVolume,
        applicationMethod: t.applicationMethod,
        waitingPeriodDays: t.waitingPeriodDays,
        safetyEquipment: t.safetyEquipment,
        restrictions: t.restrictions,
        cibrcApproved: t.cibrcApproved,
        officialAdherenceNote: t.officialSource
      })),
      todaysActionPlan
    };

    return {
      cropId: kbEntry.cropId,
      cropName: kbEntry.cropId === 'rice' ? 'Rice (Paddy)' : kbEntry.cropId === 'wheat' ? 'Wheat' : kbEntry.cropId === 'cotton' ? 'Cotton' : 'Potato',
      cropStage,
      diagnosis,
      severity,
      riskScore,
      immediateAction,
      monitoring,
      preventiveNonChemical,
      approvedTreatmentGuidance: treatmentGuidance,
      todaysActionPlan,
      environmentalContext: {
        temperatureC: env.temperatureC,
        humidityPercent: env.humidityPercent,
        rainfallMm: env.rainfallMm,
        microclimateRiskFactor: `${tempStr} temperature with ${humStr} relative humidity`,
        outbreakProximityNote: outbreakStr
      },
      farmerSummary,
      ipm: backwardIPM,
      categorized: backwardCategorized
    };
  }

  /**
   * Backward-compatible helper method for legacy routes
   */
  public getAdvisoryForDisease(cropId: string, diseaseName?: string) {
    const full = this.generateComprehensiveAdvisory({
      cropId,
      diagnosis: diseaseName || 'Rice Blast'
    });

    return {
      cropId: full.cropId,
      diseaseName: full.diagnosis,
      ipm: full.ipm,
      categorized: full.categorized
    };
  }
}

export const advisoryService = new AdvisoryService();
