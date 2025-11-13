// src/components/HospitalQuickStats.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './HospitalQuickStats.css';

const HospitalQuickStats = () => {
  return (
    <div className="stats-container">
      {/* Beds Card */}
      <Link to="/beds" className="stat-card">
        <h3>Total Beds</h3>
        <p className="stat-value">450</p>
        <p className="stat-subtext">120 available</p>
      </Link>

      {/* Doctors Card */}
      <Link to="/doctors" className="stat-card">
        <h3>Doctors On Duty</h3>
        <p className="stat-value">28</p>
      </Link>

      {/* Appointments Card */}
      <Link to="/Appointments" className="stat-card">  {/* ✅ fixed lowercase */}
        <h3>Today's Appointments</h3>
        <p className="stat-value">156</p>
      </Link>

     {/* Emergency Cases Card */}
<Link to="/emergency" className="stat-card">
  <h3>Emergency Cases</h3>
  <p className="stat-value">12</p>
</Link>

    </div>
  );
};

export default HospitalQuickStats;
