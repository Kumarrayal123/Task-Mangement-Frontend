import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiList, 
  FiAlertCircle, 
  FiUsers, 
  FiChevronLeft, 
  FiChevronRight,
  FiUser,
  FiZap,
  FiLogOut,
  FiSettings,
  FiBell
} from 'react-icons/fi';
import { FaTasks } from 'react-icons/fa';

function Sidebar({ userRole, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      path: userRole === 'admin' ? '/admin-dashboard' : '/employee-dashboard'
    },
    {
      id: 'task',
      label: 'Task',
      icon: <FaTasks className="w-5 h-5" />,
      path: '/task'
    },
    ...(userRole === 'admin' ? [{
      id: 'issues',
      label: 'Issues',
      icon: <FiAlertCircle className="w-5 h-5" />,
      path: '/issues'
    }] : []),
    // ─── NEW: Notifications Section ───
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <FiBell className="w-5 h-5" />,
      path: '/notifications'
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: <FiUsers className="w-5 h-5" />,
      path: '/staff'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <FiLogOut className="w-5 h-5" />,
      path: '/logout',
      isLogout: true
    }
  ];

  const handleMenuClick = (path, isLogout) => {
    if (isLogout) {
      handleLogout();
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate('/');
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`
      fixed left-0 top-0 h-screen z-50
      bg-white/20 backdrop-blur-xl
      border-r border-white/30
      shadow-2xl shadow-indigo-500/10
      transition-all duration-300 ease-in-out
      flex flex-col
      ${isCollapsed ? 'w-[72px]' : 'w-[280px]'}
    `}>
      {/* ── Header / Logo ── */}
      <div className={`
        flex items-center gap-3 px-4 py-5
        border-b border-white/20
        ${isCollapsed ? 'justify-center' : 'justify-between'}
        relative
      `}>
        <div className={`
          flex items-center gap-3
          ${isCollapsed ? 'justify-center w-full' : ''}
        `}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 
            flex items-center justify-center shadow-lg shadow-indigo-500/30
            transition-all hover:scale-105">
            <FiZap className="text-white w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 
              bg-clip-text text-transparent">
              TaskFlow
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            className="p-1.5 rounded-lg bg-white/30 backdrop-blur-sm border border-white/30 
              hover:bg-white/50 transition-all hover:scale-105 hover:shadow-lg"
            onClick={toggleSidebar}
            title="Collapse sidebar"
          >
            <FiChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}
        {isCollapsed && (
          <button
            className="absolute -right-3 top-6 p-1.5 rounded-full bg-white/60 backdrop-blur-sm 
              border-2 border-white/50 hover:bg-white/80 transition-all hover:scale-110 hover:shadow-lg
              shadow-md"
            onClick={toggleSidebar}
            title="Expand sidebar"
          >
            <FiChevronRight className="w-3 h-3 text-gray-600" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isLogout = item.isLogout || false;
          
          return (
            <button
              key={item.id}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200
                ${isCollapsed ? 'justify-center' : ''}
                ${isLogout 
                  ? 'mt-auto bg-gradient-to-r from-rose-500/10 to-rose-600/10 hover:from-rose-500/20 hover:to-rose-600/20 border border-rose-300/30 hover:border-rose-400/50' 
                  : isActive 
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-400/30 shadow-lg shadow-indigo-500/10' 
                    : 'hover:bg-white/30 backdrop-blur-sm hover:border hover:border-white/30 hover:shadow-md'
                }
                group relative
              `}
              onClick={() => handleMenuClick(item.path, isLogout)}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`
                ${isActive && !isLogout ? 'text-indigo-600' : ''}
                ${isLogout ? 'text-rose-600' : 'text-gray-600 group-hover:text-indigo-600'}
                transition-colors duration-200
              `}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className={`
                  flex-1 text-left text-sm font-medium
                  ${isActive && !isLogout ? 'text-indigo-700' : ''}
                  ${isLogout ? 'text-rose-600 group-hover:text-rose-700' : 'text-gray-700 group-hover:text-indigo-700'}
                  transition-colors duration-200
                `}>
                  {item.label}
                </span>
              )}
              {isActive && !isLogout && (
                <span className="absolute right-2 w-1.5 h-6 rounded-full 
                  bg-gradient-to-b from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50" />
              )}
              {isLogout && (
                <span className="absolute right-2 w-1.5 h-6 rounded-full 
                  bg-gradient-to-b from-rose-500 to-rose-600 shadow-lg shadow-rose-500/50" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className={`
        px-3 py-4 border-t border-white/20
        ${isCollapsed ? 'flex flex-col items-center gap-3' : ''}
      `}>
        <div className={`
          flex items-center gap-3
          ${isCollapsed ? 'flex-col' : ''}
          w-full
        `}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 
            flex items-center justify-center text-white font-bold text-sm 
            shadow-lg shadow-indigo-500/30 flex-shrink-0
            transition-all hover:scale-105">
            {userRole === 'admin' ? 'A' : 'E'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {userRole === 'admin' ? 'Administrator' : 'Employee'}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FiUser className="w-3 h-3" />
                {userRole === 'admin' ? 'Admin Panel' : 'Employee Panel'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Decorative Glass Effect ── */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50/10 via-transparent to-purple-50/10 pointer-events-none" />
    </aside>
  );
}

export default Sidebar;