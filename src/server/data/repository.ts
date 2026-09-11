import {
  CROPS,
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
  CURRENT_WEATHER,
  generateSyntheticDemographics
} from '../../data/mockData';
import {
  DiagnosisRecord,
  HotspotPoint,
  SensorDevice,
  PestTrapReading,
  ExtensionTask,
  LabReferralCase,
  EarlyWarningNotification,
  Crop,
  User,
  Farm
} from '../../types';

export interface ICropGuardRepository {
  // Diagnoses
  getDiagnoses(filter?: { farmerId?: string; farmId?: string; cropId?: string; limit?: number }): Promise<DiagnosisRecord[]>;
  getDiagnosisById(id: string): Promise<DiagnosisRecord | null>;
  createDiagnosis(record: Omit<DiagnosisRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<DiagnosisRecord>;
  updateDiagnosis(id: string, updates: Partial<DiagnosisRecord>): Promise<DiagnosisRecord | null>;

  // Hotspots / Outbreaks
  getHotspots(filter?: {
    crop?: string;
    type?: string;
    severity?: string;
    diseaseOrPest?: string;
    status?: string;
    days?: number;
    district?: string;
    minConfidence?: number;
  }): Promise<HotspotPoint[]>;
  createHotspot(hotspot: Omit<HotspotPoint, 'id'> & { id?: string }): Promise<HotspotPoint>;
  updateHotspot(id: string, updates: Partial<HotspotPoint>): Promise<HotspotPoint | null>;

  // Sensors & Traps
  getSensors(): Promise<SensorDevice[]>;
  getSensorById(id: string): Promise<SensorDevice | null>;
  updateSensorValue(id: string, value: number): Promise<SensorDevice | null>;
  getPestTraps(): Promise<PestTrapReading[]>;
  addPestTrapReading(reading: PestTrapReading): Promise<PestTrapReading>;

  // Extension Tasks
  getExtensionTasks(filter?: { status?: string; priority?: string }): Promise<ExtensionTask[]>;
  createExtensionTask(task: ExtensionTask): Promise<ExtensionTask>;
  updateExtensionTask(id: string, updates: Partial<ExtensionTask>): Promise<ExtensionTask | null>;

  // Lab Referrals
  getLabReferrals(): Promise<LabReferralCase[]>;
  createLabReferral(ref: LabReferralCase): Promise<LabReferralCase>;
  updateLabReferral(id: string, updates: Partial<LabReferralCase>): Promise<LabReferralCase | null>;

  // Notifications
  getNotifications(): Promise<EarlyWarningNotification[]>;
  createNotification(notif: EarlyWarningNotification): Promise<EarlyWarningNotification>;
  markNotificationRead(id: string): Promise<boolean>;

  // Users, Farms, Crops
  getCurrentUser(): Promise<User>;
  setCurrentUser(user: User): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByRole(role: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  getFarms(farmerId?: string): Promise<Farm[]>;
  getCrops(): Promise<Crop[]>;

  // Analytics & Admin
  getAdminDashboardStats(): Promise<{
    metrics: Record<string, number>;
    modelMetrics: any;
    hotspots: HotspotPoint[];
    syntheticDistricts: any;
  }>;

  // Reset & Status
  resetDemoData(): Promise<void>;
  getStatus(): Promise<{
    storageType: 'in-memory' | 'postgres';
    isReady: boolean;
    diagnosesCount: number;
    hotspotsCount: number;
    sensorsCount: number;
    extensionTasksCount: number;
    uptimeSeconds: number;
  }>;
}

/**
 * In-Memory Implementation of ICropGuardRepository
 * Clearly tags demo seeds with isMockData: true, while live submissions receive isMockData: false.
 * Implemented with async interface so a PostgreSQL / Cloud SQL driver can be swapped in transparently.
 */
export class InMemoryCropGuardRepository implements ICropGuardRepository {
  private startTime = Date.now();
  private diagnoses: DiagnosisRecord[] = [];
  private hotspots: HotspotPoint[] = [];
  private sensors: SensorDevice[] = [];
  private pestTraps: PestTrapReading[] = [];
  private extensionTasks: ExtensionTask[] = [];
  private labReferrals: LabReferralCase[] = [];
  private notifications: EarlyWarningNotification[] = [];
  private currentUser: User = DEMO_USERS[0];
  private syntheticData = generateSyntheticDemographics();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed initial demo data with isMockData flag
    this.diagnoses = INITIAL_DIAGNOSES.map(d => ({ ...d, isMockData: true } as any));
    this.hotspots = INITIAL_HOTSPOTS.map(h => ({ ...h, isMockData: true }));
    this.sensors = [...INITIAL_SENSORS];
    this.pestTraps = [...INITIAL_PEST_TRAP_READINGS];
    this.extensionTasks = [...INITIAL_EXTENSION_TASKS];
    this.labReferrals = [...INITIAL_LAB_REFERRALS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.currentUser = DEMO_USERS[0];
  }

  async getDiagnoses(filter?: { farmerId?: string; farmId?: string; cropId?: string; limit?: number }): Promise<DiagnosisRecord[]> {
    let list = [...this.diagnoses];
    if (filter?.farmerId) {
      list = list.filter(d => d.farmerId === filter.farmerId);
    }
    if (filter?.farmId) {
      list = list.filter(d => d.farmId === filter.farmId);
    }
    if (filter?.cropId) {
      list = list.filter(d => d.cropId === filter.cropId);
    }
    if (filter?.limit && filter.limit > 0) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  async getDiagnosisById(id: string): Promise<DiagnosisRecord | null> {
    return this.diagnoses.find(d => d.id === id) || null;
  }

  async createDiagnosis(record: Omit<DiagnosisRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<DiagnosisRecord> {
    const newRecord: DiagnosisRecord = {
      ...record,
      id: record.id || `diag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: record.timestamp || new Date().toISOString(),
      isMockData: false // Real user diagnosis!
    } as DiagnosisRecord;

    this.diagnoses.unshift(newRecord);
    return newRecord;
  }

  async updateDiagnosis(id: string, updates: Partial<DiagnosisRecord>): Promise<DiagnosisRecord | null> {
    const index = this.diagnoses.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.diagnoses[index] = { ...this.diagnoses[index], ...updates };
    return this.diagnoses[index];
  }

  async getHotspots(filter?: {
    crop?: string;
    type?: string;
    severity?: string;
    diseaseOrPest?: string;
    status?: string;
    days?: number;
    district?: string;
    minConfidence?: number;
  }): Promise<HotspotPoint[]> {
    let list = [...this.hotspots];
    if (filter?.crop && filter.crop !== 'all') {
      list = list.filter(h => h.crop.toLowerCase().includes(filter.crop!.toLowerCase()));
    }
    if (filter?.type && filter.type !== 'all') {
      list = list.filter(h => h.type === filter.type);
    }
    if (filter?.severity && filter.severity !== 'all') {
      list = list.filter(h => h.severity === filter.severity);
    }
    if (filter?.diseaseOrPest && filter.diseaseOrPest !== 'all') {
      list = list.filter(h => h.diseaseOrPest.toLowerCase().includes(filter.diseaseOrPest!.toLowerCase()));
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(h => h.verificationStatus === filter.status);
    }
    if (filter?.district && filter.district !== 'all') {
      list = list.filter(h => (h.district || h.locationName).toLowerCase().includes(filter.district!.toLowerCase()));
    }
    if (filter?.minConfidence !== undefined) {
      list = list.filter(h => (h.confidence || 0) >= filter.minConfidence!);
    }
    if (filter?.days && filter.days > 0) {
      const cutoff = new Date(Date.now() - filter.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      list = list.filter(h => h.date >= cutoff);
    }
    return list;
  }

  async updateHotspot(id: string, updates: Partial<HotspotPoint>): Promise<HotspotPoint | null> {
    const index = this.hotspots.findIndex(h => h.id === id);
    if (index === -1) return null;
    this.hotspots[index] = { ...this.hotspots[index], ...updates };
    return this.hotspots[index];
  }

  async createHotspot(hotspot: Omit<HotspotPoint, 'id'> & { id?: string }): Promise<HotspotPoint> {
    const newHotspot: HotspotPoint = {
      ...hotspot,
      id: hotspot.id || `hotspot-${Date.now()}`,
      isMockData: false
    };
    this.hotspots.unshift(newHotspot);
    return newHotspot;
  }

  async getSensors(): Promise<SensorDevice[]> {
    return [...this.sensors];
  }

  async getSensorById(id: string): Promise<SensorDevice | null> {
    return this.sensors.find(s => s.id === id) || null;
  }

  async updateSensorValue(id: string, value: number): Promise<SensorDevice | null> {
    const sensor = this.sensors.find(s => s.id === id);
    if (!sensor) return null;
    sensor.currentValue = value;
    sensor.lastUpdated = 'Just now';
    return sensor;
  }

  async getPestTraps(): Promise<PestTrapReading[]> {
    return [...this.pestTraps];
  }

  async addPestTrapReading(reading: PestTrapReading): Promise<PestTrapReading> {
    this.pestTraps.unshift(reading);
    return reading;
  }

  async getExtensionTasks(filter?: { status?: string; priority?: string }): Promise<ExtensionTask[]> {
    let list = [...this.extensionTasks];
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(t => t.status === filter.status);
    }
    if (filter?.priority && filter.priority !== 'all') {
      list = list.filter(t => t.priority === filter.priority);
    }
    return list;
  }

  async createExtensionTask(task: ExtensionTask): Promise<ExtensionTask> {
    this.extensionTasks.unshift(task);
    return task;
  }

  async updateExtensionTask(id: string, updates: Partial<ExtensionTask>): Promise<ExtensionTask | null> {
    const index = this.extensionTasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.extensionTasks[index] = { ...this.extensionTasks[index], ...updates };
    return this.extensionTasks[index];
  }

  async getLabReferrals(): Promise<LabReferralCase[]> {
    return [...this.labReferrals];
  }

  async createLabReferral(ref: LabReferralCase): Promise<LabReferralCase> {
    this.labReferrals.unshift(ref);
    return ref;
  }

  async updateLabReferral(id: string, updates: Partial<LabReferralCase>): Promise<LabReferralCase | null> {
    const index = this.labReferrals.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.labReferrals[index] = { ...this.labReferrals[index], ...updates };
    return this.labReferrals[index];
  }

  async getNotifications(): Promise<EarlyWarningNotification[]> {
    return [...this.notifications];
  }

  async createNotification(notif: EarlyWarningNotification): Promise<EarlyWarningNotification> {
    this.notifications.unshift(notif);
    return notif;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      return true;
    }
    return false;
  }

  async getCurrentUser(): Promise<User> {
    return this.currentUser;
  }

  async setCurrentUser(user: User): Promise<User> {
    this.currentUser = user;
    return this.currentUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return DEMO_USERS.find(u => u.id === id) || null;
  }

  async getUserByRole(role: string): Promise<User | null> {
    return DEMO_USERS.find(u => u.role === role) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return [...DEMO_USERS];
  }

  async getFarms(farmerId?: string): Promise<Farm[]> {
    if (farmerId) {
      return DEMO_FARMS.filter(f => f.farmerId === farmerId);
    }
    return [...DEMO_FARMS];
  }

  async getCrops(): Promise<Crop[]> {
    return [...CROPS];
  }

  async getAdminDashboardStats(): Promise<{
    metrics: Record<string, number>;
    modelMetrics: any;
    hotspots: HotspotPoint[];
    syntheticDistricts: any;
  }> {
    const criticalHotspots = this.hotspots.filter(h => h.severity === 'CRITICAL').length;
    const confirmedCount = this.diagnoses.filter(d => d.verificationStatus === 'CONFIRMED').length;
    const pendingCount = this.diagnoses.filter(d => d.verificationStatus === 'PENDING').length;

    return {
      metrics: {
        totalFarmers: 100,
        totalFarms: 150,
        activeOutbreaks: criticalHotspots,
        totalDiseaseCases: this.diagnoses.length + 38,
        totalPestCases: 19,
        confirmedCases: confirmedCount + 32,
        pendingVerification: pendingCount
      },
      modelMetrics: INITIAL_MODEL_METRICS,
      hotspots: this.hotspots.slice(0, 5),
      syntheticDistricts: this.syntheticData
    };
  }

  async resetDemoData(): Promise<void> {
    this.seedInitialData();
  }

  async getStatus() {
    return {
      storageType: 'in-memory' as const,
      isReady: true,
      diagnosesCount: this.diagnoses.length,
      hotspotsCount: this.hotspots.length,
      sensorsCount: this.sensors.length,
      extensionTasksCount: this.extensionTasks.length,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }
}

// Export singleton repository instance
export const repository: ICropGuardRepository = new InMemoryCropGuardRepository();
