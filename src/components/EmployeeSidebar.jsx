import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EmployeeSidebar.css';

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', path: '/employee-dashboard' },
  { id: 'my-task',   icon: '📋', label: 'My Tasks',  path: '/my-task'           },
];

function EmployeeSidebar({ employeeName, onLogout }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleNav = (path) => navigate(path);
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <aside className={`es-sidebar${collapsed ? ' es-collapsed' : ''}`}>

      {/* ── Logo ── */}
      <div className="es-logo-row">
        <div className="es-logo-icon">⚡</div>
        {!collapsed && <span className="es-logo-text">TMS</span>}
        <button
          className="es-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="es-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              className={`es-nav-item${isActive ? ' es-active' : ''}`}
              onClick={() => handleNav(item.path)}
              title={collapsed ? item.label : ''}
            >
              <span className="es-nav-icon">{item.icon}</span>
              {!collapsed && <span className="es-nav-label">{item.label}</span>}
              {isActive && <span className="es-nav-dot" />}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="es-footer">
        <div className="es-avatar">{getInitials(employeeName)}</div>
        {!collapsed && (
          <div className="es-user-info">
            <span className="es-user-name">{employeeName || 'Employee'}</span>
            <span className="es-user-role">Employee</span>
          </div>
        )}
        <button className="es-logout-btn" onClick={handleLogout} title="Logout">
          ⏻
        </button>
      </div>
    </aside>
  );
}

export default EmployeeSidebar;
