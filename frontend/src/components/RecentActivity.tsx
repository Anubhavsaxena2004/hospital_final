// src/components/RecentActivity.tsx
import React from 'react';
import './RecentActivity.css';


const RecentActivity = () => {
  return (
    <div className="activity-card">
      <h2>Recent Activity</h2>
      <ul>
        <li>
          <span className="activity-action">New patient registered</span>
          <span className="activity-time">10 mins ago</span>
        </li>
        <li>
          <span className="activity-action">Bed status updated</span>
          <span className="activity-time">25 mins ago</span>
        </li>
        <li>
          <span className="activity-action">Doctor shift changed</span>
          <span className="activity-time">1 hour ago</span>
        </li>
      </ul>
    </div>
  );
};

export default RecentActivity;