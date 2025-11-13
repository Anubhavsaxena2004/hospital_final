import React, { useState } from 'react';
import './FlipCard.css';
import './RegistrationPage.css';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';



const FlipCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="registration-page-container">
      <div className="flip-container registration-page" style={{ marginTop: '0px' }}>
        <div className={`flipper ${isFlipped ? 'flipped' : ''}`}>
          <div className="front">
            <LoginForm onFlip={handleFlip} />
          </div>
          <div className="back">
            <RegisterForm onFlip={handleFlip} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
