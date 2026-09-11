import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Globe,
  Wifi,
  WifiOff,
  Bell,
  ChevronDown,
  CheckCircle2,
  Zap,
  Search,
  Check,
  Database,
  Info
} from 'lucide-react';
import { UserRole, LanguageCode, NetworkMode, EarlyWarningNotification } from '../types';
import { translations } from '../data/translations';
import { INDIAN_REGIONAL_LANGUAGES, getLanguageMeta } from '../data/languages';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  networkMode: NetworkMode;
  onNetworkModeChange: (mode: NetworkMode) => void;
  offlineQueueCount: number;
  onOpenOfflineQueue: () => void;
  notifications: EarlyWarningNotification[];
  onStartDemoTour?: () => void;
  onOpenProfile?: () => void;
  onNavigateHome?: () => void;
  onOpenScanner?: () => void;
  onOpenRiskMap?: () => void;
  onOpenAdvisories?: () => void;
  onOpenSensors?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  networkMode,
  onNetworkModeChange,
  offlineQueueCount,
  onOpenOfflineQueue,
  notifications,
  onStartDemoTour: _onStartDemoTour,
  onOpenProfile,
  onNavigateHome,
  onOpenScanner,
  onOpenRiskMap,
  onOpenAdvisories,
  onOpenSensors
}) => {
  const t = translations[language] || translations.en;
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');

  const currentLangMeta = getLanguageMeta(language);

  const roles: { role: UserRole; label: string; icon: string; desc: string }[] = [
    { role: 'FARMER', label: t.roleFarmer, icon: '👨‍🌾', desc: 'Scan crops, view risk, get IPM advisories' },
    { role: 'EXTENSION_WORKER', label: t.roleExtension, icon: '📋', desc: 'Inspect fields, visit high-risk farms' },
    { role: 'EXPERT', label: t.roleExpert, icon: '🔬', desc: 'Validate AI diagnosis, prescribe treatment' },
    { role: 'LAB_STAFF', label: t.roleLab, icon: '🧪', desc: 'Process samples, confirm pathogens' },
    { role: 'ADMIN', label: t.roleAdmin, icon: '🏛️', desc: 'State surveillance, hotspots, model audit' }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredLanguages = INDIAN_REGIONAL_LANGUAGES.filter(lang => {
    const query = languageSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      lang.englishName.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.regions.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    );
  });

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-emerald-800/40 text-white shadow-md">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-inner font-bold text-xl border border-emerald-400/30">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-emerald-400 tracking-tight">CropGuard AI</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">v2.5</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate max-w-xs">{t.tagline}</p>
          </div>
        </div>

        {/* Desktop Navigation Links for Farmer Workflow */}
        {currentRole === 'FARMER' && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-850 font-medium transition cursor-pointer"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-3 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 font-semibold transition cursor-pointer"
            >
              Scan Crop
            </button>
            <button
              type="button"
              onClick={onOpenRiskMap}
              className="px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-850 font-medium transition cursor-pointer"
            >
              Risk Map
            </button>
            <button
              type="button"
              onClick={onOpenAdvisories}
              className="px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-850 font-medium transition cursor-pointer"
            >
              Advisories
            </button>
            <button
              type="button"
              onClick={onOpenSensors}
              className="px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-850 font-medium transition cursor-pointer"
            >
              IoT Sensors
            </button>
          </nav>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* ONLINE SECTION with Weak 2G (Data Compression) */}
          <div className="relative">
            <button
              onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
              title="Network Connectivity & Data Compression Settings"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                networkMode === 'ONLINE'
                  ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/60'
                  : networkMode === 'WEAK_2G'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 hover:bg-amber-900/80 ring-1 ring-amber-500/40'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {networkMode === 'ONLINE' && <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              {networkMode === 'WEAK_2G' && <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />}
              {networkMode === 'OFFLINE' && <WifiOff className="w-3.5 h-3.5 text-slate-400" />}

              <span className="hidden sm:inline font-semibold">
                {networkMode === 'ONLINE' && 'Online'}
                {networkMode === 'WEAK_2G' && 'Weak 2G (Compressed)'}
                {networkMode === 'OFFLINE' && 'Offline'}
              </span>

              {networkMode === 'WEAK_2G' && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono hidden md:inline">
                  -85%
                </span>
              )}

              {offlineQueueCount > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenOfflineQueue();
                  }}
                  className="ml-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full cursor-pointer hover:bg-amber-400"
                  title={`${offlineQueueCount} items queued`}
                >
                  {offlineQueueCount}
                </span>
              )}
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Network Mode Dropdown Popover */}
            {showNetworkDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-slate-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-white uppercase tracking-wider">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Network & Data Mode</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    Field-Ready
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* Option 1: Weak 2G (Data Compression) */}
                  <button
                    onClick={() => {
                      onNetworkModeChange('WEAK_2G');
                      setShowNetworkDropdown(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition cursor-pointer border ${
                      networkMode === 'WEAK_2G'
                        ? 'bg-amber-950/50 border-amber-500/80 text-white'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 mt-0.5">
                      <Zap className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          {t.weak2gMode}
                          <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1 rounded">Recommended</span>
                        </span>
                        {networkMode === 'WEAK_2G' && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Aggressive client-side canvas compression (480px / 0.40 quality). Reduces 3MB photos to ~38 KB (98%+ data saved) for rural low-signal areas.
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Online High-Speed 4G/5G */}
                  <button
                    onClick={() => {
                      onNetworkModeChange('ONLINE');
                      setShowNetworkDropdown(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition cursor-pointer border ${
                      networkMode === 'ONLINE'
                        ? 'bg-emerald-950/50 border-emerald-600 text-white'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">{t.onlineStatus}</span>
                        {networkMode === 'ONLINE' && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Full-resolution image scanning, live IoT sensor streaming, and real-time cloud pathogen verification.
                      </p>
                    </div>
                  </button>

                  {/* Option 3: Offline Mode */}
                  <button
                    onClick={() => {
                      onNetworkModeChange('OFFLINE');
                      setShowNetworkDropdown(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition cursor-pointer border ${
                      networkMode === 'OFFLINE'
                        ? 'bg-slate-800/90 border-slate-600 text-white'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-slate-700/50 text-slate-400 mt-0.5">
                      <WifiOff className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">{t.offlineMode}</span>
                        {networkMode === 'OFFLINE' && <Check className="w-4 h-4 text-slate-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Completely disconnected. Scans and field notes are safely cached in browser local storage and queued for later batch sync.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Data Compression Telemetry Footnote */}
                <div className="mt-3 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">Rural Optimization: </span>
                    2G mode delivers near-instant uploads over 64 kbps GPRS connections.
                    {offlineQueueCount > 0 && (
                      <span className="text-amber-400 block mt-0.5">
                        {offlineQueueCount} scan(s) waiting in offline queue.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ALL INDIAN REGIONAL LANGUAGES SECTION */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageModal(!showLanguageModal)}
              title="Select Regional Indian Language"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-slate-200"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white max-w-[85px] truncate">
                {currentLangMeta.nativeName}
              </span>
              <span className="text-[10px] bg-slate-700 px-1 py-0.2 rounded font-mono text-slate-300">
                {currentLangMeta.badge}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Language Selector Modal / Popover */}
            {showLanguageModal && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-white uppercase tracking-wider">
                      Indian Regional Languages ({INDIAN_REGIONAL_LANGUAGES.length})
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                    8th Schedule
                  </span>
                </div>

                {/* Search Bar */}
                <div className="mt-2.5 relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search language or state (e.g. Telugu, Marathi, Assam)..."
                    value={languageSearch}
                    onChange={(e) => setLanguageSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                {/* Quick Selection Tags for Major Regional Languages */}
                {!languageSearch && (
                  <div className="mt-2 flex flex-wrap gap-1 pb-1.5 border-b border-slate-800/80">
                    {INDIAN_REGIONAL_LANGUAGES.filter(l => l.popular).map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          onLanguageChange(l.code);
                          setShowLanguageModal(false);
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded transition cursor-pointer ${
                          language === l.code
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {l.nativeName}
                      </button>
                    ))}
                  </div>
                )}

                {/* Language Scrollable List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-1 pr-1">
                  {filteredLanguages.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No language matched "{languageSearch}"
                    </div>
                  ) : (
                    filteredLanguages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          onLanguageChange(l.code);
                          setShowLanguageModal(false);
                          setLanguageSearch('');
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer ${
                          language === l.code
                            ? 'bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/60'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 text-center text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 px-1 py-0.5 rounded border border-slate-700">
                            {l.badge}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{l.nativeName}</span>
                              <span className="text-[11px] text-slate-400">({l.englishName})</span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-[230px]">
                              {l.regions}
                            </p>
                          </div>
                        </div>

                        {language === l.code && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Early Warning Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-white">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>Early Warning Alerts</span>
                  </div>
                  <span className="text-xs text-slate-400">{notifications.length} Total</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80 mt-1">
                  {notifications.map(n => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-slate-800/40 rounded transition">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          n.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          n.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {n.riskLevel}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-white mt-1">{n.title}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{n.reason}</p>
                      <div className="mt-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-800/40">
                        <strong>Action:</strong> {n.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Popover */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-700 hover:to-teal-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-600/50 shadow-sm transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{roles.find(r => r.role === currentRole)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  {t.switchRole}
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      onRoleChange(r.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition cursor-pointer ${
                      currentRole === r.role ? 'bg-emerald-900/60 border border-emerald-700 text-white' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold flex items-center justify-between">
                        <span>{r.label}</span>
                        {currentRole === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Farmer Profile Button */}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              title="Farmer & Farm Profile Settings"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[9px]">
                👨‍🌾
              </span>
              <span className="hidden sm:inline">Profile</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
