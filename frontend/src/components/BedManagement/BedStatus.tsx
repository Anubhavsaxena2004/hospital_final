import React, { useState, useEffect } from 'react';
import './BedStatus.css';
import { bedAPI } from '../../services/api';

type BedTypeKey = 'general' | 'icu' | 'emergency' | 'pediatric' | 'private';

type BedStats = Record<BedTypeKey, { total: number; occupied: number; available?: number }>; 

const BedStatus: React.FC = () => {
  const [bedData, setBedData] = useState<BedStats>({
    general: { total: 150, occupied: 120 },
    icu: { total: 30, occupied: 28 },
    emergency: { total: 20, occupied: 15 },
    pediatric: { total: 50, occupied: 35 },
    private: { total: 10, occupied: 7 },
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await bedAPI.getBedStats();
        if (isMounted && res?.beds) {
          setBedData(res.beds);
        }
      } catch (e) {
        // Keep fallback demo data on error
        console.warn('Failed to fetch bed stats, using demo data');
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="bed-status-container">
      <h2>Hospital Bed Status</h2>
      <div className="bed-cards">
        {Object.entries(bedData).map(([type, data]) => (
          <div key={type} className={`bed-card ${type}`}>
            <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <div className="bed-progress">
              <div 
                className="progress-bar"
                style={{ width: `${data.total ? (data.occupied / data.total) * 100 : 0}%` }}
              ></div>
            </div>
            <p>
              <span className="occupied">{data.occupied}</span> / 
              <span className="total">{data.total}</span> beds
            </p>
            <p className="available">
              {(data.total - data.occupied)} available
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedStatus;
