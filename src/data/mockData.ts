import {
  User,
  Crop,
  Farm,
  DiagnosisRecord,
  WeatherInfo,
  HotspotPoint,
  SensorDevice,
  PestTrapReading,
  ExtensionTask,
  LabReferralCase,
  EarlyWarningNotification,
  ModelMetrics
} from '../types';
import { CROP_DISEASE_KNOWLEDGE_BASE } from './ipmKnowledgeBase';

export const CROPS: Crop[] = [
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    hindiName: 'धान (चावल)',
    bengaliName: 'ধান',
    category: 'Cereal',
    stages: ['Nursery / Seedling', 'Tillering', 'Panicle Initiation', 'Flowering / Heading', 'Milking / Dough', 'Maturity / Harvest'],
    icon: '🌾'
  },
  {
    id: 'wheat',
    name: 'Wheat',
    hindiName: 'गेहूं',
    bengaliName: 'গম',
    category: 'Cereal',
    stages: ['Crown Root Initiation (CRI)', 'Tillering', 'Jointing', 'Booting', 'Flowering', 'Grain Filling'],
    icon: '🌾'
  },
  {
    id: 'cotton',
    name: 'Cotton',
    hindiName: 'कपास',
    bengaliName: 'তুলা',
    category: 'Cash',
    stages: ['Seedling', 'Vegetative', 'Squaring', 'Flowering', 'Boll Formation', 'Boll Bursting'],
    icon: '🌱'
  },
  {
    id: 'potato',
    name: 'Potato',
    hindiName: 'आलू',
    bengaliName: 'আলু',
    category: 'Vegetable',
    stages: ['Sprout Development', 'Vegetative Canopy', 'Tuber Initiation', 'Tuber Bulking', 'Maturity / Haulm Senescence'],
    icon: '🥔'
  },
  {
    id: 'tomato',
    name: 'Tomato',
    hindiName: 'टमाटर',
    bengaliName: 'টমেটো',
    category: 'Vegetable',
    stages: ['Seedling / Transplanting', 'Vegetative', 'Flowering', 'Fruit Setting', 'Fruit Ripening'],
    icon: '🍅'
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    hindiName: 'मक्का',
    bengaliName: 'ভুট্টা',
    category: 'Cereal',
    stages: ['Emergence', 'V6-V8 Vegetative', 'Tasseling (VT)', 'Silking (R1)', 'Dough Stage', 'Black Layer Maturity'],
    icon: '🌽'
  }
];

export const DEMO_USERS: User[] = [
  {
    id: 'farmer-101',
    name: 'Rameshwar Mahato',
    role: 'FARMER',
    phone: '+91 98451 23410',
    email: 'rameshwar.farmer@krishi.demo',
    state: 'West Bengal',
    district: 'Purba Bardhaman',
    village: 'Galsi',
    language: 'bn',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'farmer-102',
    name: 'Gurpreet Singh',
    role: 'FARMER',
    phone: '+91 98140 88231',
    email: 'gurpreet.singh@krishi.demo',
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'Samrala',
    language: 'hi',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'ext-201',
    name: 'Ananya Roy (Block Agronomist)',
    role: 'EXTENSION_WORKER',
    phone: '+91 94331 45892',
    email: 'ananya.roy@agri.wb.gov.in',
    state: 'West Bengal',
    district: 'Purba Bardhaman',
    language: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'expert-301',
    name: 'Dr. Vivek Sharma (Pathologist, KVK)',
    role: 'EXPERT',
    phone: '+91 97110 54321',
    email: 'v.sharma@icar.kvk.demo',
    state: 'West Bengal',
    district: 'KVK Bardhaman',
    language: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'lab-401',
    name: 'Pooja Deshmukh (State Plant Pathology Lab)',
    role: 'LAB_STAFF',
    phone: '+91 96540 11984',
    email: 'lab.pathology@agri.gov.in',
    state: 'West Bengal',
    district: 'Kalyani Lab HQ',
    language: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'admin-501',
    name: 'Dr. S. K. Mukherjee (Director of Agriculture)',
    role: 'ADMIN',
    phone: '+91 99000 12345',
    email: 'director.agri@gov.demo',
    state: 'National / State HQ',
    district: 'Kolkata Headquarters',
    language: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  }
];

