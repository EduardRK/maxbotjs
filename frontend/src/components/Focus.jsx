import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Square, Plus, Minus } from 'lucide-react';
import './Focus.css';

const Focus = ({ isOpen, onClose }) => {
  const [focusTime, setFocusTime] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const modalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(focusTime * 60);
      setIsCompleted(false);
    }
  }, [focusTime, isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, timeLeft]);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      handleClose();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    console.log('Starting timer');
    setIsRunning(true);
    setIsCompleted(false);
  };

  const handleReset = () => {
    console.log('Resetting timer');
    setIsRunning(false);
    setTimeLeft(focusTime * 60);
    setIsCompleted(false);
  };

  const increaseTime = () => {
    if (focusTime < 60 && !isRunning) {
      setFocusTime(prev => Math.min(prev + 5, 60));
    }
  };

  const decreaseTime = () => {
    if (focusTime > 5 && !isRunning) {
      setFocusTime(prev => Math.max(prev - 5, 5));
    }
  };

  const getProgress = () => {
    return ((focusTime * 60 - timeLeft) / (focusTime * 60)) * 100;
  };

  const getStrokeDasharray = () => {
    const circumference = 2 * Math.PI * 45;
    const progress = getProgress();
    return `${(progress * circumference) / 100} ${circumference}`;
  };

  const handleClose = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={`focus-modal ${isRunning ? 'focus-modal-active' : ''}`}>
      <div className="focus-container" ref={modalRef}>
        <div className="focus-header">
          <h2 className="focus-title">
            Режим фокуса 
            {isRunning && <span className="focus-active-indicator"> • Активен</span>}
          </h2>
          <button
            onClick={handleClose}
            className="focus-close-btn"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="focus-content">
          <div className="focus-timer-section">
            <div className="focus-timer-wrapper">
              <div className="focus-timer-circle">
                <svg className="focus-timer-svg" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="focus-timer-background"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="focus-timer-progress"
                    strokeDasharray={getStrokeDasharray()}
                  />
                </svg>
                
                <div className="focus-timer-text">
                  <div className={`focus-time-display ${
                    isRunning ? 'running' : 
                    isCompleted ? 'completed' : 'idle'
                  } ${isRunning ? 'focus-timer-pulse' : ''}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="focus-status">
                    {isCompleted ? 'Завершено!' : isRunning ? 'Фокусируйтесь...' : 'Готово к работе'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="focus-time-controls">
            <button
              onClick={decreaseTime}
              disabled={isRunning}
              className={`focus-time-btn ${isRunning ? 'disabled' : ''}`}
              aria-label="Уменьшить время"
            >
              <Minus className="w-5 h-5" />
            </button>
            
            <div className="focus-time-display-section">
              <div className="focus-duration">
                {focusTime} минут
              </div>
              <div className="focus-duration-label">
                Время фокуса
              </div>
            </div>
            
            <button
              onClick={increaseTime}
              disabled={isRunning}
              className={`focus-time-btn ${isRunning ? 'disabled' : ''}`}
              aria-label="Увеличить время"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="focus-controls">
            {!isRunning && !isCompleted && (
              <button
                onClick={handleStart}
                className="focus-control-btn focus-start-btn"
              >
                <Play className="w-5 h-5 mr-2" />
                Начать
              </button>
            )}
            
            {isRunning && (
              <button
                onClick={handleReset}
                className="focus-control-btn focus-reset-btn"
              >
                <Square className="w-5 h-5 mr-2" />
                Остановить
              </button>
            )}
            
            {isCompleted && (
              <button
                onClick={handleReset}
                className="focus-control-btn focus-reset-btn"
              >
                <Square className="w-5 h-5 mr-2" />
                Заново
              </button>
            )}
          </div>

          <div className="focus-tips">
            <h3 className="focus-tips-title">Советы для фокуса:</h3>
            <ul className="focus-tips-list">
              <li className="focus-tips-item">• Уберите телефон подальше</li>
              <li className="focus-tips-item">• Закройте лишние вкладки браузера</li>
              <li className="focus-tips-item">• Используйте технику Pomodoro</li>
              <li className="focus-tips-item">• Сделайте перерыв после завершения</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Focus;