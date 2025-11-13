// src/pages/Home.tsx
import React from 'react';
import HospitalQuickStats from '../../components/HospitalQuickStats';
import RecentActivity from '../../components/RecentActivity';
import EmergencyContacts from '../../components/EmergencyContacts';

import './Home.css';
import Appointments from '../Appointments/Appointments';
import ImportantLinksNew from '../../components/ImportantLinksNew';
import GovernmentInitiativesCarousel from '../../components/GovernmentInitiativesCarousel';
const Home = () => {
  return (
    <div className="home-page">
      <header className="welcome-banner">
        <h1>Hospital Management System</h1>
        <p>Efficient healthcare administration at your fingertips</p>
      </header>

      <div className="dashboard-grid">
        {/* Quick Stats Cards */}
        <HospitalQuickStats />

        

        {/* Recent Activities */}
        <RecentActivity />

        {/* Emergency Contacts */}
        <EmergencyContacts />

        {/* Quick Access Buttons */}
        <div className="quick-actions">
          <a href="/registration" className="action-card">
            <img src="/images/patient.jpg" alt="Patient Registration" className="action-image standard-image image-large" />
            <h3 className="standard-heading text-large">Patient Registration</h3>
            <p className="standard-text text-medium">Register new patients</p>
          </a>
          <a href="/doctors" className="action-card">
            <img src="/images/doctor.avif" alt="Doctor Management" className="action-image standard-image image-large" />
            <h3 className="standard-heading text-large">Doctor Management</h3>
            <p className="standard-text text-medium">View doctor schedules</p>
          </a>
          <a href="/beds" className="action-card">
            <img src="/images/bed.jpg" alt="Bed Availability" className="action-image standard-image image-large" />
            <h3 className="standard-heading text-large">Bed Availability</h3>
            <p className="standard-text text-medium">Check bed status</p>
          </a>
          <a href="/hospital-dashboard" className="action-card">
            <img src="/images/hospital managemet.png" alt="Hospital Admin" className="action-image standard-image image-large" />
            <h3 className="standard-heading text-large">Hospital Admin</h3>
            <p className="standard-text text-medium">Manage hospital data</p>
          </a>
        </div>

        {/* Quick Access Buttons 2 */}
        <div className="quick-actions">
          <a href="/appointments" className="action-card">
            <img src="/images/Appoinment.jpeg" alt="Appointments" className="action-image standard-image image-large" />
            <h3 className="standard-heading text-large">Appointments</h3>
            <p className="standard-text text-medium">Manage patient appointments</p>
          </a>
          <a href="/emergency" className="action-card">
            <img src="/images/Emergency cases.jpg" alt="Emergency Cases" className="action-image standard-image image-large" />
            <h3 className="standard-heading text-large">Emergency Cases</h3>
            <p className="standard-text text-medium">View emergency cases</p>
          </a>
          <a href="/reports" className="action-card">
            <img src="/images/Reports.jpeg" alt="Reports" className="action-image standard-image image-large" />
            <h3 className="standard-heading text-large">Reports</h3>
            <p className="standard-text text-medium">View and generate reports</p>
          </a>
          <a href="/news" className="action-card">
            <img src="/images/news.jpeg" alt="Today's News" className="action-image standard-image image-large" />
            <h3 className="standard-heading text-large">Today's News</h3>
            <p className="standard-text text-medium">Stay updated with the latest news</p>
          </a>
        </div>
         {/* Important Links */}
         <ImportantLinksNew />


         {/* Other home page content */}
      <GovernmentInitiativesCarousel />
      {/* More content */}
      </div>
    </div>
  );
};

export default Home;
