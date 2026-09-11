/**
 * CropGuard AI - Relational Database Schema & PostgreSQL Data Models
 *
 * Defines explicit entities, table schemas, relationships, constraints,
 * indexes, and privacy/retention policies for production PostgreSQL deployment.
 */

// ============================================================================
// TypeScript Entity Interfaces (mapped 1:1 to PostgreSQL tables)
// ============================================================================

export interface UserEntity {
  id: string; // UUID / Primary Key
  name: string;
  role: 'FARMER' | 'EXTENSION_WORKER' | 'EXPERT' | 'LAB_STAFF' | 'ADMIN';
  phoneMasked: string; // PII Protection: Masked format e.g. "+91 943XX XXX10"
  email?: string;
  state: string;
  district: string;
  villageFuzzed?: string; // Fuzzed village name to protect privacy
  preferredLanguage: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmFieldEntity {
  id: string; // UUID / Primary Key
  farmerId: string; // FK -> users(id)
  name: string;
  areaAcres: number;
  latitudeFuzzed: number; // Rounded to ~1.1km grid for privacy
  longitudeFuzzed: number;
  district: string;
  state: string;
  soilType: string;
  currentCropId: string; // FK -> crops(id)
  cropStage: string;
  sowingDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CropEntity {
  id: string; // Primary Key e.g. 'rice', 'wheat'
  name: string;
  scientificName: string;
  hindiName: string;
  bengaliName: string;
  category: string;
  stages: string[]; // JSONB array
  icon: string;
  createdAt: string;
}

export interface ScanEntity {
  id: string; // Primary Key e.g. 'scan-uuid'
  clientUuid?: string; // Client-side scan UUID for idempotency
  farmerId: string; // FK -> users(id)
  farmId: string; // FK -> farm_fields(id)
  imageRef: string; // Reference to Object Store (NOT raw image bytes)
  imageSha256: string; // Hash for duplicate detection
  fileSizeBytes: number;
  mimeType: string;
  capturedAt: string;
  createdAt: string;
}

export interface DiagnosisEntity {
  id: string; // Primary Key
  scanId?: string; // FK -> scans(id)
  farmerId: string; // FK -> users(id)
  farmId: string; // FK -> farm_fields(id)
  cropId: string; // FK -> crops(id)
  cropStage: string;
  aiPrediction: string;
  aiConfidence: number; // Float 0.0 - 1.0
  aiConfidenceLevel: 'HIGH' | 'MODERATE' | 'LOW';
  aiSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'CONFIRMED' | 'CORRECTED' | 'LAB_REFERRED' | 'UNCERTAIN';
  finalDiagnosis: string;
  affectedLeafAreaPercent?: string;
  whyAiThinksThis?: string; // JSONB
  visualObservations?: string[]; // JSONB
  requiresExpertReview: boolean;
  latitudeFuzzed: number;
  longitudeFuzzed: number;
  locationName: string;
  isMockData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAssessmentEntity {
  id: string; // Primary Key
  cropId: string;
  cropStage: string;
  district: string;
  diseaseRiskScore: number; // 0 - 100
  pestRiskScore: number; // 0 - 100
  compositeRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  evaluatedFactors: string; // JSONB breakdown
  missingFactors: string[]; // JSONB array
  dataCompletenessPercent: number;
  forecast24hScore?: number;
  forecast48hScore?: number;
  evaluatedAt: string;
}

export interface SensorObservationEntity {
  id: string; // Primary Key
  deviceId: string;
  farmId: string;
  sensorType: 'TEMPERATURE' | 'HUMIDITY' | 'SOIL_MOISTURE' | 'LEAF_WETNESS' | 'SMART_PEST_TRAP';
  metricValue: number;
  unit: string;
  batteryPercent?: number;
  recordedAt: string;
  createdAt: string;
}

export interface OutbreakReportEntity {
  id: string; // Primary Key
  caseId: string;
  crop: string;
  diseaseOrPest: string;
  threatType: 'DISEASE' | 'PEST';
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  latitudeFuzzed: number; // Privacy fuzzing applied
  longitudeFuzzed: number;
  district: string;
  locationName: string;
  verificationStatus: 'CONFIRMED' | 'LAB_VERIFIED' | 'PRELIMINARY' | 'MONITORED';
  activeClusterCount: number;
  radiusKm: number;
  reportedAt: string;
  createdAt: string;
  isMockData: boolean;
}

export interface AdvisoryEntity {
  id: string; // Primary Key
  cropId: string;
  diseaseName: string;
  cropStage?: string;
  immediateActions: string; // JSONB
  monitoringSteps: string; // JSONB
  preventiveNonChemical: string; // JSONB
  approvedChemicalGuidance: string; // JSONB
  officialSource: string;
  isVerifiedReference: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpertCaseEntity {
  caseId: string; // Primary Key e.g. "CASE-2026-0841"
  diagnosisId?: string; // FK -> diagnoses(id)
  farmerId: string; // FK -> users(id)
  farmId: string; // FK -> farm_fields(id)
  crop: string;
  cropStage: string;
  imageRef?: string;
  aiDiagnosis: string;
  aiConfidence: number;
  aiSeverity: string;
  riskScore: number;
  environmentalFactors: string; // JSONB
  approximateLocation: string;
  farmerDescription: string;
  status: 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'CONFIRMED' | 'CORRECTED' | 'RESOLVED';
  assignedExpertId?: string; // FK -> users(id)
  assignedExpertName?: string;
  expertFinalDiagnosis?: string; // Stored separately from aiDiagnosis
  expertNotes?: string;
  auditTrail: string; // JSONB array of history
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SynchronizationRecordEntity {
  id: string; // Primary Key
  idempotencyKey: string; // Unique client idempotency key
  clientUuid: string;
  userId: string;
  recordType: 'SCAN' | 'OUTBREAK_REPORT' | 'FIELD_NOTE';
  payloadHash: string; // SHA-256 hash of payload
  syncStatus: 'SYNCED' | 'DUPLICATE' | 'REJECTED' | 'FAILED';
  errorMessage?: string;
  createdAt: string;
  synchronizedAt: string;
}

// ============================================================================
// Production PostgreSQL DDL SQL Schema
// ============================================================================

export const POSTGRES_DDL_SCHEMA = `
-- CropGuard AI Production Relational Schema
-- Target: PostgreSQL 14+ with PostGIS support (optional)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('FARMER', 'EXTENSION_WORKER', 'EXPERT', 'LAB_STAFF', 'ADMIN')),
    phone_masked VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    village_fuzzed VARCHAR(128),
    preferred_language VARCHAR(8) DEFAULT 'en',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district, state);

-- 2. FARMS & AGRICULTURAL FIELDS
CREATE TABLE IF NOT EXISTS farm_fields (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    area_acres NUMERIC(8,2) NOT NULL,
    latitude_fuzzed NUMERIC(8,4) NOT NULL,
    longitude_fuzzed NUMERIC(8,4) NOT NULL,
    district VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    soil_type VARCHAR(64),
    current_crop_id VARCHAR(64),
    crop_stage VARCHAR(64),
    sowing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_farm_fields_farmer ON farm_fields(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farm_fields_district ON farm_fields(district);

-- 3. CROPS REPOSITORY
CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    scientific_name VARCHAR(128),
    hindi_name VARCHAR(128),
    bengali_name VARCHAR(128),
    category VARCHAR(64) NOT NULL,
    stages JSONB NOT NULL DEFAULT '[]',
    icon VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_crops_category ON crops(category);

-- 4. SCANS & OBJECT STORAGE REFERENCES (Zero raw image bytes in DB rows)
CREATE TABLE IF NOT EXISTS scans (
    id VARCHAR(64) PRIMARY KEY,
    client_uuid VARCHAR(64),
    farmer_id VARCHAR(64) NOT NULL REFERENCES users(id),
    farm_id VARCHAR(64) NOT NULL REFERENCES farm_fields(id),
    image_ref VARCHAR(128) NOT NULL,
    image_sha256 VARCHAR(64) NOT NULL,
    file_size_bytes INTEGER,
    mime_type VARCHAR(64) DEFAULT 'image/jpeg',
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_scans_farmer ON scans(farmer_id);
CREATE INDEX IF NOT EXISTS idx_scans_farm ON scans(farm_id);
CREATE INDEX IF NOT EXISTS idx_scans_sha256 ON scans(image_sha256);

-- 5. DIAGNOSES & PATHOGEN RECORDS
CREATE TABLE IF NOT EXISTS diagnoses (
    id VARCHAR(64) PRIMARY KEY,
    scan_id VARCHAR(64) REFERENCES scans(id) ON DELETE SET NULL,
    farmer_id VARCHAR(64) NOT NULL REFERENCES users(id),
    farm_id VARCHAR(64) NOT NULL REFERENCES farm_fields(id),
    crop_id VARCHAR(64) NOT NULL REFERENCES crops(id),
    crop_stage VARCHAR(64) NOT NULL,
    ai_prediction VARCHAR(255) NOT NULL,
    ai_confidence NUMERIC(4,3) NOT NULL,
    ai_confidence_level VARCHAR(16) NOT NULL,
    ai_severity VARCHAR(16) NOT NULL,
    verification_status VARCHAR(32) DEFAULT 'PENDING',
    final_diagnosis VARCHAR(255) NOT NULL,
    affected_leaf_area_percent VARCHAR(32),
    why_ai_thinks_this JSONB,
    visual_observations JSONB,
    requires_expert_review BOOLEAN DEFAULT FALSE,
    latitude_fuzzed NUMERIC(8,4) NOT NULL,
    longitude_fuzzed NUMERIC(8,4) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    is_mock_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_diagnoses_farmer_created ON diagnoses(farmer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnoses_crop ON diagnoses(crop_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_prediction ON diagnoses(ai_prediction);
CREATE INDEX IF NOT EXISTS idx_diagnoses_verification ON diagnoses(verification_status);

-- 6. RISK ASSESSMENTS
CREATE TABLE IF NOT EXISTS risk_assessments (
    id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(64) NOT NULL REFERENCES crops(id),
    crop_stage VARCHAR(64) NOT NULL,
    district VARCHAR(128) NOT NULL,
    disease_risk_score INTEGER NOT NULL,
    pest_risk_score INTEGER NOT NULL,
    composite_risk_level VARCHAR(16) NOT NULL,
    evaluated_factors JSONB NOT NULL,
    missing_factors JSONB DEFAULT '[]',
    data_completeness_percent INTEGER DEFAULT 100,
    forecast_24h_score INTEGER,
    forecast_48h_score INTEGER,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_risk_crop_district ON risk_assessments(crop_id, district, evaluated_at DESC);

-- 7. IOT SENSOR & TRAP OBSERVATIONS (90-Day Retention Policy)
CREATE TABLE IF NOT EXISTS sensor_observations (
    id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL,
    farm_id VARCHAR(64) NOT NULL REFERENCES farm_fields(id),
    sensor_type VARCHAR(32) NOT NULL,
    metric_value NUMERIC(8,2) NOT NULL,
    unit VARCHAR(16) NOT NULL,
    battery_percent INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sensors_device_time ON sensor_observations(device_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensors_farm_time ON sensor_observations(farm_id, recorded_at DESC);

-- 8. OUTBREAK HOTSPOTS & SURVEILLANCE
CREATE TABLE IF NOT EXISTS outbreak_reports (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL,
    crop VARCHAR(64) NOT NULL,
    disease_or_pest VARCHAR(255) NOT NULL,
    threat_type VARCHAR(16) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    latitude_fuzzed NUMERIC(8,4) NOT NULL,
    longitude_fuzzed NUMERIC(8,4) NOT NULL,
    district VARCHAR(128) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    verification_status VARCHAR(32) NOT NULL,
    active_cluster_count INTEGER DEFAULT 1,
    radius_km NUMERIC(5,2) DEFAULT 5.0,
    reported_at DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_outbreaks_district ON outbreak_reports(district);
CREATE INDEX IF NOT EXISTS idx_outbreaks_crop_pathogen ON outbreak_reports(crop, disease_or_pest);
CREATE INDEX IF NOT EXISTS idx_outbreaks_coords ON outbreak_reports(latitude_fuzzed, longitude_fuzzed);

-- 9. AUTHORITATIVE ADVISORIES (CIBRC / ICAR Verified)
CREATE TABLE IF NOT EXISTS advisories (
    id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(64) NOT NULL REFERENCES crops(id),
    disease_name VARCHAR(255) NOT NULL,
    crop_stage VARCHAR(64),
    immediate_actions JSONB NOT NULL,
    monitoring_steps JSONB NOT NULL,
    preventive_non_chemical JSONB NOT NULL,
    approved_chemical_guidance JSONB NOT NULL,
    official_source TEXT NOT NULL,
    is_verified_reference BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_advisories_crop_disease ON advisories(crop_id, disease_name);

-- 10. KVK & EXPERT CASE MANAGEMENT
CREATE TABLE IF NOT EXISTS expert_cases (
    case_id VARCHAR(64) PRIMARY KEY,
    diagnosis_id VARCHAR(64) REFERENCES diagnoses(id) ON DELETE SET NULL,
    farmer_id VARCHAR(64) NOT NULL REFERENCES users(id),
    farm_id VARCHAR(64) NOT NULL REFERENCES farm_fields(id),
    crop VARCHAR(64) NOT NULL,
    crop_stage VARCHAR(64) NOT NULL,
    image_ref VARCHAR(128),
    ai_diagnosis VARCHAR(255) NOT NULL,
    ai_confidence NUMERIC(4,3) NOT NULL,
    ai_severity VARCHAR(16) NOT NULL,
    risk_score INTEGER NOT NULL,
    environmental_factors JSONB NOT NULL,
    approximate_location VARCHAR(255) NOT NULL,
    farmer_description TEXT,
    status VARCHAR(32) NOT NULL CHECK (status IN ('PENDING_REVIEW', 'UNDER_REVIEW', 'CONFIRMED', 'CORRECTED', 'RESOLVED')),
    assigned_expert_id VARCHAR(64) REFERENCES users(id),
    assigned_expert_name VARCHAR(255),
    expert_final_diagnosis VARCHAR(255), -- Preserved SEPARATELY from original ai_diagnosis
    expert_notes TEXT,
    audit_trail JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_expert_cases_status ON expert_cases(status);
CREATE INDEX IF NOT EXISTS idx_expert_cases_assigned ON expert_cases(assigned_expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_cases_farmer ON expert_cases(farmer_id);
CREATE INDEX IF NOT EXISTS idx_expert_cases_created ON expert_cases(created_at DESC);

-- 11. IDEMPOTENT OFFLINE SYNCHRONIZATION LOGS
CREATE TABLE IF NOT EXISTS synchronization_records (
    id VARCHAR(64) PRIMARY KEY,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    client_uuid VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    record_type VARCHAR(32) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    sync_status VARCHAR(32) NOT NULL CHECK (sync_status IN ('SYNCED', 'DUPLICATE', 'REJECTED', 'FAILED')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synchronized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sync_idempotency ON synchronization_records(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_sync_client_uuid ON synchronization_records(client_uuid);
CREATE INDEX IF NOT EXISTS idx_sync_user ON synchronization_records(user_id, sync_status);
`;

/**
 * Data Retention & Privacy Considerations:
 * 1. PII Minimization: User phone numbers are masked ("+91 943XX XXX10") and GPS coordinates
 *    are fuzzed to ~1.1km grid cells in farmer and public views.
 * 2. Raw Binary Separation: Images are never embedded in relational tables; only SHA-256
 *    references (image_ref) are stored with object storage metadata.
 * 3. High-Frequency Telemetry Pruning: sensor_observations table applies a 90-day retention
 *    window, after which telemetry is aggregated into hourly/daily summary tables.
 * 4. Audit Trail Permanence: expert_cases audit logs are append-only to ensure forensic integrity.
 */
