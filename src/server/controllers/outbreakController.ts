import { Request, Response, NextFunction } from 'express';
import { outbreakService } from '../services/outbreakService';
import { sendSuccess, sendError } from '../utils/response';

export const outbreakController = {
  /**
   * Retrieves raw or filtered outbreak hotspots.
   * GET /api/outbreak/hotspots or /api/outbreak
   */
  getHotspots: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { crop, type, severity, diseaseOrPest, status, days, district, minConfidence } = req.query;

      const data = await outbreakService.getHotspots({
        crop: crop as string,
        type: type as any,
        severity: severity as any,
        diseaseOrPest: diseaseOrPest as string,
        status: status as string,
        days: days ? Number(days) : undefined,
        district: district as string,
        minConfidence: minConfidence ? Number(minConfidence) : undefined
      });

      return sendSuccess(res, data, 'Outbreak hotspots retrieved', 200, {
        hotspots: data.hotspots,
        totalCount: data.totalCount,
        activeOutbreaks: data.activeOutbreaks
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve outbreak hotspots', 500, err);
    }
  },

  /**
   * Returns outbreak map points with privacy geofencing applied for farmer privacy.
   * GET /api/outbreak/map
   */
  getMapData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { crop, type, severity, diseaseOrPest, status, days, district } = req.query;
      const userRole = (req.query.role as string) || 'FARMER';

      const data = await outbreakService.getOutbreakMapData({
        crop: crop as string,
        type: type as any,
        severity: severity as any,
        diseaseOrPest: diseaseOrPest as string,
        status: status as string,
        days: days ? Number(days) : undefined,
        district: district as string
      }, userRole);

      return sendSuccess(res, data, 'Outbreak map data retrieved with privacy geofencing', 200, {
        points: data.points,
        totalClusters: data.totalClusters,
        isGeofencedPrivacyApplied: data.isGeofencedPrivacyApplied
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve outbreak map data', 500, err);
    }
  },

  /**
   * Computes nearby outbreak cases within configurable radius (default 15 km).
   * GET /api/outbreak/nearby
   */
  getNearby: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lat = req.query.lat ? Number(req.query.lat) : 23.2324;
      const lon = req.query.lon ? Number(req.query.lon) : 87.8615;
      const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 15;
      const cropId = req.query.cropId as string;
      const disease = req.query.disease as string;

      const analysis = await outbreakService.getNearbyCases({
        latitude: lat,
        longitude: lon,
        radiusKm,
        cropId,
        diseaseOrPest: disease
      });

      return sendSuccess(res, analysis, `Nearby outbreak cases within ${radiusKm} km computed`, 200, {
        nearby: analysis,
        totalCases: analysis.totalNearbyCases,
        confirmedCount: analysis.confirmedCasesCount,
        nearestDistanceKm: analysis.nearestDistanceKm
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to compute nearby cases', 400, err);
    }
  },

  /**
   * Geospatial outbreak intelligence wrapper (backward-compatible).
   * GET /api/outbreak/intelligence
   */
  getIntelligence: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lat = req.query.lat ? Number(req.query.lat) : 23.2324;
      const lon = req.query.lon ? Number(req.query.lon) : 87.8615;

      const intelligence = await outbreakService.getOutbreakIntelligence(lat, lon);
      return sendSuccess(res, intelligence, 'Geospatial outbreak intelligence calculated', 200, {
        intelligence
      });
    } catch (err: any) {
      return sendError(res, 'Failed to compute outbreak intelligence', 500, err);
    }
  },

  /**
   * Regional outbreak summaries aggregated across districts and crops.
   * GET /api/outbreak/summary
   */
  getSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { crop, days } = req.query;

      const summary = await outbreakService.getRegionalSummary({
        crop: crop as string,
        days: days ? Number(days) : undefined
      });

      return sendSuccess(res, summary, 'Regional outbreak summary computed', 200, {
        summary
      });
    } catch (err: any) {
      return sendError(res, 'Failed to generate regional outbreak summary', 500, err);
    }
  },

  /**
   * Temporal disease trend trajectory grouped by day/week.
   * GET /api/outbreak/trends
   */
  getTrends: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const cropId = req.query.cropId as string;
      const disease = req.query.disease as string;

      const trends = await outbreakService.getDiseaseTrends(days, cropId, disease);

      return sendSuccess(res, trends, 'Disease temporal trends computed', 200, {
        trends
      });
    } catch (err: any) {
      return sendError(res, 'Failed to compute disease trends', 500, err);
    }
  },

  /**
   * Registers a new disease or pest outbreak observation with coordinate validation and duplicate check.
   * POST /api/outbreak/report
   */
  createReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        crop,
        diseaseOrPest,
        type,
        severity,
        latitude,
        longitude,
        locationName,
        district,
        state,
        confidence,
        confirmationStatus,
        dataSource,
        radiusKm
      } = req.body;

      if (!crop || !diseaseOrPest || !severity || latitude === undefined || longitude === undefined || !locationName) {
        return sendError(res, 'Missing required outbreak report fields (crop, diseaseOrPest, severity, latitude, longitude, locationName).', 400);
      }

      const result = await outbreakService.registerOutbreakReport({
        crop,
        diseaseOrPest,
        type: type || 'DISEASE',
        severity,
        latitude: Number(latitude),
        longitude: Number(longitude),
        locationName,
        district,
        state,
        confidence: confidence ? Number(confidence) : 0.90,
        confirmationStatus: confirmationStatus || 'CONFIRMED',
        dataSource: dataSource || 'EXTENSION_VERIFIED',
        radiusKm: radiusKm ? Number(radiusKm) : 5.0
      });

      const message = result.isDuplicateUpdated
        ? 'Duplicate outbreak cluster within 500m detected; report merged and count updated.'
        : 'New outbreak observation successfully registered and verified.';

      return sendSuccess(res, result, message, 201, {
        hotspot: result.hotspot,
        isDuplicateUpdated: result.isDuplicateUpdated
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to register outbreak report', 400, err);
    }
  }
};
