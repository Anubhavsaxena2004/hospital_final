// src/App.tsx
import React, { JSX, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import Home from './pages/Home/Home';
import Doctors from './pages/Doctors/Doctors';
import Appointments from './pages/Appointments/Appointments';
import Beds from './pages/Beds/Beds';
import EmergencyPage from './pages/Emergency/EmergencyPage';
import HospitalDashboard from './pages/HospitalDashboard';
import FlipCard from './pages/RegistrationForm/FlipCard'; // Your login/register component
import AuthContext, { AuthProvider } from './context/AuthContext';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// A wrapper to protect routes that require authentication
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  // If there's no user, redirect to the login page
  return user ? children : <Navigate to="/register" />;
};

// Admin-only route guard
const AdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/register" />;
  return user.role === 'admin' ? children : <Navigate to="/" />;
};

// Separate component that uses the context
const AppContent: React.FC = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-container">
      <NavigationBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* If the user is logged in, redirect from /register to home */}
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <div style={{ paddingTop: '0px' }}><FlipCard /></div>}
          />

          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/beds" element={<Beds />} />
          <Route path="/emergency" element={<EmergencyPage />} />

          {/* Protect the dashboard route for admins only */}
          <Route
            path="/hospital-dashboard"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <HospitalDashboard />
                </AdminRoute>
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
