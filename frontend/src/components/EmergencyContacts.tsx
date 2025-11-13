// src/components/EmergencyContacts.tsx
import React from 'react';
import './EmergencyContacts.css';

const EmergencyContacts = () => {
  return (
    <div className="emergency-card">
      <h2>Emergency Contacts</h2>
      <ul>
        <li>
          <span>Emergency:</span>
          <span>+1 555-123-4567</span>
        </li>
        <li>
          <span>Ambulance:</span>
          <span>+1 555-987-6543</span>
        </li>
        <li>
          <span>Administration:</span>
          <span>+1 555-789-0123</span>
        </li>
      </ul>
    </div>
  );
};

export default EmergencyContacts;