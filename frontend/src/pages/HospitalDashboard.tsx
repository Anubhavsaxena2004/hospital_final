import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import PatientManagement from './PatientManagement';
import DoctorManagement from './DoctorManagement';
import AppointmentManagement from './AppointmentManagement';
import StaffManagement from './StaffManagement';
import ReportGeneration from './ReportGeneration';
import './HospitalDashboard.css';

// Define TypeScript interfaces
interface PatientStats {
  total_patients: number;
  recent_patients_30_days: number;
  // Add other properties as needed
}

const HospitalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);

  // Fetch patient statistics
  const fetchPatientStats = async () => {
    try {
      const data = await patientAPI.getPatientStats();
      setPatientStats(data);
    } catch (err) {
      console.error('Error fetching patient stats:', err);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchPatientStats();
    }
  }, [activeTab]);

  return (
    <div className="hospital-dashboard">
      <h1>Hospital Administration Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'patients' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('patients')}
        >
          Patients
        </button>
        <button 
          className={activeTab === 'staff' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('staff')}
        >
          Staff
        </button>
        <button
          className={activeTab === 'appointments' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button
          className={activeTab === 'reports' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>
      
      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Patients</h3>
              <div className="stat-number">{patientStats ? patientStats.total_patients : 'Loading...'}</div>
              <div className="stat-detail">
                {patientStats ? `${patientStats.recent_patients_30_days} this month` : ''}
              </div>
            </div>
            
            <div className="stat-card">
              <h3>Available Beds</h3>
              <div className="stat-number">120</div>
              <div className="stat-detail">78% occupancy</div>
            </div>
            
            <div className="stat-card">
              <h3>Doctors On Duty</h3>
              <div className="stat-number">28</div>
              <div className="stat-detail">12 specialists</div>
            </div>
            
            <div className="stat-card">
              <h3>Appointments Today</h3>
              <div className="stat-number">156</div>
              <div className="stat-detail">32 completed</div>
            </div>
          </div>
          
          <div className="dashboard-sections">
            <div className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button
                  className="action-btn"
                  onClick={() => setActiveTab('patients')}
                >
                  Add Patient
                </button>
                <button
                  className="action-btn"
                  onClick={() => setActiveTab('appointments')}
                >
                  Schedule Appointment
                </button>
                <button
                  className="action-btn"
                  onClick={() => setActiveTab('reports')}
                >
                  Generate Report
                </button>
                <button
                  className="action-btn"
                  onClick={() => setActiveTab('staff')}
                >
                  Manage Staff
                </button>
              </div>
            </div>
            
            <div className="dashboard-section">
              <h2>Recent Activity</h2>
              <ul className="activity-list">
                <li>New patient registered - John Doe</li>
                <li>Appointment completed with Dr. Smith</li>
                <li>Bed assigned in Ward B</li>
                <li>Lab results ready for patient #1234</li>
                <li>New doctor added to the system</li>
              </ul>
            </div>
          </div>
        </>
      )}
      
      {/* Patients Tab Content */}
      {activeTab === 'patients' && <PatientManagement />}

      {/* Staff Tab Content */}
      {activeTab === 'staff' && <StaffManagement />}

      {/* Appointments Tab Content */}
      {activeTab === 'appointments' && <AppointmentManagement />}

      {/* Reports Tab Content */}
      {activeTab === 'reports' && <ReportGeneration />}
      

    </div>
  );
};

export default HospitalDashboard;