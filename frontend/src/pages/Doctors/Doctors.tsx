// src/pages/Doctors.tsx
import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import './Doctors.css';

interface Doctor {
  id: number;
  full_name: string;
  specialization: string;
  specialization_display: string;
  license_number: string;
  experience_years: number;
  phone: string;
  email: string;
  consultation_fee: number;
  is_available: boolean;
  is_active: boolean;
}

interface DoctorStats {
  total_doctors: number;
  available_doctors: number;
  specialization_distribution: { [key: string]: number };
  recent_doctors_30_days: number;
  average_consultation_fee: number;
  hospital_name: string;
}

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Available' | 'Unavailable'>('All');
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchStats();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getDoctors();
      setDoctors(response);
      setFilteredDoctors(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch doctors');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await doctorAPI.getDoctorStats();
      setStats(response);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const filterDoctorsByStatus = (status: 'All' | 'Available' | 'Unavailable') => {
    setSelectedStatus(status);
    let filtered = doctors;
    
    if (status === 'Available') {
      filtered = doctors.filter(doctor => doctor.is_available);
    } else if (status === 'Unavailable') {
      filtered = doctors.filter(doctor => !doctor.is_available);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization_display.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.license_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredDoctors(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    let filtered = doctors;
    
    // Apply status filter
    if (selectedStatus === 'Available') {
      filtered = doctors.filter(doctor => doctor.is_available);
    } else if (selectedStatus === 'Unavailable') {
      filtered = doctors.filter(doctor => !doctor.is_available);
    }
    
    // Apply search filter
    if (term) {
      filtered = filtered.filter(doctor =>
        doctor.full_name.toLowerCase().includes(term.toLowerCase()) ||
        doctor.specialization_display.toLowerCase().includes(term.toLowerCase()) ||
        doctor.license_number.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredDoctors(filtered);
  };

  const toggleDoctorAvailability = async (id: number) => {
    try {
      const doctor = doctors.find(d => d.id === id);
      if (!doctor) return;

      const updatedDoctor = await doctorAPI.updateDoctor(
        id,
        { is_available: !doctor.is_available },
        true
      );

      setDoctors(doctors.map(d => d.id === id ? updatedDoctor : d));
      filterDoctorsByStatus(selectedStatus);
      fetchStats(); // Refresh stats
    } catch (err: any) {
      const msg = err?.data?.detail || err?.data || err?.message || 'Failed to update doctor availability';
      setError(typeof msg === 'string' ? msg : 'Failed to update doctor availability');
      console.error('Error updating doctor:', err);
    }
  };

  const deleteDoctor = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this doctor?')) {
      return;
    }

    try {
      await doctorAPI.deleteDoctor(id);
      setDoctors(doctors.filter(d => d.id !== id));
      filterDoctorsByStatus(selectedStatus);
      fetchStats(); // Refresh stats
    } catch (err: any) {
      const msg = err?.data?.detail || err?.data || err?.message || 'Failed to deactivate doctor';
      setError(typeof msg === 'string' ? msg : 'Failed to deactivate doctor');
      console.error('Error deleting doctor:', err);
    }
  };

  if (loading) {
    return <div className="doctors-container">Loading doctors...</div>;
  }

  if (error) {
    return <div className="doctors-container">Error: {error}</div>;
  }

  return (
    <div className="doctors-container">
      <h1>Doctors Management</h1>
      
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Doctors</h3>
            <div className="stat-number">{stats.total_doctors}</div>
            <div className="stat-detail">{stats.available_doctors} available</div>
          </div>
          
          <div className="stat-card">
            <h3>Available</h3>
            <div className="stat-number">{stats.available_doctors}</div>
            <div className="stat-detail">Active now</div>
          </div>
          
          <div className="stat-card">
            <h3>Unavailable</h3>
            <div className="stat-number">{stats.total_doctors - stats.available_doctors}</div>
            <div className="stat-detail">Not available</div>
          </div>
          
          <div className="stat-card">
            <h3>Avg. Consultation Fee</h3>
            <div className="stat-number">${stats.average_consultation_fee}</div>
            <div className="stat-detail">Per appointment</div>
          </div>
        </div>
      )}
      
      <div className="doctor-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className="doctor-status-filter">
          <button 
            className={selectedStatus === 'All' ? 'active' : ''}
            onClick={() => filterDoctorsByStatus('All')}
          >
            All Doctors
          </button>
          <button 
            className={selectedStatus === 'Available' ? 'active' : ''}
            onClick={() => filterDoctorsByStatus('Available')}
          >
            Available ({stats?.available_doctors || 0})
          </button>
          <button 
            className={selectedStatus === 'Unavailable' ? 'active' : ''}
            onClick={() => filterDoctorsByStatus('Unavailable')}
          >
            Unavailable ({(stats?.total_doctors || 0) - (stats?.available_doctors || 0)})
          </button>
        </div>
      </div>
      
      <div className="doctors-list">
        <h2>{selectedStatus} Doctors ({filteredDoctors.length})</h2>
        <div className="doctors-grid">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className={`doctor-card ${doctor.is_available ? 'available' : 'unavailable'}`}>
              <div className="doctor-header">
                <span className="doctor-id">ID: {doctor.id}</span>
                <span className="doctor-status">{doctor.is_available ? 'Available' : 'Unavailable'}</span>
              </div>
              <div className="doctor-name">{doctor.full_name}</div>
              <div className="doctor-info">
                <div className="doctor-specialty">{doctor.specialization_display}</div>
                <div className="doctor-license">License: {doctor.license_number}</div>
                <div className="doctor-experience">Experience: {doctor.experience_years} years</div>
                <div className="doctor-fee">Consultation Fee: ${doctor.consultation_fee}</div>
                <div className="doctor-contact">
                  <div>Phone: {doctor.phone}</div>
                  <div>Email: {doctor.email}</div>
                </div>
              </div>
              <div className="doctor-actions">
                <button 
                  className="status-toggle"
                  onClick={() => toggleDoctorAvailability(doctor.id)}
                >
                  {doctor.is_available ? 'Set Unavailable' : 'Set Available'}
                </button>
                <button 
                  className="remove-doctor"
                  onClick={() => deleteDoctor(doctor.id)}
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredDoctors.length === 0 && (
          <div className="no-doctors">
            <p>No doctors found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;