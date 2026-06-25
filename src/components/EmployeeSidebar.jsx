import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiList, 
  FiLogOut, 
  FiChevronLeft, 
  FiChevronRight,
  FiUser,
  FiBriefcase,
  FiZap,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiAlertTriangle,
  FiBell
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
      { id: 'assigned', label: 'Assigned Tasks', path: '/my-task', icon: <FiList className="w-4 h-4" /> },
      { id: 'created', label: 'Created Tasks', path: '/my-createdtask', icon: <FiPlus className="w-4 h-4" /> },
      { id: 'issues', label: 'My Issues', path: '/my-issues', icon: <FiAlertTriangle className="w-4 h-4" /> },
    ]
  },
  // ─── NEW: My Notifications ───
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

function EmployeeSidebar({ employeeName, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    tasks: true
  });

  const handleNav = (path) => navigate(path);
  
  const handleLogout = () => {
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

  const isChildActive = (children) => {
    return children?.some(child => location.pathname === child.path);
  };

  const checkIsActive = (path) => location.pathname === path;

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen z-50
        bg-white/20 backdrop-blur-xl
        border-r border-white/30
        shadow-2xl shadow-indigo-500/10
        transition-all duration-300 ease-in-out
        flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}
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
            onClick={() => setCollapsed(true)}
          >
            <FiChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}
        {collapsed && (
          <button
            className="absolute -right-3 top-6 p-1.5 rounded-full bg-white/60 backdrop-blur-sm 
              border-2 border-white/50 hover:bg-white/80 transition-all hover:scale-110 hover:shadow-lg
              shadow-md"
            onClick={() => setCollapsed(false)}
          >
            <FiChevronRight className="w-3 h-3 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation - Sare items ek saath yahan */}
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

                {/* Child Items */}
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

          // Logout - Special handling
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

          // Dashboard, Notifications & Profile - Regular items
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

      {/* User Info at bottom - Small */}
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
  );
}

export default EmployeeSidebar;