import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiList, 
  FiLogOut, 
  FiChevronLeft, 
  FiChevronRight,
  FiUser,
  FiZap,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiAlertTriangle,
  FiBell,
  FiMenu,
  FiX,
  FiSettings,
  FiUser as FiUserIcon
} from 'react-icons/fi';
import { FaTasks } from 'react-icons/fa';

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── BOTTOM NAVIGATION ITEMS (Mobile) ───
const BOTTOM_NAV_ITEMS = [
  { 
    id: 'dashboard', 
    icon: <FiHome className="w-5 h-5" />, 
    label: 'Home', 
    path: '/employee-dashboard' 
  },
  { 
    id: 'tasks', 
    icon: <FaTasks className="w-5 h-5" />, 
    label: 'Tasks', 
    isParent: true,
    children: [
      { id: 'my-tasks', label: 'My Tasks', path: '/my-task', icon: <FiList className="w-4 h-4" /> },
      { id: 'create-task', label: 'Create Task', path: '/create-task', icon: <FiPlus className="w-4 h-4" /> },
    ]
  },
  { 
    id: 'issues', 
    icon: <FiAlertTriangle className="w-5 h-5" />, 
    label: 'Issues', 
    path: '/my-issues' 
  },
  { 
    id: 'notifications', 
    icon: <FiBell className="w-5 h-5" />, 
    label: 'Alerts', 
    path: '/my-notifications' 
  },
  { 
    id: 'profile', 
    icon: <FiUser className="w-5 h-5" />, 
    label: 'Profile',
    isParent: true,
    children: [
      { id: 'myprofile', label: 'My Profile', path: '/employee-profile', icon: <FiUserIcon className="w-4 h-4" /> },
      { id: 'logout', label: 'Logout', path: '#logout', icon: <FiLogOut className="w-4 h-4" />, isLogout: true },
    ]
  },
];

// ─── DESKTOP SIDEBAR ITEMS ───
const NAV_ITEMS = [
  { 
    id: 'dashboard', 
    icon: <FiHome className="w-5 h-5" />, 
    label: 'Dashboard', 
    path: '/employee-dashboard' 
  },
  { 
    id: 'tasks', 
    icon: <FaTasks className="w-5 h-5" />, 
    label: 'Tasks',
    isParent: true,
    children: [
      { id: 'my-tasks', label: 'My Tasks', path: '/my-task', icon: <FiList className="w-4 h-4" /> },
      { id: 'create-task', label: 'Create Task', path: '/create-task', icon: <FiPlus className="w-4 h-4" /> },
    ]
  },
  { 
    id: 'issues', 
    icon: <FiAlertTriangle className="w-5 h-5" />, 
    label: 'My Issues', 
    path: '/my-issues' 
  },
  { 
    id: 'notifications', 
    icon: <FiBell className="w-5 h-5" />, 
    label: 'My Notifications', 
    path: '/my-notifications' 
  },
  { 
    id: 'profile', 
    icon: <FiUser className="w-5 h-5" />, 
    label: 'Profile', 
    path: '/employee-profile' 
  },
  { 
    id: 'logout', 
    icon: <FiLogOut className="w-5 h-5" />, 
    label: 'Logout', 
    isLogout: true
  },
];

