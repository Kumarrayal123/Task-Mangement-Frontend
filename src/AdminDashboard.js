import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUsers, FiBriefcase, FiClock, FiCheckCircle, FiBarChart2, 
  FiUser, FiActivity, FiPlus, FiTrendingUp, FiCalendar, 
  FiStar, FiAward, FiTarget, FiTrendingDown, FiPieChart,
  FiLayers, FiZap, FiThumbsUp, FiEye, FiAlertCircle, FiBell,
  FiMenu, FiX, FiRefreshCw
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  // ─── Update current date and time ───
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentDateTime(now.toLocaleDateString('en-US', options));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

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
  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
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
      if (showRefresh) setIsRefreshing(false);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
      if (showRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ─── Fetch Notification Count ───
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tasks/notifications`);
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

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-2xl text-center max-w-md animate-slideDown">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <FiAlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700">{error}</h3>
          <p className="text-sm text-gray-500 mt-2">Please check your connection and try again</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
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
  
  // Task distribution with colors
  const taskDistribution = [
    { label: 'Completed', value: stats.completedTasks || 0, bg: 'bg-emerald-500', color: '#10b981', icon: '✅' },
    { label: 'In Progress', value: stats.inProgressTasks || 0, bg: 'bg-blue-500', color: '#3b82f6', icon: '🔄' },
    { label: 'Pending', value: stats.pendingTasks || 0, bg: 'bg-amber-500', color: '#f59e0b', icon: '⏳' },
    { label: 'Overdue', value: stats.overdueTasks || 0, bg: 'bg-rose-500', color: '#ef4444', icon: '⚠️' },
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

  // ─── Calculate pie chart segments ───
  const getPieSegments = () => {
    const total = stats.totalTasks || 0;
    if (total === 0) {
      return taskDistribution.map((item) => ({
        ...item,
        value: 0,
        percentage: 0,
        dashArray: 0,
        offset: 0
      }));
    }
    
    let segments = [];
    let currentOffset = 0;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    
    const activeSegments = taskDistribution.filter(item => item.value > 0);
    
    if (activeSegments.length === 0) {
      return taskDistribution.map((item) => ({
        ...item,
        percentage: 0,
        dashArray: 0,
        offset: 0
      }));
    }
    
    activeSegments.forEach((item) => {
      const percentage = (item.value / total) * 100;
      const dashArray = (percentage / 100) * circumference;
      
      segments.push({
        ...item,
        percentage: percentage,
        dashArray: dashArray,
        offset: currentOffset
      });
      
      currentOffset -= dashArray;
    });
    
    return segments;
  };

  const pieSegments = getPieSegments();

  // Color gradients for stat cards
  const statCardGradients = [
    'from-indigo-500 to-indigo-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600'
  ];

  const statIcons = [
    FiUsers,
    FiBriefcase,
    FiClock,
    FiTrendingUp,
    FiCheckCircle
  ];

  const statLabels = [
    'Employees',
    'Total Tasks',
    'Pending',
    'In Progress',
    'Completed'
  ];

  const statValues = [
    stats.totalEmployees,
    stats.totalTasks,
    stats.pendingTasks,
    stats.inProgressTasks,
    stats.completedTasks
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* ─── Mobile Menu Toggle ─── */}
        <div className="lg:hidden fixed top-3 left-3 z-50">
          <button
            onClick={toggleMobileMenu}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:bg-white transition-all hover:scale-105"
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

        {/* ─── Sidebar ─── */}
        <div 
          className={`
            fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ width: '280px' }}
        >
          <Sidebar userRole={userRole} />
          
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* ─── Main Content ─── */}
        <div className="flex-1 min-h-screen w-full lg:ml-0 overflow-y-auto">
          {/* Navbar */}
          <nav className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-white/30 shadow-sm">
            <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 lg:px-8 py-3 lg:py-4 gap-2">
              <div className="flex items-center gap-3 ml-10 lg:ml-0">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0 animate-pulse-slow">
                  <FaTasks className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                    Admin Dashboard
                  </h2>
                  <h2 className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent sm:hidden">
                    Dashboard
                  </h2>
                  <p className="text-[10px] text-gray-400 hidden sm:block">Manage your team efficiently</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/70 transition-all hover:scale-105 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                >
                  <FiRefreshCw className="w-4 h-4 text-indigo-600" />
                </button>

                {/* Notification Button */}
                <button
                  onClick={() => navigateTo('/notifications')}
                  className="relative p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/70 transition-all hover:scale-105"
                >
                  <FiBell className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] font-bold rounded-full shadow-lg shadow-rose-500/30 animate-bounce">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* User Info */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                    {adminName}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Logout</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Header with Date/Time */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 lg:mb-8 animate-slideDown">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
                  <FiBarChart2 className="w-7 h-7 md:w-8 md:h-8 text-indigo-500" />
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">Overview of your team's performance and tasks</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Glass Date/Time Capsule */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <FiCalendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Current Time</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap animate-pulse-slow">
                        {currentDateTime}
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-300/50"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-emerald-600 font-medium">Live</span>
                  </div>
                </div>

                {/* Create Task Button */}
                <button 
                  onClick={() => navigateTo('/task')}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Create Task
                </button>
              </div>
            </div>

            {/* Stats Cards - Glass morphism with animations */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 lg:mb-8">
              {statLabels.map((label, index) => {
                const Icon = statIcons[index];
                const value = statValues[index];
                const gradient = statCardGradients[index];
                
                return (
                  <div 
                    key={index}
                    onClick={() => navigateTo(index === 0 ? '/staff' : '/task')}
                    className="group relative bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer overflow-hidden"
                  >
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    {/* Glow effect */}
                    <div className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br ${gradient} rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`}></div>
                    
                    <div className="relative z-10 flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                        <Icon className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                        <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
                      </div>
                    </div>
                    
                    {/* Animated border */}
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${gradient} w-0 group-hover:w-full transition-all duration-500`}></div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 lg:mb-8">
              {/* Task Distribution Chart */}
              <div 
                className="group bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer overflow-hidden"
                onClick={() => navigateTo('/task')}
              >
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200/50 flex items-center justify-between">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FaChartPie className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 group-hover:rotate-12 transition-transform duration-300" />
                    Task Distribution
                  </h3>
                  <span className="text-[10px] md:text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">Total: {stats.totalTasks} tasks</span>
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                        
                        {pieSegments.map((segment, index) => {
                          const radius = 40;
                          const circumference = 2 * Math.PI * radius;
                          
                          if (segment.value === 0) return null;
                          
                          return (
                            <circle
                              key={index}
                              cx="50"
                              cy="50"
                              r={radius}
                              fill="none"
                              stroke={segment.color}
                              strokeWidth="12"
                              strokeDasharray={`${segment.dashArray} ${circumference}`}
                              strokeDashoffset={segment.offset}
                              className="transition-all duration-1000 ease-out"
                              style={{
                                strokeDasharray: `${segment.dashArray} ${circumference}`,
                                strokeDashoffset: segment.offset,
                                strokeLinecap: 'butt'
                              }}
                            >
                              <animate
                                attributeName="stroke-dashoffset"
                                from={segment.offset + segment.dashArray}
                                to={segment.offset}
                                dur="1.5s"
                                fill="freeze"
                              />
                            </circle>
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center animate-pulse-slow">
                          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{stats.totalTasks}</p>
                          <p className="text-[8px] md:text-[10px] text-gray-500">Total Tasks</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                      {taskDistribution.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 p-2 bg-white/30 rounded-lg hover:bg-white/50 transition-all hover:scale-105 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('/task');
                          }}
                        >
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <div className="flex-1 min-w-[40px]">
                            <p className="text-[8px] md:text-[10px] font-medium text-gray-700">{item.label}</p>
                            <p className="text-xs md:text-sm font-bold text-gray-800">{item.value}</p>
                          </div>
                          <span className="text-[8px] md:text-[10px] text-gray-500 font-semibold">
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
                className="group bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer overflow-hidden"
                onClick={() => navigateTo('/task')}
              >
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200/50 flex items-center justify-between">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FaChartLine className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                    Weekly Task Trend
                  </h3>
                  <span className="text-[10px] md:text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">Last 7 days</span>
                </div>
                <div className="p-4 md:p-6">
                  <div className="h-32 md:h-40 lg:h-48 flex items-end justify-between gap-1 md:gap-2">
                    {weeklyTrend.map((day, index) => {
                      const height = maxTasks > 0 ? (day.tasks / maxTasks) * 100 : 0;
                      const colors = ['from-indigo-400 to-indigo-500', 'from-blue-400 to-blue-500', 'from-cyan-400 to-cyan-500', 'from-teal-400 to-teal-500', 'from-emerald-400 to-emerald-500', 'from-green-400 to-green-500', 'from-lime-400 to-lime-500'];
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1 md:gap-2">
                          <div 
                            className={`w-full max-w-[20px] md:max-w-[30px] lg:max-w-[40px] bg-gradient-to-t ${colors[index % colors.length]} rounded-t-lg transition-all duration-500 hover:scale-110 cursor-pointer relative group/bar`}
                            style={{ 
                              height: `${Math.max(height, 8)}%`, 
                              minHeight: day.tasks > 0 ? '16px' : '6px',
                              animation: `barGrow ${0.5 + index * 0.1}s ease-out forwards`,
                              transformOrigin: 'bottom'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateTo('/task');
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[8px] md:text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                              {day.tasks} tasks
                            </div>
                          </div>
                          <span className="text-[8px] md:text-[10px] lg:text-xs text-gray-500 font-medium">{day.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Recent Activities */}
              <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200/50 flex items-center justify-between">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FiActivity className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
                    Recent Activities
                  </h3>
                  <button 
                    onClick={() => navigateTo('/task')}
                    className="text-[10px] md:text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-gray-200/50 max-h-60 md:max-h-80 overflow-y-auto">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div 
                        key={index} 
                        className="px-4 md:px-6 py-3 md:py-4 hover:bg-white/20 transition-all hover:scale-[1.01] cursor-pointer group/activity"
                        onClick={() => navigateTo('/task')}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex-shrink-0 group-hover/activity:scale-110 transition-transform">
                            {activity.avatar || activity.user?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm text-gray-800 truncate">
                              <span className="font-semibold">{activity.user}</span>
                              <span className="text-gray-600"> {activity.action} </span>
                              <span className="font-semibold text-indigo-600">{activity.task}</span>
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <FiClock className="w-3 h-3" />
                              {activity.time}
                            </p>
                          </div>
                          <span className="text-[8px] md:text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium flex-shrink-0">
                            {activity.action}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 md:px-6 py-8 text-center text-gray-500 text-sm">
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FiActivity className="w-6 h-6 text-gray-400" />
                      </div>
                      No recent activities
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions & Stats */}
              <div className="space-y-4 md:space-y-6">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200/50">
                    <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaRocket className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                      Quick Actions
                    </h3>
                  </div>
                  <div className="p-3 md:p-4 space-y-2">
                    <button 
                      onClick={() => navigateTo('/staff')}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                    >
                      <FiEye className="w-4 h-4" />
                      View Staff
                    </button>
                    <button 
                      onClick={() => navigateTo('/task')}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                    >
                      <FiBriefcase className="w-4 h-4" />
                      View All Tasks
                    </button>
                    <button 
                      onClick={() => navigateTo('/issues')}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                    >
                      <FiTarget className="w-4 h-4" />
                      Manage Issues
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <div 
                    className="bg-white/40 backdrop-blur-xl rounded-2xl p-3 md:p-4 border border-white/30 shadow-lg text-center cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                    onClick={() => navigateTo('/task')}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <FiTrendingDown className="w-5 h-5 text-rose-600" />
                    </div>
                    <p className="text-lg md:text-xl font-bold text-rose-600">{stats.overdueTasks}</p>
                    <p className="text-[8px] md:text-[10px] text-gray-500 uppercase font-medium">Overdue</p>
                  </div>
                  <div 
                    className="bg-white/40 backdrop-blur-xl rounded-2xl p-3 md:p-4 border border-white/30 shadow-lg text-center cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                    onClick={() => navigateTo('/task')}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <FiStar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-lg md:text-xl font-bold text-emerald-600">{stats.completionRate}%</p>
                    <p className="text-[8px] md:text-[10px] text-gray-500 uppercase font-medium">Rate</p>
                  </div>
                  <div 
                    className="bg-white/40 backdrop-blur-xl rounded-2xl p-3 md:p-4 border border-white/30 shadow-lg text-center cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                    onClick={() => navigateTo('/staff')}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <FiAward className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-lg md:text-xl font-bold text-indigo-600">{stats.totalEmployees}</p>
                    <p className="text-[8px] md:text-[10px] text-gray-500 uppercase font-medium">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideDown { animation: slideDown 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        
        @media (max-width: 480px) {
          .xs\\:block { display: block; }
          .xs\\:hidden { display: none; }
        }
        @media (min-width: 481px) {
          .xs\\:block { display: block; }
          .xs\\:hidden { display: none; }
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;