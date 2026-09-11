import React, { useState } from 'react';
import {
  Cpu,
  Droplets,
  Thermometer,
  CloudRain,
  Bug,
  Activity,
  X,
  RefreshCw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SensorReading, PestTrapReading, LanguageCode } from '../types';
import { translations } from '../data/translations';

interface IoTSensorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensors: SensorReading[];
  traps: PestTrapReading[];
  language: LanguageCode;
  onUpdateSensorValue: (sensorId: string, newValue: number) => void;
  onSimulateSurge: () => void;
}

export const IoTSensorsModal: React.FC<IoTSensorsModalProps> = ({
  isOpen,
  onClose,
  sensors,
  traps,
  language,
  onUpdateSensorValue,
  onSimulateSurge
}) => {
  const t = translations[language];
  const [simulating, setSimulating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSurge = () => {
    setSimulating(true);
    onSimulateSurge();
    setTimeout(() => {
      setSimulating(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">
                IoT Farm Telemetry & Smart Trap Ingestion
              </h2>
              <p className="text-xs text-slate-400">
                Direct MQTT/LoRaWAN sensor feeds and automated optical pest counters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Simulation Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Field Sensor Simulation Suite</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Trigger real-time telemetry spikes to observe automatic risk escalation.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSurge}
              disabled={simulating}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              <span>Simulate Humidity & Pest Spike</span>
            </button>
          </div>

          {/* Microclimate Telemetry Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Microclimate Canopy Telemetry (LoRaWAN Nodes)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sensors.map(sensor => (
                <div key={sensor.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{sensor.sensorType}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {sensor.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black font-mono text-white">{sensor.currentValue}</span>
                      <span className="text-xs text-slate-400">{sensor.unit}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Bat: {sensor.batteryPercent}%</span>
                  </div>

                  {/* Interactive Slider */}
                  <div className="pt-1">
                    <input
                      type="range"
                      min={sensor.sensorType.includes('Temp') ? 10 : 0}
                      max={sensor.sensorType.includes('Temp') ? 45 : 100}
                      value={sensor.currentValue}
                      onChange={e => onUpdateSensorValue(sensor.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Optical Pheromone Trap Counter */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Automated Optical Pest Traps (ETL Monitoring)
            </h4>
            <div className="space-y-3">
              {traps.map(trap => {
                const isExceeded = trap.count >= trap.thresholdLimit;
                return (
                  <div key={trap.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{trap.crop}</span>
                          <span className="text-xs text-slate-400">({trap.targetPest})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Location: {trap.location}</p>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        isExceeded
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {isExceeded ? 'ETL EXCEEDED' : 'SAFE THRESHOLD'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Moths Captured (24h)</span>
                        <strong className="text-base font-mono text-white">{trap.count} moths/night</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">Economic Threshold (ETL)</span>
                        <strong className="text-base font-mono text-amber-400">{trap.thresholdLimit} moths/night</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Trap ID: {trap.id}</span>
                      <span>Last Camera Transmission: {trap.recordedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer"
          >
            Apply & Return
          </button>
        </div>
      </div>
    </div>
  );
};
