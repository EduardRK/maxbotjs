import React, { useState, useEffect } from 'react';
import './Welcome.css';

const Welcome = ({ user, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showDots, setShowDots] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => setShowHeader(true), 300);
    setTimeout(() => setShowMessage(true), 600);
    setTimeout(() => setShowDots(true), 900);
    setTimeout(() => setShowButton(true), 1200);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  return (
    <div className={`welcome-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`welcome-modal ${isVisible ? 'visible' : ''}`}>
        
        <div className={`welcome-header ${showHeader ? 'visible' : ''}`}>
          <h1 className="welcome-title">
            Привет! 👋
          </h1>
          <div className="welcome-divider"></div>
        </div>

        <div className={`welcome-message ${showMessage ? 'visible' : ''}`}>
          <p className="welcome-text">
            {user.motivational_message}
          </p>
          <p className="welcome-subtext">
            Готовы сделать сегодняшний день продуктивным?
          </p>
        </div>

        <div className={`welcome-dots ${showDots ? 'visible' : ''}`}>
          <div className="welcome-dot"></div>
          <div className="welcome-dot"></div>
          <div className="welcome-dot"></div>
        </div>

        <div className={`welcome-button-container ${showButton ? 'visible' : ''}`}>
          <button
            onClick={handleClose}
            className="welcome-button"
          >
            Начать работу!
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;