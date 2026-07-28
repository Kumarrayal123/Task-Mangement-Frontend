import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiAlertCircle, 
  FiUsers, 
  FiUser, 
  FiLogOut, 
  FiBell,
  FiMenu,
  FiX,
  FiChevronDown
} from 'react-icons/fi';
import { FaTasks } from 'react-icons/fa';
import Logo from './images/iglogo.png';
import './Navbar.css';

function Navbar({ userRole: propRole, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const userRole = propRole || localStorage.getItem('userRole') || 'admin';
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem('userData') || '{}');
    } catch (e) {
      return {};
    }
  })();

  const userName = userData.name || 
                   userData.adminName || 
                   userData.username || 
                   userData.fullName || 
                   (userRole === 'admin' ? 'Administrator' : 'Employee');

  const menuItems = userRole === 'employee' ? [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FiHome className="w-4 h-4" />,
      path: '/employee-dashboard'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <FaTasks className="w-4 h-4" />,
      path: '/my-task'
    },
    {
      id: 'issues',
      label: 'My Issues',
      icon: <FiAlertCircle className="w-4 h-4" />,
      path: '/my-issues'
    },
    {
      id: 'notifications',
      label: 'My Notifications',
      icon: <FiBell className="w-4 h-4" />,
      path: '/my-notifications'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <FiUser className="w-4 h-4" />,
      path: '/employee-profile'
    }
  ] : [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FiHome className="w-4 h-4" />,
      path: '/admin-dashboard'
    },
    {
      id: 'task',
      label: 'Tasks',
      icon: <FaTasks className="w-4 h-4" />,
      path: '/task'
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: <FiAlertCircle className="w-4 h-4" />,
      path: '/issues'
    },
    {
      id: 'staff',
      label: 'Employee Staff',
      icon: <FiUsers className="w-4 h-4" />,
      path: '/staff'
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: <FiUsers className="w-4 h-4" />,
      path: '/teams'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <FiBell className="w-4 h-4" />,
      path: '/notifications'
    }
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate('/');
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="horizontal-navbar sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* ─── Left Brand / Logo ─── */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate(userRole === 'admin' ? '/admin-dashboard' : '/employee-dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md p-1.5 transition-transform hover:scale-105">
              <img 
                src={Logo} 
                alt="Ingrain Logo" 
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent tracking-tight">
                IRYAX'S TMS
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                {userRole === 'admin' ? 'Admin Portal' : 'Employee Portal'}
              </span>
            </div>
          </div>

          {/* ─── Center Navigation Links (Desktop) ─── */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.id === 'dashboard' && (location.pathname === '/admin-dashboard' || location.pathname === '/admin/dashboard'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ─── Right User Actions (Desktop) ─── */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-white transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">{userName}</p>
                  <p className="text-[10px] text-slate-400 font-medium capitalize">{userRole}</p>
                </div>
                <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 lg:hidden">
                    <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{userRole}</p>
                  </div>
                  <button
                    onClick={() => handleNavigate(userRole === 'admin' ? '/admin-dashboard' : '/employee-profile')}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FiUser className="w-3.5 h-3.5 text-slate-400" />
                    My Account
                  </button>
                  <button
                    onClick={() => handleNavigate('/notifications')}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FiBell className="w-3.5 h-3.5 text-slate-400" />
                    Notifications
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <FiLogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Logout Direct Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl font-semibold text-xs border border-rose-100 transition shadow-xs"
              title="Logout"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* ─── Mobile Menu Hamburger Toggle ─── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* ─── Mobile Menu Drawer Dropdown ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2 shadow-lg animate-slideDown">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.id === 'dashboard' && (location.pathname === '/admin-dashboard' || location.pathname === '/admin/dashboard'));
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{userRole}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs border border-rose-100 hover:bg-rose-100 transition"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
