import { repository } from '../data/repository';
import { HotspotPoint, EarlyWarningNotification, SeverityLevel } from '../../types';

export interface OutbreakFilter {
  crop?: string;
  type?: 'DISEASE' | 'PEST' | 'all';
  severity?: SeverityLevel | 'all';
  diseaseOrPest?: string;
  status?: string;
  days?: number;
  district?: string;
  minConfidence?: number;
}

export interface NearbyCasesQuery {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  cropId?: string;
  diseaseOrPest?: string;
  minSeverity?: SeverityLevel;
}

export interface NearbyCasesAnalysis {
  userLocation: { latitude: number; longitude: number };
  radiusKm: number;
  totalNearbyCases: number;
  confirmedCasesCount: number;
  suspectedCasesCount: number;
  nearestDistanceKm: number | null;
  highestSeverity: SeverityLevel | 'NONE';
  dominantThreat: string | null;
  proximityZones: {
    immediateDanger_0_5km: number;
    highAwareness_5_15km: number;
    regionalWatch_15_30km: number;
  };
  nearbyClusters: (HotspotPoint & { distanceKm: number })[];
  riskContributionPoints: number; // 0 - 30 points for risk engine
  advisoryNote: string;
}

export interface RegionalOutbreakSummary {
  totalMonitoredClusters: number;
  activeCriticalOutbreaks: number;
  activeHighOutbreaks: number;
  topDiseases: { name: string; count: number; crop: string; severity: SeverityLevel }[];
  affectedCrops: { crop: string; caseCount: number; criticalCount: number }[];
  districtBreakdown: { district: string; caseCount: number; highestSeverity: SeverityLevel }[];
  surveillanceStatus: 'NORMAL' | 'ELEVATED' | 'HIGH_ALERT' | 'EPIDEMIC_WATCH';
  summarySentence: string;
  timestamp: string;
}

export interface DiseaseTrendPoint {
  date: string;
  newReports: number;
  confirmedReports: number;
  averageConfidence: number;
  dominantPathogen: string;
  severityIndex: number; // 1 (LOW) to 4 (CRITICAL)
}

export interface OutbreakReportInput {
  crop: string;
  cropId?: string;
  diseaseOrPest: string;
  type: 'DISEASE' | 'PEST';
  severity: SeverityLevel;
  latitude: number;
  longitude: number;
  locationName: string;
  district?: string;
  state?: string;
  confidence?: number;
  confirmationStatus?: 'CONFIRMED' | 'LAB_VERIFIED' | 'PRELIMINARY' | 'MONITORED';
  dataSource?: 'FARMER_AI_SCAN' | 'EXTENSION_VERIFIED' | 'KVK_SURVEILLANCE' | 'AUTOMATED_SENSOR_TRAP';
  caseId?: string;
  radiusKm?: number;
  containmentProtocol?: string;
}

/**
 * Clean geospatial abstraction.
 * Ready to be mapped to PostGIS functions (ST_DWithin, ST_Distance, ST_MakePoint)
 * when running against a relational PostgreSQL database.
 */
export class GeospatialEngine {
  /**
   * Calculates geodesic distance between two coordinates using the Haversine formula.
   * Accuracy: ±0.1 km.
   */
  public static calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's mean radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Validates coordinate inputs within genuine geographic limits.
   */
  public static validateCoordinates(
    lat: number,
    lon: number
  ): { valid: boolean; error?: string } {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return { valid: false, error: 'Coordinates must be valid numeric values.' };
    }
    if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) {
      return { valid: false, error: 'Coordinates cannot be NaN or Infinite.' };
    }
    if (lat < -90 || lat > 90) {
      return { valid: false, error: `Latitude ${lat} is out of valid bounds [-90, 90].` };
    }
    if (lon < -180 || lon > 180) {
      return { valid: false, error: `Longitude ${lon} is out of valid bounds [-180, 180].` };
    }
    return { valid: true };
  }

  /**
   * Fuzzes exact coordinates to protect private farmer parcel privacy.
   * Produces an approximate geofenced centroid (~1.1 km resolution).
   */
  public static fuzzCoordinates(lat: number, lon: number): { fuzzedLat: number; fuzzedLon: number } {
    // Round to 2 decimal places (approx 1.1km grid at equator/tropics)
    const fuzzedLat = Math.round(lat * 100) / 100;
    const fuzzedLon = Math.round(lon * 100) / 100;
    return { fuzzedLat, fuzzedLon };
  }
}

