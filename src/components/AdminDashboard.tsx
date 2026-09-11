import React, { useState } from 'react';
import {
  Building2,
  Users,
  AlertOctagon,
  TrendingUp,
  Cpu,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  RotateCw,
  Layers,
  FileCheck
} from 'lucide-react';
import { ModelMetrics, LanguageCode } from '../types';
import { translations } from '../data/translations';
import { generateSyntheticDemographics } from '../data/mockData';

interface AdminDashboardProps {
  modelMetrics: ModelMetrics;
  language: LanguageCode;
  onTriggerRetrain?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  modelMetrics,
  language,
  onTriggerRetrain
}) => {
  const t = translations[language];
  const [retrainingRunning, setRetrainingRunning] = useState<boolean>(false);
  const [retrainComplete, setRetrainComplete] = useState<boolean>(false);

  const { syntheticFarmers, syntheticFarmsList } = generateSyntheticDemographics();

  const districtSummaries = [
    { district: 'Purba Bardhaman', farmersCount: 38, farmsCount: 56, activeCases: 28, dominantThreat: 'Rice Blast & Stem Borer', riskTier: 'CRITICAL' },
    { district: 'Hooghly', farmersCount: 22, farmsCount: 34, activeCases: 14, dominantThreat: 'Potato Late Blight', riskTier: 'HIGH' },
    { district: 'Bankura', farmersCount: 16, farmsCount: 24, activeCases: 9, dominantThreat: 'Bacterial Blight', riskTier: 'HIGH' },
    { district: 'Nadia', farmersCount: 12, farmsCount: 18, activeCases: 7, dominantThreat: 'Yellow Mosaic', riskTier: 'MODERATE' },
    { district: 'Murshidabad', farmersCount: 8, farmsCount: 12, activeCases: 5, dominantThreat: 'Brown Spot', riskTier: 'MODERATE' },
    { district: 'Paschim Bardhaman', farmersCount: 4, farmsCount: 6, activeCases: 2, dominantThreat: 'Stem Rot', riskTier: 'LOW' },
  ];

  const handleRetrain = () => {
    setRetrainingRunning(true);
    setTimeout(() => {
      setRetrainingRunning(false);
      setRetrainComplete(true);
      if (onTriggerRetrain) onTriggerRetrain();
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-2xl text-white shadow-lg border border-slate-600/40 shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">State Agricultural Surveillance Portal</h1>
                <span className="bg-slate-800 text-emerald-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-700">
                  Government of West Bengal & ICAR
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Real-time regional outbreak containment, crop protection logistics, and continuous AI model monitoring.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Surveillance Frequency</span>
            <span className="text-xs font-bold text-emerald-400">Live Continuous Polling (IMD + IoT)</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Explicitly matching SIH prototype synthetic benchmark constraints) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Registered Farmers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">100</span>
            <span className="text-xs text-slate-400 block mt-0.5">Across 6 districts</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 inline-block">
            100% Aadhaar / PM-Kisan Linked
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Farms Monitored</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">150</span>
            <span className="text-xs text-slate-400 block mt-0.5">850 Total Acres</span>
          </div>
          <span className="text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40 inline-block">
            Geofenced Plots
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Outbreak Clusters</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-red-400 font-mono">5</span>
            <span className="text-xs text-slate-400 block mt-0.5">2 Critical Containment Zones</span>
          </div>
          <span className="text-[10px] text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40 inline-block">
            Emergency Sprays Dispatched
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Cases Recorded</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">65</span>
            <span className="text-xs text-slate-400 block mt-0.5">46 Diseases • 19 Pests</span>
          </div>
          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 inline-block">
            38 Lab/Expert Verified
          </span>
        </div>
      </div>

      {/* Regional District Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">District Agricultural Surveillance Summary</h3>
            <p className="text-xs text-slate-400">Real-time incident aggregation across monitored agro-climatic zones</p>
          </div>
          <span className="text-xs font-mono text-slate-400">6 Districts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Farmers</th>
                <th className="py-2.5 px-3">Farms</th>
                <th className="py-2.5 px-3">Active Incidents</th>
                <th className="py-2.5 px-3">Primary Pathogen / Threat</th>
                <th className="py-2.5 px-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {districtSummaries.map((d, i) => (
                <tr key={i} className="hover:bg-slate-850/40 transition">
                  <td className="py-3 px-3 font-semibold text-white">{d.district}</td>
                  <td className="py-3 px-3 font-mono">{d.farmersCount}</td>
                  <td className="py-3 px-3 font-mono">{d.farmsCount}</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-300">{d.activeCases}</td>
                  <td className="py-3 px-3 text-emerald-400 font-medium">{d.dominantThreat}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      d.riskTier === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      d.riskTier === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {d.riskTier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Continuous Learning & ML Model Auditing Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white">AI Vision Model Performance & Continuous Retraining</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Production edge model benchmarked against verified KVK plant pathology ground truth
            </p>
          </div>

          <button
            type="button"
            onClick={handleRetrain}
            disabled={retrainingRunning}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow flex items-center gap-2 transition cursor-pointer ${
              retrainingRunning
                ? 'bg-slate-700 opacity-60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${retrainingRunning ? 'animate-spin' : ''}`} />
            <span>{retrainingRunning ? 'Retraining MobileNetV3...' : 'Trigger Fine-Tuning Pipeline'}</span>
          </button>
        </div>

        {retrainComplete && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Retraining pipeline successfully completed! 38 new expert-verified samples assimilated. Candidate model evaluated with +0.3% Top-1 accuracy gain.
            </span>
          </div>
        )}

        {/* Model Metrics Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block">Production Model</span>
            <strong className="text-sm font-mono text-white">{modelMetrics.modelName}</strong>
            <span className="text-[10px] text-emerald-400 block mt-1">{modelMetrics.modelVersion}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block">Top-1 Accuracy</span>
            <strong className="text-xl font-mono text-emerald-400">{Math.round(modelMetrics.accuracy * 1000) / 10}%</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Benchmark holdout</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block">Macro Precision</span>
            <strong className="text-xl font-mono text-blue-400">{Math.round(modelMetrics.precision * 1000) / 10}%</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">False positive filter</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block">Macro Recall</span>
            <strong className="text-xl font-mono text-indigo-400">{Math.round(modelMetrics.recall * 1000) / 10}%</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Pathogen sensitivity</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block">Macro F1 Score</span>
            <strong className="text-xl font-mono text-purple-400">{Math.round(modelMetrics.f1Score * 1000) / 10}%</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Harmonic balance</span>
          </div>
        </div>

        {/* Human-in-the-Loop Feedback Loop Flow Diagram */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 space-y-2">
          <span className="font-bold text-white uppercase text-[11px] block">Human-in-the-Loop AI Quality Assurance:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Every time a KVK expert or state diagnostic laboratory confirms or corrects an ambiguous prediction (confidence &lt; 0.85), the labeled image and metadata are securely quarantined into the gold-standard training pool (<code className="text-emerald-400 font-mono">DS-2026.08-CONFIRMED</code>). Candidate models are automatically evaluated on holdout sets before receiving cryptographic admin approval for production edge rollout.
          </p>
        </div>
      </div>
    </div>
  );
};
