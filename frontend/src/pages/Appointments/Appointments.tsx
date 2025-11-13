import React, { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI, patientAPI } from '../../services/api';
import './Appointments.css';

interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: string;
  appointment_type_display: string;
  status: string;
  status_display: string;
  consultation_fee: number;
  is_paid: boolean;
  is_past: boolean;
  is_today: boolean;
}

interface Doctor {
  id: number;
  full_name: string;
  specialization_display: string;
  is_available: boolean;
}

interface Patient {
  id: number;
  full_name: string;
  phone: string;
}

interface AppointmentStats {
  total_appointments: number;
  scheduled_appointments: number;
  confirmed_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  today_appointments: number;
  upcoming_appointments: number;
  total_revenue: number;
  hospital_name: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    doctor: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 30,
    appointment_type: 'consultation',
    symptoms: '',
    notes: '',
    consultation_fee: 0
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
    fetchStats();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments();
      setAppointments(response);
      setFilteredAppointments(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getDoctors();
      setDoctors(response);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getPatients();
      setPatients(response);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await appointmentAPI.getAppointmentStats();
      setStats(response);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const filterAppointmentsByStatus = (status: 'All' | 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled') => {
    setSelectedStatus(status);
    let filtered = appointments;
    
    if (status !== 'All') {
      filtered = appointments.filter(appointment => appointment.status === status.toLowerCase());
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAppointments(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    let filtered = appointments;
    
    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = appointments.filter(appointment => appointment.status === selectedStatus.toLowerCase());
    }
    
    // Apply search filter
    if (term) {
      filtered = filtered.filter(appointment =>
        appointment.patient_name.toLowerCase().includes(term.toLowerCase()) ||
        appointment.doctor_name.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredAppointments(filtered);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await appointmentAPI.createAppointment({
        ...newAppointment,
        patient: parseInt(newAppointment.patient),
        doctor: parseInt(newAppointment.doctor),
        consultation_fee: parseFloat(newAppointment.consultation_fee.toString())
      });
      
      setShowCreateForm(false);
      setNewAppointment({
        patient: '',
        doctor: '',
        appointment_date: '',
        appointment_time: '',
        duration_minutes: 30,
        appointment_type: 'consultation',
        symptoms: '',
        notes: '',
        consultation_fee: 0
      });
      
      // Optimistically add the new appointment to the list
      setAppointments(prev => {
        const updated = [created, ...prev];
        // Recompute filtered view based on current filters
        let filtered = updated;
        if (selectedStatus !== 'All') {
          filtered = filtered.filter(appointment => appointment.status === selectedStatus.toLowerCase());
        }
        if (searchTerm) {
          filtered = filtered.filter(appointment =>
            appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setFilteredAppointments(filtered);
        return updated;
      });
      fetchStats();
    } catch (err: any) {
      const data = err?.data;
      let message = 'Failed to create appointment';
      if (data) {
        if (typeof data === 'string') message = data;
        else if (data.detail) message = data.detail;
        else if (typeof data === 'object') {
          const key = Object.keys(data)[0];
          if (key) {
            const val = Array.isArray(data[key]) ? data[key][0] : data[key];
            message = `${key}: ${val}`;
          }
        }
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
      console.error('Error creating appointment:', data || err);
    }
  };

  const updateAppointmentStatus = async (id: number, newStatus: string) => {
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) return;

      await appointmentAPI.updateAppointment(id, {
        ...appointment,
        status: newStatus
      });

      fetchAppointments();
      fetchStats();
    } catch (err) {
      setError('Failed to update appointment status');
      console.error('Error updating appointment:', err);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentAPI.deleteAppointment(id);
      fetchAppointments();
      fetchStats();
    } catch (err) {
      setError('Failed to cancel appointment');
      console.error('Error deleting appointment:', err);
    }
  };

  if (loading) {
    return <div className="appointments-page">Loading appointments...</div>;
  }

  if (error) {
    return <div className="appointments-page">Error: {error}</div>;
  }

  return (
    <div className="appointments-page">
      <h2>Appointments Management</h2>
      
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Appointments</h3>
            <div className="stat-number">{stats.total_appointments}</div>
            <div className="stat-detail">All time</div>
          </div>
          
          <div className="stat-card">
            <h3>Today's Appointments</h3>
            <div className="stat-number">{stats.today_appointments}</div>
            <div className="stat-detail">Scheduled for today</div>
          </div>
          
          <div className="stat-card">
            <h3>Upcoming</h3>
            <div className="stat-number">{stats.upcoming_appointments}</div>
            <div className="stat-detail">Next 7 days</div>
          </div>
          
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <div className="stat-number">${stats.total_revenue}</div>
            <div className="stat-detail">From paid appointments</div>
          </div>
        </div>
      )}
      
      <div className="appointment-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className="appointment-status-filter">
          <button 
            className={selectedStatus === 'All' ? 'active' : ''}
            onClick={() => filterAppointmentsByStatus('All')}
          >
            All Appointments
          </button>
          <button 
            className={selectedStatus === 'Scheduled' ? 'active' : ''}
            onClick={() => filterAppointmentsByStatus('Scheduled')}
          >
            Scheduled ({stats?.scheduled_appointments || 0})
          </button>
          <button 
            className={selectedStatus === 'Confirmed' ? 'active' : ''}
            onClick={() => filterAppointmentsByStatus('Confirmed')}
          >
            Confirmed ({stats?.confirmed_appointments || 0})
          </button>
          <button 
            className={selectedStatus === 'Completed' ? 'active' : ''}
            onClick={() => filterAppointmentsByStatus('Completed')}
          >
            Completed ({stats?.completed_appointments || 0})
          </button>
          <button 
            className={selectedStatus === 'Cancelled' ? 'active' : ''}
            onClick={() => filterAppointmentsByStatus('Cancelled')}
          >
            Cancelled ({stats?.cancelled_appointments || 0})
          </button>
        </div>
        
        <button 
          className="create-appointment-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Create New Appointment
        </button>
      </div>

      {showCreateForm && (
        <div className="create-appointment-form">
          <h3>Create New Appointment</h3>
          <form onSubmit={handleCreateAppointment}>
            <div className="form-row">
              <div className="form-group">
                <label>Patient:</label>
                <select
                  value={newAppointment.patient}
                  onChange={(e) => setNewAppointment({...newAppointment, patient: e.target.value})}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Doctor:</label>
                <select
                  value={newAppointment.doctor}
                  onChange={(e) => setNewAppointment({...newAppointment, doctor: e.target.value})}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name} - {doctor.specialization_display}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={newAppointment.appointment_date}
                  onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Time:</label>
                <input
                  type="time"
                  value={newAppointment.appointment_time}
                  onChange={(e) => setNewAppointment({...newAppointment, appointment_time: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Duration (minutes):</label>
                <input
                  type="number"
                  value={newAppointment.duration_minutes}
                  onChange={(e) => setNewAppointment({...newAppointment, duration_minutes: parseInt(e.target.value)})}
                  min="15"
                  max="120"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={newAppointment.appointment_type}
                  onChange={(e) => setNewAppointment({...newAppointment, appointment_type: e.target.value})}
                  required
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine_checkup">Routine Checkup</option>
                  <option value="surgery">Surgery</option>
                  <option value="lab_test">Lab Test</option>
                  <option value="imaging">Imaging</option>
                  <option value="therapy">Therapy</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Consultation Fee:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAppointment.consultation_fee}
                  onChange={(e) => setNewAppointment({...newAppointment, consultation_fee: parseFloat(e.target.value)})}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Symptoms:</label>
              <textarea
                value={newAppointment.symptoms}
                onChange={(e) => setNewAppointment({...newAppointment, symptoms: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="form-actions">
              <button type="submit">Create Appointment</button>
              <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="appointments-list">
        <h3>{selectedStatus} Appointments ({filteredAppointments.length})</h3>
        <div className="appointments-grid">
          {filteredAppointments.map(appointment => (
            <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
              <div className="appointment-header">
                <span className="appointment-id">ID: {appointment.id}</span>
                <span className={`appointment-status ${appointment.status}`}>
                  {appointment.status_display}
                </span>
              </div>
              
              <div className="appointment-info">
                <div className="appointment-patient">
                  <strong>Patient:</strong> {appointment.patient_name}
                </div>
                <div className="appointment-doctor">
                  <strong>Doctor:</strong> {appointment.doctor_name}
                </div>
                <div className="appointment-datetime">
                  <strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}
                </div>
                <div className="appointment-time">
                  <strong>Time:</strong> {appointment.appointment_time}
                </div>
                <div className="appointment-duration">
                  <strong>Duration:</strong> {appointment.duration_minutes} minutes
                </div>
                <div className="appointment-type">
                  <strong>Type:</strong> {appointment.appointment_type_display}
                </div>
                <div className="appointment-fee">
                  <strong>Fee:</strong> ${appointment.consultation_fee}
                  {appointment.is_paid && <span className="paid-badge">Paid</span>}
                </div>
                {appointment.is_today && <span className="today-badge">Today</span>}
              </div>
              
              <div className="appointment-actions">
                {appointment.status === 'scheduled' && (
                  <button 
                    className="confirm-btn"
                    onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                  >
                    Confirm
                  </button>
                )}
                
                {appointment.status === 'confirmed' && (
                  <button 
                    className="complete-btn"
                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                  >
                    Complete
                  </button>
                )}
                
                {['scheduled', 'confirmed'].includes(appointment.status) && (
                  <button 
                    className="cancel-btn"
                    onClick={() => deleteAppointment(appointment.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredAppointments.length === 0 && (
          <div className="no-appointments">
            <p>No appointments found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
