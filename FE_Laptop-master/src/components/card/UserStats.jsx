import React from 'react';
import './UserStats.css';

const UserStats = () => {
  return (
    <div className="user-stats">
      <h3>Thống kê người dùng</h3>
      <div className="user-stat-item">
        <span>Tổng số người dùng</span>
        <strong>1,245</strong>
      </div>
      <div className="user-stat-item">
        <span>Người dùng mới</span>
        <strong>145</strong>
      </div>
      <div className="user-stat-item">
        <span>Người dùng hoạt động</span>
        <strong>845</strong>
      </div>
    </div>
  );
};

export default UserStats;