import React, { useState } from 'react';
import {
  Microscope,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Camera,
  FlaskConical,
  Send,
  Calendar,
  ShieldCheck,
  Thermometer,
  Droplets,
  CloudRain,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  User,
  Phone,
  Search,
  Filter,
  Eye,
  Check,
  Building2,
  ChevronRight,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { DiagnosisRecord, LanguageCode, Farm, DiseaseHotspot } from '../types';
import { translations } from '../data/translations';
import { DEMO_FARMS } from '../data/mockData';

interface ExpertValidationViewProps {
  diagnoses: DiagnosisRecord[];
  language: LanguageCode;
  onReviewSubmit: (
    diagnosisId: string,
    action: 'CONFIRM_AI' | 'CORRECT_DIAGNOSIS' | 'MARK_UNCERTAIN' | 'REFER_TO_LAB',
    correctionName?: string,
    notes?: string,
    followUpDate?: string
  ) => void;
  farms?: Farm[];
  hotspots?: DiseaseHotspot[];
  onOpenHotspots?: () => void;
  onOpenAdvisories?: () => void;
  onDispatchExtension?: (farmId: string, issue: string) => void;
}

export const ExpertValidationView: React.FC<ExpertValidationViewProps> = ({
  diagnoses,
  language,
  onReviewSubmit,
  farms = DEMO_FARMS,
  hotspots = [],
  onOpenHotspots,
  onOpenAdvisories,
  onDispatchExtension
}) => {
  const t = translations[language] || translations.en;

  // View state: 'overview' (District Surveillance & Monitored Farms) vs 'review' (Case-Review Screen)
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');

  // Cases that need verification or have high severity / moderate confidence
  const pendingCases = diagnoses.filter(
    d => d.verificationStatus === 'PENDING' || d.aiConfidence < 0.85 || d.aiSeverity === 'HIGH' || d.aiSeverity === 'CRITICAL'
  );

  const [selectedCase, setSelectedCase] = useState<DiagnosisRecord | null>(
    pendingCases[0] || diagnoses[0] || null
  );

  const [actionType, setActionType] = useState<'CONFIRM_AI' | 'CORRECT_DIAGNOSIS' | 'MARK_UNCERTAIN' | 'REFER_TO_LAB'>('CONFIRM_AI');
  const [correctedDiagnosis, setCorrectedDiagnosis] = useState<string>('');
  const [expertNotes, setExpertNotes] = useState<string>('');
  const [followUpDays, setFollowUpDays] = useState<number>(5);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [caseFilter, setCaseFilter] = useState<'ALL' | 'PENDING' | 'CRITICAL'>('PENDING');
  const [zoomImage, setZoomImage] = useState<boolean>(false);

  // Filtered cases for workbench queue
  const filteredCases = diagnoses.filter(d => {
    if (caseFilter === 'PENDING') return d.verificationStatus === 'PENDING' || d.aiConfidence < 0.85;
    if (caseFilter === 'CRITICAL') return d.aiSeverity === 'CRITICAL' || d.aiSeverity === 'HIGH';
    return true;
  });

  // Monitored farms synthesis for the district
  const monitoredFarmsList = [
    {
      id: 'farm-01',
      name: 'North Damodar Plot #3',
      farmerName: 'Rameshwar Mahato',
      farmerPhone: '+91 98451 23410',
      village: 'Galsi, Purba Bardhaman',
      crop: 'Rice (Paddy)',
      stage: 'Tillering (Day 44)',
      riskScore: 78,
      riskLevel: 'HIGH',
      keyThreat: 'Magnaporthe Blast Airborne Conidia (8.5 km)',
      leafWetnessHours: 9.2,
      lastInspected: '2026-09-08',
      status: 'RED_ALERT'
    },
    {
      id: 'farm-02',
      name: 'East Canal Canal-side Field',
      farmerName: 'Rameshwar Mahato',
      farmerPhone: '+91 98451 23410',
      village: 'Galsi, Purba Bardhaman',
      crop: 'Potato',
      stage: 'Vegetative Canopy',
      riskScore: 68,
      riskLevel: 'MODERATE',
      keyThreat: 'Late Blight Smith Period Alert (16 km)',
      leafWetnessHours: 7.5,
      lastInspected: '2026-09-07',
      status: 'WATCH'
    },
    {
      id: 'farm-03',
      name: 'Mankar Agri Cooperative Plot 4',
      farmerName: 'Balaram Mondal',
      farmerPhone: '+91 94331 88123',
      village: 'Mankar Village',
      crop: 'Rice (Paddy)',
      stage: 'Early Tillering',
      riskScore: 84,
      riskLevel: 'HIGH',
      keyThreat: 'Stem Borer Trap Catch Exceeded ETL (14 moths/night)',
      leafWetnessHours: 8.8,
      lastInspected: '2026-09-09',
      status: 'RED_ALERT'
    },
    {
      id: 'farm-04',
      name: 'Memari Seed Multiplication Farm',
      farmerName: 'Kavita Das',
      farmerPhone: '+91 98320 44109',
      village: 'Memari Block',
      crop: 'Potato (Kufri Jyoti)',
      stage: 'Tuber Initiation',
      riskScore: 88,
      riskLevel: 'HIGH',
      keyThreat: 'Potato Late Blight Lab Confirmed (3.2 km)',
      leafWetnessHours: 11.0,
      lastInspected: '2026-09-08',
      status: 'CRITICAL_OUTBREAK'
    },
    {
      id: 'farm-05',
      name: 'Khandaghosh Valley Terrace',
      farmerName: 'Subhash Roy',
      farmerPhone: '+91 97321 66504',
      village: 'Khandaghosh Block',
      crop: 'Rice (Swarna)',
      stage: 'Panicle Initiation',
      riskScore: 54,
      riskLevel: 'MODERATE',
      keyThreat: 'Sheath Blight Microclimate Humidity >85%',
      leafWetnessHours: 6.8,
      lastInspected: '2026-09-06',
      status: 'WATCH'
    },
    {
      id: 'farm-06',
      name: 'Kalna River Basin Plot',
      farmerName: 'Pradip Biswas',
      farmerPhone: '+91 98450 11982',
      village: 'Kalna Sub-division',
      crop: 'Vegetables (Tomato)',
      stage: 'Fruiting',
      riskScore: 38,
      riskLevel: 'LOW',
      keyThreat: 'Early Blight Low Inoculum (Controlled)',
      leafWetnessHours: 4.5,
      lastInspected: '2026-09-09',
      status: 'NORMAL'
    }
  ];

  const handleSubmitReview = () => {
    if (!selectedCase) return;

    const followUpDate = new Date(Date.now() + followUpDays * 86400000).toISOString().split('T')[0];
    onReviewSubmit(selectedCase.id, actionType, correctedDiagnosis, expertNotes, followUpDate);

    setSuccessMessage(`Review for Case #${selectedCase.id} finalized successfully! Outbreak map and farmer updated.`);
    setTimeout(() => {
      setSuccessMessage(null);
      const remaining = pendingCases.filter(c => c.id !== selectedCase.id);
      if (remaining.length > 0) setSelectedCase(remaining[0]);
    }, 2200);
  };

  const handleSelectCaseForReview = (diag: DiagnosisRecord) => {
    setSelectedCase(diag);
    setActiveTab('review');
  };

  return (
    <div className="space-y-6">
      {/* 1. KVK Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/50 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-2xl text-white shadow-lg border border-indigo-400/30 shrink-0">
              🔬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Agricultural Science Center (KVK) Expert Portal
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  Purba Bardhaman District
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Integrated epidemiological surveillance, clinical leaf verification (&lt;85% confidence), farm containment orders, and lab sample routing.
              </p>
            </div>
          </div>

          {/* Navigation Toggle Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>District Surveillance & Monitored Farms</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'review'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Case Verification Workbench</span>
              {pendingCases.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingCases.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 6 District Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Monitored Farms</span>
            <div className="text-xl font-black text-white mt-0.5">142</div>
            <span className="text-[10px] text-slate-400">Across 4 rural blocks</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-red-900/30">
            <span className="text-[10px] font-semibold text-red-400 uppercase block">High-Risk Farms</span>
            <div className="text-xl font-black text-red-400 mt-0.5">18</div>
            <span className="text-[10px] text-red-300/80">Red Zone &gt;70 Risk Score</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-900/30">
            <span className="text-[10px] font-semibold text-amber-400 uppercase block">Emerging Threats</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">3 Active</div>
            <span className="text-[10px] text-amber-300/80">Foliar Blast, Borer, Blight</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Outbreak Clusters</span>
            <div className="text-xl font-black text-teal-400 mt-0.5">4 GIS Zones</div>
            <span className="text-[10px] text-slate-400">Galsi, Memari, Mankar, Kalna</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-indigo-900/30">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase block">Pending Review</span>
            <div className="text-xl font-black text-indigo-300 mt-0.5">{pendingCases.length} Cases</div>
            <span className="text-[10px] text-indigo-300/80">Requiring pathologist sign-off</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Regional Trend</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span>+22% / wk</span>
            </div>
            <span className="text-[10px] text-slate-400">Due to nocturnal dew &gt;9h</span>
          </div>
        </div>
      </div>

      {/* 2. TAB 1: DISTRICT SURVEILLANCE & MONITORED FARMS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Row: Regional Outbreak Clusters & Pathogen Progression (2 columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Outbreak Clusters & Hotspots (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-400" />
                  <h3 className="font-bold text-sm text-white">Active District Outbreak Clusters</h3>
                </div>
                {onOpenHotspots && (
                  <button
                    type="button"
                    onClick={onOpenHotspots}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open GIS Outbreak Map</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-red-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Galsi Foliar Blast Cluster</span>
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      CRITICAL • 14 Farms
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Purba Bardhaman • 8.5 km radius • Airborne conidia active
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Protocol: Tricyclazole / Trichoderma barrier ring.
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-red-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Memari Late Blight Outbreak</span>
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      LAB VERIFIED • 22 Plots
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Memari Block • 12 km radius • Smith Period criteria breached
                  </p>
                  <div className="text-[11px] text-amber-400 font-medium">
                    Protocol: Curative Cymoxanil + Mancozeb spray.
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Mankar Stem Borer Zone</span>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      ETL BREACHED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pheromone traps caught 11–14 moths/night (Limit: 8)
                  </p>
                  <div className="text-[11px] text-slate-300 font-medium">
                    Protocol: Pheromone disruption & Trichogramma release.
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Khandaghosh Sheath Blight</span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      MONITORED • 6 Plots
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Canopy fogging in densely transplanted basin plots
                  </p>
                  <div className="text-[11px] text-slate-300 font-medium">
                    Protocol: Water drainage to 2 cm; hold urea application.
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Pathogen Progression & Severity Breakdown (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">Regional Pathogen Distribution</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Week 37</span>
                </div>

                <div className="space-y-3 mt-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-white">Rice Blast (Magnaporthe oryzae)</span>
                      <span className="text-red-400 font-mono">56% of cases (+18%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '56%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-white">Yellow Stem Borer (Scirpophaga)</span>
                      <span className="text-amber-400 font-mono">22% of cases (+4%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '22%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-white">Potato Late Blight (Phytophthora)</span>
                      <span className="text-amber-400 font-mono">14% of cases (Surging)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '14%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-white">Bacterial Leaf Blight (Xanthomonas)</span>
                      <span className="text-emerald-400 font-mono">8% of cases (Controlled)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 text-xs text-slate-300 mt-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">KVK Epidemiologist Alert:</span>
                Persistent overcast skies with 88% night humidity are accelerating fungal mycelial branching. Advise field extension officers to conduct dawn scouting.
              </div>
            </div>
          </div>

          {/* Bottom Row: High-Risk Monitored Farms Priority Surveillance Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-base text-white">Monitored Farms Surveillance Register</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time microclimatic vulnerability ranking across enrolled district acreage
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  {monitoredFarmsList.length} Monitored Plots
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Farm & Farmer</th>
                    <th className="py-3 px-3">Crop & Stage</th>
                    <th className="py-3 px-3">Microclimate Risk</th>
                    <th className="py-3 px-3">Primary Threat & Conducive Trigger</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {monitoredFarmsList.map(farm => (
                    <tr key={farm.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{farm.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{farm.farmerName}</span>
                          <span>•</span>
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{farm.farmerPhone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{farm.crop}</div>
                        <div className="text-[10px] text-slate-400">{farm.stage}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-black font-mono ${
                            farm.riskScore >= 70 ? 'text-red-400' :
                            farm.riskScore >= 45 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {farm.riskScore}/100
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                            farm.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            farm.riskLevel === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {farm.riskLevel}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Dew duration: {farm.leafWetnessHours}h / night
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200">{farm.keyThreat}</div>
                        <div className="text-[10px] text-slate-400">Village: {farm.village}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          farm.status === 'CRITICAL_OUTBREAK' ? 'bg-red-500/30 text-red-300 border-red-500/50 animate-pulse' :
                          farm.status === 'RED_ALERT' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          farm.status === 'WATCH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {farm.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const matchingDiag = diagnoses.find(d => d.farmerName === farm.farmerName) || diagnoses[0];
                              handleSelectCaseForReview(matchingDiag);
                            }}
                            className="px-2.5 py-1.5 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Scans</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: CASE VERIFICATION WORKBENCH (Expert Case-Review Screen) */}
      {activeTab === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Queue of Cases (Col 4) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Validation Queue</h3>
              <span className="text-xs text-amber-400 font-mono">{filteredCases.length} Cases</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setCaseFilter('PENDING')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  caseFilter === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Pending / Low Conf
              </button>
              <button
                type="button"
                onClick={() => setCaseFilter('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  caseFilter === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                High Severity
              </button>
              <button
                type="button"
                onClick={() => setCaseFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  caseFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                All ({diagnoses.length})
              </button>
            </div>

            {/* Case List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredCases.map(c => {
                const isSelected = selectedCase?.id === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500/80 shadow-lg shadow-indigo-950/30'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="w-13 h-13 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                      <img src={c.imageUrl} alt={c.aiPrediction} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-xs truncate">{c.farmerName}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                          c.verificationStatus === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          c.verificationStatus === 'CORRECTED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {c.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-300 font-bold truncate mt-0.5">{c.aiPrediction}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{c.cropName} ({c.cropStage})</span>
                        <span className="font-mono text-amber-400 font-bold">{Math.round(c.aiConfidence * 100)}% Conf</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Inspection & Expert Actions (Col 8) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            {selectedCase ? (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        CASE #{selectedCase.id}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{selectedCase.locationName}</span>
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-white mt-1">
                      {selectedCase.farmerName} — {selectedCase.cropName} ({selectedCase.cropStage})
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                      selectedCase.aiConfidence >= 0.85
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : 'bg-amber-950/60 border-amber-800 text-amber-300'
                    }`}>
                      AI Conf: {Math.round(selectedCase.aiConfidence * 100)}% ({selectedCase.aiConfidenceLevel})
                    </span>
                    <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-xl border ${
                      selectedCase.aiSeverity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      selectedCase.aiSeverity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {selectedCase.aiSeverity} Severity
                    </span>
                  </div>
                </div>

                {/* Side-by-Side: Leaf Photograph with Inspection Lens vs AI Extraction & Environmental Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Field Photograph with Zoom */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Submitted High-Res Leaf Image:</span>
                      <button
                        type="button"
                        onClick={() => setZoomImage(!zoomImage)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        {zoomImage ? 'Normal View' : 'Zoom Inspection'}
                      </button>
                    </div>

                    <div className={`relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center transition-all ${
                      zoomImage ? 'aspect-square scale-102' : 'aspect-video'
                    }`}>
                      <img
                        src={selectedCase.imageUrl}
                        alt="Diagnosed symptom"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-950/85 px-2 py-0.5 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-750">
                        GPS: {selectedCase.latitude.toFixed(4)}, {selectedCase.longitude.toFixed(4)}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-slate-950/85 px-2 py-0.5 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-750">
                        {selectedCase.timestamp.split('T')[0]}
                      </div>
                    </div>
                  </div>

                  {/* AI Extraction & Microclimate Context */}
                  <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-850 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block">AI Diagnostic Inference:</span>
                      <p className="text-white font-bold text-sm mt-0.5">{selectedCase.aiPrediction}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Key Morphological Symptoms:</span>
                      <ul className="text-slate-300 mt-1 space-y-1">
                        {selectedCase.aiSymptoms?.map((sym, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{sym}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Microclimate at capture */}
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1">Microclimate Readings at Image Capture:</span>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Temperature</span>
                          <strong className="text-white">26.2°C</strong>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Humidity</span>
                          <strong className="text-blue-400 font-bold">88% RH</strong>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Leaf Wetness</span>
                          <strong className="text-teal-400 font-bold">9.2 Hours</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farmer & Plot Metadata */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Farmer Name:</span>
                    <strong className="text-white">{selectedCase.farmerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Enrolled Plot:</span>
                    <strong className="text-slate-200">Plot #WB-01 (3.5 Acres)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Soil Classification:</span>
                    <strong className="text-slate-200">Alluvial Loam (pH 6.5)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Sowing / Transplant:</span>
                    <strong className="text-slate-200">44 Days Ago (Kharif)</strong>
                  </div>
                </div>

                {/* Expert Validation Certification Form */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Pathologist Clinical Decision Certification
                    </h4>
                    <span className="text-xs text-indigo-400 font-semibold">ICAR / KVK Protocol</span>
                  </div>

                  {/* 4 Action Selector Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActionType('CONFIRM_AI')}
                      className={`p-3 rounded-2xl border text-center font-bold transition cursor-pointer ${
                        actionType === 'CONFIRM_AI'
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      1. Confirm AI Result
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('CORRECT_DIAGNOSIS')}
                      className={`p-3 rounded-2xl border text-center font-bold transition cursor-pointer ${
                        actionType === 'CORRECT_DIAGNOSIS'
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      2. Correct Diagnosis
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('MARK_UNCERTAIN')}
                      className={`p-3 rounded-2xl border text-center font-bold transition cursor-pointer ${
                        actionType === 'MARK_UNCERTAIN'
                          ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      3. Mark Uncertain
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('REFER_TO_LAB')}
                      className={`p-3 rounded-2xl border text-center font-bold transition cursor-pointer ${
                        actionType === 'REFER_TO_LAB'
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      4. Refer to Lab
                    </button>
                  </div>

                  {/* If Correcting, specify correct disease */}
                  {actionType === 'CORRECT_DIAGNOSIS' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Select / Enter Correct Pathogen Diagnosis:
                      </label>
                      <input
                        type="text"
                        value={correctedDiagnosis}
                        onChange={e => setCorrectedDiagnosis(e.target.value)}
                        placeholder="e.g. Brown Spot (Bipolaris oryzae) or Nitrogen Scorch"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* If Refer to Lab */}
                  {actionType === 'REFER_TO_LAB' && (
                    <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Auto-generating sample chain-of-custody tracking ID: <strong>KVK-WB-2026-084</strong></span>
                      </div>
                      <span className="text-[10px] font-mono bg-purple-900/60 px-2 py-0.5 rounded text-purple-300">
                        Lab: Burdwan Agri University
                      </span>
                    </div>
                  )}

                  {/* Expert Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Official Pathologist Clinical Notes & Advisory Guidance:
                    </label>
                    <textarea
                      rows={3}
                      value={expertNotes}
                      onChange={e => setExpertNotes(e.target.value)}
                      placeholder="Enter specific guidance for the farmer (e.g. adjust spray nozzle, maintain 2cm shallow water, withhold nitrogen, or schedule follow-up inspection)..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Follow up timeline */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">Follow-up Inspection Schedule:</span>
                      <select
                        value={followUpDays}
                        onChange={e => setFollowUpDays(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-indigo-300 font-semibold focus:outline-none"
                      >
                        <option value={3}>In 3 Days (Critical)</option>
                        <option value={5}>In 5 Days (Recommended)</option>
                        <option value={7}>In 7 Days (Routine)</option>
                        <option value={14}>In 14 Days</option>
                      </select>
                    </div>

                    {onOpenAdvisories && (
                      <button
                        type="button"
                        onClick={onOpenAdvisories}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline"
                      >
                        Review Crop IPM Knowledge Base
                      </button>
                    )}
                  </div>

                  {successMessage && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Action Submission */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Certify Review & Broadcast Guidance to Farmer</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-500">
                <Microscope className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No pending cases selected. Choose a record from the validation queue.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
