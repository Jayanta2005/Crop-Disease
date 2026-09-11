import { repository } from '../data/repository';
import { SensorDevice, PestTrapReading, EarlyWarningNotification } from '../../types';

class SensorService {
  public async getSensors(): Promise<SensorDevice[]> {
    return repository.getSensors();
  }

  public async getPestTraps(): Promise<PestTrapReading[]> {
    return repository.getPestTraps();
  }

  public async ingestSensorTelemetry(deviceId: string, value: number): Promise<SensorDevice> {
    const updated = await repository.updateSensorValue(deviceId, value);
    if (!updated) {
      throw new Error(`Sensor device ${deviceId} not found`);
    }

    // Check threshold alert condition
    if (updated.type === 'HUMIDITY' && value >= 90) {
      updated.thresholdAlert = 'Critical humidity level (>90%) detected';
    } else if (updated.type === 'LEAF_WETNESS' && value >= 8) {
      updated.thresholdAlert = 'Foliar surface moisture exceeds 8 hours (spore infection risk)';
    }

    return updated;
  }

  public async ingestTrapReading(reading: {
    trapId: string;
    farmId: string;
    targetPest: string;
    count: number;
    thresholdLimit: number;
    notes?: string;
  }): Promise<PestTrapReading> {
    const isExceeded = reading.count >= reading.thresholdLimit;
    const trapRecord: PestTrapReading = {
      id: `trap-${Date.now()}`,
      trapId: reading.trapId,
      farmId: reading.farmId,
      date: new Date().toISOString().split('T')[0],
      targetPest: reading.targetPest,
      count: reading.count,
      thresholdLimit: reading.thresholdLimit,
      isExceeded,
      notes: reading.notes,
      recordedAt: new Date().toISOString()
    };

    await repository.addPestTrapReading(trapRecord);

    // If threshold breached, dispatch automated warning alert
    if (isExceeded) {
      const alert: EarlyWarningNotification = {
        id: `notif-etl-${Date.now()}`,
        title: `Pest Trap ETL Breached: ${reading.targetPest}`,
        riskLevel: 'CRITICAL',
        reason: `Trap recorded ${reading.count} moths/night, exceeding safety threshold of ${reading.thresholdLimit}.`,
        affectedCrop: 'Field Crop',
        recommendedAction: 'Install mating disruption pheromone lures or release Trichogramma egg parasitoids.',
        location: 'Field Sensor Zone',
        timestamp: 'Just now',
        isRead: false,
        cooldownKey: `etl-${reading.trapId}`
      };
      await repository.createNotification(alert);
    }

    return trapRecord;
  }
}

export const sensorService = new SensorService();
