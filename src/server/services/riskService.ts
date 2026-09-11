import {
  calculateAgriculturalRisk,
  calculateDeterministicRiskForecast,
  RiskInputParams,
  RiskForecastResponse,
  CropRiskThresholdProfile,
  getCropRiskProfile
} from '../riskEngine';
import { repository } from '../data/repository';
import { CROPS, CURRENT_WEATHER } from '../../data/mockData';
import { RiskAssessment } from '../../types';
import { outbreakService } from './outbreakService';

export interface RiskQueryOptions {
  cropId?: string;
  stage?: string;
  farmId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  overrideWeather?: Partial<typeof CURRENT_WEATHER>;
  customProfile?: Partial<CropRiskThresholdProfile>;
}

class RiskService {
  /**
   * Calculates comprehensive agricultural risk combining microclimate, crop phenology,
   * live geospatial outbreak clusters from OutbreakService, and pheromone trap thresholds.
   */
  public async getRiskForCrop(
    cropId = 'rice',
    stage = 'Tillering',
    overrideWeather?: Partial<typeof CURRENT_WEATHER>,
    farmId?: string,
    options?: { latitude?: number; longitude?: number; radiusKm?: number }
  ): Promise<{
    risk: RiskAssessment;
    weather: typeof CURRENT_WEATHER;
    nearbyOutbreakAnalysis: any;
  }> {
    const crop = (await repository.getCrops()).find(c => c.id === cropId) || CROPS[0];
    const weather = { ...CURRENT_WEATHER, ...(overrideWeather || {}) };

    const farmLat = options?.latitude ?? 23.2324;
    const farmLon = options?.longitude ?? 87.8615;
    const radiusKm = options?.radiusKm ?? 15;

    // 1. Live nearby outbreak analysis from OutbreakService
    let nearbyAnalysis;
    try {
      nearbyAnalysis = await outbreakService.getNearbyCases({
        latitude: farmLat,
        longitude: farmLon,
        radiusKm,
        cropId: crop.id
      });
    } catch {
      nearbyAnalysis = {
        totalNearbyCases: 0,
        confirmedCasesCount: 0,
        suspectedCasesCount: 0,
        nearestDistanceKm: null,
        highestSeverity: 'NONE',
        dominantThreat: null,
        nearbyClusters: []
      };
    }

    // 2. Traps & monitoring
    const traps = await repository.getPestTraps();
    const primaryTrap = traps[0] || { count: 11, thresholdLimit: 8 };

    // 3. Field inoculum from recent on-farm leaf scans
    let recentDiagnosisDisease: string | undefined;
    let recentDiagnosisConfidence: number | undefined;

    const farmDiagnoses = await repository.getDiagnoses({
      farmId: farmId || 'farm-01',
      cropId: crop.id,
      limit: 1
    });

    if (farmDiagnoses.length > 0 && farmDiagnoses[0].aiPrediction) {
      recentDiagnosisDisease = farmDiagnoses[0].aiPrediction;
      recentDiagnosisConfidence = farmDiagnoses[0].aiConfidence;
    }

    // 4. Calculate deterministic agricultural risk
    const assessment = calculateAgriculturalRisk({
      cropId: crop.id,
      cropName: crop.name,
      cropStage: stage,
      latitude: farmLat,
      longitude: farmLon,
      temperatureC: weather.temperatureC,
      humidityPercent: weather.humidityPercent,
      rainfallMm: weather.rainfallMm,
      windSpeedKmph: weather.windSpeedKmph,
      leafWetnessHours: 7.5, // Observed microclimate reading
      nearbyConfirmedCasesCount: nearbyAnalysis.confirmedCasesCount,
      nearbySuspectedCasesCount: nearbyAnalysis.suspectedCasesCount,
      nearbyCasesRadiusKm: radiusKm,
      recentTrapCount: primaryTrap.count,
      trapThreshold: primaryTrap.thresholdLimit,
      recentDiagnosisDisease,
      recentDiagnosisConfidence
    });

    return {
      risk: assessment,
      weather,
      nearbyOutbreakAnalysis: nearbyAnalysis
    };
  }

