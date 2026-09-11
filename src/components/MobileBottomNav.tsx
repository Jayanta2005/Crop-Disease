import React from 'react';
import {
  Home,
  Camera,
  MapPin,
  FileText,
  User,
  AlertTriangle
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../data/translations';

interface MobileBottomNavProps {
  activeTab: 'home' | 'scan' | 'riskMap' | 'advisory' | 'profile';
  language: LanguageCode;
  offlineQueueCount: number;
  onNavigateHome: () => void;
  onOpenScanner: () => void;
  onOpenRiskMap: () => void;
  onOpenAdvisory: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  language,
  offlineQueueCount,
  onNavigateHome,
  onOpenScanner,
  onOpenRiskMap,
  onOpenAdvisory,
  onOpenProfile
}) => {
  const t = translations[language] || translations.en;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 text-slate-300 md:hidden shadow-2xl safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* 1. Home */}
        <button
          type="button"
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center gap-1 py-1 w-full h-full transition cursor-pointer ${
            activeTab === 'home' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">{t.home || 'Home'}</span>
        </button>

        {/* 2. Risk Map */}
        <button
          type="button"
          onClick={onOpenRiskMap}
          className={`flex flex-col items-center justify-center gap-1 py-1 w-full h-full transition cursor-pointer ${
            activeTab === 'riskMap' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Risk Map</span>
        </button>

        {/* 3. Scan (Prominent Center Button) */}
        <div className="flex justify-center -mt-5">
          <button
            type="button"
            onClick={onOpenScanner}
            aria-label="Scan Crop Leaf"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-950/60 border-2 border-slate-900 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {/* 4. Advisory */}
        <button
          type="button"
          onClick={onOpenAdvisory}
          className={`flex flex-col items-center justify-center gap-1 py-1 w-full h-full transition cursor-pointer ${
            activeTab === 'advisory' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Advisory</span>
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={onOpenProfile}
          className={`relative flex flex-col items-center justify-center gap-1 py-1 w-full h-full transition cursor-pointer ${
            activeTab === 'profile' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5" />
            {offlineQueueCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse ring-2 ring-slate-900" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
