import React, { useState } from 'react';
import {
  FileText,
  Sprout,
  ShieldCheck,
  AlertTriangle,
  X,
  Droplets,
  Search,
  CheckCircle2,
  Clock,
  HelpCircle,
  Calendar,
  Layers,
  Thermometer,
  Wind,
  ShieldAlert,
  ChevronRight,
  Info,
  Printer,
  Sparkles,
  Leaf
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../data/translations';
import { CROP_DISEASE_KNOWLEDGE_BASE, getCategorizedAdvisory, CATEGORIZED_ADVISORIES } from '../data/ipmKnowledgeBase';

interface AdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  selectedDiseaseKey?: string;
  onApplyActionPlan?: (tasks: any[]) => void;
}

type AdvisoryCategoryTab = 'immediate' | 'monitoring' | 'preventive' | 'treatment' | 'action-plan';

export const AdvisoryModal: React.FC<AdvisoryModalProps> = ({
  isOpen,
  onClose,
  language,
  selectedDiseaseKey = 'rice-blast',
  onApplyActionPlan
}) => {
  const t = translations[language] || translations.en;
  const [activeKey, setActiveKey] = useState<string>(selectedDiseaseKey);
  const [activeCategory, setActiveCategory] = useState<AdvisoryCategoryTab>('immediate');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [completedPlanSteps, setCompletedPlanSteps] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const currentEntry = CROP_DISEASE_KNOWLEDGE_BASE[activeKey] || CROP_DISEASE_KNOWLEDGE_BASE['rice-blast'];
  const categorized = getCategorizedAdvisory(activeKey);
  const allEntries = Object.entries(CROP_DISEASE_KNOWLEDGE_BASE);

  const filteredEntries = allEntries.filter(([key, val]) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      val.name.toLowerCase().includes(q) ||
      val.cropId.toLowerCase().includes(q) ||
      val.scientificName.toLowerCase().includes(q)
    );
  });

  const togglePlanStep = (index: number) => {
    setCompletedPlanSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-850 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-white">
                  Agricultural Advisory & Integrated Pest Management
                </h2>
                <span className="hidden sm:inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  IPM FIRST
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prioritizing biological & non-chemical controls • Calibrated official CIBRC guidance
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close Advisory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden flex-1">
          {/* Diseases Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4 bg-slate-950/90 border-r border-slate-800 p-3.5 space-y-2.5 overflow-y-auto max-h-[35vh] lg:max-h-full">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search disease, pest, or crop..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              {filteredEntries.map(([k, val]) => {
                const isSelected = activeKey === k;
                return (
                  <button
                    key={k}
                    onClick={() => setActiveKey(k)}
                    className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-600/70 text-white shadow-md shadow-emerald-950/40'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-850/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-bold text-xs ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                        {val.name}
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded shrink-0">
                        {val.cropId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                      <span className="italic truncate max-w-[170px]">{val.scientificName}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        val.category === 'PEST'
                          ? 'bg-amber-500/20 text-amber-300'
                          : val.category === 'FUNGAL'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {val.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details & Categories Pane (8 cols on lg) */}
          <div className="lg:col-span-8 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[57vh] lg:max-h-full flex flex-col justify-between">
            <div className="space-y-4">
              {/* Disease Summary Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {currentEntry.cropId} CROP
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs italic text-slate-400">{currentEntry.scientificName}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Stages: {currentEntry.stagesAffected.join(', ')}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-white mt-1.5 tracking-tight">{currentEntry.name}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {currentEntry.commonSymptoms.join('. ')}.
                </p>

                {/* Conducive Environment Bar */}
                <div className="mt-3 pt-3 border-t border-slate-850 grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Thermal Window</span>
                      <span className="font-mono font-bold text-slate-200">
                        {currentEntry.weatherFavored.tempRange[0]}–{currentEntry.weatherFavored.tempRange[1]}°C
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Critical Humidity</span>
                      <span className="font-mono font-bold text-blue-300">&gt;{currentEntry.weatherFavored.minHumidity}% RH</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Wet Conditions</span>
                      <span className="font-bold text-slate-200">
                        {currentEntry.weatherFavored.rainfallFavored ? 'High Risk' : 'Moderate'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Categorized Sections Navigation Bar + Today's Action Plan */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCategory('immediate')}
                  className={`py-2 px-2.5 rounded-xl font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    activeCategory === 'immediate'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="truncate">1. Immediate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('monitoring')}
                  className={`py-2 px-2.5 rounded-xl font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    activeCategory === 'monitoring'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">2. Monitoring</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('preventive')}
                  className={`py-2 px-2.5 rounded-xl font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    activeCategory === 'preventive'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">3. Preventive</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('treatment')}
                  className={`py-2 px-2.5 rounded-xl font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    activeCategory === 'treatment'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">4. Treatment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('action-plan')}
                  className={`col-span-2 sm:col-span-1 py-2 px-2.5 rounded-xl font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    activeCategory === 'action-plan'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Action Plan</span>
                </button>
              </div>

              {/* Category 1: Immediate Action */}
              {activeCategory === 'immediate' && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-2xl flex items-start gap-3 text-xs text-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-white block">Immediate Field Interventions (Next 4–6 Hours)</strong>
                      <span>
                        Target initial primary sources of infection and microclimatic amplifiers before pathogen mycelium penetrates adjacent tillers.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {categorized.immediateActions.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center border border-red-500/30 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-sm text-white">{item.action}</span>
                          </div>
                          {item.timeOfDay && (
                            <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded shrink-0">
                              {item.timeOfDay}
                            </span>
                          )}
                        </div>

                        {/* Explicit "Why" Explanation */}
                        <div className="bg-slate-900/90 border-l-2 border-emerald-500 p-2.5 rounded-r-xl text-xs text-slate-300 flex items-start gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-emerald-400 font-semibold">Why this is recommended: </strong>
                            <span>{item.why}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: Monitoring */}
              {activeCategory === 'monitoring' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-2xl flex items-start gap-3 text-xs text-blue-200">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-white block">Field Scouting & Economic Threshold Levels (ETL)</strong>
                      <span>
                        Track pest and disease emergence systematically. Intervene with interventions only when pest levels exceed economic injury thresholds.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {categorized.monitoringSteps.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-sm text-white">{item.action}</span>
                          </div>
                          {item.timeOfDay && (
                            <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded shrink-0">
                              {item.timeOfDay}
                            </span>
                          )}
                        </div>

                        {item.etlThreshold && (
                          <div className="bg-blue-950/40 border border-blue-800/50 p-2 rounded-xl text-xs text-blue-300 font-medium">
                            <span className="font-bold text-white">Threshold trigger: </span>
                            {item.etlThreshold}
                          </div>
                        )}

                        {/* Explicit "Why" Explanation */}
                        <div className="bg-slate-900/90 border-l-2 border-blue-400 p-2.5 rounded-r-xl text-xs text-slate-300 flex items-start gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-blue-400 font-semibold">Why this is recommended: </strong>
                            <span>{item.why}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Preventive / Non-Chemical Measures */}
              {activeCategory === 'preventive' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex items-start gap-3 text-xs text-emerald-200">
                    <Sprout className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-white block">Sustainable Biological & Cultural Measures (IPM Foundation)</strong>
                      <span>
                        Prioritize natural biocontrols, certified seed dressings, balanced nutrition, and canopy ventilation before any chemical input.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {categorized.preventiveNonChemical.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-sm text-white">{item.action}</span>
                          </div>
                          {item.type && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              item.type === 'BIOLOGICAL'
                                ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                                : item.type === 'CULTURAL'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {item.type}
                            </span>
                          )}
                        </div>

                        {/* Explicit "Why" Explanation */}
                        <div className="bg-slate-900/90 border-l-2 border-teal-400 p-2.5 rounded-r-xl text-xs text-slate-300 flex items-start gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-teal-400 font-semibold">Why this is recommended: </strong>
                            <span>{item.why}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 4: Approved Treatment Guidance */}
              {activeCategory === 'treatment' && (
                <div className="space-y-3">
                  {/* Strict Statutory Notice */}
                  <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs text-amber-200 space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Official Agricultural Pesticide Compliance Mandate</span>
                    </div>
                    <p className="leading-relaxed text-amber-200/90">
                      Chemical pesticides are a calibrated last resort. Farmers must strictly follow official crop-specific recommendations, approved products, recommended dose, timing, and application instructions. Never spray prophylactically unless economic threshold levels (ETL) are exceeded.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {categorized.approvedTreatmentGuidance.map((chem, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-slate-850">
                          <div>
                            <h4 className="font-bold text-white text-base">{chem.chemicalName}</h4>
                            <span className="text-xs text-slate-400">Trade names: {chem.tradeNames.join(', ')}</span>
                          </div>
                          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>CIBRC Approved</span>
                          </span>
                        </div>

                        {/* Key Dosage & Application Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 text-[10px] block">Recommended Dose</span>
                            <strong className="text-white text-xs">{chem.dosage}</strong>
                          </div>
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 text-[10px] block">Water Volume</span>
                            <strong className="text-white text-xs">{chem.waterVolume}</strong>
                          </div>
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 text-[10px] block">Application Timing</span>
                            <strong className="text-amber-300 text-xs">{chem.timing}</strong>
                          </div>
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 text-[10px] block">Pre-Harvest Interval (PHI)</span>
                            <strong className="text-amber-400 text-xs font-mono">{chem.waitingPeriodDays} Days Wait</strong>
                          </div>
                        </div>

                        {/* Explicit "Why" Explanation */}
                        <div className="bg-slate-900/90 border-l-2 border-amber-400 p-2.5 rounded-r-xl text-xs text-slate-300 flex items-start gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-400 font-semibold">Why this chemical is recommended: </strong>
                            <span>{chem.why}</span>
                          </div>
                        </div>

                        {/* Safety PPE & Restrictions */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span className="font-semibold text-slate-400">Required Safety Gear:</span>
                            <span>{chem.safetyEquipment.join(', ')}</span>
                          </div>
                          <div className="text-red-300/90 bg-red-950/20 p-2 rounded-xl border border-red-900/30 text-[11px]">
                            <strong className="font-bold text-red-400">Official Restriction: </strong>
                            {chem.restrictions}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 5: Today's Action Plan View */}
              {activeCategory === 'action-plan' && (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-2xl flex items-start justify-between gap-3 text-xs text-purple-200">
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-white block">Today's Prioritized Action Plan</strong>
                        <span>
                          Synthesized daily steps converting diagnosis and risk into prioritized morning, midday, and evening actions.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Plan</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {categorized.todaysActionPlan.map((step, idx) => {
                      const isDone = completedPlanSteps[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => togglePlanStep(idx)}
                          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isDone
                              ? 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-0.5 text-emerald-400 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <div className="w-5 h-5 rounded-md border-2 border-slate-600 hover:border-emerald-400" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                  step.priority === 'URGENT'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : step.priority === 'HIGH'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {step.priority}
                                </span>
                                <span className="text-xs font-mono text-slate-400">• {step.timeOfDay}</span>
                              </div>

                              <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                                {step.title}
                              </h4>
                              <p className={`text-xs ${isDone ? 'text-slate-600' : 'text-slate-300'}`}>
                                {step.instruction}
                              </p>

                              {/* Why block */}
                              <div className="text-[11px] text-emerald-400/90 pt-1 flex items-start gap-1">
                                <HelpCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                <span><strong>Why:</strong> {step.why}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Endorsed by Agricultural Science Center (KVK) Agronomy Board</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold transition cursor-pointer"
                >
                  Close Advisory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
