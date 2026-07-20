import React, { useState } from 'react';
import './adminHeader.scss';
import { FiMenu } from 'react-icons/fi'; // Import menu icon from react-icons

const AdminHeader = ({ onToggleSidebar, isSidebarOpen }) => {

  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem('USER_LOGIN');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="sidebar-toggle" 
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <FiMenu size={20} />
        </button>
      </div>
      
      <div className="header-right">
        <div className="user-profile">
          <div className="user-avatar">
            <img src={"https://i.pravatar.cc/150?img=3" } alt={userData.name} />
          </div>
          <span className="user-name">{userData.fullName}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;