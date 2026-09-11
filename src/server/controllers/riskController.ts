import { Request, Response, NextFunction } from 'express';
import { riskService } from '../services/riskService';
import { sendSuccess, sendError } from '../utils/response';
import { CURRENT_WEATHER } from '../../data/mockData';

export const riskController = {
  /**
   * Evaluates current agricultural risk combining microclimate, crop phenology,
   * live geospatial outbreak clusters, and on-farm diagnosis history.
   * GET /api/risk
   */
  getRisk: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cropId = (req.query.cropId as string) || 'rice';
      const stage = (req.query.stage as string) || 'Tillering';
      const farmId = (req.query.farmId as string) || undefined;
      const lat = req.query.lat ? Number(req.query.lat) : undefined;
      const lon = req.query.lon ? Number(req.query.lon) : undefined;
      const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : undefined;

      const data = await riskService.getRiskForCrop(cropId, stage, undefined, farmId, {
        latitude: lat,
        longitude: lon,
        radiusKm
      });

      return sendSuccess(res, data, 'Agricultural risk evaluated successfully', 200, {
        risk: data.risk,
        weather: data.weather,
        nearbyOutbreakAnalysis: data.nearbyOutbreakAnalysis
      });
    } catch (err: any) {
      return sendError(res, 'Failed to evaluate agricultural risk', 500, err);
    }
  },

  /**
   * Explicit endpoint for current risk.
   * GET /api/risk/current
   */
  getCurrentRisk: async (req: Request, res: Response, next: NextFunction) => {
    return riskController.getRisk(req, res, next);
  },

  /**
   * Deterministic calculation with custom farmer/sensor inputs.
   * POST /api/risk/calculate
   */
  calculateCustom: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assessment = riskService.calculateCustomRisk(req.body);
      return sendSuccess(res, assessment, 'Custom agricultural risk calculated deterministically', 200, {
        risk: assessment
      });
    } catch (err: any) {
      return sendError(res, 'Failed to calculate custom risk parameters', 500, err);
    }
  },

  /**
   * 24-48 Hour Multi-Interval Deterministic Risk Forecast.
   * GET /api/risk/forecast or POST /api/risk/forecast
   */
  getForecast: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cropId = (req.query.cropId as string) || (req.body?.cropId as string) || 'rice';
      const stage = (req.query.stage as string) || (req.body?.stage as string) || 'Tillering';
      const farmId = (req.query.farmId as string) || (req.body?.farmId as string) || undefined;
      const lat = req.query.lat ? Number(req.query.lat) : req.body?.latitude ? Number(req.body.latitude) : undefined;
      const lon = req.query.lon ? Number(req.query.lon) : req.body?.longitude ? Number(req.body.longitude) : undefined;

      const forecast = await riskService.getRiskForecast(cropId, stage, {
        farmId,
        latitude: lat,
        longitude: lon
      });

      return sendSuccess(res, forecast, '24-48 hour deterministic agricultural risk forecast generated', 200, {
        forecast,
        current: forecast.currentRiskScore,
        forecast24hScore: forecast.forecast24hScore,
        forecast48hScore: forecast.forecast48hScore,
        trend: forecast.trend,
        majorDrivers: forecast.majorDrivers,
        intervals: forecast.intervals
      });
    } catch (err: any) {
      return sendError(res, 'Failed to generate risk forecast', 500, err);
    }
  },

  /**
   * Granular breakdown of contributing risk factors distinguishing MEASURED, ESTIMATED, UNAVAILABLE.
   * GET /api/risk/factors
   */
  getFactors: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cropId = (req.query.cropId as string) || 'rice';
      const stage = (req.query.stage as string) || 'Tillering';
      const lat = req.query.lat ? Number(req.query.lat) : undefined;
      const lon = req.query.lon ? Number(req.query.lon) : undefined;

      const factorsData = await riskService.getRiskFactors(cropId, stage, {
        latitude: lat,
        longitude: lon
      });

      return sendSuccess(res, factorsData, 'Detailed risk factors retrieved', 200, {
        factors: factorsData
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve risk factors', 500, err);
    }
  },

  /**
   * Historical progression timeline + future projections.
   * GET /api/risk/history
   */
  getHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cropId = (req.query.cropId as string) || 'rice';
      const stage = (req.query.stage as string) || 'Tillering';

      const historyData = await riskService.getRiskHistory(cropId, stage);

      return sendSuccess(res, historyData, 'Risk history timeline retrieved', 200, {
        history: historyData
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve risk history', 500, err);
    }
  },

  /**
   * Current meteorological observations.
   * GET /api/risk/weather
   */
  getCurrentWeather: (req: Request, res: Response) => {
    return sendSuccess(res, CURRENT_WEATHER, 'Current meteorological conditions retrieved', 200, {
      weather: CURRENT_WEATHER
    });
  }
};
