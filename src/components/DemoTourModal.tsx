import React from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types';

export interface TourStep {
  stepNumber: number;
  role: UserRole;
  title: string;
  description: string;
  actionInstruction: string;
  actionType: 'OPEN_RISK' | 'OPEN_SCANNER' | 'SWITCH_ROLE' | 'OPEN_HOTSPOTS' | 'OPEN_ADMIN' | 'OPEN_EXTENSION' | 'OPEN_EXPERT' | 'VIEW_DASHBOARD';
  targetRole?: UserRole;
}

export const SIH_DEMO_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    role: 'FARMER',
    title: '1. Farmer Session Initialization',
    description: 'Farmer Rameshwar Mahato accesses CropGuard AI from Purba Bardhaman, West Bengal. The system loads with zero latency and multilingual support.',
    actionInstruction: 'Inspect the Farmer Dashboard with profile, GPS coordinates, and crop health status.',
    actionType: 'VIEW_DASHBOARD'
  },
  {
    stepNumber: 2,
    role: 'FARMER',
    title: '2. Dashboard & Primary Action Hub',
    description: 'The dashboard highlights 4 distinct primary action buttons: Scan Crop, Check Risk, View Advisory, and Report Problem.',
    actionInstruction: 'Notice the dual risk gauges (Disease Risk: 78/100, Pest Risk: 54/100).',
    actionType: 'VIEW_DASHBOARD'
  },
  {
    stepNumber: 3,
    role: 'FARMER',
    title: '3. Transparent Rule-Based Risk Engine',
    description: 'Farmer opens the Risk Forecaster. The transparent calculation combines 88% Relative Humidity, 26.2°C temperature, and 12.4mm rainfall.',
    actionInstruction: 'Explore the applied meteorological rules justifying the blast incubation alert.',
    actionType: 'OPEN_RISK'
  },
  {
    stepNumber: 4,
    role: 'FARMER',
    title: '4. Nearby Outbreak Proximity Warning',
    description: 'System correlates local coordinates with regional outbreak database, alerting the farmer of 14 confirmed cases within 8.5 km.',
    actionInstruction: 'Inspect the nearby outbreak alert banner.',
    actionType: 'OPEN_HOTSPOTS'
  },
  {
    stepNumber: 5,
    role: 'FARMER',
    title: '5. Launching Crop Scan & Image Capture',
    description: 'Farmer launches the camera scanning workflow, selects Rice at the Tillering stage, and inputs a leaf photograph.',
    actionInstruction: 'The leaf image is compressed on-device to minimize rural bandwidth usage.',
    actionType: 'OPEN_SCANNER'
  },
  {
    stepNumber: 6,
    role: 'FARMER',
    title: '6. AI Vision Inference & Symptom Extraction',
    description: 'MobileNetV3 model analyzes diamond lesion textures and identifies Rice Blast with 74% confidence.',
    actionInstruction: 'Observe the calibrated confidence score and visible symptoms list.',
    actionType: 'OPEN_SCANNER'
  },
  {
    stepNumber: 7,
    role: 'FARMER',
    title: '7. Calibrated Confidence Gating (< 0.85)',
    description: 'Because confidence (0.74) is below the 0.85 definitive threshold, the system strictly tags the diagnosis: "Needs Expert Verification".',
    actionInstruction: 'Notice the safety warning preventing unwarranted pesticide misapplication.',
    actionType: 'OPEN_SCANNER'
  },
  {
    stepNumber: 8,
    role: 'FARMER',
    title: '8. Authoritative IPM Advisory Guidance',
    description: 'The system renders certified CIBRC guidance with exact Tricyclazole 75% WP dosage (0.6g/L), 30-day PHI, and mandatory PPE.',
    actionInstruction: 'Browse the Prevention, Cultural, Biological, and Safe Chemical tabs.',
    actionType: 'OPEN_SCANNER'
  },
  {
    stepNumber: 9,
    role: 'FARMER',
    title: '9. Escalation & Expert Review Request',
    description: 'Farmer taps "Forward to KVK Agri Expert" to request official validation from the district agricultural science center.',
    actionInstruction: 'The incident is automatically assigned to the KVK review queue.',
    actionType: 'OPEN_SCANNER'
  },
  {
    stepNumber: 10,
    role: 'EXPERT',
    title: '10. Case Queued for KVK Pathologist',
    description: 'The system stores the pending case and schedules an on-site field verification task.',
    actionInstruction: 'Switch user persona to Agri Expert (Dr. Vivek Sharma).',
    actionType: 'SWITCH_ROLE',
    targetRole: 'EXPERT'
  },
  {
    stepNumber: 11,
    role: 'EXPERT',
    title: '11. Expert Pathology Workbench',
    description: 'Dr. Vivek Sharma opens the KVK Expert Portal to inspect pending moderate-confidence cases.',
    actionInstruction: 'Select the pending Rice Blast case from the validation queue.',
    actionType: 'OPEN_EXPERT'
  },
  {
    stepNumber: 12,
    role: 'EXPERT',
    title: '12. Side-by-Side Diagnostic Verification',
    description: 'Expert inspects the high-res leaf image alongside microclimatic humidity (88%) and local infection history.',
    actionInstruction: 'Notice how the expert cross-references symptoms with weather data.',
    actionType: 'OPEN_EXPERT'
  },
  {
    stepNumber: 13,
    role: 'EXPERT',
    title: '13. Expert Confirmation & Clinical Notes',
    description: 'Pathologist confirms the Rice Blast diagnosis, prescribes foliar spray timing, and schedules a 5-day follow-up.',
    actionInstruction: 'Tap "Finalize Review & Update Surveillance Database".',
    actionType: 'OPEN_EXPERT'
  },
  {
    stepNumber: 14,
    role: 'EXPERT',
    title: '14. Hotspot Cluster & Notification Broadcast',
    description: 'Confirmed case dynamically increments the Galsi outbreak cluster and dispatches an alert to all nearby farmers.',
    actionInstruction: 'Inspect the updated GIS Outbreak Map with the new confirmed cluster marker.',
    actionType: 'OPEN_HOTSPOTS'
  },
  {
    stepNumber: 15,
    role: 'EXTENSION_WORKER',
    title: '15. Extension Field Operations Workflow',
    description: 'Switch persona to Agricultural Extension Worker Ananya Roy to conduct an in-person field visit.',
    actionInstruction: 'Open the Extension Worker task queue.',
    actionType: 'SWITCH_ROLE',
    targetRole: 'EXTENSION_WORKER'
  },
  {
    stepNumber: 16,
    role: 'EXTENSION_WORKER',
    title: '16. Field Visit Logging & Laboratory Referral',
    description: 'Extension Worker inspects the field, records observations, and verifies containment measures.',
    actionInstruction: 'Worker marks the task visited or refers complex tissue to the pathology lab.',
    actionType: 'OPEN_EXTENSION'
  },
  {
    stepNumber: 17,
    role: 'ADMIN',
    title: '17. State Agricultural Administration Portal',
    description: 'Switch persona to Agriculture Department Director (Dr. S. K. Mukherjee) to inspect state surveillance metrics.',
    actionInstruction: 'Switch role to Admin.',
    actionType: 'SWITCH_ROLE',
    targetRole: 'ADMIN'
  },
  {
    stepNumber: 18,
    role: 'ADMIN',
    title: '18. Continuous Learning & Model Retraining',
    description: 'Admin reviews district densities, verifies the 94.2% AI agreement rate, and triggers the continuous fine-tuning pipeline with newly verified field data.',
    actionInstruction: 'The complete Smart India Hackathon lifecycle is successfully closed!',
    actionType: 'OPEN_ADMIN'
  }
];

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onExecuteTourAction: (action: TourStep['actionType'], targetRole?: UserRole) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  currentStepIndex,
  onStepChange,
  onExecuteTourAction
}) => {
  if (!isOpen) return null;

  const currentStep = SIH_DEMO_STEPS[currentStepIndex] || SIH_DEMO_STEPS[0];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === SIH_DEMO_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      const nextIdx = currentStepIndex + 1;
      onStepChange(nextIdx);
      const nextStep = SIH_DEMO_STEPS[nextIdx];
      onExecuteTourAction(nextStep.actionType, nextStep.targetRole);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIdx = currentStepIndex - 1;
      onStepChange(prevIdx);
      const prevStep = SIH_DEMO_STEPS[prevIdx];
      onExecuteTourAction(prevStep.actionType, prevStep.targetRole);
    }
  };

  const handleExecuteCurrent = () => {
    onExecuteTourAction(currentStep.actionType, currentStep.targetRole);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:right-6 z-50 max-w-md w-full px-2">
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="font-bold text-xs text-white uppercase tracking-wider">
              SIH End-to-End Walkthrough
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/40">
              {currentStepIndex + 1} of {SIH_DEMO_STEPS.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                ROLE: {currentStep.role}
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-white">
              {currentStep.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-2.5 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Target Action:</strong> {currentStep.actionInstruction}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / SIH_DEMO_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                isFirst
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={handleExecuteCurrent}
              className="bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Jump to View
            </button>

            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
            >
              <span>{isLast ? 'Complete' : 'Next Step'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
