import React, { useState, useEffect } from 'react';
import './TokenGenerator.css';

interface TokenGeneratorProps {
  doctor: string;
  department: string;
}

const TokenGenerator: React.FC<TokenGeneratorProps> = ({ doctor, department }) => {
  const [token, setToken] = useState<string>('');
  const [queue, setQueue] = useState<string[]>([]);
  const [currentToken, setCurrentToken] = useState<string>('');

  useEffect(() => {
    // Simulate live queue updates
    const interval = setInterval(() => {
      setQueue(prev => {
        if(prev.length > 0 && Math.random() > 0.7) {
          setCurrentToken(prev[0]);
          return prev.slice(1);
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const generateToken = () => {
    const newToken = `T-${department.slice(0,3)}-${Date.now().toString().slice(-4)}`;
    setToken(newToken);
    setQueue(prev => [...prev, newToken]);
  };

  return (
    <div className="token-container">
      <div className="token-display">
        {token && <div className="your-token">Your Token: {token}</div>}
        <div className="current-token">Now Serving: {currentToken || '--'}</div>
      </div>

      <button onClick={generateToken} className="generate-btn">
        Get Token
      </button>

      <div className="queue-status">
        <h4>Queue Status</h4>
        <div className="queue-list">
          {queue.map((t, i) => (
            <div key={t} className="queue-item">
              <span>#{i+1}</span> {t}
            </div>
          ))}
          {queue.length === 0 && <p>No patients in queue</p>}
        </div>
      </div>
    </div>
  );
};

export default TokenGenerator;