class OutbreakService {
  /**
   * Retrieves hotspot points with comprehensive filtering options.
   */
  public async getHotspots(filter?: OutbreakFilter): Promise<{
    hotspots: HotspotPoint[];
    totalCount: number;
    activeOutbreaks: number;
  }> {
    const hotspots = await repository.getHotspots(filter as any);
    const activeOutbreaks = hotspots.filter(
      h => h.severity === 'CRITICAL' || h.severity === 'HIGH'
    ).length;

    return {
      hotspots,
      totalCount: hotspots.length,
      activeOutbreaks
    };
  }

  /**
   * Returns outbreak map points with privacy protections.
   * Public / farmer queries receive fuzzed coordinates to protect property locations.
   */
  public async getOutbreakMapData(
    filter?: OutbreakFilter,
    viewerRole = 'FARMER'
  ): Promise<{
    points: HotspotPoint[];
    totalClusters: number;
    isGeofencedPrivacyApplied: boolean;
  }> {
    const rawHotspots = await repository.getHotspots(filter as any);
    const isPrivileged = viewerRole === 'ADMIN' || viewerRole === 'EXPERT';

    const points = rawHotspots.map(h => {
      const { fuzzedLat, fuzzedLon } = GeospatialEngine.fuzzCoordinates(h.latitude, h.longitude);

      if (isPrivileged) {
        return {
          ...h,
          fuzzedLatitude: fuzzedLat,
          fuzzedLongitude: fuzzedLon
        };
      }

      // For farmer/public facing views: replace exact coordinates with fuzzed geofence
      return {
        ...h,
        latitude: fuzzedLat,
        longitude: fuzzedLon,
        fuzzedLatitude: fuzzedLat,
        fuzzedLongitude: fuzzedLon,
        locationName: h.district ? `${h.district} Agricultural Block` : h.locationName
      };
    });

    return {
      points,
      totalClusters: points.length,
      isGeofencedPrivacyApplied: !isPrivileged
    };
  }

  /**
   * Computes nearby outbreak case aggregation and configurable radius-based analysis.
   * Feeds directly into the deterministic risk engine.
   */
  public async getNearbyCases(params: NearbyCasesQuery): Promise<NearbyCasesAnalysis> {
    const userLat = params.latitude;
    const userLon = params.longitude;
    const radiusKm = params.radiusKm || 15;

    const coordCheck = GeospatialEngine.validateCoordinates(userLat, userLon);
    if (!coordCheck.valid) {
      throw new Error(`Invalid query coordinates: ${coordCheck.error}`);
    }

    const allHotspots = await repository.getHotspots({
      crop: params.cropId
    });

    const withDistance = allHotspots
      .map(h => {
        const dist = GeospatialEngine.calculateDistanceKm(userLat, userLon, h.latitude, h.longitude);
        return { ...h, distanceKm: dist };
      })
      .filter(h => h.distanceKm <= radiusKm);

    // Sort by proximity (closest first)
    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    const confirmed = withDistance.filter(
      h => h.verificationStatus === 'CONFIRMED' || h.verificationStatus === 'LAB_VERIFIED'
    );
    const suspected = withDistance.filter(
      h => h.verificationStatus === 'PRELIMINARY' || h.verificationStatus === 'MONITORED'
    );

    // Distance zones
    const zone0to5 = withDistance.filter(h => h.distanceKm <= 5).length;
    const zone5to15 = withDistance.filter(h => h.distanceKm > 5 && h.distanceKm <= 15).length;
    const zone15to30 = withDistance.filter(h => h.distanceKm > 15 && h.distanceKm <= 30).length;

    // Highest severity
    let highestSeverity: SeverityLevel | 'NONE' = 'NONE';
    if (withDistance.some(h => h.severity === 'CRITICAL')) {
      highestSeverity = 'CRITICAL';
    } else if (withDistance.some(h => h.severity === 'HIGH')) {
      highestSeverity = 'HIGH';
    } else if (withDistance.some(h => h.severity === 'MODERATE')) {
      highestSeverity = 'MODERATE';
    } else if (withDistance.length > 0) {
      highestSeverity = 'LOW';
    }

    // Dominant threat
    const countsByDisease: Record<string, number> = {};
    withDistance.forEach(h => {
      countsByDisease[h.diseaseOrPest] = (countsByDisease[h.diseaseOrPest] || 0) + 1;
    });

    let dominantThreat: string | null = null;
    let maxThreatCount = 0;
    Object.entries(countsByDisease).forEach(([disease, count]) => {
      if (count > maxThreatCount) {
        maxThreatCount = count;
        dominantThreat = disease;
      }
    });

    // Deterministic points for Risk Engine (0 - 30 points)
    let riskPoints = 0;
    if (confirmed.length >= 5 || zone0to5 >= 2) {
      riskPoints = 25;
    } else if (confirmed.length >= 2 || zone0to5 >= 1) {
      riskPoints = 18;
    } else if (confirmed.length === 1 || suspected.length >= 2) {
      riskPoints = 10;
    } else if (suspected.length === 1) {
      riskPoints = 5;
    }

    // Advisory note
    let advisoryNote = 'No verified pathogen outbreaks reported within surveillance radius.';
    if (zone0to5 > 0) {
      advisoryNote = `Immediate Threat: ${zone0to5} active outbreak clusters reported within 5 km. Airborne spore pressure is intense.`;
    } else if (confirmed.length > 0) {
      advisoryNote = `${confirmed.length} verified cases within ${radiusKm} km. Implement preventive biocontrol sprays before morning dew.`;
    }

    return {
      userLocation: { latitude: userLat, longitude: userLon },
      radiusKm,
      totalNearbyCases: withDistance.length,
      confirmedCasesCount: confirmed.length,
      suspectedCasesCount: suspected.length,
      nearestDistanceKm: withDistance.length > 0 ? withDistance[0].distanceKm : null,
      highestSeverity,
      dominantThreat,
      proximityZones: {
        immediateDanger_0_5km: zone0to5,
        highAwareness_5_15km: zone5to15,
        regionalWatch_15_30km: zone15to30
      },
      nearbyClusters: withDistance,
      riskContributionPoints: riskPoints,
      advisoryNote
    };
  }

