import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUsers, FiBriefcase, FiClock, FiCheckCircle, FiBarChart2, 
  FiUser, FiActivity, FiPlus, FiTrendingUp, FiCalendar, 
  FiStar, FiAward, FiTarget, FiTrendingDown, FiPieChart,
  FiLayers, FiZap, FiThumbsUp, FiEye, FiAlertCircle, FiBell,
  FiMenu, FiX
} from 'react-icons/fi';
import { FaTasks, FaRocket, FaChartLine, FaChartPie, FaUsers } from 'react-icons/fa';
import Sidebar from './Sidebar';
import './AdminDashboard.css';

const API_BASE_URL = 'https://api.timelyhealth.in/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const userRole = localStorage.getItem('userRole') || 'admin';
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─── Close mobile menu on resize to desktop ───
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // ─── Prevent body scroll when mobile menu is open ───
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
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
      navigate('/');
    }
  }, [navigate]);

  // ─── Fetch Dashboard Data ───
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/tasks/admin-dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setDashboardData(response.data.dashboard);
        }
        setLoading(false);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // ─── Fetch Notification Count ───
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await axios.get('https://api.timelyhealth.in/api/tasks/notifications');
        if (response.data.success) {
          setNotificationCount(response.data.total || 0);
        }
      } catch (err) {
        console.error('Notification count fetch error:', err);
      }
    };
    fetchNotificationCount();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navigateTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/30 shadow-lg text-center max-w-sm sm:max-w-md">
          <FiAlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700">{error}</h3>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 sm:px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData || {
    totalEmployees: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  };

  const recentActivities = dashboardData?.recentActivities || [];
  const taskDistribution = dashboardData?.taskDistribution || [
    { label: 'Completed', value: 0, bg: 'bg-emerald-500' },
    { label: 'In Progress', value: 0, bg: 'bg-blue-500' },
    { label: 'Pending', value: 0, bg: 'bg-amber-500' },
    { label: 'Overdue', value: 0, bg: 'bg-rose-500' },
  ];
  const weeklyTrend = dashboardData?.weeklyTrend || [
    { day: 'Mon', tasks: 0 },
    { day: 'Tue', tasks: 0 },
    { day: 'Wed', tasks: 0 },
    { day: 'Thu', tasks: 0 },
    { day: 'Fri', tasks: 0 },
    { day: 'Sat', tasks: 0 },
    { day: 'Sun', tasks: 0 },
  ];

  const maxTasks = Math.max(...weeklyTrend.map(d => d.tasks), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* ─── Mobile Menu Toggle ─── */}
        <div className="lg:hidden fixed top-0.5 left-0.5 z-50">
          <button
            onClick={toggleMobileMenu}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:bg-white transition-all hover:scale-105"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <FiX className="w-5 h-5 text-gray-700" />
            ) : (
              <FiMenu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* ─── Mobile Overlay ─── */}
        <div 
          className={`
            fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden
            ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `} 
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* ─── Sidebar - Fixed on desktop ─── */}
        <div 
          className={`
            fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ width: '280px' }}
        >
          <Sidebar userRole={userRole} />
          
          {/* ─── Mobile Close Button Inside Sidebar ─── */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute top-0.5 right-0.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* ─── Main Content - Scrollable ─── */}
        <div className="flex-1 min-h-screen w-full lg:ml-0 overflow-y-auto">
          {/* Navbar */}
          <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm">
            <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 ml-8 lg:ml-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                  <FaTasks className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block">
                  Admin Dashboard
                </h2>
                <h2 className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Dashboard
                </h2>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-wrap">
                {/* Notification Button */}
                <button
                  onClick={() => navigateTo('/notifications')}
                  className="relative p-1.5 sm:p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/70 transition-all hover:scale-105"
                >
                  <FiBell className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[8px] sm:text-[10px] font-bold rounded-full shadow-lg shadow-rose-500/30 animate-pulse-slow">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* User Info - Hidden on very small screens */}
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/30">
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[80px] sm:max-w-[150px]">
                    Welcome, {adminName}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
                >
                  <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Logout</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-indigo-500" />
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Overview of your team's performance and tasks</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto">
                <button className="hidden sm:flex px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 text-gray-700 font-medium hover:bg-white/60 transition-all items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  This Week
                </button>
                <button 
                  onClick={() => navigateTo('/task')}
                  className="flex-1 sm:flex-none px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-1 sm:gap-2"
                >
                  <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Create Task
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
              <div 
                onClick={() => navigateTo('/staff')}
                className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                    <FiUsers className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] md:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => navigateTo('/task')}
                className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                    <FiBriefcase className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] md:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-gray-800">{stats.totalTasks}</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => navigateTo('/task')}
                className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <FiClock className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] md:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-gray-800">{stats.pendingTasks}</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => navigateTo('/task')}
                className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <FiTrendingUp className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] md:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-gray-800">{stats.inProgressTasks}</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => navigateTo('/task')}
                className="col-span-2 sm:col-span-1 bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <FiCheckCircle className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] md:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
                    <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
                      <p className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-gray-800">{stats.completedTasks}</p>
                      <p className="text-[7px] sm:text-[8px] md:text-[10px] text-purple-600 flex items-center gap-0.5">
                        <FiThumbsUp className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                        {stats.completionRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
              {/* Task Distribution Chart */}
              <div 
                className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                onClick={() => navigateTo('/task')}
              >
                <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-200/50 flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                    <FaChartPie className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-500" />
                    Task Distribution
                  </h3>
                  <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-500">Total: {stats.totalTasks} tasks</span>
                </div>
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        {taskDistribution.map((item, index) => {
                          const percentage = stats.totalTasks > 0 ? (item.value / stats.totalTasks) * 100 : 0;
                          const circumference = 2 * Math.PI * 40;
                          const dashArray = (percentage / 100) * circumference;
                          
                          const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
                          
                          return (
                            <circle
                              key={index}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={colors[index]}
                              strokeWidth="8"
                              strokeDasharray={circumference}
                              strokeDashoffset={0}
                              className="transition-all duration-1000"
                              style={{ strokeDasharray: `${dashArray} ${circumference}` }}
                            />
                          );
                        })}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeDasharray={2 * Math.PI * 40} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{stats.totalTasks}</p>
                          <p className="text-[6px] sm:text-[8px] md:text-[10px] text-gray-500">Total Tasks</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 w-full md:w-auto">
                      {taskDistribution.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-1 sm:gap-1.5 md:gap-2 p-1 sm:p-1.5 md:p-2 bg-white/30 rounded-lg cursor-pointer hover:bg-white/50 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('/task');
                          }}
                        >
                          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full ${item.bg}`}></div>
                          <div className="flex-1 min-w-[30px] sm:min-w-[40px]">
                            <p className="text-[7px] sm:text-[8px] md:text-[10px] font-medium text-gray-700">{item.label}</p>
                            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-800">{item.value}</p>
                          </div>
                          <span className="text-[6px] sm:text-[8px] md:text-[10px] text-gray-500">
                            {stats.totalTasks > 0 ? Math.round((item.value / stats.totalTasks) * 100) : 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Trend Chart */}
              <div 
                className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                onClick={() => navigateTo('/task')}
              >
                <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-200/50 flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                    <FaChartLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-500" />
                    Weekly Task Trend
                  </h3>
                  <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-500">Last 7 days</span>
                </div>
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="h-24 sm:h-32 md:h-40 lg:h-48 flex items-end justify-between gap-0.5 sm:gap-1 md:gap-2">
                    {weeklyTrend.map((day, index) => {
                      const height = maxTasks > 0 ? (day.tasks / maxTasks) * 100 : 0;
                      const colors = ['from-indigo-400 to-indigo-500', 'from-blue-400 to-blue-500', 'from-cyan-400 to-cyan-500', 'from-teal-400 to-teal-500', 'from-emerald-400 to-emerald-500', 'from-green-400 to-green-500', 'from-lime-400 to-lime-500'];
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2">
                          <div 
                            className={`w-full max-w-[14px] sm:max-w-[20px] md:max-w-[30px] lg:max-w-[40px] bg-gradient-to-t ${colors[index % colors.length]} rounded-t-lg transition-all duration-500 hover:scale-105 cursor-pointer relative group`}
                            style={{ height: `${Math.max(height, 5)}%`, minHeight: day.tasks > 0 ? '12px' : '4px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateTo('/task');
                            }}
                          >
                            <div className="absolute -top-5 sm:-top-6 md:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[6px] sm:text-[8px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {day.tasks} tasks
                            </div>
                          </div>
                          <span className="text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-gray-500 font-medium">{day.day}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1 sm:mt-2 md:mt-4 text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-gray-400">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {/* Recent Activities */}
              <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-200/50 flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                    <FiActivity className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-500" />
                    Recent Activities
                  </h3>
                  <button 
                    onClick={() => navigateTo('/task')}
                    className="text-[8px] sm:text-[10px] md:text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-gray-200/50 max-h-48 sm:max-h-60 md:max-h-80 overflow-y-auto">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div 
                        key={index} 
                        className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:bg-white/20 transition-colors flex items-center justify-between cursor-pointer"
                        onClick={() => navigateTo('/task')}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[8px] sm:text-xs md:text-sm shadow-lg shadow-indigo-500/25 flex-shrink-0">
                            {activity.avatar || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm text-gray-800 truncate">
                              <span className="font-semibold">{activity.user}</span>
                              <span className="text-gray-600"> {activity.action} </span>
                              <span className="font-semibold text-indigo-600">{activity.task}</span>
                            </p>
                            <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 flex items-center gap-0.5 sm:gap-1 mt-0.5">
                              <FiClock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                              {activity.time}
                            </p>
                          </div>
                        </div>
                        <span className="text-[6px] sm:text-[8px] md:text-[10px] px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium flex-shrink-0">
                          {activity.action}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 text-center text-gray-500 text-xs sm:text-sm">
                      No recent activities
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions & Stats */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                  <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-200/50">
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                      <FaRocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-500" />
                      Quick Actions
                    </h3>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2 md:space-y-2.5">
                    <button 
                      onClick={() => navigateTo('/staff')}
                      className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm"
                    >
                      <FiEye className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      View Staff
                    </button>
                    <button 
                      onClick={() => navigateTo('/task')}
                      className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm"
                    >
                      <FiBriefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      View All Tasks
                    </button>
                    <button 
                      onClick={() => navigateTo('/issues')}
                      className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm"
                    >
                      <FiTarget className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      Manage Issues
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
                  <div 
                    className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-white/30 shadow-lg text-center cursor-pointer hover:scale-105 transition-all"
                    onClick={() => navigateTo('/task')}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-0.5 sm:mb-1 md:mb-2">
                      <FiTrendingDown className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-rose-600" />
                    </div>
                    <p className="text-sm sm:text-base md:text-xl font-bold text-rose-600">{stats.overdueTasks}</p>
                    <p className="text-[6px] sm:text-[8px] md:text-[10px] text-gray-500 uppercase font-medium">Overdue</p>
                  </div>
                  <div 
                    className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-white/30 shadow-lg text-center cursor-pointer hover:scale-105 transition-all"
                    onClick={() => navigateTo('/task')}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-0.5 sm:mb-1 md:mb-2">
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600" />
                    </div>
                    <p className="text-sm sm:text-base md:text-xl font-bold text-emerald-600">{stats.completionRate}%</p>
                    <p className="text-[6px] sm:text-[8px] md:text-[10px] text-gray-500 uppercase font-medium">Rate</p>
                  </div>
                  <div 
                    className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-white/30 shadow-lg text-center cursor-pointer hover:scale-105 transition-all"
                    onClick={() => navigateTo('/staff')}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-0.5 sm:mb-1 md:mb-2">
                      <FiAward className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-600" />
                    </div>
                    <p className="text-sm sm:text-base md:text-xl font-bold text-indigo-600">{stats.totalEmployees}</p>
                    <p className="text-[6px] sm:text-[8px] md:text-[10px] text-gray-500 uppercase font-medium">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        
        @media (max-width: 480px) {
          .xs\\:block { display: block; }
          .xs\\:hidden { display: none; }
        }
        @media (min-width: 481px) {
          .xs\\:block { display: block; }
          .xs\\:hidden { display: none; }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;