export const DEMO_FARMS: Farm[] = [
  {
    id: 'farm-01',
    farmerId: 'farmer-101',
    farmerName: 'Rameshwar Mahato',
    name: 'North Damodar Plot #3',
    areaAcres: 3.5,
    latitude: 23.2324,
    longitude: 87.8615,
    district: 'Purba Bardhaman',
    state: 'West Bengal',
    soilType: 'Alluvial Loam',
    currentCropId: 'rice',
    cropStage: 'Tillering',
    sowingDate: '2026-07-14'
  },
  {
    id: 'farm-02',
    farmerId: 'farmer-101',
    farmerName: 'Rameshwar Mahato',
    name: 'East Canal Canal-side Field',
    areaAcres: 2.0,
    latitude: 23.2510,
    longitude: 87.8920,
    district: 'Purba Bardhaman',
    state: 'West Bengal',
    soilType: 'Clay Loam',
    currentCropId: 'potato',
    cropStage: 'Vegetative Canopy',
    sowingDate: '2026-08-01'
  }
];

// Generate synthetic 100 farmers & 150 farms for administrative depth
export function generateSyntheticDemographics() {
  const statesDistricts = [
    { state: 'West Bengal', districts: ['Purba Bardhaman', 'Nadia', 'Hooghly', 'Murshidabad'], baseLat: 23.23, baseLng: 87.86 },
    { state: 'Punjab', districts: ['Ludhiana', 'Jalandhar', 'Bathinda', 'Patiala'], baseLat: 30.90, baseLng: 75.85 },
    { state: 'Maharashtra', districts: ['Ahmednagar', 'Nashik', 'Amravati', 'Yavatmal'], baseLat: 19.09, baseLng: 74.74 },
    { state: 'Telangana', districts: ['Warangal', 'Karimnagar', 'Nalgonda'], baseLat: 17.96, baseLng: 79.59 }
  ];

  const firstNames = ['Ram', 'Shyam', 'Gurpreet', 'Hardeep', 'Suresh', 'Balaram', 'Subhash', 'Kavita', 'Manoj', 'Anil', 'Gopal', 'Santosh', 'Sunil', 'Devendra', 'Rajesh', 'Pradip'];
  const lastNames = ['Singh', 'Patel', 'Mahato', 'Mondal', 'Kaur', 'Jadhav', 'Rathod', 'Reddy', 'Roy', 'Sharma', 'Biswas', 'Das', 'Verma', 'Yadav'];

  const syntheticFarmers: { id: string; name: string; district: string; state: string; phone: string; activeFarms: number }[] = [];
  const syntheticFarmsList: { id: string; farmerName: string; crop: string; stage: string; acres: number; lat: number; lng: number; district: string; status: 'HEALTHY' | 'AT_RISK' | 'INFECTED' }[] = [];

  for (let i = 1; i <= 100; i++) {
    const loc = statesDistricts[i % statesDistricts.length];
    const dist = loc.districts[i % loc.districts.length];
    const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`;
    syntheticFarmers.push({
      id: `syn-farmer-${i}`,
      name,
      district: dist,
      state: loc.state,
      phone: `+91 98${(10000000 + i * 837).toString().slice(0, 8)}`,
      activeFarms: (i % 3) + 1
    });
  }

  const cropKeys = ['rice', 'wheat', 'cotton', 'potato', 'tomato'];
  const stages = ['Tillering', 'Vegetative', 'Flowering', 'Heading', 'Tuber Bulking'];

  for (let j = 1; j <= 150; j++) {
    const loc = statesDistricts[j % statesDistricts.length];
    const dist = loc.districts[j % loc.districts.length];
    const farmer = syntheticFarmers[j % syntheticFarmers.length];
    const crop = cropKeys[j % cropKeys.length];
    const jitterLat = loc.baseLat + ((j % 20) - 10) * 0.04;
    const jitterLng = loc.baseLng + (((j * 7) % 20) - 10) * 0.04;
    const status = j % 5 === 0 ? 'INFECTED' : j % 3 === 0 ? 'AT_RISK' : 'HEALTHY';

    syntheticFarmsList.push({
      id: `syn-farm-${j}`,
      farmerName: farmer.name,
      crop: crop.toUpperCase(),
      stage: stages[j % stages.length],
      acres: Math.round(((j % 8) + 1.5) * 10) / 10,
      lat: Number(jitterLat.toFixed(4)),
      lng: Number(jitterLng.toFixed(4)),
      district: dist,
      status
    });
  }

  return { syntheticFarmers, syntheticFarmsList };
}

export const CURRENT_WEATHER: WeatherInfo = {
  temperatureC: 28.5,
  humidityPercent: 88, // Very high!
  rainfallMm: 12.4,    // Favorable for fungal blast
  windSpeedKmph: 8.5,
  condition: 'Humid & Overcast with intermittent drizzle',
  icon: '🌧️',
  forecast3Day: [
    { day: 'Today', tempMax: 29, tempMin: 22, humidity: 88, rainProb: 80, riskScore: 78 },
    { day: 'Tomorrow', tempMax: 30, tempMin: 23, humidity: 84, rainProb: 65, riskScore: 72 },
    { day: 'Day 3', tempMax: 31, tempMin: 24, humidity: 79, rainProb: 40, riskScore: 58 }
  ]
};

export const INITIAL_DIAGNOSES: DiagnosisRecord[] = [
  {
    id: 'diag-001',
    farmerId: '+91 98451 23410',
    farmerName: 'Rameshwar Mahato',
    farmerPhone: '+91 98451 23410',
    farmId: 'farm-01',
    cropId: 'rice',
    cropName: 'Rice (Paddy)',
    cropStage: 'Tillering',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    latitude: 23.2324,
    longitude: 87.8615,
    locationName: 'Galsi, Purba Bardhaman, WB',
    timestamp: '2026-09-08T09:30:00Z',
    aiPrediction: 'Rice Blast (Magnaporthe oryzae)',
    aiConfidence: 0.74, // Moderate confidence -> triggers expert verification
    aiConfidenceLevel: 'MODERATE',
    aiSeverity: 'HIGH',
    aiSymptoms: [
      'Elliptical spindle-shaped spots on leaves',
      'Grayish center with dark reddish-brown margins',
      'Lower leaves showing focal yellowing and drying'
    ],
    alternativePredictions: [
      { name: 'Brown Spot (Bipolaris oryzae)', confidence: 0.18 },
      { name: 'Narrow Brown Leaf Spot (Cercospora)', confidence: 0.08 }
    ],
    verificationStatus: 'PENDING',
    finalDiagnosis: 'Rice Blast (Magnaporthe oryzae) - Pending Expert Review',
    ipmAdvisory: CROP_DISEASE_KNOWLEDGE_BASE['rice-blast'].ipm,
    followUpDate: '2026-09-12',
    followUpStatus: 'PENDING',
    syncStatus: 'UPLOADED'
  },
  {
    id: 'diag-002',
    farmerId: '+91 98140 88231',
    farmerName: 'Gurpreet Singh',
    farmerPhone: '+91 98140 88231',
    farmId: 'farm-02',
    cropId: 'wheat',
    cropName: 'Wheat',
    cropStage: 'Tillering',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    latitude: 30.9010,
    longitude: 75.8573,
    locationName: 'Samrala, Ludhiana, Punjab',
    timestamp: '2026-09-06T14:15:00Z',
    aiPrediction: 'Yellow / Stripe Rust (Puccinia striiformis)',
    aiConfidence: 0.91, // High confidence >= 0.85
    aiConfidenceLevel: 'HIGH',
    aiSeverity: 'MODERATE',
    aiSymptoms: [
      'Bright yellow linear pustules arranged in parallel lines on upper leaf blades',
      'Powdery yellow urediniospores dusting off when leaves are touched'
    ],
    alternativePredictions: [
      { name: 'Brown / Leaf Rust (Puccinia triticina)', confidence: 0.06 },
      { name: 'Powdery Mildew', confidence: 0.03 }
    ],
    verificationStatus: 'CONFIRMED',
    expertPrediction: 'Yellow / Stripe Rust (Puccinia striiformis)',
    expertNotes: 'Confirmed typical early stripe rust foci. Propiconazole 25% EC foliar spray recommended immediately to contain foci.',
    reviewerId: 'expert-301',
    reviewerName: 'Dr. Vivek Sharma',
    reviewTimestamp: '2026-09-07T10:00:00Z',
    finalDiagnosis: 'Yellow / Stripe Rust (Puccinia striiformis)',
    ipmAdvisory: CROP_DISEASE_KNOWLEDGE_BASE['wheat-yellow-rust'].ipm,
    followUpDate: '2026-09-14',
    followUpStatus: 'VISITED',
    syncStatus: 'UPLOADED'
  }
];

export const INITIAL_HOTSPOTS: HotspotPoint[] = [
  {
    id: 'hotspot-1',
    caseId: 'diag-001',
    latitude: 23.2324,
    longitude: 87.8615,
    locationName: 'Galsi Block, Purba Bardhaman',
    crop: 'Rice',
    diseaseOrPest: 'Rice Blast',
    type: 'DISEASE',
    severity: 'HIGH',
    date: '2026-09-08',
    confidence: 0.88,
    verificationStatus: 'CONFIRMED',
    activeCount: 14,
    radiusKm: 8.5,
    trend: 'INCREASING',
    containmentProtocol: 'Prophylactic community barrier spray with Tricyclazole 75 WP (0.6g/L) within 5 km perimeter. Restrict inter-field machinery movement.',
    isMockData: true
  },
  {
    id: 'hotspot-2',
    caseId: 'diag-003',
    latitude: 23.3400,
    longitude: 87.7200,
    locationName: 'Bhatar Block, Purba Bardhaman',
    crop: 'Rice',
    diseaseOrPest: 'Bacterial Leaf Blight',
    type: 'DISEASE',
    severity: 'MODERATE',
    date: '2026-09-07',
    confidence: 0.92,
    verificationStatus: 'CONFIRMED',
    activeCount: 9,
    radiusKm: 6.0,
    trend: 'STABLE',
    containmentProtocol: 'Foliar application of Copper Oxychloride 50 WP (2.5g/L) + Streptocycline (100 ppm). Avoid clipping seedling tips.',
    isMockData: true
  },
  {
    id: 'hotspot-3',
    caseId: 'diag-004',
    latitude: 23.1800,
    longitude: 87.9500,
    locationName: 'Memari, Purba Bardhaman',
    crop: 'Potato',
    diseaseOrPest: 'Late Blight Early Outbreak',
    type: 'DISEASE',
    severity: 'CRITICAL',
    date: '2026-09-08',
    confidence: 0.95,
    verificationStatus: 'LAB_VERIFIED',
    activeCount: 22,
    radiusKm: 12.0,
    trend: 'INCREASING',
    containmentProtocol: 'Immediate systemic curative spray with Cymoxanil + Mancozeb (2g/L). Daily canopy inspection by KVK officers.',
    isMockData: true
  },
  {
    id: 'hotspot-6',
    caseId: 'diag-007',
    latitude: 23.2100,
    longitude: 87.8100,
    locationName: 'Khandaghosh Block, Purba Bardhaman',
    crop: 'Rice',
    diseaseOrPest: 'Sheath Blight Suspected Focus',
    type: 'DISEASE',
    severity: 'MODERATE',
    date: '2026-09-09',
    confidence: 0.72,
    verificationStatus: 'PRELIMINARY',
    activeCount: 6,
    radiusKm: 5.5,
    trend: 'STABLE',
    containmentProtocol: 'Field validation team dispatched. Lower canopy aeration recommended; maintain shallow standing water layer (2 cm).',
    isMockData: true
  },
  {
    id: 'hotspot-7',
    caseId: 'diag-008',
    latitude: 23.2900,
    longitude: 87.8900,
    locationName: 'Ausgram Surveillance Zone',
    crop: 'Rice',
    diseaseOrPest: 'Stem Borer Regular Monitoring',
    type: 'PEST',
    severity: 'LOW',
    date: '2026-09-09',
    confidence: 0.85,
    verificationStatus: 'MONITORED',
    activeCount: 3,
    radiusKm: 4.0,
    trend: 'CONTAINED',
    containmentProtocol: 'Routine pheromone trap inspection every 3 days. Clean bund vegetation to eradicate alternate weed hosts.',
    isMockData: true
  },
  {
    id: 'hotspot-4',
    caseId: 'diag-005',
    latitude: 30.9010,
    longitude: 75.8573,
    locationName: 'Samrala, Ludhiana, Punjab',
    crop: 'Wheat',
    diseaseOrPest: 'Yellow Stripe Rust',
    type: 'DISEASE',
    severity: 'HIGH',
    date: '2026-09-06',
    confidence: 0.91,
    verificationStatus: 'CONFIRMED',
    activeCount: 18,
    radiusKm: 10.2,
    trend: 'STABLE',
    containmentProtocol: 'Foliar spray with Propiconazole 25 EC (0.1%). Coordinate buffer zone survey with PAU advisory cell.',
    isMockData: true
  },
  {
    id: 'hotspot-5',
    caseId: 'diag-006',
    latitude: 19.0948,
    longitude: 74.7480,
    locationName: 'Rahuri, Ahmednagar, Maharashtra',
    crop: 'Cotton',
    diseaseOrPest: 'Pink Bollworm Pheromone Trap Surge',
    type: 'PEST',
    severity: 'CRITICAL',
    date: '2026-09-08',
    confidence: 0.94,
    verificationStatus: 'CONFIRMED',
    activeCount: 31,
    radiusKm: 15.0,
    trend: 'INCREASING',
    containmentProtocol: 'Install mating disruption gossyplure ropes (100/acre). Mass release Trichogramma bactrae parasitoids.',
    isMockData: true
  }
];

export const INITIAL_SENSORS: SensorDevice[] = [
  {
    id: 'sensor-temp-01',
    farmId: 'farm-01',
    name: 'Canopy Temp Sensor #1',
    type: 'TEMPERATURE',
    unit: '°C',
    currentValue: 28.5,
    batteryLevel: 92,
    lastUpdated: '10 mins ago',
    status: 'ONLINE'
  },
  {
    id: 'sensor-hum-01',
    farmId: 'farm-01',
    name: 'Canopy Microclimate RH',
    type: 'HUMIDITY',
    unit: '%',
    currentValue: 88.0,
    batteryLevel: 89,
    lastUpdated: '10 mins ago',
    status: 'WARNING',
    thresholdAlert: 'RH >85% favorable for fungal sporulation'
  },
  {
    id: 'sensor-leaf-01',
    farmId: 'farm-01',
    name: 'Leaf Wetness Sensor Grid',
    type: 'LEAF_WETNESS',
    unit: 'hours',
    currentValue: 9.4,
    batteryLevel: 84,
    lastUpdated: '5 mins ago',
    status: 'WARNING',
    thresholdAlert: 'Continuous wetness >8h breaches blast trigger threshold'
  },
  {
    id: 'sensor-soil-01',
    farmId: 'farm-01',
    name: 'TDR Soil Volumetric Moisture',
    type: 'SOIL_MOISTURE',
    unit: '% VWC',
    currentValue: 34.2,
    batteryLevel: 95,
    lastUpdated: '15 mins ago',
    status: 'ONLINE'
  },
  {
    id: 'trap-smart-01',
    farmId: 'farm-01',
    name: 'Smart Automated Optical Pest Trap',
    type: 'SMART_PEST_TRAP',
    unit: 'moths/night',
    currentValue: 12.0,
    batteryLevel: 78,
    lastUpdated: '1 hour ago',
    status: 'WARNING',
    thresholdAlert: 'Moth catch (12) exceeded ETL limit (8)'
  }
];

export const INITIAL_PEST_TRAP_READINGS: PestTrapReading[] = [
  {
    trapId: 'trap-smart-01',
    farmId: 'farm-01',
    date: '2026-09-08',
    targetPest: 'Yellow Stem Borer / Moth',
    count: 12,
    thresholdLimit: 8,
    isExceeded: true,
    notes: 'Exceeded ETL threshold. Immediate mating disruption or bio-agent release advised.'
  },
  {
    trapId: 'trap-smart-01',
    farmId: 'farm-01',
    date: '2026-09-07',
    targetPest: 'Yellow Stem Borer / Moth',
    count: 6,
    thresholdLimit: 8,
    isExceeded: false,
    notes: 'Within safe monitoring limit.'
  },
  {
    trapId: 'trap-smart-01',
    farmId: 'farm-01',
    date: '2026-09-06',
    targetPest: 'Yellow Stem Borer / Moth',
    count: 4,
    thresholdLimit: 8,
    isExceeded: false
  }
];

export const INITIAL_EXTENSION_TASKS: ExtensionTask[] = [
  {
    id: 'task-ext-01',
    farmId: 'farm-01',
    farmerName: 'Rameshwar Mahato',
    farmerPhone: '+91 98451 23410',
    location: 'North Damodar Plot #3, Galsi, WB',
    crop: 'Rice (Paddy)',
    suspectedIssue: 'Rice Blast Spindle Lesions (Moderate Confidence 74%)',
    priority: 'HIGH',
    status: 'PENDING',
    scheduledDate: '2026-09-10',
    diagnosisId: 'diag-001'
  },
  {
    id: 'task-ext-02',
    farmId: 'farm-memari-04',
    farmerName: 'Biren Mondal',
    farmerPhone: '+91 94340 99812',
    location: 'Plot #12, Memari, Purba Bardhaman',
    crop: 'Potato',
    suspectedIssue: 'Suspected Late Blight Haulm Rot with Rapid Spreading',
    priority: 'CRITICAL',
    status: 'PENDING',
    scheduledDate: '2026-09-09',
    diagnosisId: 'diag-004'
  }
];

export const INITIAL_LAB_REFERRALS: LabReferralCase[] = [
  {
    id: 'lab-ref-101',
    diagnosisId: 'diag-004',
    sampleId: 'SMPL-WB-26-8891',
    farmerId: 'farmer-biren',
    farmerName: 'Biren Mondal',
    crop: 'Potato',
    suspectedPathogen: 'Phytophthora infestans (Late Blight)',
    sampleType: 'LEAF_TISSUE',
    collectionDate: '2026-09-07',
    laboratoryName: 'Kalyani State Agri Microbiology & Diagnostic Lab',
    status: 'IN_TESTING',
    testedBy: 'Pooja Deshmukh'
  }
];

export const INITIAL_NOTIFICATIONS: EarlyWarningNotification[] = [
  {
    id: 'notif-01',
    title: 'High Fungal Disease Risk Alert: Rice Blast',
    riskLevel: 'HIGH',
    reason: 'Relative humidity continuously above 85% with leaf wetness exceeding 9 hours in Galsi Block.',
    affectedCrop: 'Rice (Paddy)',
    recommendedAction: 'Inspect bottom tillers for spindle spots; prepare prophylactic spray of Tricyclazole 75% WP @ 0.6g/L.',
    location: 'Purba Bardhaman District',
    timestamp: '2 hours ago',
    isRead: false,
    cooldownKey: 'blast-rh-galsi'
  },
  {
    id: 'notif-02',
    title: 'Outbreak Warning: 14 Cases Reported Nearby',
    riskLevel: 'HIGH',
    reason: 'Geospatial hotspot detected within 8.5 km radius of your farm in Galsi Block.',
    affectedCrop: 'Rice (Paddy)',
    recommendedAction: 'Check bunds, eliminate standing drainage water and avoid excess urea application.',
    location: 'Within 8.5 km of Farm #01',
    timestamp: '5 hours ago',
    isRead: false,
    cooldownKey: 'hotspot-galsi-8km'
  },
  {
    id: 'notif-03',
    title: 'Pheromone Trap Threshold Breached',
    riskLevel: 'CRITICAL',
    reason: 'Smart Trap #01 recorded 12 yellow stem borer moths (ETL threshold is 8 moths/night).',
    affectedCrop: 'Rice (Paddy)',
    recommendedAction: 'Release Trichogramma egg parasitoids @ 40,000/acre or apply Chlorantraniliprole 18.5% SC @ 0.3ml/L.',
    location: 'North Damodar Plot #3',
    timestamp: '1 hour ago',
    isRead: false,
    cooldownKey: 'trap-exceed-01'
  }
];

export const INITIAL_MODEL_METRICS: ModelMetrics = {
  version: 'v2.4.1',
  architecture: 'MobileNetV3-Small (Transfer Learning on AgriVision-India)',
  trainingDatasetVersion: 'DS-2026.08-CONFIRMED',
  totalConfirmedSamples: 42850,
  accuracy: 0.942,
  precision: 0.938,
  recall: 0.925,
  f1Score: 0.931,
  expertCorrectionRate: 0.058, // Only 5.8% required expert correction
  deploymentDate: '2026-08-15',
  isProduction: true
};