  /**
   * Generates a regional outbreak summary across all monitored agricultural blocks.
   */
  public async getRegionalSummary(filter?: OutbreakFilter): Promise<RegionalOutbreakSummary> {
    const hotspots = await repository.getHotspots(filter as any);

    const criticalCount = hotspots.filter(h => h.severity === 'CRITICAL').length;
    const highCount = hotspots.filter(h => h.severity === 'HIGH').length;

    // Disease breakdown
    const diseaseMap: Record<string, { count: number; crop: string; severity: SeverityLevel }> = {};
    hotspots.forEach(h => {
      if (!diseaseMap[h.diseaseOrPest]) {
        diseaseMap[h.diseaseOrPest] = { count: 0, crop: h.crop, severity: h.severity };
      }
      diseaseMap[h.diseaseOrPest].count += h.activeCount || 1;
      if (h.severity === 'CRITICAL') {
        diseaseMap[h.diseaseOrPest].severity = 'CRITICAL';
      }
    });

    const topDiseases = Object.entries(diseaseMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Crop breakdown
    const cropMap: Record<string, { caseCount: number; criticalCount: number }> = {};
    hotspots.forEach(h => {
      if (!cropMap[h.crop]) {
        cropMap[h.crop] = { caseCount: 0, criticalCount: 0 };
      }
      cropMap[h.crop].caseCount += h.activeCount || 1;
      if (h.severity === 'CRITICAL') {
        cropMap[h.crop].criticalCount += 1;
      }
    });

    const affectedCrops = Object.entries(cropMap)
      .map(([crop, data]) => ({ crop, ...data }))
      .sort((a, b) => b.caseCount - a.caseCount);

    // District breakdown
    const districtMap: Record<string, { caseCount: number; highestSeverity: SeverityLevel }> = {};
    hotspots.forEach(h => {
      const dist = h.district || h.locationName.split(',')[0].trim();
      if (!districtMap[dist]) {
        districtMap[dist] = { caseCount: 0, highestSeverity: h.severity };
      }
      districtMap[dist].caseCount += h.activeCount || 1;
      if (h.severity === 'CRITICAL') {
        districtMap[dist].highestSeverity = 'CRITICAL';
      }
    });

    const districtBreakdown = Object.entries(districtMap)
      .map(([district, data]) => ({ district, ...data }))
      .sort((a, b) => b.caseCount - a.caseCount);

    let surveillanceStatus: RegionalOutbreakSummary['surveillanceStatus'] = 'NORMAL';
    if (criticalCount >= 4) {
      surveillanceStatus = 'EPIDEMIC_WATCH';
    } else if (criticalCount >= 2 || highCount >= 5) {
      surveillanceStatus = 'HIGH_ALERT';
    } else if (highCount >= 2) {
      surveillanceStatus = 'ELEVATED';
    }

    const summarySentence = criticalCount > 0
      ? `Surveillance Alert: ${criticalCount} critical and ${highCount} high-severity outbreak clusters active across ${districtBreakdown.length} districts. Primary threat: ${topDiseases[0]?.name || 'Foliar Blight'}.`
      : `Surveillance Normal: Regional pathogen incidence is stable with no epidemic clusters reported.`;

    return {
      totalMonitoredClusters: hotspots.length,
      activeCriticalOutbreaks: criticalCount,
      activeHighOutbreaks: highCount,
      topDiseases,
      affectedCrops,
      districtBreakdown,
      surveillanceStatus,
      summarySentence,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generates temporal disease trends grouped by time window.
   */
  public async getDiseaseTrends(
    timePeriodDays = 30,
    cropId?: string,
    disease?: string
  ): Promise<{
    timePeriodDays: number;
    totalReports: number;
    trendDirection: 'RISING' | 'STEADY' | 'DECLINING';
    trendPoints: DiseaseTrendPoint[];
  }> {
    const hotspots = await repository.getHotspots({
      crop: cropId,
      diseaseOrPest: disease,
      days: timePeriodDays
    });

    const dateBuckets: Record<string, HotspotPoint[]> = {};
    const now = Date.now();

    // Create daily or weekly intervals
    const intervalDays = timePeriodDays <= 14 ? 1 : timePeriodDays <= 45 ? 3 : 7;
    const numBuckets = Math.ceil(timePeriodDays / intervalDays);

    for (let i = numBuckets - 1; i >= 0; i--) {
      const bucketDate = new Date(now - i * intervalDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      dateBuckets[bucketDate] = [];
    }

    hotspots.forEach(h => {
      const reportDate = h.date;
      const matchingBucket = Object.keys(dateBuckets).reduce((closest, curr) => {
        return Math.abs(new Date(curr).getTime() - new Date(reportDate).getTime()) <
          Math.abs(new Date(closest).getTime() - new Date(reportDate).getTime())
          ? curr
          : closest;
      }, Object.keys(dateBuckets)[0]);

      if (dateBuckets[matchingBucket]) {
        dateBuckets[matchingBucket].push(h);
      }
    });

    const trendPoints: DiseaseTrendPoint[] = Object.entries(dateBuckets).map(([date, items]) => {
      const confirmed = items.filter(
        i => i.verificationStatus === 'CONFIRMED' || i.verificationStatus === 'LAB_VERIFIED'
      ).length;
      const avgConf = items.length > 0
        ? Math.round((items.reduce((acc, i) => acc + (i.confidence || 0.8), 0) / items.length) * 100) / 100
        : 0;

      const severityScore = items.length > 0
        ? Math.round((items.reduce((acc, i) => {
            const val = i.severity === 'CRITICAL' ? 4 : i.severity === 'HIGH' ? 3 : i.severity === 'MODERATE' ? 2 : 1;
            return acc + val;
          }, 0) / items.length) * 10) / 10
        : 1.0;

      const domPathogen = items.length > 0
        ? items[0].diseaseOrPest
        : 'None Reported';

      return {
        date,
        newReports: items.length,
        confirmedReports: confirmed,
        averageConfidence: avgConf,
        dominantPathogen: domPathogen,
        severityIndex: severityScore
      };
    });

    // Determine overall trend direction
    const firstHalf = trendPoints.slice(0, Math.floor(trendPoints.length / 2));
    const secondHalf = trendPoints.slice(Math.floor(trendPoints.length / 2));

    const firstSum = firstHalf.reduce((acc, p) => acc + p.newReports, 0);
    const secondSum = secondHalf.reduce((acc, p) => acc + p.newReports, 0);

    const trendDirection: 'RISING' | 'STEADY' | 'DECLINING' =
      secondSum > firstSum * 1.25
        ? 'RISING'
        : secondSum < firstSum * 0.75
        ? 'DECLINING'
        : 'STEADY';

    return {
      timePeriodDays,
      totalReports: hotspots.length,
      trendDirection,
      trendPoints
    };
  }

  /**
   * Registers a new disease or pest outbreak report with coordinate validation and duplicate check.
   */
  public async registerOutbreakReport(input: OutbreakReportInput): Promise<{
    hotspot: HotspotPoint;
    isDuplicateUpdated: boolean;
  }> {
    // 1. Validate geographic coordinates
    const coordCheck = GeospatialEngine.validateCoordinates(input.latitude, input.longitude);
    if (!coordCheck.valid) {
      throw new Error(`Invalid report coordinates: ${coordCheck.error}`);
    }

    // 2. Duplicate protection: Check if a matching report exists within 500m in last 24h
    const existingHotspots = await repository.getHotspots({
      crop: input.crop,
      diseaseOrPest: input.diseaseOrPest,
      days: 1
    });

    const duplicate = existingHotspots.find(h => {
      const dist = GeospatialEngine.calculateDistanceKm(input.latitude, input.longitude, h.latitude, h.longitude);
      return dist <= 0.5; // Within 500 meters
    });

    if (duplicate) {
      // Increment count on existing hotspot rather than creating duplicate spam
      const updated = await repository.updateHotspot(duplicate.id, {
        activeCount: (duplicate.activeCount || 1) + 1,
        confidence: Math.max(duplicate.confidence || 0.8, input.confidence || 0.8),
        severity: input.severity === 'CRITICAL' ? 'CRITICAL' : duplicate.severity
      });
      return {
        hotspot: updated || duplicate,
        isDuplicateUpdated: true
      };
    }

    // 3. Compute privacy-fuzzed coordinates for storage and public access
    const { fuzzedLat, fuzzedLon } = GeospatialEngine.fuzzCoordinates(input.latitude, input.longitude);
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];

    const newHotspot = await repository.createHotspot({
      caseId: input.caseId || `case-${Date.now()}`,
      latitude: input.latitude,
      longitude: input.longitude,
      fuzzedLatitude: fuzzedLat,
      fuzzedLongitude: fuzzedLon,
      locationName: input.locationName,
      district: input.district,
      state: input.state,
      crop: input.crop,
      diseaseOrPest: input.diseaseOrPest,
      type: input.type,
      severity: input.severity,
      date: today,
      timestamp: nowIso,
      confidence: input.confidence ?? 0.90,
      verificationStatus: input.confirmationStatus || 'CONFIRMED',
      dataSource: input.dataSource || 'EXTENSION_VERIFIED',
      activeCount: 1,
      radiusKm: input.radiusKm || 5.0,
      containmentProtocol: input.containmentProtocol
    });

    // 4. Trigger alert notification for High/Critical severity
    if (input.severity === 'CRITICAL' || input.severity === 'HIGH') {
      const notif: EarlyWarningNotification = {
        id: `notif-${Date.now()}`,
        title: `Outbreak Alert: ${input.diseaseOrPest}`,
        riskLevel: input.severity,
        reason: `New outbreak cluster confirmed in ${input.locationName} (${input.crop}).`,
        affectedCrop: input.crop,
        recommendedAction: 'Alert adjacent block farmers to initiate scouting and preventive IPM bio-sprays.',
        location: input.locationName,
        timestamp: 'Just now',
        isRead: false,
        cooldownKey: `outbreak-${newHotspot.id}`
      };
      await repository.createNotification(notif);
    }

    return {
      hotspot: newHotspot,
      isDuplicateUpdated: false
    };
  }

  /**
   * Backward-compatible helper to register an outbreak point directly from an expert-verified diagnosis.
   */
  public async registerOutbreakFromDiagnosis(
    diagnosisId: string,
    details: {
      latitude: number;
      longitude: number;
      locationName: string;
      crop: string;
      pathogenName: string;
      severity: SeverityLevel;
      verifiedBy: string;
      district?: string;
    }
  ): Promise<HotspotPoint> {
    const isPest = details.pathogenName.toLowerCase().includes('bollworm') ||
      details.pathogenName.toLowerCase().includes('borer') ||
      details.pathogenName.toLowerCase().includes('aphid') ||
      details.pathogenName.toLowerCase().includes('hopper');

    const result = await this.registerOutbreakReport({
      crop: details.crop,
      diseaseOrPest: details.pathogenName,
      type: isPest ? 'PEST' : 'DISEASE',
      severity: details.severity,
      latitude: details.latitude,
      longitude: details.longitude,
      locationName: details.locationName,
      district: details.district,
      caseId: diagnosisId,
      confidence: 0.96,
      confirmationStatus: 'CONFIRMED',
      dataSource: 'EXTENSION_VERIFIED'
    });

    return result.hotspot;
  }

  /**
   * Backward-compatible outbreak intelligence wrapper.
   */
  public async getOutbreakIntelligence(userLat = 23.2324, userLon = 87.8615) {
    const analysis = await this.getNearbyCases({
      latitude: userLat,
      longitude: userLon,
      radiusKm: 15
    });

    const all = await repository.getHotspots();

    return {
      totalMonitoredClusters: all.length,
      nearbyOutbreaksCount: analysis.totalNearbyCases,
      criticalNearbyOutbreaks: analysis.nearbyClusters.filter(h => h.severity === 'CRITICAL').length,
      highestThreat: analysis.nearbyClusters[0] || null,
      clusters: analysis.nearbyClusters,
      proximityAnalysis: analysis
    };
  }
}

export const outbreakService = new OutbreakService();
