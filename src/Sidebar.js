import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ userRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: userRole === 'admin' ? '/admin-dashboard' : '/employee-dashboard'
    },
    {
      id: 'task',
      label: 'Task',
      icon: '📝',
      path: '/task'
    },
    ...(userRole === 'admin' ? [{
      id: 'issues',
      label: 'Issues',
      icon: '⚠️',
      path: '/issues'
    }] : []),
    {
      id: 'staff',
      label: 'Staff',
      icon: '👥',
      path: '/staff'
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          {!isCollapsed && <span className="logo-text">TMS</span>}
        </div>
        <button className="toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-avatar">👤</span>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-role">
                {userRole === 'admin' ? 'Admin' : 'Employee'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
