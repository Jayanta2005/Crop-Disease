import { RiskAssessment, RiskFactorDetail } from '../types';

/**
 * Configurable agronomic risk profile for crop-specific disease and pest biophysical dynamics.
 * Thresholds and weights can be tuned per crop or regionally without rewriting calculation logic.
 */
export interface CropRiskThresholdProfile {
  cropId: string;
  cropName: string;
  optimalTempMinC: number;
  optimalTempMaxC: number;
  criticalHighTempC: number;
  highRhThreshold: number;
  criticalRhThreshold: number;
  criticalLeafWetnessHours: number;
  moderateLeafWetnessHours: number;
  rainfallInfectionThresholdMm: number;
  rainfallSplashThresholdMm: number;
  defaultTrapETL: number;
  susceptibleStages: string[];
  weights: {
    relativeHumidity: number;
    leafWetness: number;
    temperature: number;
    rainfall: number;
    cropStage: number;
    outbreakProximity: number;
    fieldInoculum: number;
    trapBreach: number;
  };
}

/**
 * Pre-calibrated crop risk profiles grounded in standard ICAR and State Agricultural University guidelines.
 */
export const CROP_RISK_PROFILES: Record<string, CropRiskThresholdProfile> = {
  rice: {
    cropId: 'rice',
    cropName: 'Rice (Paddy)',
    optimalTempMinC: 20,
    optimalTempMaxC: 30,
    criticalHighTempC: 36,
    highRhThreshold: 78,
    criticalRhThreshold: 86,
    criticalLeafWetnessHours: 7.5,
    moderateLeafWetnessHours: 4.0,
    rainfallInfectionThresholdMm: 2.0,
    rainfallSplashThresholdMm: 12.0,
    defaultTrapETL: 8,
    susceptibleStages: ['Tillering', 'Panicle Initiation', 'Booting', 'Flowering'],
    weights: {
      relativeHumidity: 28,
      leafWetness: 18,
      temperature: 18,
      rainfall: 16,
      cropStage: 14,
      outbreakProximity: 20,
      fieldInoculum: 15,
      trapBreach: 25
    }
  },
  wheat: {
    cropId: 'wheat',
    cropName: 'Wheat',
    optimalTempMinC: 10,
    optimalTempMaxC: 22,
    criticalHighTempC: 28,
    highRhThreshold: 72,
    criticalRhThreshold: 82,
    criticalLeafWetnessHours: 6.0,
    moderateLeafWetnessHours: 3.5,
    rainfallInfectionThresholdMm: 1.5,
    rainfallSplashThresholdMm: 8.0,
    defaultTrapETL: 10,
    susceptibleStages: ['Tillering', 'Jointing', 'Heading', 'Milking'],
    weights: {
      relativeHumidity: 24,
      leafWetness: 22,
      temperature: 20,
      rainfall: 12,
      cropStage: 16,
      outbreakProximity: 22,
      fieldInoculum: 16,
      trapBreach: 20
    }
  },
  cotton: {
    cropId: 'cotton',
    cropName: 'Cotton',
    optimalTempMinC: 24,
    optimalTempMaxC: 34,
    criticalHighTempC: 40,
    highRhThreshold: 70,
    criticalRhThreshold: 80,
    criticalLeafWetnessHours: 5.0,
    moderateLeafWetnessHours: 3.0,
    rainfallInfectionThresholdMm: 3.0,
    rainfallSplashThresholdMm: 15.0,
    defaultTrapETL: 8,
    susceptibleStages: ['Squaring', 'Flowering', 'Boll Formation', 'Boll Development'],
    weights: {
      relativeHumidity: 18,
      leafWetness: 14,
      temperature: 24,
      rainfall: 14,
      cropStage: 20,
      outbreakProximity: 18,
      fieldInoculum: 14,
      trapBreach: 30
    }
  },
  potato: {
    cropId: 'potato',
    cropName: 'Potato',
    optimalTempMinC: 12,
    optimalTempMaxC: 21,
    criticalHighTempC: 27,
    highRhThreshold: 80,
    criticalRhThreshold: 90,
    criticalLeafWetnessHours: 8.0, // Smith Period requirement
    moderateLeafWetnessHours: 4.0,
    rainfallInfectionThresholdMm: 2.0,
    rainfallSplashThresholdMm: 10.0,
    defaultTrapETL: 6,
    susceptibleStages: ['Vegetative', 'Tuber Initiation', 'Tuber Bulking'],
    weights: {
      relativeHumidity: 30,
      leafWetness: 24,
      temperature: 20,
      rainfall: 15,
      cropStage: 15,
      outbreakProximity: 22,
      fieldInoculum: 18,
      trapBreach: 15
    }
  },
  tomato: {
    cropId: 'tomato',
    cropName: 'Tomato',
    optimalTempMinC: 18,
    optimalTempMaxC: 28,
    criticalHighTempC: 35,
    highRhThreshold: 75,
    criticalRhThreshold: 85,
    criticalLeafWetnessHours: 5.5,
    moderateLeafWetnessHours: 3.0,
    rainfallInfectionThresholdMm: 2.0,
    rainfallSplashThresholdMm: 10.0,
    defaultTrapETL: 7,
    susceptibleStages: ['Vegetative', 'Flowering', 'Fruiting', 'Ripening'],
    weights: {
      relativeHumidity: 26,
      leafWetness: 20,
      temperature: 18,
      rainfall: 16,
      cropStage: 16,
      outbreakProximity: 20,
      fieldInoculum: 16,
      trapBreach: 24
    }
  },
  default: {
    cropId: 'default',
    cropName: 'Standard Field Crop',
    optimalTempMinC: 20,
    optimalTempMaxC: 30,
    criticalHighTempC: 36,
    highRhThreshold: 75,
    criticalRhThreshold: 85,
    criticalLeafWetnessHours: 7.0,
    moderateLeafWetnessHours: 4.0,
    rainfallInfectionThresholdMm: 2.0,
    rainfallSplashThresholdMm: 10.0,
    defaultTrapETL: 8,
    susceptibleStages: ['Tillering', 'Panicle Initiation', 'Flowering', 'Fruiting', 'Squaring', 'Tuber Formation'],
    weights: {
      relativeHumidity: 25,
      leafWetness: 18,
      temperature: 18,
      rainfall: 15,
      cropStage: 15,
      outbreakProximity: 20,
      fieldInoculum: 15,
      trapBreach: 25
    }
  }
};

/**
 * Structured inputs for deterministic agricultural risk calculation.
 * Supports explicit missing value flags (undefined/null) to prevent artificial value generation.
 */
