-- CropGuard AI - Database Seed Script (Synthetic Benchmark Data for SIH Prototype)

INSERT INTO crops (id, name, scientific_name, category) VALUES
('rice', 'Rice (Paddy)', 'Oryza sativa', 'Cereal'),
('wheat', 'Wheat', 'Triticum aestivum', 'Cereal'),
('cotton', 'Cotton', 'Gossypium hirsutum', 'Cash'),
('potato', 'Potato', 'Solanum tuberosum', 'Vegetable'),
('tomato', 'Tomato', 'Solanum lycopersicum', 'Vegetable')
ON CONFLICT DO NOTHING;

INSERT INTO users (id, name, phone, email, role, preferred_language, state, district, village) VALUES
('farmer-101', 'Rameshwar Mahato', '+919845123410', 'rameshwar.farmer@krishi.demo', 'FARMER', 'bn', 'West Bengal', 'Purba Bardhaman', 'Galsi'),
('farmer-102', 'Gurpreet Singh', '+919814088231', 'gurpreet.singh@krishi.demo', 'FARMER', 'hi', 'Punjab', 'Ludhiana', 'Samrala'),
('ext-201', 'Ananya Roy', '+919433145892', 'ananya.roy@agri.wb.gov.in', 'EXTENSION_WORKER', 'en', 'West Bengal', 'Purba Bardhaman', 'Burdwan HQ'),
('expert-301', 'Dr. Vivek Sharma', '+919711054321', 'v.sharma@icar.kvk.demo', 'EXPERT', 'en', 'West Bengal', 'Purba Bardhaman', 'KVK Burdwan'),
('lab-401', 'Pooja Deshmukh', '+919654011984', 'lab.pathology@agri.gov.in', 'LAB_STAFF', 'en', 'West Bengal', 'Kalyani Lab HQ', 'Kalyani'),
('admin-501', 'Dr. S. K. Mukherjee', '+919900012345', 'director.agri@gov.demo', 'ADMIN', 'en', 'West Bengal', 'Kolkata HQ', 'Writers Building')
ON CONFLICT DO NOTHING;

INSERT INTO farmers (id, user_id, total_landholding_acres) VALUES
('farmer-101', 'farmer-101', 5.5),
('farmer-102', 'farmer-102', 12.0)
ON CONFLICT DO NOTHING;

INSERT INTO farms (id, farmer_id, farm_name, total_area_acres, latitude, longitude, soil_type) VALUES
('farm-01', 'farmer-101', 'North Damodar Plot #3', 3.5, 23.2324, 87.8615, 'Alluvial Loam'),
('farm-02', 'farmer-102', 'Samrala Wheat Block A', 8.0, 30.9010, 75.8573, 'Sandy Loam')
ON CONFLICT DO NOTHING;

INSERT INTO model_versions (version, architecture, dataset_version, confirmed_samples_count, top1_accuracy, macro_f1, precision_score, recall_score, is_production, deployed_at) VALUES
('v2.4.1', 'MobileNetV3-Small', 'DS-2026.08-CONFIRMED', 42850, 0.9420, 0.9310, 0.9380, 0.9250, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
