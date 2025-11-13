import React, { useState } from 'react';
// import EmergencyForm from '../../components/EmergencyBiodata/EmergencyForm';
import BedStatus from '../../components/BedManagement/BedStatus';
// import PatientList from '../../components/BedManagement/PatientList';
import './EmergencyPage.css';

interface EmergencyCase {
  id: number;
  admissionTime: string;
  status: string;
  [key: string]: any;
}

const EmergencyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('form');
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>([]);

  const handleNewCase = (caseData: Omit<EmergencyCase, 'id' | 'admissionTime' | 'status'>) => {
    setEmergencyCases(prev => [...prev, {
      ...caseData,
      id: Date.now(),
      admissionTime: new Date().toLocaleString(),
      status: 'Pending'
    }]);
    setActiveTab('cases');
  };

  return (
    <div className="emergency-page">
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('form')}
          className={activeTab === 'form' ? 'active' : ''}
        >
          New Emergency Case
        </button>
        <button 
          onClick={() => setActiveTab('cases')}
          className={activeTab === 'cases' ? 'active' : ''}
        >
          Current Cases ({emergencyCases.length})
        </button>
        <button 
          onClick={() => setActiveTab('beds')}
          className={activeTab === 'beds' ? 'active' : ''}
        >
          Bed Status
        </button>
      </div>

      {activeTab === 'form' && (
        <div>
          {/* EmergencyForm component is missing */}
          <p>Emergency form component is not available.</p>
        </div>
      )}

      {activeTab === 'cases' && (
        <div className="cases-container">
          <h2>Active Emergency Cases</h2>
          <div>
            {/* PatientList component is missing */}
            <p>Patient list component is not available.</p>
          </div>
        </div>
      )}

      {activeTab === 'beds' && (
        <div className="beds-container">
          <BedStatus />
          <div className="department-view">
            <h3>ICU Patients</h3>
            {/* ICU specific components */}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPage;
