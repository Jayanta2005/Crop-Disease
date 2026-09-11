-- ==========================================================
-- CropGuard AI - Production Database Schema (PostgreSQL / SQLite Compatible)
-- Optimized for Geospatial Queries, Disease History & Surveillance
-- ==========================================================

-- 1. Users & Roles
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(128),
    role VARCHAR(32) NOT NULL CHECK(role IN ('FARMER', 'EXTENSION_WORKER', 'EXPERT', 'LAB_STAFF', 'ADMIN')),
    preferred_language VARCHAR(8) DEFAULT 'en' CHECK(preferred_language IN ('en', 'hi', 'bn')),
    state VARCHAR(64) NOT NULL,
    district VARCHAR(64) NOT NULL,
    village VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district);

-- 2. Farmers
CREATE TABLE IF NOT EXISTS farmers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    aadhaar_hash VARCHAR(64),
    pm_kisan_id VARCHAR(64),
    kisan_credit_card BOOLEAN DEFAULT FALSE,
    emergency_contact VARCHAR(20),
    total_landholding_acres DECIMAL(6, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Farms
CREATE TABLE IF NOT EXISTS farms (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    farm_name VARCHAR(128) NOT NULL,
    total_area_acres DECIMAL(6, 2) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    elevation_meters DECIMAL(6, 1),
    soil_type VARCHAR(64),
    irrigation_source VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farms_coords ON farms(latitude, longitude);

-- 4. Crops & Crop Stages
CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    scientific_name VARCHAR(128),
    category VARCHAR(32) NOT NULL,
    optimal_temp_min DECIMAL(4, 1),
    optimal_temp_max DECIMAL(4, 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_stages (
    id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(32) NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    stage_name VARCHAR(64) NOT NULL,
    stage_order INTEGER NOT NULL,
    duration_days_min INTEGER,
    duration_days_max INTEGER,
    susceptibility_factor DECIMAL(3, 2) DEFAULT 1.00
);

-- 5. Fields (Sub-plots within a Farm)
CREATE TABLE IF NOT EXISTS fields (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    field_name VARCHAR(64) NOT NULL,
    area_acres DECIMAL(6, 2) NOT NULL,
    current_crop_id VARCHAR(32) REFERENCES crops(id),
    current_stage_id VARCHAR(64) REFERENCES crop_stages(id),
    sowing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Diseases & Pests Catalog
CREATE TABLE IF NOT EXISTS diseases (
    id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(32) NOT NULL REFERENCES crops(id),
    name VARCHAR(128) NOT NULL,
    scientific_name VARCHAR(128),
    pathogen_type VARCHAR(32) CHECK(pathogen_type IN ('FUNGAL', 'BACTERIAL', 'VIRAL', 'NEMATODE', 'DEFICIENCY')),
    favored_temp_min DECIMAL(4, 1),
    favored_temp_max DECIMAL(4, 1),
    favored_min_humidity DECIMAL(4, 1),
    requires_free_water BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pests (
    id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(32) NOT NULL REFERENCES crops(id),
    name VARCHAR(128) NOT NULL,
    scientific_name VARCHAR(128),
    economic_threshold_level VARCHAR(256),
    trap_threshold_count INTEGER DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Diagnoses & Submissions
CREATE TABLE IF NOT EXISTS diagnoses (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id),
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id),
    field_id VARCHAR(64) REFERENCES fields(id),
    crop_id VARCHAR(32) NOT NULL REFERENCES crops(id),
    crop_stage VARCHAR(64),
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    submission_channel VARCHAR(32) DEFAULT 'MOBILE_APP',
    verification_status VARCHAR(32) DEFAULT 'PENDING' CHECK(verification_status IN ('PENDING', 'CONFIRMED', 'CORRECTED', 'UNCERTAIN', 'LAB_REFERRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_geo ON diagnoses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_diagnoses_status ON diagnoses(verification_status);

-- 8. Diagnosis Images
CREATE TABLE IF NOT EXISTS diagnosis_images (
    id VARCHAR(64) PRIMARY KEY,
    diagnosis_id VARCHAR(64) NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
    storage_url TEXT NOT NULL,
    file_size_bytes INTEGER,
    mime_type VARCHAR(32),
    width INTEGER,
    height INTEGER,
    captured_offline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. AI Prediction Results
CREATE TABLE IF NOT EXISTS ai_results (
    id VARCHAR(64) PRIMARY KEY,
    diagnosis_id VARCHAR(64) NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
    predicted_disease_id VARCHAR(64) REFERENCES diseases(id),
    predicted_pest_id VARCHAR(64) REFERENCES pests(id),
    prediction_label VARCHAR(128) NOT NULL,
    confidence_score DECIMAL(5, 4) NOT NULL,
    confidence_tier VARCHAR(16) NOT NULL CHECK(confidence_tier IN ('HIGH', 'MODERATE', 'LOW')),
    severity_level VARCHAR(16) NOT NULL CHECK(severity_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    alternative_predictions JSON,
    requires_expert_review BOOLEAN NOT NULL DEFAULT FALSE,
    model_version VARCHAR(32) NOT NULL,
    inference_latency_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Expert Reviews
CREATE TABLE IF NOT EXISTS expert_reviews (
    id VARCHAR(64) PRIMARY KEY,
    diagnosis_id VARCHAR(64) NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
    reviewer_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    decision VARCHAR(32) NOT NULL CHECK(decision IN ('CONFIRM_AI', 'CORRECT_DIAGNOSIS', 'MARK_UNCERTAIN', 'REQUEST_NEW_PHOTO', 'REFER_TO_LAB')),
    expert_diagnosis_label VARCHAR(128),
    expert_notes TEXT,
    follow_up_recommended_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Advisories & IPM Recommendations
CREATE TABLE IF NOT EXISTS advisories (
    id VARCHAR(64) PRIMARY KEY,
    diagnosis_id VARCHAR(64) NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
    language VARCHAR(8) NOT NULL DEFAULT 'en',
    problem_title VARCHAR(256) NOT NULL,
    severity_summary TEXT,
    immediate_actions JSON,
    preventive_actions JSON,
    ipm_cultural JSON,
    ipm_biological JSON,
    ipm_chemical JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Weather Data & Risk Forecasts
CREATE TABLE IF NOT EXISTS weather_data (
    id VARCHAR(64) PRIMARY KEY,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    temperature_c DECIMAL(4, 1) NOT NULL,
    relative_humidity_pct DECIMAL(4, 1) NOT NULL,
    rainfall_mm DECIMAL(5, 1) NOT NULL,
    wind_speed_kmh DECIMAL(4, 1),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(64) DEFAULT 'IMD_AGROMET'
);

CREATE TABLE IF NOT EXISTS risk_predictions (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id),
    crop_id VARCHAR(32) NOT NULL REFERENCES crops(id),
    disease_risk_score INTEGER NOT NULL CHECK(disease_risk_score BETWEEN 0 AND 100),
    pest_risk_score INTEGER NOT NULL CHECK(pest_risk_score BETWEEN 0 AND 100),
    disease_risk_tier VARCHAR(16) NOT NULL,
    pest_risk_tier VARCHAR(16) NOT NULL,
    primary_threats JSON,
    applied_rules JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Sensors & IoT Pest Traps
CREATE TABLE IF NOT EXISTS sensors (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    device_name VARCHAR(64) NOT NULL,
    sensor_type VARCHAR(32) NOT NULL CHECK(sensor_type IN ('TEMPERATURE', 'HUMIDITY', 'SOIL_MOISTURE', 'LEAF_WETNESS', 'SMART_PEST_TRAP')),
    unit VARCHAR(16) NOT NULL,
    battery_pct INTEGER,
    status VARCHAR(16) DEFAULT 'ONLINE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id VARCHAR(64) PRIMARY KEY,
    sensor_id VARCHAR(64) NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    value DECIMAL(8, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings ON sensor_readings(sensor_id, recorded_at DESC);

-- 14. Outbreak Hotspots & Geospatial Clusters
CREATE TABLE IF NOT EXISTS hotspots (
    id VARCHAR(64) PRIMARY KEY,
    district VARCHAR(64) NOT NULL,
    state VARCHAR(64) NOT NULL,
    centroid_lat DECIMAL(10, 6) NOT NULL,
    centroid_lng DECIMAL(10, 6) NOT NULL,
    radius_km DECIMAL(5, 2) NOT NULL,
    crop_id VARCHAR(32) REFERENCES crops(id),
    pathogen_or_pest_name VARCHAR(128) NOT NULL,
    active_confirmed_cases INTEGER NOT NULL,
    severity VARCHAR(16) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Laboratories & Lab Referrals
CREATE TABLE IF NOT EXISTS laboratories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    district VARCHAR(64) NOT NULL,
    state VARCHAR(64) NOT NULL,
    contact_phone VARCHAR(20),
    accreditation VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS lab_referrals (
    id VARCHAR(64) PRIMARY KEY,
    diagnosis_id VARCHAR(64) NOT NULL REFERENCES diagnoses(id),
    laboratory_id VARCHAR(64) NOT NULL REFERENCES laboratories(id),
    sample_code VARCHAR(64) UNIQUE NOT NULL,
    sample_type VARCHAR(32) NOT NULL,
    status VARCHAR(32) DEFAULT 'IN_TRANSIT' CHECK(status IN ('PENDING_COLLECTION', 'IN_TRANSIT', 'RECEIVED', 'IN_TESTING', 'CONFIRMED', 'INCONCLUSIVE')),
    lab_result_details TEXT,
    tested_by_user_id VARCHAR(64) REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 16. Extension Workers & Field Visits
CREATE TABLE IF NOT EXISTS field_visits (
    id VARCHAR(64) PRIMARY KEY,
    extension_worker_id VARCHAR(64) NOT NULL REFERENCES users(id),
    diagnosis_id VARCHAR(64) REFERENCES diagnoses(id),
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id),
    scheduled_date DATE NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(16) DEFAULT 'HIGH' CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    observations TEXT,
    action_taken TEXT,
    status VARCHAR(32) DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'VISITED', 'REFERRED_TO_LAB', 'RESOLVED'))
);

-- 17. Notifications & Alerts
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    risk_level VARCHAR(16) NOT NULL,
    reason TEXT NOT NULL,
    affected_crop VARCHAR(64),
    recommended_action TEXT,
    location_label VARCHAR(128),
    cooldown_key VARCHAR(128),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Continuous Learning & Retraining Datasets
CREATE TABLE IF NOT EXISTS model_versions (
    version VARCHAR(32) PRIMARY KEY,
    architecture VARCHAR(64) NOT NULL,
    dataset_version VARCHAR(64) NOT NULL,
    confirmed_samples_count INTEGER NOT NULL,
    top1_accuracy DECIMAL(5, 4) NOT NULL,
    macro_f1 DECIMAL(5, 4) NOT NULL,
    precision_score DECIMAL(5, 4) NOT NULL,
    recall_score DECIMAL(5, 4) NOT NULL,
    is_production BOOLEAN DEFAULT FALSE,
    deployed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_user_id VARCHAR(64) REFERENCES users(id),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