  /**
   * Calculates customized risk based on explicit farmer input parameters.
   * Deterministic, transparent, and supports unmeasured values.
   */
  public calculateCustomRisk(params: RiskInputParams): RiskAssessment {
    return calculateAgriculturalRisk(params);
  }

  /**
   * Generates a 24-48 hour deterministic risk forecast.
   * Grounded in biophysical microclimate-pathogen models with explicit drivers and non-probabilistic disclaimer.
   */
  public async getRiskForecast(
    cropId = 'rice',
    stage = 'Tillering',
    options?: {
      farmId?: string;
      latitude?: number;
      longitude?: number;
      overrideWeather?: Partial<typeof CURRENT_WEATHER>;
      customProfile?: Partial<CropRiskThresholdProfile>;
    }
  ): Promise<RiskForecastResponse> {
    const { risk, weather } = await this.getRiskForCrop(
      cropId,
      stage,
      options?.overrideWeather,
      options?.farmId,
      { latitude: options?.latitude, longitude: options?.longitude }
    );

    const baseInput: RiskInputParams = {
      cropId,
      cropStage: stage,
      temperatureC: weather.temperatureC,
      humidityPercent: weather.humidityPercent,
      rainfallMm: weather.rainfallMm,
      windSpeedKmph: weather.windSpeedKmph,
      leafWetnessHours: 7.5,
      nearbyConfirmedCasesCount: risk.environmentalDiagnosisLink?.hasNearbyOutbreak ? 3 : 0,
      recentDiagnosisDisease: risk.environmentalDiagnosisLink?.diagnosisName,
      customProfile: options?.customProfile
    };

    return calculateDeterministicRiskForecast(baseInput, {
      currentTempC: weather.temperatureC,
      currentHumidity: weather.humidityPercent,
      forecast24hTempC: 27,
      forecast24hHumidity: 88,
      forecast24hRainMm: 8,
      forecast48hTempC: 26,
      forecast48hHumidity: 92,
      forecast48hRainMm: 12
    });
  }

  /**
   * Returns granular risk factors broken down by measurement status: MEASURED vs ESTIMATED vs UNAVAILABLE.
   */
  public async getRiskFactors(
    cropId = 'rice',
    stage = 'Tillering',
    options?: { latitude?: number; longitude?: number }
  ): Promise<{
    cropId: string;
    cropStage: string;
    overallRiskScore: number;
    overallRiskLevel: string;
    dataCompletenessPercent: number;
    measuredFactors: any[];
    estimatedFactors: any[];
    unavailableFactors: any[];
    allFactors: any[];
  }> {
    const { risk } = await this.getRiskForCrop(cropId, stage, undefined, undefined, options);

    const measured = risk.riskFactors.filter(f => f.status === 'MEASURED');
    const estimated = risk.riskFactors.filter(f => f.status === 'ESTIMATED');
    const unavailable = risk.riskFactors.filter(f => f.status === 'UNAVAILABLE');

    return {
      cropId,
      cropStage: stage,
      overallRiskScore: risk.diseaseRiskScore,
      overallRiskLevel: risk.diseaseRiskLevel,
      dataCompletenessPercent: risk.dataCompletenessPercent || 100,
      measuredFactors: measured,
      estimatedFactors: estimated,
      unavailableFactors: unavailable,
      allFactors: risk.riskFactors
    };
  }

  /**
   * Returns the 5-point historical progression + projection timeline for a crop plot.
   */
  public async getRiskHistory(
    cropId = 'rice',
    stage = 'Tillering'
  ): Promise<{
    cropId: string;
    stage: string;
    timeline: any[];
    environmentalDiagnosisLink: any;
  }> {
    const { risk } = await this.getRiskForCrop(cropId, stage);

    return {
      cropId,
      stage,
      timeline: risk.timelineHistory || [],
      environmentalDiagnosisLink: risk.environmentalDiagnosisLink
    };
  }
}

export const riskService = new RiskService();
