import { Request, Response, NextFunction } from 'express';
import { sensorService } from '../services/sensorService';
import { sendSuccess, sendError } from '../utils/response';

export const sensorController = {
  getList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sensors = await sensorService.getSensors();
      const trapReadings = await sensorService.getPestTraps();

      return sendSuccess(res, { sensors, trapReadings }, 'Sensor list and trap readings retrieved', 200, {
        sensors,
        trapReadings
      });
    } catch (err: any) {
      return sendError(res, 'Failed to retrieve sensor inventory', 500, err);
    }
  },

  updateData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deviceId, value } = req.body;
      const sensor = await sensorService.ingestSensorTelemetry(deviceId, Number(value));

      return sendSuccess(res, sensor, 'Sensor telemetry ingested', 200, {
        sensor
      });
    } catch (err: any) {
      return sendError(res, 'Failed to update sensor telemetry', 404, err);
    }
  },

  recordTrap: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reading = await sensorService.ingestTrapReading(req.body);
      return sendSuccess(res, reading, 'Pest trap reading recorded', 201, {
        trapReading: reading
      });
    } catch (err: any) {
      return sendError(res, 'Failed to record pest trap reading', 500, err);
    }
  }
};
