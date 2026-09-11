import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Send,
  X,
  CheckCircle2,
  Phone,
  AlertTriangle,
  Camera
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../data/translations';
import { CROPS } from '../data/mockData';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSubmitReport: (report: any) => void;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  isOpen,
  onClose,
  language,
  onSubmitReport
}) => {
  const t = translations[language];
  const [cropId, setCropId] = useState<string>('rice');
  const [severity, setSeverity] = useState<string>('HIGH');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('VISIT_REQUESTED');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport({
      cropId,
      severity,
      problemDescription,
      urgency,
      timestamp: new Date().toISOString()
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                {t.reportProblem}
              </h2>
              <p className="text-xs text-slate-400">
                Direct emergency dispatch to KVK Burdwan Extension Block
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
              <h3 className="font-bold text-white text-base">Report Dispatched to Extension Officer</h3>
              <p className="text-slate-300 max-w-xs mx-auto">
                Officer Ananya Roy has received your emergency ticket. You will receive an SMS confirmation on +91 98451 23410.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Affected Crop:</label>
                <select
                  value={cropId}
                  onChange={e => setCropId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {CROPS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Observed Urgency & Spread:</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="CRITICAL">Critical (Spreading rapidly across entire field)</option>
                  <option value="HIGH">High (Spotted across multiple crop patches)</option>
                  <option value="MODERATE">Moderate (Isolated symptoms noticed today)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Problem Description:</label>
                <textarea
                  rows={4}
                  required
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  placeholder="Describe leaf symptoms, wilting, insect damage, or sudden yellowing..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kisan Call Center: <strong>1800-180-1551 (Toll-Free)</strong></span>
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-5 rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Urgent Report</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
