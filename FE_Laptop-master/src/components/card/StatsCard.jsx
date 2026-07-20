import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, change, positive }) => {
  return (
    <div className="stats-card">
      <h3>{title}</h3>
      <div className="stats-value">{value}</div>
      <div className={`stats-change ${positive ? 'positive' : ''}`}>
        {change}
      </div>
    </div>
  );
};

export default StatsCard;