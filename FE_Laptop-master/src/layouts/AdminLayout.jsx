import React, { useState } from 'react';
import './adminLayout.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/sidebar/Sidebar';
import AdminHeader from '../components/header/AdminHeader';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-layout">
      <Sidebar isCollapsed={!isSidebarOpen} setIsCollapsed={setIsSidebarOpen}/>
      <div className={`admin-layout__wrapper ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <AdminHeader 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
        <main className="admin-layout__main">
          {children}
        </main>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default AdminLayout;