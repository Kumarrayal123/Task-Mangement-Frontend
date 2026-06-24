import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const userRole = localStorage.getItem('userRole') || 'admin';

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      console.log('Admin Dashboard - User Data:', parsedData);
      
      // Try multiple possible field names for the user's name
      const name = parsedData.name || 
                   parsedData.adminName || 
                   parsedData.username || 
                   parsedData.fullName || 
                   parsedData.firstName || 
                   parsedData.user?.name ||
                   parsedData.data?.name ||
                   parsedData.data?.adminName ||
                   'Admin';
      
      setAdminName(name);
    } else {
      // If no user data, redirect to login
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <Sidebar userRole={userRole} />
      <div className="main-content">
        <nav className="dashboard-navbar">
          <div className="navbar-brand">
            <h2>Task Management System</h2>
          </div>
          <div className="navbar-user">
            <span className="user-name">Welcome, {adminName}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </nav>

        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Manage employees and tasks</p>
          </div>

          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Total Employees</h3>
              <p className="card-number">0</p>
            </div>
            <div className="dashboard-card">
              <h3>Total Tasks</h3>
              <p className="card-number">0</p>
            </div>
            <div className="dashboard-card">
              <h3>Pending Tasks</h3>
              <p className="card-number">0</p>
            </div>
            <div className="dashboard-card">
              <h3>Completed Tasks</h3>
              <p className="card-number">0</p>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="dashboard-section">
              <h3>Recent Activities</h3>
              <p>No recent activities</p>
            </div>
            <div className="dashboard-section">
              <h3>Quick Actions</h3>
              <button className="action-button">Add New Employee</button>
              <button className="action-button">Create Task</button>
              <button className="action-button">View Reports</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
