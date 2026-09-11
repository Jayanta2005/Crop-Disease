import React, { useState } from 'react';
import {
  FlaskConical,
  Dna,
  TestTube,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Calendar,
  Search,
  Filter,
  Microscope
} from 'lucide-react';
import { LabReferralCase, LanguageCode } from '../types';
import { translations } from '../data/translations';

interface LaboratoryViewProps {
  referrals: LabReferralCase[];
  language: LanguageCode;
  onUpdateReferral: (referralId: string, status: string, resultDetails: string) => void;
}

export const LaboratoryView: React.FC<LaboratoryViewProps> = ({
  referrals,
  language,
  onUpdateReferral
}) => {
  const t = translations[language];
  const [selectedCase, setSelectedCase] = useState<LabReferralCase | null>(referrals[0] || null);
  const [testStatus, setTestStatus] = useState<string>('CONFIRMED');
  const [labResultText, setLabResultText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  const filtered = referrals.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.sampleId.toLowerCase().includes(q) ||
      r.farmerName.toLowerCase().includes(q) ||
      r.crop.toLowerCase().includes(q) ||
      r.suspectedPathogen.toLowerCase().includes(q)
    );
  });

  const handleUpdate = () => {
    if (!selectedCase) return;
    const result = labResultText || `${selectedCase.suspectedPathogen} confirmed via PCR & fungal mycelial culture.`;
    onUpdateReferral(selectedCase.id, testStatus, result);
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setLabResultText('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-purple-950/40 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-2xl text-white shadow-lg border border-purple-400/30 shrink-0">
              🧪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">State Plant Pathology Diagnostic Laboratory</h1>
                <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  Kalyani Central Lab
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Gold-standard diagnostic confirmation using PCR assay, microscopic spore morphology, and fungal culture plates.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-300 flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block">Samples In Testing</span>
              <span className="text-base font-bold text-amber-400">{referrals.filter(r => r.status === 'IN_TESTING' || r.status === 'RECEIVED').length}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">Completed Assays</span>
              <span className="text-base font-bold text-emerald-400">{referrals.filter(r => r.status === 'CONFIRMED').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sample List (Col 5) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Referred Tissue Samples</h3>
            <span className="text-xs text-slate-400 font-mono">{filtered.length} samples</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search sample code, farmer, crop..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filtered.map(item => {
              const isSelected = selectedCase?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-purple-500/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-purple-300">{item.sampleId}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                      item.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      item.status === 'IN_TESTING' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-xs mt-1.5">{item.farmerName} • {item.crop}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Suspected: {item.suspectedPathogen}</p>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>Type: {item.sampleType}</span>
                    <span>Collected: {item.collectionDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workbench (Col 7) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          {selectedCase ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase">SAMPLE ACCESSION #{selectedCase.sampleId}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedCase.crop} - {selectedCase.suspectedPathogen}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Origin: {selectedCase.farmerName} ({selectedCase.laboratoryName})</p>
                </div>
                <span className="text-xs bg-purple-950/60 text-purple-300 font-semibold px-2.5 py-1 rounded-lg border border-purple-800/40">
                  {selectedCase.sampleType}
                </span>
              </div>

              {/* Protocol Details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 text-xs">
                <span className="text-slate-400 font-semibold block">Laboratory Assay Protocol:</span>
                <p className="text-slate-300 leading-relaxed">
                  1. Surface sterilization in 1% NaOCl for 60s. Plated on Potato Dextrose Agar (PDA) at 27°C.
                  <br />
                  2. Microscopic observation of conidial septation under 400x magnification.
                  <br />
                  3. ITS-region primer PCR amplification for definitive fungal phylogenetic identification.
                </p>
              </div>

              {/* Status Update Form */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Diagnostic Outcome Status:</label>
                  <select
                    value={testStatus}
                    onChange={e => setTestStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="IN_TESTING">IN_TESTING (Incubation in progress)</option>
                    <option value="CONFIRMED">CONFIRMED (Pathogen definitively matched)</option>
                    <option value="INCONCLUSIVE">INCONCLUSIVE (Secondary saprophyte present)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Microbiologist Test Report / Notes:</label>
                  <textarea
                    rows={3}
                    value={labResultText}
                    onChange={e => setLabResultText(e.target.value)}
                    placeholder="e.g. Magnaporthe oryzae mycelium isolated. Conidia pyriform, 2-septate, hyaline. Tricyclazole susceptibility confirmed."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {feedbackSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Laboratory test results committed and synchronized with farmer records!</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Publish Certified Lab Result</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Select an accession sample from the list to enter assay results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