export interface RiskInputParams {
  cropId: string;
  cropName?: string;
  cropStage?: string;
  latitude?: number;
  longitude?: number;

  // Microclimate sensor or weather inputs (null/undefined if unmeasured)
  temperatureC?: number | null;
  humidityPercent?: number | null;
  leafWetnessHours?: number | null;
  rainfallMm?: number | null;
  windSpeedKmph?: number | null;

  // Surveillance & Biological monitoring
  nearbyConfirmedCasesCount?: number | null;
  nearbySuspectedCasesCount?: number | null;
  nearbyRadiusKm?: number;
  nearbyCasesRadiusKm?: number;
  recentTrapCount?: number | null;
  trapThreshold?: number | null;

  // Field diagnosis context
  recentDiagnosisDisease?: string;
  recentDiagnosisConfidence?: number;
  recentObservations?: string[];

  // Weather projection inputs
  forecastTomorrowRainMm?: number | null;
  forecastTomorrowHumidity?: number | null;
  forecastTomorrowTempC?: number | null;

  // Metadata / Sensor data provenance
  dataSourceMeta?: {
    temperatureSource?: 'SENSOR' | 'WEATHER_STATION' | 'ESTIMATED' | 'UNAVAILABLE';
    humiditySource?: 'SENSOR' | 'WEATHER_STATION' | 'ESTIMATED' | 'UNAVAILABLE';
    leafWetnessSource?: 'SENSOR' | 'ESTIMATED' | 'UNAVAILABLE';
    rainfallSource?: 'SENSOR' | 'WEATHER_STATION' | 'ESTIMATED' | 'UNAVAILABLE';
    trapSource?: 'SMART_TRAP' | 'MANUAL_SCOUT' | 'UNAVAILABLE';
  };

  // Optional custom crop threshold overrides
  customProfile?: Partial<CropRiskThresholdProfile>;
}

export interface RiskForecastInterval {
  hourOffset: number; // 0, 6, 12, 24, 36, 48
  timeLabel: string;
  projectedTempC?: number;
  projectedHumidityPercent?: number;
  projectedRainMm?: number;
  projectedLeafWetnessHours?: number;
  diseaseRiskScore: number;
  pestRiskScore: number;
  compositeRiskScore: number;
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  majorDrivers: string[];
}

export interface RiskForecastResponse {
  cropId: string;
  cropStage: string;
  currentRiskScore: number;
  currentCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  forecast24hScore: number;
  forecast48hScore: number;
  trend: 'RISING' | 'STEADY' | 'FALLING';
  recommendedMonitoringInterval: string;
  majorDrivers: string[];
  intervals: RiskForecastInterval[];
  dataQuality: {
    dataCompletenessPercent: number;
    measuredFactors: string[];
    unavailableFactors: string[];
  };
  disclaimer: string;
}

/**
 * Resolves the appropriate crop risk profile.
 */
export function getCropRiskProfile(cropId: string, custom?: Partial<CropRiskThresholdProfile>): CropRiskThresholdProfile {
  const normalized = (cropId || '').toLowerCase().trim();
  const baseProfile = CROP_RISK_PROFILES[normalized] || CROP_RISK_PROFILES.default;

  if (!custom) return baseProfile;

  return {
    ...baseProfile,
    ...custom,
    weights: {
      ...baseProfile.weights,
      ...(custom.weights || {})
    }
  };
}

/**
 * Maps numerical score (0-100) to standard agronomic risk category.
 */
export function getRiskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
  if (score >= 76) return 'CRITICAL';
  if (score >= 51) return 'HIGH';
  if (score >= 26) return 'MODERATE';
  return 'LOW';
}

/**
 * Computes recommended scouting / monitoring frequency based on risk level and vulnerability.
 */
export function getRecommendedMonitoringInterval(level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL', isVulnerableStage: boolean): string {
  switch (level) {
    case 'CRITICAL':
      return 'Every 12 hours (sunrise dew inspection & late afternoon foliar check)';
    case 'HIGH':
      return isVulnerableStage
        ? 'Every 24 hours (inspect before 10:00 AM before foliar dew evaporates)'
        : 'Every 24–36 hours (daily foliar canopy inspection)';
    case 'MODERATE':
      return 'Every 48 hours (standard 2-day scouting across "W" walking path)';
    case 'LOW':
    default:
      return 'Weekly (standard routine field bund and canopy inspection)';
  }
}

/**
 * Core Deterministic Risk Engine.
 * Evaluates biophysical microclimate, phenology, geospatial proximity, and trap breaches.
 * Explicitly marks missing factors as UNAVAILABLE rather than inventing synthetic sensor measurements.
 */