function EmployeeSidebar({ employeeName, onLogout, onCollapseChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    tasks: true
  });
  const [mobileTaskExpanded, setMobileTaskExpanded] = useState(false);
  const [mobileProfileExpanded, setMobileProfileExpanded] = useState(false);

  const handleNav = (path) => {
    setMobileTaskExpanded(false);
    setMobileProfileExpanded(false);
    if (path === '#logout') {
      handleLogout();
      return;
    }
    navigate(path);
  };
  
  const handleLogout = () => {
    setMobileTaskExpanded(false);
    setMobileProfileExpanded(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate('/');
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleMobileTask = () => {
    setMobileProfileExpanded(false);
    setMobileTaskExpanded(!mobileTaskExpanded);
  };

  const toggleMobileProfile = () => {
    setMobileTaskExpanded(false);
    setMobileProfileExpanded(!mobileProfileExpanded);
  };

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }
  };

  const isChildActive = (children) => {
    return children?.some(child => location.pathname === child.path);
  };

  const checkIsActive = (path) => {
    if (path === '/my-task' && location.pathname === '/my-task') return true;
    if (path === '/create-task' && location.pathname === '/create-task') return true;
    return location.pathname === path;
  };

  const isBottomNavActive = (path) => {
    if (path === '/my-task' && location.pathname === '/my-task') return true;
    if (path === '/create-task' && location.pathname === '/create-task') return true;
    if (path === '/my-issues' && location.pathname === '/my-issues') return true;
    if (path === '/my-notifications' && location.pathname === '/my-notifications') return true;
    if (path === '/employee-profile' && location.pathname === '/employee-profile') return true;
    if (path === '/employee-dashboard' && location.pathname === '/employee-dashboard') return true;
    return false;
  };

  // ─── Get active child label for mobile ───
  const getActiveChildLabel = (item) => {
    if (item.id === 'tasks') {
      const taskItem = BOTTOM_NAV_ITEMS.find(item => item.id === 'tasks');
      if (taskItem?.children) {
        for (const child of taskItem.children) {
          if (location.pathname === child.path) {
            return child.label;
          }
        }
      }
      return 'Tasks';
    }
    if (item.id === 'profile') {
      if (location.pathname === '/employee-profile') {
        return 'Profile';
      }
      return 'Profile';
    }
    return item.label;
  };

  // ─── Check if profile is active ───
  const isProfileActive = () => {
    return location.pathname === '/employee-profile';
  };

  return (
    <>
      {/* ─── MOBILE BOTTOM NAVIGATION ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-white/30 shadow-2xl shadow-indigo-500/10 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isActive = isBottomNavActive(item.path);
            
            // ─── Task Item with Submenu ───
            if (item.id === 'tasks' && item.isParent) {
              const isTaskActive = isChildActive(item.children) || isActive;
              const activeChildLabel = getActiveChildLabel(item);
              
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={toggleMobileTask}
                    className={`
                      flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl
                      transition-all duration-200 relative
                      ${isTaskActive ? 'scale-105' : 'hover:scale-105 active:scale-95'}
                      min-w-[50px]
                    `}
                  >
                    <span className={`
                      transition-colors duration-200
                      ${isTaskActive ? 'text-indigo-600' : 'text-gray-500'}
                    `}>
                      {item.icon}
                    </span>
                    <span className={`
                      text-[9px] font-medium transition-colors duration-200
                      ${isTaskActive ? 'text-indigo-600' : 'text-gray-500'}
                    `}>
                      {activeChildLabel}
                    </span>
                    {isTaskActive && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50" />
                    )}
                    {isTaskActive && (
                      <span className="absolute -top-0.5 right-0 w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 animate-pulse" />
                    )}
                  </button>

                  {/* ─── Task Submenu Popup ─── */}
                  {mobileTaskExpanded && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileTaskExpanded(false)}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 
                        bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/30 
                        border border-white/30 p-1.5 min-w-[150px] animate-slideUp">
                        <div className="space-y-0.5">
                          {item.children.map((child) => {
                            const childIsActive = checkIsActive(child.path);
                            return (
                              <button
                                key={child.id}
                                onClick={() => handleNav(child.path)}
                                className={`
                                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                                  transition-all duration-200
                                  ${childIsActive 
                                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-700' 
                                    : 'hover:bg-white/30 text-gray-700 hover:text-indigo-600'
                                  }
                                  group
                                `}
                              >
                                <span className={`
                                  ${childIsActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'}
                                  transition-colors duration-200
                                `}>
                                  {child.icon}
                                </span>
                                <span className={`
                                  flex-1 text-left text-sm
                                  ${childIsActive ? 'font-semibold' : 'font-medium'}
                                `}>
                                  {child.label}
                                </span>
                                {childIsActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {/* Submenu Arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-r border-b border-white/30" />
                      </div>
                    </>
                  )}
                </div>
              );
            }

            // ─── Profile Item with Submenu ───
            if (item.id === 'profile' && item.isParent) {
              const isProfileActiveCheck = isProfileActive();
              
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={toggleMobileProfile}
                    className={`
                      flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl
                      transition-all duration-200 relative
                      ${isProfileActiveCheck ? 'scale-105' : 'hover:scale-105 active:scale-95'}
                      min-w-[50px]
                    `}
                  >
                    <span className={`
                      transition-colors duration-200
                      ${isProfileActiveCheck ? 'text-indigo-600' : 'text-gray-500'}
                    `}>
                      {item.icon}
                    </span>
                    <span className={`
                      text-[9px] font-medium transition-colors duration-200
                      ${isProfileActiveCheck ? 'text-indigo-600' : 'text-gray-500'}
                    `}>
                      {isProfileActiveCheck ? 'Profile' : 'Profile'}
                    </span>
                    {isProfileActiveCheck && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50" />
                    )}
                  </button>

                  {/* ─── Profile Submenu Popup ─── */}
                  {mobileProfileExpanded && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileProfileExpanded(false)}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 
                        bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/30 
                        border border-white/30 p-1.5 min-w-[150px] animate-slideUp">
                        <div className="space-y-0.5">
                          {item.children.map((child) => {
                            const childIsActive = child.id === 'myprofile' && checkIsActive(child.path);
                            const isLogout = child.isLogout;
                            return (
                              <button
                                key={child.id}
                                onClick={() => handleNav(child.path)}
                                className={`
                                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                                  transition-all duration-200
                                  ${isLogout 
                                    ? 'hover:bg-rose-50 text-rose-600 hover:text-rose-700' 
                                    : childIsActive 
                                      ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-700' 
                                      : 'hover:bg-white/30 text-gray-700 hover:text-indigo-600'
                                  }
                                  group
                                `}
                              >
                                <span className={`
                                  ${isLogout 
                                    ? 'text-rose-500' 
                                    : childIsActive 
                                      ? 'text-indigo-500' 
                                      : 'text-gray-400 group-hover:text-indigo-500'
                                  }
                                  transition-colors duration-200
                                `}>
                                  {child.icon}
                                </span>
                                <span className={`
                                  flex-1 text-left text-sm
                                  ${isLogout ? 'font-medium' : childIsActive ? 'font-semibold' : 'font-medium'}
                                `}>
                                  {child.label}
                                </span>
                                {childIsActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {/* Submenu Arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-r border-b border-white/30" />
                      </div>
                    </>
                  )}
                </div>
              );
            }

            // ─── Regular Items ───
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`
                  flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl
                  transition-all duration-200 relative
                  ${isActive ? 'scale-105' : 'hover:scale-105 active:scale-95'}
                  min-w-[50px]
                `}
              >
                <span className={`
                  transition-colors duration-200
                  ${isActive ? 'text-indigo-600' : 'text-gray-500'}
                `}>
                  {item.icon}
                </span>
                <span className={`
                  text-[9px] font-medium transition-colors duration-200
                  ${isActive ? 'text-indigo-600' : 'text-gray-500'}
                `}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside 
        className={`
          hidden lg:flex fixed left-0 top-0 h-screen z-50
          bg-white/20 backdrop-blur-xl
          border-r border-white/30
          shadow-2xl shadow-indigo-500/10
          transition-all duration-300 ease-in-out
          flex-col
          ${collapsed ? 'w-20' : 'w-[280px]'}
        `}
      >
        {/* Logo */}
        <div className={`
          flex items-center gap-3 px-4 py-5
          border-b border-white/20
          ${collapsed ? 'justify-center' : 'justify-between'}
          relative
        `}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 
              flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all hover:scale-105">
              <FiZap className="text-white w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 
                bg-clip-text text-transparent">
                TaskFlow
              </span>
            )}
          </div>
          {!collapsed && (
            <button
              className="p-1.5 rounded-lg bg-white/30 backdrop-blur-sm border border-white/30 
                hover:bg-white/50 transition-all hover:scale-105 hover:shadow-lg"
              onClick={toggleCollapse}
            >
              <FiChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {collapsed && (
            <button
              className="absolute -right-3 top-6 p-1.5 rounded-full bg-white/60 backdrop-blur-sm 
                border-2 border-white/50 hover:bg-white/80 transition-all hover:scale-110 hover:shadow-lg
                shadow-md"
              onClick={toggleCollapse}
            >
              <FiChevronRight className="w-3 h-3 text-gray-600" />
            </button>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            // Tasks - Parent with children
            if (item.isParent) {
              const isSectionActive = isChildActive(item.children);
              const isExpanded = expandedSections[item.id];
              
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200
                      ${collapsed ? 'justify-center' : ''}
                      ${isSectionActive 
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-400/30 shadow-lg shadow-indigo-500/10' 
                        : 'hover:bg-white/30 backdrop-blur-sm hover:border hover:border-white/30 hover:shadow-md'
                      }
                      group relative
                    `}
                    onClick={() => !collapsed && toggleSection(item.id)}
                    title={collapsed ? item.label : ''}
                  >
                    <span className={`
                      ${isSectionActive ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}
                      transition-colors duration-200
                    `}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className={`
                          flex-1 text-left text-sm font-medium
                          ${isSectionActive ? 'text-indigo-700' : 'text-gray-700 group-hover:text-indigo-700'}
                          transition-colors duration-200
                        `}>
                          {item.label}
                        </span>
                        <span className="text-gray-400">
                          {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                        </span>
                      </>
                    )}
                    {isSectionActive && !collapsed && (
                      <span className="absolute right-2 w-1.5 h-6 rounded-full 
                        bg-gradient-to-b from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50" />
                    )}
                  </button>

                  {/* Child Items - My Tasks and Create Task */}
                  {!collapsed && isExpanded && (
                    <div className="ml-4 pl-3 space-y-1 border-l-2 border-indigo-200/30">
                      {item.children.map((child) => {
                        const childIsActive = checkIsActive(child.path);
                        return (
                          <button
                            key={child.id}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2 rounded-lg
                              transition-all duration-200
                              ${childIsActive 
                                ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-700' 
                                : 'hover:bg-white/20 text-gray-600 hover:text-indigo-600'
                              }
                              group
                            `}
                            onClick={() => handleNav(child.path)}
                          >
                            <span className={`
                              ${childIsActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'}
                              transition-colors duration-200
                            `}>
                              {child.icon}
                            </span>
                            <span className={`
                              flex-1 text-left text-sm
                              ${childIsActive ? 'font-semibold' : 'font-medium'}
                            `}>
                              {child.label}
                            </span>
                            {childIsActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Logout
            if (item.isLogout) {
              return (
                <button
                  key={item.id}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200
                    ${collapsed ? 'justify-center' : ''}
                    bg-gradient-to-r from-rose-500/10 to-rose-600/10
                    hover:bg-gradient-to-r hover:from-rose-500/20 hover:to-rose-600/20
                    border border-rose-200/30
                    hover:border-rose-400/50
                    group
                    mt-2
                  `}
                  onClick={handleLogout}
                  title={collapsed ? 'Logout' : ''}
                >
                  <span className="text-rose-600 group-hover:text-rose-700 transition-colors duration-200">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 text-left text-sm font-medium text-rose-700 group-hover:text-rose-800 transition-colors duration-200">
                      {item.label}
                    </span>
                  )}
                  {!collapsed && (
                    <span className="text-rose-400 group-hover:translate-x-1 transition-transform duration-200">
                      <FiChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            }

            // Regular items (Dashboard, Issues, Notifications, Profile)
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200
                  ${collapsed ? 'justify-center' : ''}
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-400/30 shadow-lg shadow-indigo-500/10' 
                    : 'hover:bg-white/30 backdrop-blur-sm hover:border hover:border-white/30 hover:shadow-md'
                  }
                  group relative
                `}
                onClick={() => handleNav(item.path)}
                title={collapsed ? item.label : ''}
              >
                <span className={`
                  ${isActive ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}
                  transition-colors duration-200
                `}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className={`
                    flex-1 text-left text-sm font-medium
                    ${isActive ? 'text-indigo-700' : 'text-gray-700 group-hover:text-indigo-700'}
                    transition-colors duration-200
                  `}>
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <span className="absolute right-2 w-1.5 h-6 rounded-full 
                    bg-gradient-to-b from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-white/20">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 
                flex items-center justify-center text-white font-bold text-xs 
                shadow-lg shadow-indigo-500/30 flex-shrink-0">
                {getInitials(employeeName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">
                  {employeeName || 'Employee'}
                </p>
                <p className="text-[10px] text-gray-500">Employee</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <style jsx>{`
        /* Safe area for notched phones */
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default EmployeeSidebar;