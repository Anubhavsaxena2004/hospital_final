// src/components/NavigationBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NavigationBar.css';
import logo from '../logo.svg';
import AuthContext from '../context/AuthContext';

import  { useContext } from 'react';
const NavigationBar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  return (
    <nav className="navigation-bar">
      <div className="logo-container">
        <img src="/images/LOGO.png" alt="Hospital Logo" className="logo" />
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        {/* <li><Link to="/register">Registration</Link></li> */}
        <li><Link to="/doctors">Doctors</Link></li>
        <li><Link to="/beds">Beds</Link></li>
        {user?.role === 'admin' && (
          <li><Link to="/hospital-dashboard">Hospital Admin</Link></li>
        )}
        <li><Link to="/appointments">Appointments</Link></li>
        <li><Link to="/emergency">Emergency</Link></li>

      </ul>
      {user ? (
        <button onClick={logoutUser}>Logout</button>
      ) : (
        <Link to="/register">Login</Link>
      )}
    </nav>
  );
};

export default NavigationBar;
