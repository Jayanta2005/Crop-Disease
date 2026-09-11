import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  MapPin,
  Sprout,
  Wifi,
  WifiOff,
  Zap,
  RefreshCw,
  Globe,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Save,
  Camera,
  Check,
  Tag,
  ArrowRight,
  Layers,
  Clock,
  Sparkles
} from 'lucide-react';
import { User as UserType, Farm, LanguageCode, NetworkMode, UserRole, DiagnosisRecord } from '../types';
import { translations } from '../data/translations';
import { getLanguageMeta } from '../data/languages';
import { DEMO_FARMS, DEMO_USERS } from '../data/mockData';

interface FarmerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateUser?: (updated: Partial<UserType> & { name: string; phone: string }) => void;
  currentFarm: Farm;
  onSelectFarm?: (farm: Farm) => void;
  language: LanguageCode;
  onOpenLanguageModal: () => void;
  networkMode: NetworkMode;
  onNetworkModeChange: (mode: NetworkMode) => void;
  offlineQueueCount: number;
  onOpenOfflineQueue: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  savedDiagnoses?: DiagnosisRecord[];
  onOpenScanner?: () => void;
  onSelectDiagnosis?: (record: DiagnosisRecord) => void;
}

export const FarmerProfileModal: React.FC<FarmerProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  currentFarm,
  onSelectFarm,
  language,
  onOpenLanguageModal,
  networkMode,
  onNetworkModeChange,
  offlineQueueCount,
  onOpenOfflineQueue,
  currentRole,
  onRoleChange,
  savedDiagnoses = [],
  onOpenScanner,
  onSelectDiagnosis
}) => {
  const t = translations[language] || translations.en;
  const langMeta = getLanguageMeta(language);

  // Editable Profile State
  const [name, setName] = useState<string>(user.name || '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [village, setVillage] = useState<string>(user.village || 'Galsi');
  const [district, setDistrict] = useState<string>(user.district || 'Purba Bardhaman');
  const [state, setState] = useState<string>(user.state || 'West Bengal');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isEditExpanded, setIsEditExpanded] = useState<boolean>(true);

  // Synchronize state when user prop changes
  useEffect(() => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setVillage(user.village || 'Galsi');
    setDistrict(user.district || 'Purba Bardhaman');
    setState(user.state || 'West Bengal');
  }, [user.name, user.phone, user.village, user.district, user.state, isOpen]);

  if (!isOpen) return null;

  // Filter diagnoses/crops saved in profile for this particular user ID
  const effectiveUserId = phone.trim() || user.phone;
  const userSavedCrops = savedDiagnoses.filter(d => {
    return (
      (d.farmerPhone && d.farmerPhone.trim() === effectiveUserId) ||
      (d.farmerId && d.farmerId.trim() === effectiveUserId) ||
      (d.farmerId && d.farmerId === user.id)
    );
  });

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (!cleanName || !cleanPhone) return;

    if (onUpdateUser) {
      onUpdateUser({
        name: cleanName,
        phone: cleanPhone,
        id: cleanPhone, // Phone number serves as the User ID
        village: village.trim(),
        district: district.trim(),
        state: state.trim()
      });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3500);
  };

  const handleApplyDemoProfile = (demoName: string, demoPhone: string, demoVillage: string, demoDistrict: string, demoState: string) => {
    setName(demoName);
    setPhone(demoPhone);
    setVillage(demoVillage);
    setDistrict(demoDistrict);
    setState(demoState);

    if (onUpdateUser) {
      onUpdateUser({
        name: demoName,
        phone: demoPhone,
        id: demoPhone,
        village: demoVillage,
        district: demoDistrict,
        state: demoState
      });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Farmer Profile & User ID</h2>
              <p className="text-xs text-slate-400">Manage your identity & personal crop history</p>
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
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Active Farmer Profile Summary Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
            <div className="w-13 h-13 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl shrink-0">
              👨‍🌾
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-base text-white truncate">{user.name}</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  {t.roleFarmer}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{user.village || 'Galsi'}, {user.district || 'Purba Bardhaman'}, {user.state || 'West Bengal'}</span>
              </p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>User ID: {user.phone}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {userSavedCrops.length} crop{userSavedCrops.length === 1 ? '' : 's'} linked to this ID
                </span>
              </div>
            </div>
          </div>

          {/* Editable Name Change & User ID (Phone Number) Section */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Edit Profile & User ID</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                Custom Identity
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Name Section: "Enter your name" */}
              <div>
                <label
                  htmlFor="enterYourNameInput"
                  className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5"
                >
                  Enter your name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="enterYourNameInput"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This name will appear on all your crop diagnoses, farm plots, and KVK consultation records.
                </p>
              </div>

              {/* Phone Number Section as ID of a user */}
              <div>
                <label
                  htmlFor="phoneUserIdInput"
                  className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center justify-between"
                >
                  <span>Phone Number (User ID)</span>
                  <span className="text-[10px] font-mono text-emerald-400 lowercase">unique identifier</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="phoneUserIdInput"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number as User ID"
                    required
                    className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
                <div className="mt-1.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Your phone number serves as the <strong>User ID</strong> to save and isolate your crop scans in your profile as a particular user. Any crop you scan is tagged with this ID.
                  </p>
                </div>
              </div>

              {/* Location details (collapsible/compact) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label htmlFor="userVillageInput" className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Village / Town
                  </label>
                  <input
                    id="userVillageInput"
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Galsi"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="userDistrictInput" className="block text-[11px] font-semibold text-slate-400 mb-1">
                    District
                  </label>
                  <input
                    id="userDistrictInput"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Purba Bardhaman"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="userStateInput" className="block text-[11px] font-semibold text-slate-400 mb-1">
                    State
                  </label>
                  <input
                    id="userStateInput"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. West Bengal"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Save Button & Feedback */}
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile & Update User ID</span>
                </button>

                {saveSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Profile saved! Crops linked to User ID: {phone}</span>
                  </div>
                )}
              </div>

              {/* Quick Preset Farmer Profiles */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Or load demo user profile:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyDemoProfile('Rameshwar Mahato', '+91 98451 23410', 'Galsi', 'Purba Bardhaman', 'West Bengal')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left text-xs transition cursor-pointer"
                  >
                    <span className="font-bold text-white block">Rameshwar Mahato</span>
                    <span className="text-[10px] font-mono text-emerald-400">ID: +91 98451 23410 (West Bengal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyDemoProfile('Gurpreet Singh', '+91 98140 88231', 'Samrala', 'Ludhiana', 'Punjab')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left text-xs transition cursor-pointer"
                  >
                    <span className="font-bold text-white block">Gurpreet Singh</span>
                    <span className="text-[10px] font-mono text-emerald-400">ID: +91 98140 88231 (Punjab)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Crops Saved in User Profile Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Crops Saved in Profile</h3>
                  <p className="text-[11px] text-slate-400">Linked to User ID: <span className="font-mono text-emerald-300">{effectiveUserId}</span></p>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                {userSavedCrops.length} Crop{userSavedCrops.length === 1 ? '' : 's'}
              </span>
            </div>

            {userSavedCrops.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-900/60 rounded-xl border border-dashed border-slate-800">
                <Sprout className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">No Crops Saved For User ID ({effectiveUserId})</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  When you scan a leaf with the camera or upload an image, it will be automatically saved under this user ID in your personal profile.
                </p>
                {onOpenScanner && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenScanner();
                    }}
                    className="mt-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Crop & Save to Profile</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {userSavedCrops.slice(0, 5).map(diag => (
                  <div
                    key={diag.id}
                    onClick={() => {
                      if (onSelectDiagnosis) {
                        onSelectDiagnosis(diag);
                        onClose();
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                        <img src={diag.imageUrl} alt={diag.cropName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white truncate group-hover:text-emerald-400 transition">
                            {diag.cropName}
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                            diag.aiSeverity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                            diag.aiSeverity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                            'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          }`}>
                            {diag.aiSeverity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate mt-0.5 font-medium">
                          {diag.finalDiagnosis || diag.aiPrediction}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{diag.cropStage}</span>
                          <span>•</span>
                          <span>{diag.timestamp.split('T')[0]}</span>
                          <span>•</span>
                          <span className="font-mono text-emerald-400">ID: {diag.farmerPhone || diag.farmerId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-emerald-300">
                      <span className="hidden sm:inline text-[11px]">View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}

                {userSavedCrops.length > 5 && (
                  <p className="text-center text-[11px] text-slate-400 pt-1">
                    Showing top 5 of {userSavedCrops.length} crops saved under User ID {effectiveUserId}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Registered Farm Plots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Registered Farm Plots ({DEMO_FARMS.length})
              </span>
              <span className="text-[11px] text-emerald-400">Active Field Selection</span>
            </div>
            <div className="space-y-2">
              {DEMO_FARMS.map(f => {
                const isSelected = f.id === currentFarm.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => onSelectFarm && onSelectFarm(f)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        🌾
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs">{f.name}</h4>
                          {isSelected && (
                            <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {f.areaAcres} Acres • {f.currentCropId.toUpperCase()} ({f.cropStage}) • {f.soilType}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[11px] text-slate-500">Switch</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Network & Data Mode Selection */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Network & Data Synchronization
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onNetworkModeChange('ONLINE')}
                className={`p-2 rounded-lg border text-center font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                  networkMode === 'ONLINE'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Online (4G/5G)</span>
              </button>

              <button
                type="button"
                onClick={() => onNetworkModeChange('WEAK_2G')}
                className={`p-2 rounded-lg border text-center font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                  networkMode === 'WEAK_2G'
                    ? 'bg-amber-950 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Weak 2G (-85%)</span>
              </button>

              <button
                type="button"
                onClick={() => onNetworkModeChange('OFFLINE')}
                className={`p-2 rounded-lg border text-center font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                  networkMode === 'OFFLINE'
                    ? 'bg-slate-800 border-slate-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <WifiOff className="w-4 h-4 text-slate-400" />
                <span>Offline Cache</span>
              </button>
            </div>

            {/* Offline Queue quick action */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              <span>Offline Pending Scans:</span>
              <button
                type="button"
                onClick={onOpenOfflineQueue}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline flex items-center gap-1"
              >
                <span>{offlineQueueCount} scans in local queue</span>
              </button>
            </div>
          </div>

          {/* Language Selector shortcut */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Regional Language</span>
                <span className="text-[11px] text-slate-400">
                  {langMeta.nativeName} ({langMeta.englishName})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenLanguageModal}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-emerald-300 transition cursor-pointer"
            >
              Change Language
            </button>
          </div>

          {/* Assigned KVK Agronomist Contact Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Assigned Agricultural Extension Officer
            </span>
            <div className="flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-white">Dr. Vivek Sharma</h4>
                <p className="text-[11px] text-slate-400">Senior Pathologist, Krishi Vigyan Kendra (KVK)</p>
                <p className="text-[11px] text-emerald-400 mt-0.5">Purba Bardhaman Center</p>
              </div>
              <a
                href="tel:18001801551"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call KVK</span>
              </a>
            </div>
          </div>

          {/* Switch Role (For Evaluation & Demo Testing) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Demonstration: Switch Stakeholder Workspace
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(['FARMER', 'EXTENSION_WORKER', 'EXPERT', 'LAB_STAFF', 'ADMIN'] as UserRole[]).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onRoleChange(role);
                    onClose();
                  }}
                  className={`p-2 rounded-lg border text-left font-medium transition cursor-pointer ${
                    currentRole === role
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block font-semibold">
                    {role === 'FARMER' ? '👨‍🌾 Farmer' :
                     role === 'EXTENSION_WORKER' ? '📋 Extension' :
                     role === 'EXPERT' ? '🔬 Expert' :
                     role === 'LAB_STAFF' ? '🧪 Lab Staff' : '🏛️ Admin'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Active ID: <span className="font-mono text-emerald-400">{user.phone}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

