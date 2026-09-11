import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  LanguageCode,
  NetworkMode,
  DiagnosisRecord,
  HotspotPoint,
  SensorReading,
  PestTrapReading,
  ExtensionTask,
  LabReferralCase,
  EarlyWarningNotification,
  ModelMetrics,
  WeatherData,
  OfflineQueueItem
} from './types';
import {
  DEMO_USERS,
  DEMO_FARMS,
  INITIAL_DIAGNOSES,
  INITIAL_HOTSPOTS,
  INITIAL_SENSORS,
  INITIAL_PEST_TRAP_READINGS,
  INITIAL_EXTENSION_TASKS,
  INITIAL_LAB_REFERRALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MODEL_METRICS,
  CURRENT_WEATHER
} from './data/mockData';
import { calculateAgriculturalRisk } from './server/riskEngine';
import { Header } from './components/Header';
import { FarmerDashboard } from './components/FarmerDashboard';
import { CropScannerModal } from './components/CropScannerModal';
import { RiskForecaster } from './components/RiskForecaster';
import { HotspotMap } from './components/HotspotMap';
import { IoTSensorsModal } from './components/IoTSensorsModal';
import { ExtensionWorkerView } from './components/ExtensionWorkerView';
import { ExpertValidationView } from './components/ExpertValidationView';
import { LaboratoryView } from './components/LaboratoryView';
import { AdminDashboard } from './components/AdminDashboard';
import { OfflineQueueModal } from './components/OfflineQueueModal';
import { DemoTourModal, SIH_DEMO_STEPS } from './components/DemoTourModal';
import { AdvisoryModal } from './components/AdvisoryModal';
import { ReportProblemModal } from './components/ReportProblemModal';
import { FarmerProfileModal } from './components/FarmerProfileModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Layers, MapPin, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';

