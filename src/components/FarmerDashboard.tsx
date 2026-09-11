import React, { useState } from 'react';
import {
  Camera,
  AlertTriangle,
  FileText,
  MessageSquareWarning,
  Activity,
  MapPin,
  CloudSun,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Droplets,
  Cpu,
  Layers,
  CheckSquare,
  Square,
  Thermometer,
  Wind,
  Info,
  ExternalLink,
  User,
  Phone,
  RefreshCw,
  Zap,
  Wifi,
  WifiOff,
  Sprout,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Microscope
} from 'lucide-react';
import {
  User as UserType,
  Farm,
  DiagnosisRecord,
  RiskAssessment,
  WeatherData,
  EarlyWarningNotification,
  LanguageCode,
  NetworkMode
} from '../types';
import { translations } from '../data/translations';
import { CROPS, DEMO_FARMS } from '../data/mockData';

interface FarmerDashboardProps {
  user: UserType;
  farm: Farm;
  recentDiagnoses: DiagnosisRecord[];
  risk: RiskAssessment;
  weather: WeatherData;
  notifications: EarlyWarningNotification[];
  language: LanguageCode;
  networkMode?: NetworkMode;
  offlineQueueCount?: number;
  lastSyncTime?: string;
  onOpenScanner: () => void;
  onOpenRisk: () => void;
  onOpenAdvisories: () => void;
  onOpenReportProblem: () => void;
  onOpenHotspots: () => void;
  onOpenSensors: () => void;
  onOpenOfflineQueue?: () => void;
  onSelectDiagnosis: (d: DiagnosisRecord) => void;
  onSelectFarm?: (farm: Farm) => void;
  onRequestExpertReview?: (diagnosisId: string) => void;
  onOpenProfile?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  user,
  farm,
  recentDiagnoses,
  risk,
  weather,
  notifications,
  language,
  networkMode = 'ONLINE',
  offlineQueueCount = 0,
  lastSyncTime = 'Today, 10:45 AM',
  onOpenScanner,
  onOpenRisk,
  onOpenAdvisories,
  onOpenReportProblem,
  onOpenHotspots,
  onOpenSensors,
  onOpenOfflineQueue,
  onSelectDiagnosis,
  onSelectFarm,
  onRequestExpertReview,
  onOpenProfile
}) => {
  const t = translations[language] || translations.en;

  // Crops filtered for this particular user ID (phone number)
  const mySavedCrops = recentDiagnoses.filter(d =>
    (d.farmerPhone && d.farmerPhone.trim() === user.phone.trim()) ||
    (d.farmerId && (d.farmerId.trim() === user.phone.trim() || d.farmerId === user.id))
  );

  // Tab filter between user's profile crops vs all scans
  const [activeScanTab, setActiveScanTab] = useState<'MY_CROPS' | 'ALL'>('MY_CROPS');
  const displayedDiagnoses = activeScanTab === 'MY_CROPS' ? mySavedCrops : recentDiagnoses;

  // Feedback notification for requesting expert review
  const [expertReviewRequestedId, setExpertReviewRequestedId] = useState<string | null>(null);

  // Today's Action Plan interactive state
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'task-1': false,
    'task-2': false,
    'task-3': true,
    'task-4': false,
    'task-5': false
  });

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const tasksList = [
    {
      id: 'task-1',
      category: 'Immediate Action',
      priority: 'URGENT' as const,
      time: 'Before 09:30 AM',
      title: 'Dawn Field Scouting for Diamond Leaf Blast Lesions',
      desc: 'Inspect lower tillers for spindle-shaped spots with gray centers while morning dew remains on leaf tips.',
      whyRecommended: 'Why: Spores detach and infect during dawn wetness (RH >85%). Identifying focal spots early prevents field-wide spread.',
      actionLabel: 'Scan Suspicious Leaf',
      onAction: onOpenScanner
    },
    {
      id: 'task-2',
      category: 'Preventive / Cultural',
      priority: 'URGENT' as const,
      time: 'Mid-Morning',
      title: 'Regulate Standing Water & Withhold Nitrogen Top-Dressing',
      desc: 'Maintain water depth at exactly 2-3 cm. Do not apply urea fertilizer until lesions turn brown and stop expanding.',
      whyRecommended: 'Why: Excessive vegetative nitrogen induces soft, succulent plant tissue highly vulnerable to fungal penetration.',
      actionLabel: 'View Water & Soil Guidance',
      onAction: onOpenAdvisories
    },
    {
      id: 'task-3',
      category: 'Monitoring',
      priority: 'RECOMMENDED' as const,
      time: 'Morning Routine',
      title: 'Inspect Yellow Stem Borer Pheromone Trap',
      desc: 'Record 24-hour moth catch count. 11 moths logged yesterday breached the district threshold (8 moths/night).',
      whyRecommended: 'Why: Pheromone counts provide a 3-5 day lead time before stem borer larvae bore into tillers and cause dead hearts.',
      actionLabel: 'View Trap Telemetry',
      onAction: onOpenSensors
    },
    {
      id: 'task-4',
      category: 'Approved Treatment Guidance',
      priority: 'RECOMMENDED' as const,
      time: 'Late Afternoon (4:30 - 6:00 PM)',
      title: 'Prepare CIBRC-Approved Bio-Control or Prophylactic Spray',
      desc: 'If blast lesions cover >2% of leaf surface, prepare Trichoderma viride (5g/L) or Tricyclazole 75 WP (0.6g/L).',
      whyRecommended: 'Why: Spraying during late afternoon avoids midday solar UV degradation of active biocontrol ingredients and protects pollinators.',
      actionLabel: 'Check Approved Dosage',
      onAction: onOpenAdvisories
    },
    {
      id: 'task-5',
      category: 'KVK Expert Consultation',
      priority: 'ROUTINE' as const,
      time: 'As Needed',
      title: 'Request KVK Pathologist Clinical Review for Ambiguous Spots',
      desc: 'If symptoms resemble brown spot or abiotic scorch, route your leaf scan directly to Burdwan KVK scientists.',
      whyRecommended: 'Why: Misdiagnosis leads to ineffective chemical application and unnecessary farm expense.',
      actionLabel: 'Submit for Review',
      onAction: () => {
        if (recentDiagnoses[0]) {
          handleRequestExpert(recentDiagnoses[0].id);
        } else {
          onOpenReportProblem();
        }
      }
    }
  ];

  const handleRequestExpert = (diagId: string) => {
    if (onRequestExpertReview) {
      onRequestExpertReview(diagId);
    }
    setExpertReviewRequestedId(diagId);
    setTimeout(() => {
      setExpertReviewRequestedId(null);
    }, 3500);
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;

  const getSeverityBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'CORRECTED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'LAB_REFERRED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    }
  };

  const currentCropObj = CROPS.find(c => c.id === farm.currentCropId) || CROPS[0];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 0. Top Connectivity, Sync & Farm Selector Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Network Mode Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              networkMode === 'ONLINE'
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'
                : networkMode === 'WEAK_2G'
                ? 'bg-amber-950/70 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {networkMode === 'ONLINE' && <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              {networkMode === 'WEAK_2G' && <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              {networkMode === 'OFFLINE' && <WifiOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>{networkMode === 'ONLINE' ? 'Online (4G/5G)' : networkMode === 'WEAK_2G' ? 'Weak 2G (Ultra-Compressed)' : 'Offline Local Mode'}</span>
            </span>

            {/* Sync Timestamp */}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Synced: {lastSyncTime}</span>
            </span>
          </div>

          {/* Pending Offline Scans Alert */}
          {offlineQueueCount > 0 && onOpenOfflineQueue && (
            <button
              onClick={onOpenOfflineQueue}
              className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{offlineQueueCount} Offline Scans Pending</span>
            </button>
          )}
        </div>

        {/* Selected Plot Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Active Field:</span>
          <div className="inline-flex rounded-xl bg-slate-950 border border-slate-800 p-0.5 text-xs">
            {DEMO_FARMS.map(f => {
              const isSelected = f.id === farm.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSelectFarm && onSelectFarm(f)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.name.split(' ')[0]} ({f.areaAcres} Ac)
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 0.5 Farmer Profile & User ID Quick Card */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            👨‍🌾
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Farmer:</span>
              <h2 className="font-bold text-base text-white hover:text-emerald-300 transition">
                {user.name}
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                Personal Profile
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
              <span className="font-mono text-emerald-400 font-medium flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>User ID: {user.phone}</span>
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{user.village || 'Galsi'}, {user.district || 'Purba Bardhaman'}</span>
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-emerald-300 font-medium">
                {mySavedCrops.length} crop{mySavedCrops.length === 1 ? '' : 's'} saved in your profile
              </span>
            </div>
          </div>
        </div>

        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 hover:border-emerald-500 text-xs font-semibold text-emerald-300 transition cursor-pointer flex items-center gap-1.5 self-stretch sm:self-auto justify-center shadow"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Name & User ID</span>
          </button>
        )}
      </div>

      {/* 1. THE THREE CORE QUESTIONS (HERO DECISION-SUPPORT MODULE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ANSWER 1: HOW HEALTHY IS MY CROP? (Large prominent card, 7 cols on lg) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            {/* Question Label */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-black">
                  1
                </span>
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  How healthy is my crop?
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Field Health Status
              </span>
            </div>

            {/* Crop Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  {currentCropObj.icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {farm.currentCropId === 'rice' ? 'Rice (Paddy)' : currentCropObj.name}
                    </h1>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                      {farm.cropStage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{farm.name}, {user.village} ({farm.areaAcres} Acres • {farm.soilType})</span>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Verdict</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                  Vigilance Required
                </span>
              </div>
            </div>

            {/* Dual Risk Gauges (Disease & Pest) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
              {/* Disease Risk Gauge */}
              <div
                onClick={onOpenRisk}
                className="bg-slate-950/80 border border-slate-800 hover:border-red-500/50 rounded-2xl p-3.5 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Disease Threat (Early Warning)</span>
                  <span className={`font-black px-2 py-0.5 rounded text-[10px] border uppercase ${
                    risk.diseaseRiskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    risk.diseaseRiskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {risk.diseaseRiskLevel} • {risk.diseaseRiskScore}/100
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      risk.diseaseRiskScore >= 76 ? 'bg-red-500' :
                      risk.diseaseRiskScore >= 51 ? 'bg-amber-500' :
                      risk.diseaseRiskScore >= 26 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${risk.diseaseRiskScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Target: <strong className="text-white">{risk.primaryThreats[0]?.name || 'Rice Blast'}</strong></span>
                  <span className="text-emerald-400 font-semibold group-hover:underline">Forecast ➔</span>
                </div>
              </div>

              {/* Pest Risk Gauge */}
              <div
                onClick={onOpenRisk}
                className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Insect Pest Pressure</span>
                  <span className={`font-black px-2 py-0.5 rounded text-[10px] border uppercase ${
                    risk.pestRiskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    risk.pestRiskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {risk.pestRiskLevel} • {risk.pestRiskScore}/100
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      risk.pestRiskScore >= 76 ? 'bg-red-500' :
                      risk.pestRiskScore >= 51 ? 'bg-amber-500' :
                      risk.pestRiskScore >= 26 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${risk.pestRiskScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Target: <strong className="text-white">{risk.primaryThreats[1]?.name || 'Yellow Stem Borer'}</strong></span>
                  <span className="text-emerald-400 font-semibold group-hover:underline">Details ➔</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom helper summary */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Crop leaves are currently free of severe visible damage, but high moisture requires protective action.
            </span>
            <button
              onClick={onOpenRisk}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 shrink-0 ml-3 cursor-pointer"
            >
              <span>View Full Forecast</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ANSWER 2 & ANSWER 3 (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* ANSWER 2: IS THERE ANY IMMEDIATE DANGER? */}
          <div className="bg-red-950/50 border border-red-700/60 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-red-800/40">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center text-xs font-black">
                  2
                </span>
                <h2 className="text-xs font-bold text-red-300 uppercase tracking-wider">
                  Is there any immediate danger?
                </h2>
              </div>
              <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                ALERT ACTIVE
              </span>
            </div>

            <div className="flex items-start gap-3 mt-2">
              <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Rice Blast Outbreak: 8.5 km Away
                </h3>
                <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                  14 confirmed cases reported in adjacent Galsi block. High humidity ({weather.humidityPercent}%) and night dew create a 24-hour infection window for your tillering paddy.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={onOpenHotspots}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Outbreak Map</span>
                  </button>
                  <button
                    onClick={onOpenAdvisories}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-red-700/50 text-xs font-semibold transition cursor-pointer"
                  >
                    <span>Spray Protocol</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ANSWER 3: WHAT SHOULD I DO TODAY? (Compact Action Plan card) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex-1">
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  What should I do today?
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {completedCount} of {tasksList.length} Done
              </span>
            </div>

            {/* Quick prioritized summary list */}
            <div className="space-y-2 mt-2">
              {tasksList.slice(0, 2).map(task => {
                const isDone = completedTasks[task.id];
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      isDone
                        ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-emerald-400 shrink-0"
                    >
                      {isDone ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${isDone ? 'text-slate-500' : 'text-white'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono shrink-0">
                          {task.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {task.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-right">
              <a
                href="#action-plan"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
              >
                <span>View Full Today's Action Checklist ({tasksList.length} tasks)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOUR PRIMARY ACTIONS (Large, High-Contrast Farmer Buttons) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Primary Field Operations
          </h2>
          <span className="text-xs text-slate-500">Tap to execute workflow</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Action 1: Scan Crop (Most prominent) */}
          <button
            onClick={onOpenScanner}
            className="group bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl p-4 sm:p-5 text-left shadow-xl transition-all duration-200 hover:scale-[1.01] active:scale-98 cursor-pointer flex flex-col justify-between min-h-[140px] border border-emerald-400/30"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur shadow-inner">
                <Camera className="w-6 h-6" />
              </div>
              <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Photo Diagnosis
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-black tracking-tight">{t.scanCrop}</h3>
              <p className="text-xs text-emerald-100 opacity-90 mt-0.5">Instant disease & pest scan</p>
            </div>
          </button>

          {/* Action 2: Check Risk */}
          <button
            onClick={onOpenRisk}
            className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-white rounded-2xl p-4 sm:p-5 text-left shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-98 cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                78 / 100 Risk
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-black tracking-tight">{t.checkRisk}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Weather & pathogen forecast</p>
            </div>
          </button>

          {/* Action 3: View Advisory */}
          <button
            onClick={onOpenAdvisories}
            className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 text-white rounded-2xl p-4 sm:p-5 text-left shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-98 cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                CIBRC Certified
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-black tracking-tight">{t.viewAdvisory}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Safe IPM treatment plans</p>
            </div>
          </button>

          {/* Action 4: Expert Help / Report Problem */}
          <button
            onClick={onOpenReportProblem}
            className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 text-white rounded-2xl p-4 sm:p-5 text-left shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-98 cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                KVK Support
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-black tracking-tight">Expert Help</h3>
              <p className="text-xs text-slate-400 mt-0.5">Request extension officer visit</p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. SECTION: WHY IS MY CROP AT RISK? (Explainable Agricultural Drivers) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Why is my crop at risk?
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent biological and microclimatic risk factors analyzed for your farm plot today
            </p>
          </div>
          <button
            onClick={onOpenSensors}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 self-start sm:self-auto bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>View IoT Sensor Telemetry</span>
          </button>
        </div>

        {/* 5 Clear Environmental & Biological Factor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Factor 1: Humidity & Leaf Wetness */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>Humidity & Leaf Wetness</span>
                </span>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30">
                  CRITICAL
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{weather.humidityPercent}% RH</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Relative humidity above 85% with night dew sustains free water on leaf surfaces, allowing fungal blast spores to germinate in 4–6 hours.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-850 text-[11px] text-red-300/90 font-medium">
              Impact: High infection incubation
            </div>
          </div>

          {/* Factor 2: Temperature Range */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>Ambient Temperature</span>
                </span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  OPTIMAL FOR FUNGUS
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{weather.temperatureC}°C</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Night temperatures between 20°C and 26°C with day peaks at 28.5°C represent the exact thermal optimum for Magnaporthe fungal mycelial growth.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-850 text-[11px] text-amber-300/90 font-medium">
              Impact: Accelerates fungal replication
            </div>
          </div>

          {/* Factor 3: Crop Stage Vulnerability */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  <span>Growth Stage Susceptibility</span>
                </span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  TILLERING STAGE
                </span>
              </div>
              <div className="text-2xl font-black text-white">Day 44 of 120</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Young vegetative tillers produce tender leaf blades lacking dense silica deposition, providing minimum physical resistance against appressorial penetration.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-850 text-[11px] text-amber-300/90 font-medium">
              Impact: High host tissue vulnerability
            </div>
          </div>

          {/* Factor 4: Nearby Confirmed Cases */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>Nearby Outbreak Reservoir</span>
                </span>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30">
                  14 CASES NEARBY
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">8.5 km Distance</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Active foliar blast confirmed in Galsi Block. Conidia spores are airborne and easily travel 10–15 km with prevailing light seasonal breezes.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-850 text-[11px] text-red-300/90 font-medium">
              Impact: Airborne inoculum pressure
            </div>
          </div>

          {/* Factor 5: Pest Trap Catch & ETL */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Pest Trap Counts (ETL)</span>
                </span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  THRESHOLD BREACHED
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">11 Moths / Night</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Pheromone trap caught 11 yellow stem borer moths last night, exceeding the economic threshold level (ETL) limit of 8 moths per night.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-850 text-[11px] text-amber-300/90 font-medium">
              Impact: Imminent egg mass deposition
            </div>
          </div>

          {/* Factor 6: Rainfall & Surface Wind */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-teal-400" />
                  <span>Rainfall & Wind Flow</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  MILD • {weather.rainfallMm} mm
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{weather.windSpeedKmph} km/h Wind</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Light breeze facilitates spore dispersal across adjoining plots without severe washing. Cloudy sky limits UV degradation of pathogen spores.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-850 text-[11px] text-emerald-300/90 font-medium">
              Impact: Normal dispersion
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION: TODAY'S ACTION PLAN (Detailed interactive checklist) */}
      <div id="action-plan" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Today's Action Plan
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Prioritized daily steps recommended by the agricultural decision-support engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              {completedCount} / {tasksList.length} Tasks Completed
            </span>
          </div>
        </div>

        {/* Task Items */}
        <div className="space-y-3">
          {tasksList.map(task => {
            const isDone = completedTasks[task.id];
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200 shadow-sm'
                }`}
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex items-start gap-3.5 cursor-pointer flex-1"
                >
                  <button
                    type="button"
                    className="mt-0.5 text-emerald-400 shrink-0"
                    aria-label={isDone ? 'Mark task as incomplete' : 'Mark task as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-600 hover:border-emerald-400" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                        {task.category}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        task.priority === 'URGENT'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : task.priority === 'RECOMMENDED'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {task.priority.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-slate-400">• {task.time}</span>
                    </div>

                    <h3 className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <p className={`text-xs ${isDone ? 'text-slate-600' : 'text-slate-300'}`}>
                      {task.desc}
                    </p>

                    {task.whyRecommended && !isDone && (
                      <div className="mt-1.5 p-2 bg-slate-900/80 rounded-xl border border-slate-850 text-[11px] text-amber-300/90 leading-snug">
                        {task.whyRecommended}
                      </div>
                    )}
                  </div>
                </div>

                {task.actionLabel && task.onAction && !isDone && (
                  <button
                    onClick={task.onAction}
                    className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-300 hover:text-white border border-slate-700 text-xs font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{task.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Toast for Expert Review Request */}
      {expertReviewRequestedId && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-2xl text-xs text-emerald-300 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Case #{expertReviewRequestedId} submitted to KVK Agronomy Lab!</strong> An expert pathologist will inspect the symptoms and certify official containment instructions.
            </span>
          </div>
          <button
            onClick={() => setExpertReviewRequestedId(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 5. COMPACT NEARBY THREATS & RECENT SCAN HISTORY (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Nearby Outbreak Threats (5 cols on lg) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="font-bold text-sm text-white">Nearby Crop Threats</h3>
              </div>
              <button
                onClick={onOpenHotspots}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Full Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Threat 1 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">Rice Blast (Foliar)</span>
                    <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.2 rounded">
                      8.5 km
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Galsi Block, Purba Bardhaman • 14 plots affected
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Defense: Prophylactic Tricyclazole or Trichoderma spray.
                  </p>
                </div>
              </div>

              {/* Threat 2 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">Yellow Stem Borer</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.2 rounded">
                      12.0 km
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Mankar Village • Dead hearts reported in early tillers
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Defense: Install pheromone traps (5/acre); release Trichogramma.
                  </p>
                </div>
              </div>

              {/* Threat 3 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">Potato Late Blight</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.2 rounded">
                      16.4 km
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Memari Block • Favorable Smith Period weather
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Defense: Mancozeb 75 WP preventive foliar application.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenHotspots}
            className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Open Regional Surveillance Map</span>
          </button>
        </div>

        {/* Recent Diagnosis History (7 cols on lg) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white">{t.recentScans}</h3>
                <p className="text-xs text-slate-400">Diagnosis history linked to user profile IDs</p>
              </div>
              <button
                onClick={onOpenScanner}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>New Scan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Pills: My Profile Crops vs All Field Scans */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setActiveScanTab('MY_CROPS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeScanTab === 'MY_CROPS'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <User className="w-3 h-3" />
                <span>My Profile Crops ({mySavedCrops.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveScanTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeScanTab === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>All Field Scans ({recentDiagnoses.length})</span>
              </button>
            </div>

            {displayedDiagnoses.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Camera className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">
                  {activeScanTab === 'MY_CROPS'
                    ? `No Crops Saved in Profile for User ID: ${user.phone}`
                    : 'No Leaf Scans Recorded Yet'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeScanTab === 'MY_CROPS'
                    ? `Diagnose a plant leaf and it will automatically be saved to ${user.name}'s profile.`
                    : "Tap 'Scan Crop' to check your first plant."}
                </p>
                <button
                  onClick={onOpenScanner}
                  className="mt-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Crop to Profile</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {displayedDiagnoses.slice(0, 5).map(diag => {
                  const isCurrentUserCrop =
                    (diag.farmerPhone && diag.farmerPhone.trim() === user.phone.trim()) ||
                    (diag.farmerId && (diag.farmerId.trim() === user.phone.trim() || diag.farmerId === user.id));

                  return (
                    <div
                      key={diag.id}
                      onClick={() => onSelectDiagnosis(diag)}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-850/50 px-2 rounded-xl transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                          <img src={diag.imageUrl} alt={diag.aiPrediction} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition">
                              {diag.finalDiagnosis || diag.aiPrediction}
                            </h4>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getSeverityBadge(diag.verificationStatus)}`}>
                              {diag.verificationStatus}
                            </span>
                            {isCurrentUserCrop && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.2 rounded border border-emerald-500/30">
                                In Your Profile
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                            <span>{diag.cropName} ({diag.cropStage})</span>
                            <span>•</span>
                            <span>{diag.timestamp.split('T')[0]}</span>
                            <span>•</span>
                            <span className="font-mono text-emerald-400 font-medium">
                              User ID: {diag.farmerPhone || diag.farmerId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {diag.verificationStatus === 'PENDING' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestExpert(diag.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <Microscope className="w-3 h-3" />
                            <span className="hidden sm:inline">Request KVK Review</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline">
                            ✓ Verified
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Verified records are shared with your assigned KVK agronomist.</span>
            <button
              onClick={onOpenAdvisories}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline"
            >
              View IPM Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
