import React, { useState, useEffect, useRef } from 'react';
import { X, TrendingUp, Calendar, Award } from 'lucide-react';
import './Statistics.css';

const Statistics = ({ isOpen, onClose, statsData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const calculatePercentage = (completed, total) => {
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const allTimePercentage = calculatePercentage(statsData.allTime.completed, statsData.allTime.total);
  const lastMonthPercentage = calculatePercentage(statsData.lastMonth.completed, statsData.lastMonth.total);
  const lastWeekPercentage = calculatePercentage(statsData.lastWeek.completed, statsData.lastWeek.total);

  return (
    <div 
      className={`statistics-overlay ${isVisible ? 'visible' : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className={`statistics-modal ${isVisible ? 'visible' : ''}`}
      >
        <div className="statistics-header">
          <div className="statistics-title-container">
            <TrendingUp className="statistics-title-icon" />
            <h2 className="statistics-title">Статистика выполнения</h2>
          </div>
          <button
            onClick={handleClose}
            className="statistics-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="statistics-content">
          <div className="stat-card stat-card-alltime">
            <div className="stat-header">
              <div className="stat-title-container">
                <Award className="stat-icon stat-numbers-alltime" />
                <span className="stat-title">За все время</span>
              </div>
              <span className="stat-numbers stat-numbers-alltime">
                {statsData.allTime.completed} / {statsData.allTime.total}
              </span>
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar progress-bar-alltime" 
                style={{ width: `${allTimePercentage}%` }}
              ></div>
            </div>
            <div className="progress-percentage progress-percentage-alltime">
              {allTimePercentage}%
            </div>
          </div>

          <div className="stat-card stat-card-month">
            <div className="stat-header">
              <div className="stat-title-container">
                <Calendar className="stat-icon stat-numbers-month" />
                <span className="stat-title">Последний месяц</span>
              </div>
              <span className="stat-numbers stat-numbers-month">
                {statsData.lastMonth.completed} / {statsData.lastMonth.total}
              </span>
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar progress-bar-month" 
                style={{ width: `${lastMonthPercentage}%` }}
              ></div>
            </div>
            <div className="progress-percentage progress-percentage-month">
              {lastMonthPercentage}%
            </div>
          </div>

          <div className="stat-card stat-card-week">
            <div className="stat-header">
              <div className="stat-title-container">
                <Calendar className="stat-icon stat-numbers-week" />
                <span className="stat-title">Последняя неделя</span>
              </div>
              <span className="stat-numbers stat-numbers-week">
                {statsData.lastWeek.completed} / {statsData.lastWeek.total}
              </span>
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar progress-bar-week" 
                style={{ width: `${lastWeekPercentage}%` }}
              ></div>
            </div>
            <div className="progress-percentage progress-percentage-week">
              {lastWeekPercentage}%
            </div>
          </div>

          <div className="additional-stats">
            <div className="stat-box">
              <div className="stat-number stat-number-total">{statsData.allTime.total}</div>
              <div className="stat-label">Всего задач</div>
            </div>
            <div className="stat-box">
              <div className="stat-number stat-number-completed">{statsData.allTime.completed}</div>
              <div className="stat-label">Выполнено</div>
            </div>
          </div>
        </div>

        <div className="statistics-footer">
          <div className="statistics-footer-text">
            Данные обновляются в реальном времени
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;