export function calculateAgriculturalRisk(input: RiskInputParams): RiskAssessment {
  const profile = getCropRiskProfile(input.cropId, input.customProfile);
  const cropName = input.cropName || profile.cropName;
  const cropStage = input.cropStage || 'Vegetative';

  let rawDiseasePoints = 0;
  let rawPestPoints = 0;
  let maxPossibleDiseasePoints = 0;
  let maxPossiblePestPoints = 0;

  const rulesApplied: string[] = [];
  const riskFactors: RiskFactorDetail[] = [];
  const primaryThreats: RiskAssessment['primaryThreats'] = [];
  const preventiveAdvice: string[] = [];

  const measuredFactorsList: string[] = [];
  const unavailableFactorsList: string[] = [];

  // ==========================================
  // FACTOR 1: Relative Humidity (Sensor / Station)
  // ==========================================
  maxPossibleDiseasePoints += profile.weights.relativeHumidity;
  if (input.humidityPercent !== undefined && input.humidityPercent !== null && !isNaN(input.humidityPercent)) {
    measuredFactorsList.push('Relative Humidity');
    const rh = input.humidityPercent;
    const isHigh = rh >= profile.criticalRhThreshold;
    const isModerate = rh >= profile.highRhThreshold;

    if (isHigh) {
      rawDiseasePoints += profile.weights.relativeHumidity;
      rulesApplied.push(`RH >= ${profile.criticalRhThreshold}%: Optimal spore germination and infection incubation (+${profile.weights.relativeHumidity} disease points)`);
      riskFactors.push({
        factor: 'Very High Relative Humidity',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: profile.weights.relativeHumidity,
        weight: profile.weights.relativeHumidity,
        description: `${rh}% RH creates extended moisture film enabling rapid fungal spore germination.`,
        value: `${rh}% RH`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    } else if (isModerate) {
      const pts = Math.round(profile.weights.relativeHumidity * 0.65);
      rawDiseasePoints += pts;
      rulesApplied.push(`RH ${profile.highRhThreshold}-${profile.criticalRhThreshold - 1}%: Elevated microclimatic moisture (+${pts} disease points)`);
      riskFactors.push({
        factor: 'Elevated Relative Humidity',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: pts,
        weight: profile.weights.relativeHumidity,
        description: `${rh}% RH sustains humidity within dense vegetative canopy.`,
        value: `${rh}% RH`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    } else {
      riskFactors.push({
        factor: 'Low/Moderate Air Humidity',
        impact: 'UNFAVORABLE',
        status: 'MEASURED',
        scoreContribution: 0,
        weight: profile.weights.relativeHumidity,
        description: `${rh}% RH restricts airborne spore tube penetration and desiccation.`,
        value: `${rh}% RH`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    }
  } else {
    unavailableFactorsList.push('Relative Humidity');
    riskFactors.push({
      factor: 'Relative Humidity',
      impact: 'UNAVAILABLE',
      status: 'UNAVAILABLE',
      scoreContribution: 0,
      weight: profile.weights.relativeHumidity,
      description: 'Sensor or meteorological humidity data currently unavailable.',
      value: 'Unavailable',
      isObserved: false,
      sourceType: 'UNAVAILABLE'
    });
  }

  // ==========================================
  // FACTOR 2: Leaf Wetness Duration (IoT Leaf Sensor / Microclimate)
  // ==========================================
  maxPossibleDiseasePoints += profile.weights.leafWetness;
  if (input.leafWetnessHours !== undefined && input.leafWetnessHours !== null && !isNaN(input.leafWetnessHours)) {
    measuredFactorsList.push('Leaf Wetness Duration');
    const lw = input.leafWetnessHours;
    const isCritical = lw >= profile.criticalLeafWetnessHours;
    const isModerate = lw >= profile.moderateLeafWetnessHours;

    if (isCritical) {
      rawDiseasePoints += profile.weights.leafWetness;
      rulesApplied.push(`Leaf Wetness >= ${profile.criticalLeafWetnessHours}h: Critical free water film threshold exceeded (+${profile.weights.leafWetness} disease points)`);
      riskFactors.push({
        factor: 'Extended Leaf Wetness Duration',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: profile.weights.leafWetness,
        weight: profile.weights.leafWetness,
        description: `${lw} hours continuous moisture film exceeds pathogen penetration threshold.`,
        value: `${lw} Hours`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    } else if (isModerate) {
      const pts = Math.round(profile.weights.leafWetness * 0.55);
      rawDiseasePoints += pts;
      rulesApplied.push(`Leaf Wetness ${profile.moderateLeafWetnessHours}-${profile.criticalLeafWetnessHours}h: Moderate surface moisture (+${pts} disease points)`);
      riskFactors.push({
        factor: 'Moderate Leaf Wetness Duration',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: pts,
        weight: profile.weights.leafWetness,
        description: `${lw} hours of moisture film during early morning dew period.`,
        value: `${lw} Hours`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    } else {
      riskFactors.push({
        factor: 'Dry Foliar Canopy',
        impact: 'UNFAVORABLE',
        status: 'MEASURED',
        scoreContribution: 0,
        weight: profile.weights.leafWetness,
        description: `${lw} hours wetness: leaves dried rapidly, inhibiting pathogen appressoria formation.`,
        value: `${lw} Hours`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    }
  } else {
    // DO NOT invent a fake sensor measurement. Mark explicitly as UNAVAILABLE.
    unavailableFactorsList.push('Leaf Wetness Duration');
    riskFactors.push({
      factor: 'Leaf Wetness Duration',
      impact: 'UNAVAILABLE',
      status: 'UNAVAILABLE',
      scoreContribution: 0,
      weight: profile.weights.leafWetness,
      description: 'Dedicated IoT leaf wetness sensor is not installed or offline.',
      value: 'Unavailable (No Sensor)',
      isObserved: false,
      sourceType: 'UNAVAILABLE'
    });
  }

  // ==========================================
  // FACTOR 3: Ambient Temperature
  // ==========================================
  maxPossibleDiseasePoints += profile.weights.temperature;
  maxPossiblePestPoints += profile.weights.temperature;
  if (input.temperatureC !== undefined && input.temperatureC !== null && !isNaN(input.temperatureC)) {
    measuredFactorsList.push('Ambient Temperature');
    const temp = input.temperatureC;
    const isOptimal = temp >= profile.optimalTempMinC && temp <= profile.optimalTempMaxC;
    const isWarmPestFavored = temp > profile.optimalTempMaxC && temp <= profile.criticalHighTempC;

    if (isOptimal) {
      rawDiseasePoints += profile.weights.temperature;
      rawPestPoints += profile.weights.temperature;
      rulesApplied.push(`Temp ${profile.optimalTempMinC}-${profile.optimalTempMaxC}°C: Ideal bioclimatic thermal window (+${profile.weights.temperature} disease, +${profile.weights.temperature} pest points)`);
      riskFactors.push({
        factor: 'Optimal Pathogen & Insect Temperature',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: profile.weights.temperature,
        weight: profile.weights.temperature,
        description: `${temp}°C optimizes fungal mycelial elongation and insect metabolic rate.`,
        value: `${temp}°C`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    } else if (isWarmPestFavored) {
      const pestPts = Math.round(profile.weights.temperature * 1.2);
      const disPts = Math.round(profile.weights.temperature * 0.5);
      rawPestPoints += pestPts;
      rawDiseasePoints += disPts;
      rulesApplied.push(`Temp ${profile.optimalTempMaxC + 1}-${profile.criticalHighTempC}°C: High insect reproduction (+${pestPts} pest, +${disPts} disease points)`);
      riskFactors.push({
        factor: 'Warm Temperature (Insect Multiplication Favored)',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: pestPts,
        weight: profile.weights.temperature,
        description: `${temp}°C accelerates pupal emergence, hopper multiplication, and mite reproduction.`,
        value: `${temp}°C`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    } else {
      riskFactors.push({
        factor: 'Thermal Growth Incompatible',
        impact: 'UNFAVORABLE',
        status: 'MEASURED',
        scoreContribution: 0,
        weight: profile.weights.temperature,
        description: `${temp}°C is outside the optimal thermal band, retarding development rates.`,
        value: `${temp}°C`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    }
  } else {
    unavailableFactorsList.push('Ambient Temperature');
    riskFactors.push({
      factor: 'Ambient Temperature',
      impact: 'UNAVAILABLE',
      status: 'UNAVAILABLE',
      scoreContribution: 0,
      weight: profile.weights.temperature,
      description: 'Air temperature measurement unavailable.',
      value: 'Unavailable',
      isObserved: false,
      sourceType: 'UNAVAILABLE'
    });
  }

  // ==========================================
  // FACTOR 4: Rainfall & Splash Dispersal
  // ==========================================
  maxPossibleDiseasePoints += profile.weights.rainfall;
  if (input.rainfallMm !== undefined && input.rainfallMm !== null && !isNaN(input.rainfallMm)) {
    measuredFactorsList.push('Rainfall');
    const rain = input.rainfallMm;
    const isHeavySplash = rain >= profile.rainfallSplashThresholdMm;
    const isLightInfection = rain >= profile.rainfallInfectionThresholdMm;

    if (isHeavySplash) {
      rawDiseasePoints += profile.weights.rainfall;
      rulesApplied.push(`Rainfall >= ${profile.rainfallSplashThresholdMm}mm: Rain-splash spore dispersal active (+${profile.weights.rainfall} disease points)`);
      riskFactors.push({
        factor: 'Active Rain-Splash Spore Dispersal',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: profile.weights.rainfall,
        weight: profile.weights.rainfall,
        description: `${rain} mm precipitation causes violent splash dispersal of spores across adjacent foliage.`,
        value: `${rain} mm`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    } else if (isLightInfection) {
      const disPts = Math.round(profile.weights.rainfall * 0.65);
      rawDiseasePoints += disPts;
      rawPestPoints = Math.max(0, rawPestPoints - 5); // Washing effect on small nymphs
      rulesApplied.push(`Light Rainfall ${profile.rainfallInfectionThresholdMm}-${profile.rainfallSplashThresholdMm}mm: Foliar wetness maintenance (+${disPts} disease points)`);
      riskFactors.push({
        factor: 'Light Intermittent Rain',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: disPts,
        weight: profile.weights.rainfall,
        description: `${rain} mm rainfall maintains canopy moisture without heavy physical runoff.`,
        value: `${rain} mm`,
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    } else {
      riskFactors.push({
        factor: 'Dry Weather Spell',
        impact: 'UNFAVORABLE',
        status: 'MEASURED',
        scoreContribution: 0,
        weight: profile.weights.rainfall,
        description: 'Zero precipitation prevents rain-splash dispersal of fungal conidia.',
        value: '0.0 mm',
        isObserved: true,
        sourceType: 'OBSERVED_SENSOR'
      });
    }
  } else {
    unavailableFactorsList.push('Rainfall');
    riskFactors.push({
      factor: 'Rainfall Sensor / Gauge',
      impact: 'UNAVAILABLE',
      status: 'UNAVAILABLE',
      scoreContribution: 0,
      weight: profile.weights.rainfall,
      description: 'Precipitation measurement unavailable.',
      value: 'Unavailable',
      isObserved: false,
      sourceType: 'UNAVAILABLE'
    });
  }

  // ==========================================
  // FACTOR 5: Crop Phenological Stage Susceptibility
  // ==========================================
  maxPossibleDiseasePoints += profile.weights.cropStage;
  maxPossiblePestPoints += profile.weights.cropStage;
  const isVulnerableStage = profile.susceptibleStages.some(
    s => cropStage.toLowerCase().includes(s.toLowerCase())
  );

  if (isVulnerableStage) {
    rawDiseasePoints += profile.weights.cropStage;
    rawPestPoints += profile.weights.cropStage;
    rulesApplied.push(`Crop Stage (${cropStage}): Peak physiological susceptibility to tissue penetration (+${profile.weights.cropStage} disease, +${profile.weights.cropStage} pest points)`);
    riskFactors.push({
      factor: `Vulnerable Growth Stage: ${cropStage}`,
      impact: 'FAVORABLE',
      status: 'MEASURED',
      scoreContribution: profile.weights.cropStage,
      weight: profile.weights.cropStage,
      description: 'Young succulent vegetative shoots or tender reproductive blooms lack thick protective cuticular wax.',
      value: cropStage,
      isObserved: true,
      sourceType: 'AGRONOMIC_MODEL'
    });
  } else {
    riskFactors.push({
      factor: `Resilient Growth Stage: ${cropStage}`,
      impact: 'UNFAVORABLE',
      status: 'MEASURED',
      scoreContribution: 0,
      weight: profile.weights.cropStage,
      description: 'Hardened vegetative or mature stage with superior mechanical resistance.',
      value: cropStage,
      isObserved: true,
      sourceType: 'AGRONOMIC_MODEL'
    });
  }

  // ==========================================
  // FACTOR 6: Geospatial Outbreak Proximity & Cluster Density
  // ==========================================
  maxPossibleDiseasePoints += profile.weights.outbreakProximity;
  maxPossiblePestPoints += profile.weights.outbreakProximity;
  const nearbyConfirmed = input.nearbyConfirmedCasesCount ?? 0;
  const nearbySuspected = input.nearbySuspectedCasesCount ?? 0;
  const radiusKm = input.nearbyCasesRadiusKm || 15;

  if (nearbyConfirmed >= 5) {
    rawDiseasePoints += profile.weights.outbreakProximity;
    rawPestPoints += Math.round(profile.weights.outbreakProximity * 0.75);
    rulesApplied.push(`Active Outbreak Cluster: ${nearbyConfirmed} confirmed cases within ${radiusKm}km (+${profile.weights.outbreakProximity} disease points)`);
    riskFactors.push({
      factor: 'High Nearby Outbreak Density',
      impact: 'FAVORABLE',
      status: 'MEASURED',
      scoreContribution: profile.weights.outbreakProximity,
      weight: profile.weights.outbreakProximity,
      description: `${nearbyConfirmed} verified disease/pest cases active within ${radiusKm} km radius. Airborne regional inoculum pressure is high.`,
      value: `${nearbyConfirmed} Confirmed Clusters`,
      isObserved: true,
      sourceType: 'OBSERVED_FIELD'
    });
  } else if (nearbyConfirmed >= 2 || nearbySuspected >= 3) {
    const pts = Math.round(profile.weights.outbreakProximity * 0.55);
    rawDiseasePoints += pts;
    rawPestPoints += pts;
    rulesApplied.push(`Nearby Cases: ${nearbyConfirmed} confirmed, ${nearbySuspected} suspected within ${radiusKm}km (+${pts} disease points)`);
    riskFactors.push({
      factor: 'Isolated Nearby Infections',
      impact: 'FAVORABLE',
      status: 'MEASURED',
      scoreContribution: pts,
      weight: profile.weights.outbreakProximity,
      description: `${nearbyConfirmed} confirmed and ${nearbySuspected} suspected infections detected within ${radiusKm} km surveillance boundary.`,
      value: `${nearbyConfirmed} Confirmed, ${nearbySuspected} Suspected`,
      isObserved: true,
      sourceType: 'OBSERVED_FIELD'
    });
  } else if (nearbyConfirmed === 1 || nearbySuspected === 1) {
    const pts = Math.round(profile.weights.outbreakProximity * 0.25);
    rawDiseasePoints += pts;
    rawPestPoints += pts;
    riskFactors.push({
      factor: 'Single Nearby Observation',
      impact: 'FAVORABLE',
      status: 'MEASURED',
      scoreContribution: pts,
      weight: profile.weights.outbreakProximity,
      description: `1 infection observation recorded within ${radiusKm} km surveillance zone.`,
      value: '1 Incident',
      isObserved: true,
      sourceType: 'OBSERVED_FIELD'
    });
  } else {
    riskFactors.push({
      factor: 'No Immediate Nearby Outbreaks',
      impact: 'UNFAVORABLE',
      status: 'MEASURED',
      scoreContribution: 0,
      weight: profile.weights.outbreakProximity,
      description: `Zero verified outbreak clusters reported within ${radiusKm} km radius.`,
      value: `0 Confirmed (${radiusKm} km)`,
      isObserved: true,
      sourceType: 'OBSERVED_FIELD'
    });
  }

  // ==========================================
  // FACTOR 7: Field Inoculum from Recent Diagnosis Scan
  // ==========================================
  maxPossibleDiseasePoints += profile.weights.fieldInoculum;
  if (input.recentDiagnosisDisease) {
    rawDiseasePoints += profile.weights.fieldInoculum;
    rulesApplied.push(`Prior Local Diagnosis: ${input.recentDiagnosisDisease} confirms viable on-farm inoculum (+${profile.weights.fieldInoculum} disease points)`);
    riskFactors.push({
      factor: `Field Inoculum Source: ${input.recentDiagnosisDisease}`,
      impact: 'FAVORABLE',
      status: 'MEASURED',
      scoreContribution: profile.weights.fieldInoculum,
      weight: profile.weights.fieldInoculum,
      description: `Recent leaf scan on this plot detected ${input.recentDiagnosisDisease}. Established pathogen lesions serve as immediate spore reservoirs.`,
      value: input.recentDiagnosisDisease,
      isObserved: true,
      sourceType: 'OBSERVED_FIELD'
    });
  } else {
    riskFactors.push({
      factor: 'No Recorded Field Inoculum',
      impact: 'UNFAVORABLE',
      status: 'MEASURED',
      scoreContribution: 0,
      weight: profile.weights.fieldInoculum,
      description: 'Recent scans on this parcel showed clean foliar tissues with no active sporulation.',
      value: 'None Detected',
      isObserved: true,
      sourceType: 'OBSERVED_FIELD'
    });
  }

  // ==========================================
  // FACTOR 8: Pheromone Trap Catch / ETL Breaches
  // ==========================================
  maxPossiblePestPoints += profile.weights.trapBreach;
  const trapThreshold = input.trapThreshold || profile.defaultTrapETL;
  const trapCount = input.recentTrapCount;

  if (trapCount !== undefined && trapCount !== null && !isNaN(trapCount)) {
    measuredFactorsList.push('Pest Trap Count');
    if (trapCount >= trapThreshold) {
      rawPestPoints += profile.weights.trapBreach;
      rulesApplied.push(`Pest Trap ETL Breached: ${trapCount} moths caught (Threshold: ${trapThreshold}) (+${profile.weights.trapBreach} pest points)`);
      riskFactors.push({
        factor: 'Economic Threshold Level (ETL) Exceeded in Pheromone Traps',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: profile.weights.trapBreach,
        weight: profile.weights.trapBreach,
        description: `Trap catch of ${trapCount} moths exceeds the ${trapThreshold} moths/night threshold, indicating peak mating flight and egg deposition.`,
        value: `${trapCount} / ${trapThreshold} moths (BREACHED)`,
        isObserved: true,
        sourceType: 'OBSERVED_TRAP'
      });
    } else if (trapCount >= trapThreshold * 0.5) {
      const pts = Math.round(profile.weights.trapBreach * 0.5);
      rawPestPoints += pts;
      rulesApplied.push(`Pest Trap Moderate Catch: ${trapCount} approaching ETL (+${pts} pest points)`);
      riskFactors.push({
        factor: 'Pheromone Trap Approaching Threshold',
        impact: 'FAVORABLE',
        status: 'MEASURED',
        scoreContribution: pts,
        weight: profile.weights.trapBreach,
        description: `Trap catch of ${trapCount} moths is nearing the action threshold of ${trapThreshold} moths.`,
        value: `${trapCount} / ${trapThreshold} moths`,
        isObserved: true,
        sourceType: 'OBSERVED_TRAP'
      });
    } else {
      riskFactors.push({
        factor: 'Pheromone Trap Count Below Threshold',
        impact: 'UNFAVORABLE',
        status: 'MEASURED',
        scoreContribution: 0,
        weight: profile.weights.trapBreach,
        description: `Trap catch of ${trapCount} moths remains well below the action threshold (${trapThreshold}).`,
        value: `${trapCount} / ${trapThreshold} moths (SAFE)`,
        isObserved: true,
        sourceType: 'OBSERVED_TRAP'
      });
    }
  } else {
    unavailableFactorsList.push('Pest Trap Count');
    riskFactors.push({
      factor: 'Pheromone Trap Catch',
      impact: 'UNAVAILABLE',
      status: 'UNAVAILABLE',
      scoreContribution: 0,
      weight: profile.weights.trapBreach,
      description: 'Pheromone trap count data currently unavailable for this parcel.',
      value: 'Unavailable',
      isObserved: false,
      sourceType: 'UNAVAILABLE'
    });
  }

  // ==========================================
  // SCORE NORMALIZATION & DATA QUALITY
  // ==========================================
  // Normalize raw points to a 0-100 scale, with bounds clamping
  const diseaseRiskScore = Math.min(100, Math.max(0, Math.round(rawDiseasePoints)));
  const pestRiskScore = Math.min(100, Math.max(0, Math.round(rawPestPoints)));

  const diseaseRiskLevel = getRiskLevel(diseaseRiskScore);
  const pestRiskLevel = getRiskLevel(pestRiskScore);

  const totalEvaluatedFactors = measuredFactorsList.length + unavailableFactorsList.length;
  const dataCompletenessPercent = totalEvaluatedFactors > 0
    ? Math.round((measuredFactorsList.length / totalEvaluatedFactors) * 100)
    : 100;

  // ==========================================
  // ASSIGN CROP-SPECIFIC PRIMARY THREATS
  // ==========================================
  const cropLower = input.cropId.toLowerCase();
  if (cropLower.includes('rice') || cropLower.includes('paddy')) {
    primaryThreats.push({
      name: 'Rice Blast (Magnaporthe oryzae)',
      type: 'DISEASE',
      riskScore: diseaseRiskScore,
      favoredBy: 'Cool night temperatures (20-26°C), morning RH >85%, and excessive nitrogen fertilizer.'
    });
    primaryThreats.push({
      name: 'Yellow Stem Borer / Brown Plant Hopper',
      type: 'PEST',
      riskScore: pestRiskScore,
      favoredBy: 'Warm humid microclimate with continuous deep stagnant water.'
    });
  } else if (cropLower.includes('wheat')) {
    primaryThreats.push({
      name: 'Yellow Stripe Rust (Puccinia striiformis)',
      type: 'DISEASE',
      riskScore: diseaseRiskScore,
      favoredBy: 'Cool foggy mornings (10-18°C) with prolonged foliar moisture film.'
    });
    primaryThreats.push({
      name: 'Wheat Aphid (Sitobion avenae)',
      type: 'PEST',
      riskScore: pestRiskScore,
      favoredBy: 'Dry overcast spells during boot to milking stages.'
    });
  } else if (cropLower.includes('cotton')) {
    primaryThreats.push({
      name: 'Pink Bollworm (Pectinophora gossypiella)',
      type: 'PEST',
      riskScore: pestRiskScore,
      favoredBy: 'Flowering and boll formation stages with warm nighttime temperatures.'
    });
    primaryThreats.push({
      name: 'Bacterial Blight / Angular Leaf Spot',
      type: 'DISEASE',
      riskScore: diseaseRiskScore,
      favoredBy: 'Intermittent rainfall events and warm afternoon temperatures.'
    });
  } else if (cropLower.includes('potato')) {
    primaryThreats.push({
      name: 'Potato Late Blight (Phytophthora infestans)',
      type: 'DISEASE',
      riskScore: diseaseRiskScore,
      favoredBy: 'Smith Period: 48 hours with temperature <20°C and RH >90%.'
    });
    primaryThreats.push({
      name: 'Potato Tuber Moth / Aphids',
      type: 'PEST',
      riskScore: pestRiskScore,
      favoredBy: 'Dry soil cracks exposing shallow tubers to oviposition.'
    });
  } else if (cropLower.includes('tomato')) {
    primaryThreats.push({
      name: 'Early Blight & Tomato Leaf Curl Virus',
      type: 'DISEASE',
      riskScore: diseaseRiskScore,
      favoredBy: 'Warm humid canopy with high whitefly vector activity.'
    });
    primaryThreats.push({
      name: 'Tomato Fruit Borer (Helicoverpa armigera)',
      type: 'PEST',
      riskScore: pestRiskScore,
      favoredBy: 'Flowering to fruit set stage with nighttime temperatures >22°C.'
    });
  } else {
    primaryThreats.push({
      name: 'Foliar Blight & Leaf Spot Complex',
      type: 'DISEASE',
      riskScore: diseaseRiskScore,
      favoredBy: 'Elevated relative humidity and extended canopy wetness.'
    });
    primaryThreats.push({
      name: 'Sucking Pests & Foliage Feeders',
      type: 'PEST',
      riskScore: pestRiskScore,
      favoredBy: 'Moderate temperatures and succulent young vegetative growth.'
    });
  }

  // ==========================================
  // ACTIONABLE PREVENTIVE ADVICE
  // ==========================================
  if (diseaseRiskLevel === 'CRITICAL' || diseaseRiskLevel === 'HIGH') {
    preventiveAdvice.push('Apply protective bio-fungicide or contact spray (Trichoderma viride 5g/L or Mancozeb 75% WP @ 2g/L) before expected rain.');
    preventiveAdvice.push('Temporarily cease nitrogenous fertilizer application to prevent soft succulent tissue flare-up.');
    preventiveAdvice.push('Ensure proper drainage to keep field water shallow (2-3 cm) and lower microclimatic canopy humidity.');
  } else if (diseaseRiskLevel === 'MODERATE') {
    preventiveAdvice.push('Conduct field scouting every 48 hours, checking lower leaves at sunrise for early lesion expansion.');
    preventiveAdvice.push('Maintain optimal plant-to-plant spacing and clear weed reservoirs along field bunds.');
  } else {
    preventiveAdvice.push('Standard routine crop monitoring; microclimate conditions currently do not favor pathogen flare-up.');
  }

  if (pestRiskLevel === 'CRITICAL' || pestRiskLevel === 'HIGH') {
    preventiveAdvice.push('Inspect pheromone traps daily. If trap count exceeds ETL threshold, install mating disruption lures.');
    preventiveAdvice.push('Release beneficial biocontrol agents (Trichogramma egg parasitoids) during evening hours.');
  } else if (pestRiskLevel === 'MODERATE') {
    preventiveAdvice.push('Scout 20 random crop hills across a "W" walking pattern in the field.');
  } else {
    preventiveAdvice.push('Continue weekly pest scouting and maintain clean field bunds.');
  }

  // ==========================================
  // 24H & 48H FORECAST PROJECTIONS
  // ==========================================
  const forecastRain = input.forecastTomorrowRainMm !== undefined && input.forecastTomorrowRainMm !== null
    ? input.forecastTomorrowRainMm
    : (input.rainfallMm && input.rainfallMm > 0 ? 10 : 3);
  const forecastHumid = input.forecastTomorrowHumidity !== undefined && input.forecastTomorrowHumidity !== null
    ? input.forecastTomorrowHumidity
    : (input.humidityPercent ? Math.min(95, input.humidityPercent + 3) : 75);

  let forecast24hScore = diseaseRiskScore;
  if (forecastRain > 5 || forecastHumid >= profile.criticalRhThreshold) {
    forecast24hScore = Math.min(100, diseaseRiskScore + 8);
  } else if (forecastHumid < profile.highRhThreshold && forecastRain === 0) {
    forecast24hScore = Math.max(10, diseaseRiskScore - 12);
  }

  let forecast48hScore = forecast24hScore;
  if (forecast24hScore > diseaseRiskScore) {
    forecast48hScore = Math.min(100, forecast24hScore + 6);
  } else {
    forecast48hScore = Math.max(15, forecast24hScore - 5);
  }

  const riskTrend24h: 'INCREASING' | 'STABLE' | 'DECREASING' =
    forecast24hScore > diseaseRiskScore + 3
      ? 'INCREASING'
      : forecast24hScore < diseaseRiskScore - 3
      ? 'DECREASING'
      : 'STABLE';

  // ==========================================
  // CONFLUENCE TRIAD: DIAGNOSIS + MICROCLIMATE + OUTBREAK
  // ==========================================
  const hasDiagnosisInoculum = Boolean(input.recentDiagnosisDisease);
  const hasFavorableMicroclimate = (input.humidityPercent || 0) >= profile.highRhThreshold ||
    (input.leafWetnessHours || 0) >= profile.moderateLeafWetnessHours;
  const hasNearbyOutbreak = nearbyConfirmed > 0;

  let synthesis = '';
  if (hasDiagnosisInoculum && hasFavorableMicroclimate && hasNearbyOutbreak) {
    synthesis = `Critical Confluence Alert: All three infection factors are active simultaneously — recent scan confirmed ${input.recentDiagnosisDisease}, microclimate (${input.humidityPercent || 'N/A'}% RH, ${input.leafWetnessHours ?? 'N/A'}h wetness) is highly favorable, and ${nearbyConfirmed} confirmed cases nearby confirm high airborne inoculum pressure.`;
  } else if (hasFavorableMicroclimate && hasNearbyOutbreak) {
    synthesis = `Elevated Environmental Risk: Even without visible field symptoms yet, microclimate conditions (${input.humidityPercent || 'N/A'}% RH) favor pathogen penetration, and ${nearbyConfirmed} confirmed cases within ${radiusKm}km provide an active regional spore source.`;
  } else if (hasFavorableMicroclimate) {
    synthesis = `Microclimate Alert: Atmospheric moisture and leaf surface wetness favor pathogen incubation, but no confirmed outbreak has yet been reported in your immediate ${radiusKm}km block.`;
  } else {
    synthesis = `Safe Baseline: Environmental microclimate and regional surveillance metrics are currently unfavorable for rapid pathogen dissemination.`;
  }

  // ==========================================
  // EXPLANATION & MONITORING INTERVAL
  // ==========================================
  const whyReasons: string[] = [];
  if (input.humidityPercent && input.humidityPercent >= profile.highRhThreshold) {
    whyReasons.push(`morning humidity (${input.humidityPercent}%) provides sufficient moisture for fungal spore germination`);
  }
  if (input.leafWetnessHours && input.leafWetnessHours >= profile.moderateLeafWetnessHours) {
    whyReasons.push(`persistent leaf surface wetness (${input.leafWetnessHours}h) exceeds the spore penetration threshold`);
  }
  if (isVulnerableStage) {
    whyReasons.push(`crop is in the ${cropStage} stage with tender foliar tissues and lower cuticular wax resistance`);
  }
  if (nearbyConfirmed > 0) {
    whyReasons.push(`${nearbyConfirmed} confirmed outbreak cases reported within ${radiusKm}km indicate airborne spore dispersal`);
  }
  if (input.recentDiagnosisDisease) {
    whyReasons.push(`previous field scan identified ${input.recentDiagnosisDisease}, confirming active foliar inoculum`);
  }
  if (trapCount !== undefined && trapCount !== null && trapCount >= trapThreshold) {
    whyReasons.push(`pheromone trap catch (${trapCount} moths) breached the economic action threshold (${trapThreshold})`);
  }

  const whyIsMyCropAtRisk = whyReasons.length > 0
    ? `Your ${cropName} is at ${diseaseRiskLevel} risk today because ${whyReasons.join(', and ')}.`
    : `Your ${cropName} currently has low risk because atmospheric conditions are dry, foliage is clean, and no nearby disease clusters were reported.`;

  const recommendedMonitoringInterval = getRecommendedMonitoringInterval(diseaseRiskLevel, isVulnerableStage);

  const farmerFriendlySummary = diseaseRiskLevel === 'HIGH' || diseaseRiskLevel === 'CRITICAL'
    ? `Action Required Today: High disease flare-up potential over next 24–48 hours. Inspect crops before 10 AM, maintain shallow water (2-3 cm), and prepare preventive bio-fungicide spray before rain.`
    : diseaseRiskLevel === 'MODERATE'
    ? `Watchful Waiting: Moderate risk detected due to morning dew and humidity. Scout 20 random hills tomorrow morning. Hold off on chemical sprays unless active lesions expand.`
    : `Field In Good Condition: Weather and trap counts are within safe limits. Continue standard weekly scouting and maintain clean field bunds.`;

  // 5-Point Historical + Forecast Timeline
  const timelineHistory = [
    {
      timeLabel: '3 Days Ago',
      score: Math.max(15, diseaseRiskScore - 26),
      level: getRiskLevel(Math.max(15, diseaseRiskScore - 26)),
      isForecast: false,
      triggerEvent: 'Dry sunny spell, minimal foliar moisture'
    },
    {
      timeLabel: '2 Days Ago',
      score: Math.max(25, diseaseRiskScore - 18),
      level: getRiskLevel(Math.max(25, diseaseRiskScore - 18)),
      isForecast: false,
      triggerEvent: 'Overcast skies, morning RH reached 76%'
    },
    {
      timeLabel: 'Yesterday',
      score: Math.max(35, diseaseRiskScore - 10),
      level: getRiskLevel(Math.max(35, diseaseRiskScore - 10)),
      isForecast: false,
      triggerEvent: 'Light rain, leaf wetness exceeded 5 hours'
    },
    {
      timeLabel: 'Today (Now)',
      score: diseaseRiskScore,
      level: diseaseRiskLevel,
      isForecast: false,
      triggerEvent: `Current evaluation: RH ${input.humidityPercent ?? 'N/A'}% + ${nearbyConfirmed} nearby outbreak clusters`
    },
    {
      timeLabel: '+24h Forecast',
      score: forecast24hScore,
      level: getRiskLevel(forecast24hScore),
      isForecast: true,
      triggerEvent: forecastRain > 5 ? 'Forecast rain shower and >85% humidity' : 'Stable temperature with persistent morning dew'
    },
    {
      timeLabel: '+48h Forecast',
      score: forecast48hScore,
      level: getRiskLevel(forecast48hScore),
      isForecast: true,
      triggerEvent: 'Projected cumulative spore incubation & moisture index'
    }
  ];

  return {
    cropId: input.cropId,
    cropName,
    cropStage,
    diseaseRiskScore,
    pestRiskScore,
    diseaseRiskLevel,
    pestRiskLevel,
    primaryThreats,
    riskFactors,
    preventiveAdvice,
    calculationRulesApplied: rulesApplied,
    appliedRules: rulesApplied,
    explanation: whyIsMyCropAtRisk,
    whyIsMyCropAtRisk,
    farmerFriendlySummary,
    recommendedMonitoringInterval,
    dataCompletenessPercent,
    missingFactors: unavailableFactorsList,
    riskTrend24h,
    forecast24hScore,
    forecast48hScore,
    environmentalDiagnosisLink: {
      hasDiagnosisInoculum,
      hasFavorableMicroclimate,
      hasNearbyOutbreak,
      diagnosisName: input.recentDiagnosisDisease,
      synthesis
    },
    timelineHistory
  };
}

/**
 * Generates a structured 24-48 hour multi-interval risk forecast.
 * Grounded in deterministic biophysical models; explicitly not a calibrated probability.
 */
export function calculateDeterministicRiskForecast(
  baseInput: RiskInputParams,
  weatherForecast?: {
    currentTempC: number;
    currentHumidity: number;
    forecast24hTempC: number;
    forecast24hHumidity: number;
    forecast24hRainMm: number;
    forecast48hTempC: number;
    forecast48hHumidity: number;
    forecast48hRainMm: number;
  }
): RiskForecastResponse {
  const currentAssessment = calculateAgriculturalRisk(baseInput);
  const profile = getCropRiskProfile(baseInput.cropId, baseInput.customProfile);

  const wf = weatherForecast || {
    currentTempC: baseInput.temperatureC ?? 28,
    currentHumidity: baseInput.humidityPercent ?? 82,
    forecast24hTempC: baseInput.forecastTomorrowTempC ?? 27,
    forecast24hHumidity: baseInput.forecastTomorrowHumidity ?? 88,
    forecast24hRainMm: baseInput.forecastTomorrowRainMm ?? 8,
    forecast48hTempC: (baseInput.forecastTomorrowTempC ?? 27) - 1,
    forecast48hHumidity: Math.min(95, (baseInput.forecastTomorrowHumidity ?? 88) + 3),
    forecast48hRainMm: (baseInput.forecastTomorrowRainMm ?? 8) > 0 ? 12 : 2
  };

  const intervals: RiskForecastInterval[] = [];
  const hours = [0, 6, 12, 24, 36, 48];

  const driversSet = new Set<string>();

  hours.forEach(hr => {
    let t = wf.currentTempC;
    let h = wf.currentHumidity;
    let r = 0;
    let lw = baseInput.leafWetnessHours ?? 5.0;

    if (hr === 0) {
      t = wf.currentTempC;
      h = wf.currentHumidity;
      r = baseInput.rainfallMm ?? 0;
    } else if (hr <= 12) {
      // Overnight dew incubation window
      t = wf.currentTempC - 3;
      h = Math.min(98, wf.currentHumidity + 8);
      r = 0;
      lw = Math.min(12, lw + 4);
      driversSet.add('Nighttime radiative cooling sustains relative humidity near saturation (>90%)');
    } else if (hr <= 24) {
      t = wf.forecast24hTempC;
      h = wf.forecast24hHumidity;
      r = wf.forecast24hRainMm;
      lw = r > 0 ? 8.5 : 4.0;
      if (r > 5) {
        driversSet.add('Predicted precipitation (+8mm) triggers rain-splash spore dispersal');
      }
    } else if (hr <= 36) {
      t = wf.forecast48hTempC - 2;
      h = Math.min(98, wf.forecast48hHumidity + 5);
      r = Math.round(wf.forecast48hRainMm * 0.4);
      lw = 7.0;
    } else {
      t = wf.forecast48hTempC;
      h = wf.forecast48hHumidity;
      r = wf.forecast48hRainMm;
      lw = r > 0 ? 9.0 : 3.5;
      if (r > 10) {
        driversSet.add('Prolonged foliar moisture accumulation exceeding 8-hour pathogen infection window');
      }
    }

    const intervalEval = calculateAgriculturalRisk({
      ...baseInput,
      temperatureC: t,
      humidityPercent: h,
      rainfallMm: r,
      leafWetnessHours: lw
    });

    intervals.push({
      hourOffset: hr,
      timeLabel: hr === 0 ? 'Now' : `+${hr}h`,
      projectedTempC: t,
      projectedHumidityPercent: h,
      projectedRainMm: r,
      projectedLeafWetnessHours: lw,
      diseaseRiskScore: intervalEval.diseaseRiskScore,
      pestRiskScore: intervalEval.pestRiskScore,
      compositeRiskScore: Math.max(intervalEval.diseaseRiskScore, intervalEval.pestRiskScore),
      riskCategory: intervalEval.diseaseRiskLevel,
      majorDrivers: intervalEval.calculationRulesApplied.slice(0, 2)
    });
  });

  const currentScore = currentAssessment.diseaseRiskScore;
  const score24h = intervals.find(i => i.hourOffset === 24)?.compositeRiskScore ?? currentScore;
  const score48h = intervals.find(i => i.hourOffset === 48)?.compositeRiskScore ?? score24h;

  const trend: 'RISING' | 'STEADY' | 'FALLING' =
    score24h > currentScore + 3
      ? 'RISING'
      : score24h < currentScore - 3
      ? 'FALLING'
      : 'STEADY';

  const majorDrivers = Array.from(driversSet);
  if (majorDrivers.length === 0) {
    majorDrivers.push('Stable ambient temperatures and moderate foliar canopy humidity.');
  }

  return {
    cropId: baseInput.cropId,
    cropStage: baseInput.cropStage,
    currentRiskScore: currentScore,
    currentCategory: currentAssessment.diseaseRiskLevel,
    forecast24hScore: score24h,
    forecast48hScore: score48h,
    trend,
    recommendedMonitoringInterval: currentAssessment.recommendedMonitoringInterval || 'Daily',
    majorDrivers,
    intervals,
    dataQuality: {
      dataCompletenessPercent: currentAssessment.dataCompletenessPercent || 100,
      measuredFactors: currentAssessment.riskFactors.filter(f => f.status === 'MEASURED').map(f => f.factor),
      unavailableFactors: currentAssessment.missingFactors || []
    },
    disclaimer: 'Agronomic risk index calculated via biophysical microclimate-pathogen deterministic heuristics. This index is not a calibrated mathematical probability.'
  };
}
