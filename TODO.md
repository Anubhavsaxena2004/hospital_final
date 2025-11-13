# Hospital Management System Refactoring TODO

## Phase 1: Component Extraction and Renaming
- [x] Extract PatientManagement component from HospitalDashboard.tsx
- [x] Rename Doctors.tsx to DoctorManagement.tsx
- [x] Rename Appointments.tsx to AppointmentManagement.tsx

## Phase 2: Backend Staff Implementation
- [x] Create Staff model in backend/staff/models.py
- [x] Create backend/staff/serializers.py
- [x] Implement CRUD views in backend/staff/views.py
- [x] Create backend/staff/urls.py
- [x] Create and run migrations for Staff model
- [x] Update backend main urls.py to include staff URLs

## Phase 3: Frontend API Updates
- [x] Add staff API endpoints to frontend/src/services/api.ts
- [x] Add reports API endpoints to frontend/src/services/api.ts

## Phase 4: New Components Creation
- [x] Create StaffManagement.tsx component
- [x] Create ReportGeneration.tsx component

## Phase 5: Dashboard Refactoring
- [x] Refactor HospitalDashboard.tsx to use new components
- [x] Update tab navigation and imports

## Phase 6: Testing and Integration
- [ ] Test all new components
- [ ] Verify API endpoints functionality
- [ ] Ensure proper component integration