export function App() {
  // Global App State
  const [currentRole, setCurrentRole] = useState<UserRole>('FARMER');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [networkMode, setNetworkMode] = useState<NetworkMode>('ONLINE');
  const isOnline = networkMode !== 'OFFLINE';

  // Entities & DB State
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>(INITIAL_DIAGNOSES);
  const [hotspots, setHotspots] = useState<HotspotPoint[]>(INITIAL_HOTSPOTS);
  const [sensors, setSensors] = useState<SensorReading[]>(INITIAL_SENSORS);
  const [pestTraps, setPestTraps] = useState<PestTrapReading[]>(INITIAL_PEST_TRAP_READINGS);
  const [extensionTasks, setExtensionTasks] = useState<ExtensionTask[]>(INITIAL_EXTENSION_TASKS);
  const [labReferrals, setLabReferrals] = useState<LabReferralCase[]>(INITIAL_LAB_REFERRALS);
  const [notifications, setNotifications] = useState<EarlyWarningNotification[]>(INITIAL_NOTIFICATIONS);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>(INITIAL_MODEL_METRICS);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [weather, setWeather] = useState<WeatherData>(CURRENT_WEATHER);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Today, 10:45 AM');

  // Active User Profile State (with editable name and phone number as User ID)
  const [farmerUser, setFarmerUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('cropguard_farmer_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.phone) {
          return parsed;
        }
      }
    } catch (e) {}
    const defaultFarmer = DEMO_USERS.find(u => u.role === 'FARMER') || DEMO_USERS[0];
    return {
      ...defaultFarmer,
      id: defaultFarmer.phone // Make phone number the ID of the user
    };
  });

  const currentUser = currentRole === 'FARMER'
    ? farmerUser
    : (DEMO_USERS.find(u => u.role === currentRole) || DEMO_USERS[0]);

  const [currentFarm, setCurrentFarm] = useState(DEMO_FARMS[0]);

  // Handler for updating farmer profile (name change & user ID)
  const handleUpdateFarmerProfile = (updated: Partial<User> & { name: string; phone: string }) => {
    const cleanPhone = updated.phone.trim();
    const cleanName = updated.name.trim();
    const newProfile: User = {
      ...farmerUser,
      ...updated,
      name: cleanName || farmerUser.name,
      phone: cleanPhone || farmerUser.phone,
      id: cleanPhone || farmerUser.phone // Phone number is ID of user
    };
    setFarmerUser(newProfile);

    try {
      localStorage.setItem('cropguard_farmer_profile', JSON.stringify(newProfile));
    } catch (e) {}

    // Post to backend profile endpoint to update repository session
    fetch('/api/auth/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile)
    }).catch(() => {});
  };

  // Modals & Popups State
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Calculated Dynamic Risk
  const currentRisk = calculateAgriculturalRisk({
    cropId: 'rice',
    cropName: 'Rice (Paddy)',
    cropStage: 'Tillering',
    latitude: currentFarm.latitude,
    longitude: currentFarm.longitude,
    temperatureC: weather.temperatureC,
    humidityPercent: weather.humidityPercent,
    rainfallMm: weather.rainfallMm,
    windSpeedKmph: weather.windSpeedKmph,
    nearbyConfirmedCasesCount: hotspots.filter(h => h.crop.toLowerCase().includes('rice')).length + 4,
    recentTrapCount: pestTraps[0]?.count || 11,
    trapThreshold: pestTraps[0]?.thresholdLimit || 8
  });

  // Modals & Popups State
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isRiskOpen, setIsRiskOpen] = useState<boolean>(false);
  const [isHotspotMapOpen, setIsHotspotMapOpen] = useState<boolean>(false);
  const [isSensorsOpen, setIsSensorsOpen] = useState<boolean>(false);
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState<boolean>(false);
  const [isReportProblemOpen, setIsReportProblemOpen] = useState<boolean>(false);
  const [isOfflineQueueOpen, setIsOfflineQueueOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [tourStepIndex, setTourStepIndex] = useState<number>(0);

  // Handlers for Workflows
  const handleDiagnosisCompleted = (record: DiagnosisRecord) => {
    // Ensure the crop is saved in the particular user profile using phone as user ID
    const userPhoneId = currentUser.phone || currentUser.id;
    const enrichedRecord: DiagnosisRecord = {
      ...record,
      farmerId: record.farmerId || userPhoneId,
      farmerPhone: record.farmerPhone || userPhoneId,
      farmerName: record.farmerName || currentUser.name
    };

    setDiagnoses(prev => [enrichedRecord, ...prev]);

    // If requires expert review, automatically add task for extension / expert queue
    if (record.verificationStatus === 'PENDING') {
      const newTask: ExtensionTask = {
        id: `task-${Date.now()}`,
        farmId: record.farmId,
        farmerName: enrichedRecord.farmerName,
        farmerPhone: enrichedRecord.farmerPhone || userPhoneId,
        location: record.locationName,
        crop: record.cropName,
        suspectedIssue: `${record.aiPrediction} (${Math.round(record.aiConfidence * 100)}% Conf)`,
        priority: record.aiSeverity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        status: 'PENDING',
        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        diagnosisId: record.id
      };
      setExtensionTasks(prev => [newTask, ...prev]);
    }
  };

  const handleAddToOfflineQueue = (item: any) => {
    setOfflineQueue(prev => [item, ...prev]);
  };

  const handleSyncAllOffline = () => {
    if (offlineQueue.length === 0 || isSyncing) return;
    setIsSyncing(true);

    setTimeout(() => {
      offlineQueue.forEach((item, idx) => {
        handleDiagnosisCompleted({
          id: `diag-sync-${Date.now()}-${idx}`,
          farmerId: currentUser.phone || currentUser.id,
          farmerPhone: currentUser.phone,
          farmerName: currentUser.name,
          farmId: currentFarm.id,
          cropId: item.cropId,
          cropName: item.cropName,
          cropStage: item.cropStage,
          imageUrl: item.imageBlobUrl,
          latitude: item.latitude,
          longitude: item.longitude,
          locationName: 'Purba Bardhaman, WB',
          timestamp: new Date().toISOString(),
          aiPrediction: 'Rice Blast (Magnaporthe oryzae)',
          aiConfidence: 0.74,
          aiConfidenceLevel: 'MODERATE',
          aiSeverity: 'HIGH',
          aiSymptoms: ['Spindle diamond lesions on leaf blades'],
          alternativePredictions: [
            { name: 'Brown Spot (Bipolaris oryzae)', confidence: 0.16 },
            { name: 'Healthy Leaf Canopy', confidence: 0.07 }
          ],
          verificationStatus: 'PENDING',
          finalDiagnosis: 'Rice Blast (Magnaporthe oryzae)',
          ipmAdvisory: INITIAL_DIAGNOSES[0].ipmAdvisory,
          syncStatus: 'UPLOADED'
        });
      });
      setOfflineQueue([]);
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsOfflineQueueOpen(false);
    }, 1200);
  };

  const handleRequestExpertReview = (diagnosisId: string) => {
    setDiagnoses(prev =>
      prev.map(d => {
        if (d.id === diagnosisId) {
          return {
            ...d,
            verificationStatus: 'PENDING'
          };
        }
        return d;
      })
    );

    const target = diagnoses.find(d => d.id === diagnosisId);
    if (target) {
      const newTask: ExtensionTask = {
        id: `task-ext-${Date.now()}`,
        farmId: target.farmId,
        farmerId: target.farmerId,
        farmerName: target.farmerName,
        farmerPhone: '+91 94331 82910',
        location: target.locationName,
        crop: target.cropName,
        suspectedIssue: `${target.aiPrediction} (Farmer requested expert review)`,
        priority: target.aiSeverity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        status: 'PENDING',
        scheduledDate: new Date().toISOString().split('T')[0],
        diagnosisId: target.id
      };
      setExtensionTasks(tasks => [newTask, ...tasks]);
    }

    setNotifications(prev => [
      {
        id: `notif-req-${Date.now()}`,
        title: 'KVK Pathology Review Prioritized',
        riskLevel: 'MODERATE',
        reason: `Leaf scan #${diagnosisId} routed to Dr. Vivek Sharma at Burdwan KVK.`,
        affectedCrop: target?.cropName || 'Rice (Paddy)',
        recommendedAction: 'Agronomist will inspect leaf pattern and issue certified guidance.',
        location: target?.locationName || 'Purba Bardhaman, WB',
        timestamp: 'Just now',
        isRead: false,
        urgencyHours: 24
      },
      ...prev
    ]);
  };

  // Expert Review Handler
  const handleExpertReviewSubmit = (
    diagnosisId: string,
    action: 'CONFIRM_AI' | 'CORRECT_DIAGNOSIS' | 'MARK_UNCERTAIN' | 'REFER_TO_LAB',
    correctionName?: string,
    notes?: string,
    followUpDate?: string
  ) => {
    setDiagnoses(prev =>
      prev.map(d => {
        if (d.id === diagnosisId) {
          const updated: DiagnosisRecord = {
            ...d,
            reviewerId: currentUser.id,
            reviewerName: currentUser.name,
            reviewTimestamp: new Date().toISOString(),
            expertNotes: notes,
            followUpDate
          };

          if (action === 'CONFIRM_AI') {
            updated.verificationStatus = 'CONFIRMED';
            updated.finalDiagnosis = d.aiPrediction;
          } else if (action === 'CORRECT_DIAGNOSIS') {
            updated.verificationStatus = 'CORRECTED';
            updated.expertPrediction = correctionName;
            updated.finalDiagnosis = correctionName;
          } else if (action === 'REFER_TO_LAB') {
            updated.verificationStatus = 'LAB_REFERRED';
            // Add lab sample
            const newLabCase: LabReferralCase = {
              id: `lab-${Date.now()}`,
              diagnosisId: d.id,
              sampleId: `SMPL-WB-26-${Math.floor(1000 + Math.random() * 9000)}`,
              farmerId: d.farmerId,
              farmerName: d.farmerName,
              crop: d.cropName,
              suspectedPathogen: d.aiPrediction,
              sampleType: 'LEAF_TISSUE',
              collectionDate: new Date().toISOString().split('T')[0],
              laboratoryName: 'Kalyani State Agri Microbiology Lab',
              status: 'RECEIVED',
              testedBy: 'Pending Specialist'
            };
            setLabReferrals(labs => [newLabCase, ...labs]);
          } else {
            updated.verificationStatus = 'UNCERTAIN';
          }
          return updated;
        }
        return d;
      })
    );

    // If confirmed, add point to Hotspot Map & alert notifications
    if (action === 'CONFIRM_AI' || action === 'CORRECT_DIAGNOSIS') {
      const target = diagnoses.find(d => d.id === diagnosisId);
      if (target) {
        const newHotspot: HotspotPoint = {
          id: `hotspot-${Date.now()}`,
          caseId: target.id,
          latitude: target.latitude,
          longitude: target.longitude,
          locationName: target.locationName,
          crop: target.cropName,
          diseaseOrPest: correctionName || target.aiPrediction,
          type: (correctionName || target.aiPrediction).toLowerCase().includes('bollworm') ? 'PEST' : 'DISEASE',
          severity: target.aiSeverity,
          date: new Date().toISOString().split('T')[0],
          confidence: 0.96,
          verificationStatus: 'CONFIRMED',
          activeCount: 1,
          radiusKm: 5.0
        };
        setHotspots(prev => [newHotspot, ...prev]);

        setNotifications(prev => [
          {
            id: `notif-${Date.now()}`,
            title: `Expert Confirmed: ${newHotspot.diseaseOrPest}`,
            riskLevel: target.aiSeverity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
            reason: `Field case officially verified by Dr. Vivek Sharma in ${target.locationName}.`,
            affectedCrop: target.cropName,
            recommendedAction: 'Alert local extension block to initiate prophylactic spraying.',
            location: target.locationName,
            timestamp: 'Just now',
            isRead: false,
            cooldownKey: `confirmed-${target.id}`
          },
          ...prev
        ]);
      }
    }
  };

  // Extension Worker Task Update
  const handleUpdateExtensionTask = (taskId: string, status: string, notes: string) => {
    setExtensionTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: status as any,
            fieldNotes: notes,
            visitedAt: new Date().toISOString(),
            inspectorName: currentUser.name
          };
        }
        return t;
      })
    );
  };

  // Laboratory Referral Update
  const handleUpdateLabReferral = (referralId: string, status: string, resultDetails: string) => {
    setLabReferrals(prev =>
      prev.map(r => {
        if (r.id === referralId) {
          return {
            ...r,
            status: status as any,
            labResult: resultDetails,
            testedBy: currentUser.name,
            resultDate: new Date().toISOString().split('T')[0]
          };
        }
        return r;
      })
    );
  };

  // Sensor Simulation Surge
  const handleSimulateSensorSurge = () => {
    // Escalate humidity to 94% and rainfall to 22mm
    setSensors(prev =>
      prev.map(s => {
        if (s.sensorType.includes('Humidity')) return { ...s, currentValue: 94 };
        if (s.sensorType.includes('Leaf Wetness')) return { ...s, currentValue: 100 };
        return s;
      })
    );
    setPestTraps(prev =>
      prev.map(t => ({ ...t, count: t.thresholdLimit + 7 }))
    );
    setWeather(w => ({
      ...w,
      humidityPercent: 94,
      rainfallMm: 22.5
    }));
  };

  // Interactive Tour Step Executor
  const handleExecuteTourAction = (action: string, targetRole?: UserRole) => {
    if (targetRole) {
      setCurrentRole(targetRole);
    }

    if (action === 'OPEN_SCANNER') {
      setIsScannerOpen(true);
      setIsRiskOpen(false);
      setIsHotspotMapOpen(false);
    } else if (action === 'OPEN_RISK') {
      setIsRiskOpen(true);
      setIsScannerOpen(false);
    } else if (action === 'OPEN_HOTSPOTS') {
      setIsHotspotMapOpen(true);
      setIsScannerOpen(false);
      setIsRiskOpen(false);
    } else if (action === 'VIEW_DASHBOARD') {
      setIsScannerOpen(false);
      setIsRiskOpen(false);
      setIsHotspotMapOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Global Navigation & Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        language={language}
        onLanguageChange={setLanguage}
        networkMode={networkMode}
        onNetworkModeChange={setNetworkMode}
        offlineQueueCount={offlineQueue.length}
        onOpenOfflineQueue={() => setIsOfflineQueueOpen(true)}
        notifications={notifications}
        onStartDemoTour={() => {
          setIsDemoTourOpen(true);
          setTourStepIndex(0);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNavigateHome={() => {
          setIsRiskOpen(false);
          setIsHotspotMapOpen(false);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenRiskMap={() => {
          setIsHotspotMapOpen(true);
          setIsRiskOpen(false);
        }}
        onOpenAdvisories={() => setIsAdvisoryOpen(true)}
        onOpenSensors={() => setIsSensorsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* If Hotspot Map modal/view is active, render full-screen banner */}
        {isHotspotMapOpen && (
          <div className="space-y-4">
            <button
              onClick={() => setIsHotspotMapOpen(false)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Role Workspace</span>
            </button>
            <HotspotMap
              hotspots={hotspots}
              language={language}
              userLat={currentFarm.latitude}
              userLng={currentFarm.longitude}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenRisk={() => {
                setIsHotspotMapOpen(false);
                setIsRiskOpen(true);
              }}
            />
          </div>
        )}

        {/* If Risk view is active, render Risk Forecaster */}
        {isRiskOpen && (
          <div className="space-y-4">
            <button
              onClick={() => setIsRiskOpen(false)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Farmer Dashboard</span>
            </button>
            <RiskForecaster
              initialRisk={currentRisk}
              weather={weather}
              language={language}
              diagnoses={diagnoses}
              hotspots={hotspots}
              sensors={sensors}
              pestTraps={pestTraps}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenAdvisories={() => setIsAdvisoryOpen(true)}
              onOpenHotspots={() => {
                setIsRiskOpen(false);
                setIsHotspotMapOpen(true);
              }}
              onOpenSensors={() => setIsSensorsOpen(true)}
              currentFarm={currentFarm}
            />
          </div>
        )}

        {/* Default View by Role (When not in full sub-view) */}
        {!isHotspotMapOpen && !isRiskOpen && (
          <>
            {currentRole === 'FARMER' && (
              <FarmerDashboard
                user={currentUser}
                farm={currentFarm}
                recentDiagnoses={diagnoses}
                risk={currentRisk}
                weather={weather}
                notifications={notifications}
                language={language}
                networkMode={networkMode}
                offlineQueueCount={offlineQueue.length}
                lastSyncTime={lastSyncTime}
                onOpenScanner={() => setIsScannerOpen(true)}
                onOpenRisk={() => setIsRiskOpen(true)}
                onOpenAdvisories={() => setIsAdvisoryOpen(true)}
                onOpenReportProblem={() => setIsReportProblemOpen(true)}
                onOpenHotspots={() => setIsHotspotMapOpen(true)}
                onOpenSensors={() => setIsSensorsOpen(true)}
                onOpenOfflineQueue={() => setIsOfflineQueueOpen(true)}
                onSelectDiagnosis={() => setIsAdvisoryOpen(true)}
                onSelectFarm={(f) => setCurrentFarm(f)}
                onRequestExpertReview={handleRequestExpertReview}
                onOpenProfile={() => setIsProfileOpen(true)}
              />
            )}

            {currentRole === 'EXTENSION_WORKER' && (
              <ExtensionWorkerView
                tasks={extensionTasks}
                language={language}
                onUpdateTask={handleUpdateExtensionTask}
              />
            )}

            {currentRole === 'EXPERT' && (
              <ExpertValidationView
                diagnoses={diagnoses}
                language={language}
                onReviewSubmit={handleExpertReviewSubmit}
              />
            )}

            {currentRole === 'LAB_STAFF' && (
              <LaboratoryView
                referrals={labReferrals}
                language={language}
                onUpdateReferral={handleUpdateLabReferral}
              />
            )}

            {currentRole === 'ADMIN' && (
              <AdminDashboard
                modelMetrics={modelMetrics}
                language={language}
                onTriggerRetrain={() => {
                  setModelMetrics(m => ({
                    ...m,
                    accuracy: 0.945,
                    precision: 0.941,
                    recall: 0.932,
                    f1Score: 0.936,
                    trainingSamplesCount: m.trainingSamplesCount + 38
                  }));
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Global Interactive Modals */}
      <CropScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        language={language}
        isOnline={isOnline}
        networkMode={networkMode}
        onNetworkModeChange={setNetworkMode}
        onDiagnosisCompleted={handleDiagnosisCompleted}
        onAddToOfflineQueue={handleAddToOfflineQueue}
        existingDiagnoses={diagnoses}
        onOpenAdvisoryModal={() => setIsAdvisoryOpen(true)}
        user={currentUser}
      />

      <IoTSensorsModal
        isOpen={isSensorsOpen}
        onClose={() => setIsSensorsOpen(false)}
        sensors={sensors}
        traps={pestTraps}
        language={language}
        onUpdateSensorValue={(id, val) => {
          setSensors(prev => prev.map(s => s.id === id ? { ...s, currentValue: val } : s));
        }}
        onSimulateSurge={handleSimulateSensorSurge}
      />

      <AdvisoryModal
        isOpen={isAdvisoryOpen}
        onClose={() => setIsAdvisoryOpen(false)}
        language={language}
        selectedDiseaseKey="rice-blast"
      />

      <ReportProblemModal
        isOpen={isReportProblemOpen}
        onClose={() => setIsReportProblemOpen(false)}
        language={language}
        onSubmitReport={(report) => {
          // Add notification for extension worker
          setNotifications(n => [
            {
              id: `notif-${Date.now()}`,
              title: `Farmer Emergency Report: ${report.cropId.toUpperCase()}`,
              riskLevel: 'HIGH',
              reason: report.problemDescription,
              affectedCrop: report.cropId,
              recommendedAction: 'Extension officer visit scheduled.',
              location: 'Galsi Block, WB',
              timestamp: 'Just now',
              isRead: false
            },
            ...n
          ]);
        }}
      />

      <OfflineQueueModal
        isOpen={isOfflineQueueOpen}
        onClose={() => setIsOfflineQueueOpen(false)}
        queue={offlineQueue}
        isOnline={isOnline}
        networkMode={networkMode}
        language={language}
        onSyncAll={handleSyncAllOffline}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* 18-Step Interactive Walkthrough Tour */}
      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        currentStepIndex={tourStepIndex}
        onStepChange={setTourStepIndex}
        onExecuteTourAction={handleExecuteTourAction}
      />

      {/* Farmer & Farm Profile Modal */}
      <FarmerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onUpdateUser={handleUpdateFarmerProfile}
        currentFarm={currentFarm}
        onSelectFarm={(f) => setCurrentFarm(f)}
        language={language}
        onOpenLanguageModal={() => {
          // Language selector can also be triggered directly from Header
        }}
        networkMode={networkMode}
        onNetworkModeChange={setNetworkMode}
        offlineQueueCount={offlineQueue.length}
        onOpenOfflineQueue={() => {
          setIsProfileOpen(false);
          setIsOfflineQueueOpen(true);
        }}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        savedDiagnoses={diagnoses}
        onOpenScanner={() => {
          setIsProfileOpen(false);
          setIsScannerOpen(true);
        }}
        onSelectDiagnosis={() => {
          setIsProfileOpen(false);
          setIsAdvisoryOpen(true);
        }}
      />

      {/* Mobile-First Bottom Navigation Bar for Farmer Workflow */}
      {currentRole === 'FARMER' && (
        <MobileBottomNav
          activeTab={
            isHotspotMapOpen ? 'riskMap' :
            isScannerOpen ? 'scan' :
            isAdvisoryOpen ? 'advisory' :
            isProfileOpen ? 'profile' : 'home'
          }
          language={language}
          offlineQueueCount={offlineQueue.length}
          onNavigateHome={() => {
            setIsRiskOpen(false);
            setIsHotspotMapOpen(false);
            setIsScannerOpen(false);
            setIsAdvisoryOpen(false);
            setIsProfileOpen(false);
          }}
          onOpenScanner={() => {
            setIsScannerOpen(true);
            setIsRiskOpen(false);
            setIsHotspotMapOpen(false);
          }}
          onOpenRiskMap={() => {
            setIsHotspotMapOpen(true);
            setIsRiskOpen(false);
          }}
          onOpenAdvisory={() => setIsAdvisoryOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {/* Bottom Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CropGuard AI • Smart India Hackathon 2026 Prototype</span>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>ICAR & CIBRC Certified Reference Rules</span>
            <span>•</span>
            <span>MobileNetV3 Edge Inference</span>
            <span>•</span>
            <span>PostgreSQL & GIS Geofencing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
