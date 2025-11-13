import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';

// Define TypeScript interfaces
interface Patient {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  phone: string;
  is_active: boolean;
  // Add other properties as needed
}

interface PatientStats {
  total_patients: number;
  recent_patients_30_days: number;
  // Add other properties as needed
}

interface NewPatient {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_history: string;
  allergies: string;
}

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState<NewPatient>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_history: '',
    allergies: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch patient data from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getPatients();
      setPatients(data);
    } catch (err) {
      setError('Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient statistics
  const fetchPatientStats = async () => {
    try {
      const data = await patientAPI.getPatientStats();
      setPatientStats(data);
    } catch (err) {
      console.error('Error fetching patient stats:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPatient({
      ...newPatient,
      [name]: value
    });
  };

  // Submit new patient form
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const created = await patientAPI.createPatient(newPatient);
      setShowAddPatientModal(false);
      setSuccess(created?.id ? `Patient #${created.id} added successfully.` : 'Patient added successfully.');
      setError('');
      setNewPatient({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        phone: '',
        email: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        medical_history: '',
        allergies: ''
      });
      fetchPatients(); // Refresh the patient list
      fetchPatientStats(); // Refresh stats
    } catch (err: any) {
      let message = 'Failed to add patient';
      const status = err?.status;
      const data = err?.data;
      if (status === 401) {
        message = 'Unauthorized. Please log in again.';
      } else if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else if (typeof data === 'object') {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const key = keys[0];
            const val = Array.isArray((data as any)[key]) ? (data as any)[key][0] : (data as any)[key];
            message = `${key}: ${val}`;
          }
        }
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
      console.error('Error adding patient:', data || err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchPatients();
    fetchPatientStats();
  }, []);

  return (
    <div className="patients-section">
      <div className="section-header">
        <h2>Patient Management</h2>
        <button
          className="btn-primary"
          onClick={() => setShowAddPatientModal(true)}
        >
          Add New Patient
        </button>
      </div>

      {loading && <div className="loading">Loading patients...</div>}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="patients-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood Group</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.id}>
                <td>{patient.full_name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</td>
                <td>{patient.blood_group || 'N/A'}</td>
                <td>{patient.phone}</td>
                <td>
                  <span className={`status ${patient.is_active ? 'active' : 'inactive'}`}>
                    {patient.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn-sm">View</button>
                  <button className="btn-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Patient</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddPatientModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="patient-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={newPatient.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={newPatient.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={newPatient.date_of_birth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={newPatient.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Blood Group</label>
                  <select
                    name="blood_group"
                    value={newPatient.blood_group}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newPatient.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newPatient.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={newPatient.address}
                  onChange={handleInputChange}
                  rows={3}
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={newPatient.emergency_contact_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={newPatient.emergency_contact_phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Medical History</label>
                <textarea
                  name="medical_history"
                  value={newPatient.medical_history}
                  onChange={handleInputChange}
                  rows={3}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Allergies</label>
                <textarea
                  name="allergies"
                  value={newPatient.allergies}
                  onChange={handleInputChange}
                  rows={2}
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddPatientModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
