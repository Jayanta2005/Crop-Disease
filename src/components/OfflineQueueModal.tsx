import React from 'react';
import {
  WifiOff,
  CloudUpload,
  CheckCircle2,
  X,
  Clock,
  RefreshCw,
  AlertCircle,
  Zap
} from 'lucide-react';
import { OfflineQueueItem, LanguageCode, NetworkMode } from '../types';
import { translations } from '../data/translations';

interface OfflineQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: OfflineQueueItem[];
  isOnline: boolean;
  networkMode?: NetworkMode;
  language: LanguageCode;
  onSyncAll: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string;
}

export const OfflineQueueModal: React.FC<OfflineQueueModalProps> = ({
  isOpen,
  onClose,
  queue,
  isOnline,
  networkMode = 'ONLINE',
  language,
  onSyncAll,
  isSyncing = false,
  lastSyncTime = 'Today, 10:45 AM'
}) => {
  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              {isSyncing ? (
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                Offline Field Cache & Sync Center
              </h2>
              <p className="text-xs text-slate-400">
                Resilient local IndexedDB storage with automatic background synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Status Indicator Bar */}
          <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
            isSyncing
              ? 'bg-blue-950/50 border-blue-500/60 text-blue-300'
              : networkMode === 'WEAK_2G'
              ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
              : isOnline
              ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300'
              : 'bg-slate-850 border-slate-700 text-slate-400'
          }`}>
            <span className="font-medium flex items-center gap-2">
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <strong>Syncing with KVK Cloud Server...</strong>
                </>
              ) : networkMode === 'WEAK_2G' ? (
                <>
                  <Zap className="w-4 h-4 fill-amber-400" />
                  <span>Network: <strong>Weak 2G (Data Compressed Mode)</strong></span>
                </>
              ) : isOnline ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Network: <strong>Online (4G / 5G Ready)</strong></span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-slate-400" />
                  <span>Network: <strong>Offline (Local Queue Active)</strong></span>
                </>
              )}
            </span>
            <span className="text-[11px] font-mono font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              {queue.length} Pending Scans
            </span>
          </div>

          {/* Sync Telemetry Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Last Synchronized:</span>
              <span className="text-white font-mono font-bold mt-0.5 block">{lastSyncTime}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Storage Engine:</span>
              <span className="text-emerald-400 font-mono font-bold mt-0.5 block">IndexedDB Offline Store</span>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-70" />
              <p className="text-xs font-bold text-white">All Field Scans Fully Synchronized</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                No pending crop scans in offline storage. New scans taken in low-connectivity areas will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map(item => (
                <div key={item.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                      <img src={item.imageBlobUrl} alt={item.cropName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{item.cropName} ({item.cropStage})</h4>
                      <p className="text-[10px] text-slate-400">Captured at {new Date(item.timestamp).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-indigo-300 font-mono">GPS: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    isSyncing ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse' :
                    item.status === 'UPLOADED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    item.status === 'UPLOADING' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {isSyncing ? 'Syncing...' : item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-850 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[11px] text-slate-400">
            Sync triggers automatically upon network reconnection
          </span>
          <button
            type="button"
            onClick={onSyncAll}
            disabled={!isOnline || queue.length === 0 || isSyncing}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow flex items-center gap-1.5 transition cursor-pointer ${
              !isOnline || queue.length === 0 || isSyncing
                ? 'bg-slate-700 opacity-50 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5" />
            )}
            <span>{isSyncing ? 'Syncing All...' : 'Sync All Items Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
