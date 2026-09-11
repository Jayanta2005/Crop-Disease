import React, { useState } from 'react';
import {
  ClipboardList,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Send,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';
import { ExtensionTask, LanguageCode } from '../types';
import { translations } from '../data/translations';

interface ExtensionWorkerViewProps {
  tasks: ExtensionTask[];
  language: LanguageCode;
  onUpdateTask: (taskId: string, status: string, notes: string) => void;
}

export const ExtensionWorkerView: React.FC<ExtensionWorkerViewProps> = ({
  tasks,
  language,
  onUpdateTask
}) => {
  const t = translations[language];
  const [selectedTask, setSelectedTask] = useState<ExtensionTask | null>(tasks[0] || null);
  const [fieldNotes, setFieldNotes] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        task.farmerName.toLowerCase().includes(q) ||
        task.crop.toLowerCase().includes(q) ||
        task.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCompleteVisit = (referToLab: boolean = false) => {
    if (!selectedTask) return;
    const newStatus = referToLab ? 'REFERRED_TO_LAB' : 'VISITED';
    onUpdateTask(selectedTask.id, newStatus, fieldNotes || 'Field inspected by extension officer.');
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setFieldNotes('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Extension Officer Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950/40 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-2xl text-white shadow-lg border border-teal-400/30 shrink-0">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Extension Field Operations</h1>
                <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  KVK Burdwan Block
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Field verification queue for high-risk and moderate-confidence crop health incidents.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-300 flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block">Pending Visits</span>
              <span className="text-base font-bold text-amber-400">{tasks.filter(t => t.status === 'PENDING').length}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">Completed Today</span>
              <span className="text-base font-bold text-emerald-400">{tasks.filter(t => t.status === 'VISITED').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Task List & Inspection Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Task List (Col 5) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Assigned Farm Visits</h3>
            <span className="text-xs text-slate-400 font-mono">{filteredTasks.length} tasks</span>
          </div>

          {/* Filters & Search */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search farmer, crop, or location..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Priority:</span>
              {(['all', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                    filterPriority === p ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Scrollable List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredTasks.map(task => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-teal-500/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      task.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      task.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      task.status === 'VISITED' ? 'text-emerald-400' :
                      task.status === 'REFERRED_TO_LAB' ? 'text-purple-400' : 'text-amber-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-1.5">{task.farmerName}</h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>{task.location}</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                    <span>{task.crop} • {task.suspectedIssue}</span>
                    <span>Due: {task.scheduledDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspection Workbench (Col 7) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          {selectedTask ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase">Field Inspection Case #{selectedTask.id}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedTask.farmerName}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{selectedTask.farmerPhone}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      <span>{selectedTask.location}</span>
                    </span>
                  </div>
                </div>

                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  Target: {selectedTask.crop}
                </span>
              </div>

              {/* Suspected Issue & Context */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block">AI Flagged Issue:</span>
                <p className="text-sm font-bold text-amber-300">{selectedTask.suspectedIssue}</p>
                <p className="text-xs text-slate-400">
                  Reason for visit: Calibrated AI model reported moderate confidence with potential yield risk. On-site verification requested.
                </p>
              </div>

              {/* Field Observation Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Extension Officer Observations & Field Measurements:
                </label>
                <textarea
                  rows={4}
                  value={fieldNotes}
                  onChange={e => setFieldNotes(e.target.value)}
                  placeholder="Record lesion count, affected canopy percentage, soil moisture, or fertilizer history observed during field visit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {submittedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Field visit report submitted successfully! Case status updated.</span>
                </div>
              )}

              {/* Inspection Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleCompleteVisit(false)}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Mark Visited</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCompleteVisit(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Refer Sample to Laboratory</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Select a farm visit from the queue to start field logging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
