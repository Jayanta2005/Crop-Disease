import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Flame,
  Filter,
  Layers,
  AlertOctagon,
  Maximize2,
  Navigation,
  ShieldCheck,
  Calendar,
  Compass,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  HelpCircle,
  Clock,
  Radio,
  Camera,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { HotspotPoint, LanguageCode, SeverityLevel } from '../types';
import { translations } from '../data/translations';

interface HotspotMapProps {
  hotspots: HotspotPoint[];
  language: LanguageCode;
  userLat?: number;
  userLng?: number;
  onSelectHotspot?: (h: HotspotPoint) => void;
  onOpenScanner?: () => void;
  onOpenRisk?: () => void;
}

export const HotspotMap: React.FC<HotspotMapProps> = ({
  hotspots,
  language,
  userLat = 23.2324,
  userLng = 87.8615,
  onSelectHotspot,
  onOpenScanner,
  onOpenRisk
}) => {
  const t = translations[language];

  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showGeofence, setShowGeofence] = useState<boolean>(true);
  const [activePoint, setActivePoint] = useState<HotspotPoint | null>(hotspots[0] || null);

  // Calculate distance in km from user location
  const calculateDistance = (lat: number, lng: number): number => {
    const dLat = (lat - userLat) * 111;
    const dLng = (lng - userLng) * 111 * Math.cos((userLat * Math.PI) / 180);
    return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
  };

  // Filter Hotspots
  const filteredHotspots = useMemo(() => {
    return hotspots.filter(h => {
      if (selectedCrop !== 'all' && !h.crop.toLowerCase().includes(selectedCrop.toLowerCase())) return false;
      if (selectedType !== 'all' && h.type !== selectedType) return false;
      if (selectedSeverity !== 'all' && h.severity !== selectedSeverity) return false;
      if (selectedStatus !== 'all' && h.verificationStatus !== selectedStatus) return false;

      // Time Period Filter
      if (selectedTimePeriod === '24h') {
        if (h.date !== '2026-09-09' && h.date !== '2026-09-08') return false;
      } else if (selectedTimePeriod === '7d') {
        // within current week
      }

      // Distance from user coordinate
      const dist = calculateDistance(h.latitude, h.longitude);
      if (dist > radiusKm) return false;

      return true;
    });
  }, [hotspots, selectedCrop, selectedType, selectedSeverity, selectedStatus, selectedTimePeriod, radiusKm, userLat, userLng]);

  // Aggregate stats
  const confirmedCount = filteredHotspots
    .filter(h => h.verificationStatus === 'CONFIRMED' || h.verificationStatus === 'LAB_VERIFIED')
    .reduce((acc, h) => acc + h.activeCount, 0);

  const suspectedCount = filteredHotspots
    .filter(h => h.verificationStatus === 'PRELIMINARY')
    .reduce((acc, h) => acc + h.activeCount, 0);

  const monitoredCount = filteredHotspots
    .filter(h => h.verificationStatus === 'MONITORED')
    .reduce((acc, h) => acc + h.activeCount, 0);

  // SVG Projection parameters (centered around user location)
  const scale = 24;
  const projectToMap = (lat: number, lng: number) => {
    const x = 400 + (lng - userLng) * scale * 30;
    const y = 250 - (lat - userLat) * scale * 30;
    return {
      x: Math.max(40, Math.min(760, x)),
      y: Math.max(40, Math.min(460, y))
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'LAB_VERIFIED':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'PRELIMINARY':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getStatusFill = (status: string, severity: SeverityLevel) => {
    if (status === 'MONITORED') return '#10b981'; // green
    if (status === 'PRELIMINARY') return '#f59e0b'; // amber
    if (severity === 'CRITICAL') return '#ef4444'; // red
    if (severity === 'HIGH') return '#f97316'; // orange-red
    return '#eab308'; // yellow
  };

  const activeDistance = activePoint ? calculateDistance(activePoint.latitude, activePoint.longitude) : 0;
  const isInside15kmSurveillance = activeDistance <= 15.0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-slate-100 space-y-5">
      {/* 1. Header Bar with Demo Label & Geofence Radius */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">
                  Geospatial Outbreak Intelligence & Biosecurity Surveillance
                </h3>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                  DEMO DATASET • KVK PURBA BARDHAMAN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-layer GIS map integrating confirmed laboratory cases, preliminary field reports and geofenced risk zones
              </p>
            </div>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition cursor-pointer ${
              showHeatmap
                ? 'bg-red-950/60 border-red-600/50 text-red-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap Overlay: {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowGeofence(!showGeofence)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition cursor-pointer ${
              showGeofence
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Farm Geofence: {showGeofence ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Radius:</span>
            <select
              value={radiusKm}
              onChange={e => setRadiusKm(Number(e.target.value))}
              className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={10} className="bg-slate-900">10 km</option>
              <option value={25} className="bg-slate-900">25 km</option>
              <option value={50} className="bg-slate-900">50 km</option>
              <option value={100} className="bg-slate-900">100 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Confirmed Outbreaks
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-red-400">
              {confirmedCount}
            </span>
            <span className="text-xs text-slate-400">farms verified</span>
          </div>
          <span className="text-[10px] text-red-400/80 font-medium block mt-1">
            ● Lab/KVK certified foci
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Suspected Clusters
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              {suspectedCount}
            </span>
            <span className="text-xs text-slate-400">under inspection</span>
          </div>
          <span className="text-[10px] text-amber-400/80 font-medium block mt-1">
            ▲ Preliminary reports
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Surveillance Zones
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {monitoredCount}
            </span>
            <span className="text-xs text-slate-400">monitored</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-medium block mt-1">
            ■ Low-risk baselines
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Regional 7-Day Trend
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-base sm:text-lg font-bold text-white">
              Increasing (+4 cases)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Spreading South-East along river
          </span>
        </div>
      </div>

      {/* 3. Comprehensive GIS Filters */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Crop Filter */}
        <select
          value={selectedCrop}
          onChange={e => setSelectedCrop(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Crops</option>
          <option value="rice">Rice (Paddy)</option>
          <option value="wheat">Wheat</option>
          <option value="potato">Potato</option>
          <option value="cotton">Cotton</option>
        </select>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Types (Disease & Pest)</option>
          <option value="DISEASE">Diseases Only</option>
          <option value="PEST">Pests Only</option>
        </select>

        {/* Verification Status Filter */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="CONFIRMED">Confirmed Only</option>
          <option value="PRELIMINARY">Suspected Only</option>
          <option value="MONITORED">Monitored Only</option>
        </select>

        {/* Severity Filter */}
        <select
          value={selectedSeverity}
          onChange={e => setSelectedSeverity(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MODERATE">Moderate</option>
          <option value="LOW">Low</option>
        </select>

        {/* Time Period Filter */}
        <select
          value={selectedTimePeriod}
          onChange={e => setSelectedTimePeriod(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Records</option>
          <option value="24h">Last 24-48 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>

        <span className="text-slate-400 ml-auto font-mono text-[11px]">
          Showing <strong>{filteredHotspots.length}</strong> active clusters in {radiusKm} km
        </span>
      </div>

      {/* 4. Interactive GIS Map Canvas + Detailed Cluster Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SVG Map Canvas (8 cols) */}
        <div className="lg:col-span-8 relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden min-h-[420px] flex items-center justify-center">
          <svg
            viewBox="0 0 800 500"
            className="w-full h-full object-cover select-none cursor-crosshair"
          >
            <defs>
              {/* Map Grid Pattern */}
              <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
              </pattern>

              {/* Heatmap Gradients */}
              <radialGradient id="gis-heat-critical" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.70" />
                <stop offset="60%" stopColor="#ef4444" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="gis-heat-high" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.65" />
                <stop offset="60%" stopColor="#f97316" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="gis-heat-suspected" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#eab308" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Grid Pattern */}
            <rect width="800" height="500" fill="url(#gis-grid)" />

            {/* Geographic River Feature (Damodar River Basin) */}
            <path
              d="M 40 160 Q 240 210, 420 180 T 780 270"
              fill="none"
              stroke="#0891b2"
              strokeWidth="12"
              strokeOpacity="0.25"
              strokeLinecap="round"
            />
            <text x="160" y="175" fill="#38bdf8" opacity="0.4" fontSize="10" fontFamily="sans-serif">
              Damodar River (Canal Irrigation Network)
            </text>

            {/* Block Boundaries Annotations */}
            <text x="360" y="80" fill="#64748b" opacity="0.4" fontSize="11" fontWeight="bold">
              BHATAR BLOCK
            </text>
            <text x="120" y="320" fill="#64748b" opacity="0.4" fontSize="11" fontWeight="bold">
              KHANDAGHOSH BLOCK
            </text>
            <text x="620" y="360" fill="#64748b" opacity="0.4" fontSize="11" fontWeight="bold">
              MEMARI BLOCK
            </text>

            {/* 15 km Risk Engine Surveillance Geofence Ring */}
            {showGeofence && (
              <g transform={`translate(${projectToMap(userLat, userLng).x}, ${projectToMap(userLat, userLng).y})`}>
                <circle
                  r="130"
                  fill="#10b981"
                  fillOpacity="0.04"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                  opacity="0.6"
                />
                <text y="-136" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">
                  15 km Risk Engine Geospatial Zone
                </text>
              </g>
            )}

            {/* Heatmap Layer */}
            {showHeatmap && filteredHotspots.map(h => {
              const pos = projectToMap(h.latitude, h.longitude);
              const r = Math.max(40, h.radiusKm * 4.5);
              const gradId = h.severity === 'CRITICAL'
                ? 'url(#gis-heat-critical)'
                : h.verificationStatus === 'PRELIMINARY'
                ? 'url(#gis-heat-suspected)'
                : 'url(#gis-heat-high)';

              return (
                <circle
                  key={`heat-${h.id}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={gradId}
                  className="pointer-events-none"
                />
              );
            })}

            {/* Outbreak Containment Rings (Differentiates Confirmed vs Suspected vs Monitored) */}
            {filteredHotspots.map(h => {
              const pos = projectToMap(h.latitude, h.longitude);
              const isSelected = activePoint?.id === h.id;
              const fill = getStatusFill(h.verificationStatus, h.severity);
              const isSuspected = h.verificationStatus === 'PRELIMINARY';
              const isMonitored = h.verificationStatus === 'MONITORED';

              return (
                <g key={`ring-${h.id}`} className="transition-all duration-300">
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={Math.max(18, h.activeCount * 2.0)}
                    fill="none"
                    stroke={fill}
                    strokeWidth={isSelected ? '2.5' : '1.2'}
                    strokeDasharray={isSuspected ? '5,3' : isMonitored ? '2,2' : 'none'}
                    opacity={isSelected ? 0.9 : 0.45}
                  />
                </g>
              );
            })}

            {/* Hotspot Markers */}
            {filteredHotspots.map(h => {
              const pos = projectToMap(h.latitude, h.longitude);
              const isSelected = activePoint?.id === h.id;
              const fill = getStatusFill(h.verificationStatus, h.severity);
              const isSuspected = h.verificationStatus === 'PRELIMINARY';

              return (
                <g
                  key={h.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => {
                    setActivePoint(h);
                    if (onSelectHotspot) onSelectHotspot(h);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Pulse for Critical/Active */}
                  {h.severity === 'CRITICAL' && (
                    <circle r="16" fill="#ef4444" opacity="0.35" className="animate-ping" />
                  )}

                  {/* Pin Circle */}
                  <circle
                    r={isSelected ? '12' : '9'}
                    fill={fill}
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="transition-transform duration-200 group-hover:scale-125"
                  />

                  {/* Marker Type Character: C = Confirmed, ? = Suspected, M = Monitored */}
                  <text
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isSelected ? '10' : '8'}
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {isSuspected ? '?' : h.verificationStatus === 'MONITORED' ? 'M' : 'C'}
                  </text>

                  {/* Tooltip Label */}
                  <text
                    y="-16"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9.5"
                    fontWeight="700"
                    className="opacity-90 group-hover:opacity-100 drop-shadow pointer-events-none"
                  >
                    {h.locationName.split(',')[0]} ({h.activeCount})
                  </text>
                </g>
              );
            })}

            {/* Farmer Farm Marker (Galsi) */}
            <g transform={`translate(${projectToMap(userLat, userLng).x}, ${projectToMap(userLat, userLng).y})`}>
              <circle r="18" fill="#10b981" opacity="0.2" className="animate-ping" />
              <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
              <text y="18" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                Your Farm (Galsi)
              </text>
            </g>
          </svg>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/70 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1 shadow-lg pointer-events-none">
            <div className="font-semibold text-white text-xs flex items-center gap-1.5 pb-1 border-b border-slate-700">
              <Layers className="w-3 h-3 text-emerald-400" /> Map Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Confirmed Outbreak (Lab/KVK Verified)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Suspected Focus (Preliminary Investigation)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Monitored Surveillance Zone (Low Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
              <span>Your Current Farm Location</span>
            </div>
          </div>
        </div>

        {/* Detail Sidebar / Inspector Card (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          {activePoint ? (
            <div className="space-y-3.5">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(activePoint.verificationStatus)}`}>
                    {activePoint.verificationStatus.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {activePoint.caseId}
                  </span>
                </div>
                <h4 className="font-bold text-white text-lg mt-1 leading-tight">
                  {activePoint.diseaseOrPest}
                </h4>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{activePoint.locationName}</span>
                </p>
              </div>

              {/* Distance from Farm & Surveillance Buffer Check */}
              <div className={`p-2.5 rounded-lg border text-xs ${
                isInside15kmSurveillance
                  ? 'bg-red-950/40 border-red-800/50 text-red-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center justify-between font-semibold">
                  <span>Distance to Your Farm:</span>
                  <strong className="font-mono text-white text-sm">{activeDistance} km</strong>
                </div>
                <p className="text-[11px] mt-1 text-slate-300">
                  {isInside15kmSurveillance
                    ? '⚠️ Inside your 15 km Risk Zone: This cluster actively contributes +20 points to your farm\'s disease risk score.'
                    : 'Outside immediate 15 km perimeter. Monitored for potential downwind spore trajectory.'}
                </p>
              </div>

              {/* Cluster Stats Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Active Affected Plots</span>
                  <span className="text-white font-bold text-sm">{activePoint.activeCount} farms</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Containment Perimeter</span>
                  <span className="text-white font-bold text-sm">{activePoint.radiusKm} km</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Host Crop</span>
                  <span className="text-emerald-400 font-semibold">{activePoint.crop}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Cluster Trend</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {activePoint.trend || 'Increasing'}
                  </span>
                </div>
              </div>

              {/* Containment Protocol Advisory */}
              <div className="text-xs space-y-1">
                <span className="font-semibold text-white block">Official Containment Advisory:</span>
                <p className="text-slate-300 text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  {activePoint.containmentProtocol ||
                    'Prophylactic community barrier spray recommended within 5 km perimeter. Restrict inter-field machinery movement to curb spore transport.'}
                </p>
              </div>

              {/* Coordinates & Reporting Info */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>GPS: {activePoint.latitude.toFixed(4)}, {activePoint.longitude.toFixed(4)}</span>
                <span>Reported: {activePoint.date}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <AlertOctagon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Click any marker on the map to inspect surveillance metrics.</p>
            </div>
          )}

          {/* Action Button Links to Risk & Scanner */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            {onOpenRisk && (
              <button
                onClick={onOpenRisk}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Calculate Disease Risk on My Farm</span>
              </button>
            )}

            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scan My Field for This Symptom</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
