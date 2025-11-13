-- Recommended PostgreSQL indexes for Hospital + Map projects

-- Incidents (map)
CREATE INDEX IF NOT EXISTS ix_incidents_patient_point ON incidents (patient_lat, patient_lng);
CREATE INDEX IF NOT EXISTS ix_incidents_status_created_at ON incidents (status, created_at);
CREATE INDEX IF NOT EXISTS ix_incidents_emergency_level ON incidents (emergency_level);

-- Ambulance telemetry
CREATE INDEX IF NOT EXISTS ix_ambulance_is_available ON ambulance_data (is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS ix_ambulance_last_ping ON ambulance_data (last_ping_time);
CREATE INDEX IF NOT EXISTS ix_ambulance_location ON ambulance_data (current_location_lat, current_location_lng);

-- Beds
CREATE INDEX IF NOT EXISTS ix_beds_hospital_is_occupied ON beds (hospital_id, is_occupied);
CREATE INDEX IF NOT EXISTS ix_beds_reserved_incident ON beds (reserved_incident_id);

-- Emergency incidents
CREATE INDEX IF NOT EXISTS ix_emergencyincident_incident ON emergency_incidents (incident_id);

-- Hospitals geo
CREATE INDEX IF NOT EXISTS ix_hospitals_lat_lng ON hospitals (lat, lng);
