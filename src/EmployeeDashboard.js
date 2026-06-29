import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiRefreshCw, 
  FiCalendar, 
  FiFolder, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiBarChart2,
  FiHome,
  FiList,
  FiLogOut,
  FiUser,
  FiBriefcase,
  FiChevronRight,
  FiFlag,
  FiStar,
  FiZap,
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiTarget,
  FiThumbsUp,
  FiEye,
  FiAlertTriangle,
  FiDollarSign,
  FiX,
  FiBell,
  FiClock as FiClockIcon,
  FiPlus,
  FiSmile
} from 'react-icons/fi';
import { FaTasks, FaRocket } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import EmployeeSidebar from './components/EmployeeSidebar';

const TASK_API = 'https://api.timelyhealth.in/api/tasks';
const NOTIFICATIONS_API = 'https://api.timelyhealth.in/api/tasks/employeenotifications';

// ── Helpers ──────────────────────────────────────────────────────────────────
const priorityMeta = {
  Critical: { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiAlertCircle className="w-4 h-4" /> },
  High:     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiFlag className="w-4 h-4" /> },
  Medium:   { color: '#eab308', bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-200/50', icon: <FiStar className="w-4 h-4" /> },
  Low:      { color: '#22c55e', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-4 h-4" /> },
};

const statusMeta = {
  'Pending':     { color: '#6366f1', bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-200/50', icon: <FiClock className="w-4 h-4" /> },
  'In Progress': { color: '#3b82f6', bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-200/50', icon: <FiRefreshCw className="w-4 h-4" /> },
  'Completed':   { color: '#10b981', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-4 h-4" /> },
  'Rejected':    { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiX className="w-4 h-4" /> },
  'Overdue':     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiAlertCircle className="w-4 h-4" /> },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, gradient }) {
  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 
      shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer group">
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-lg ${gradient}`}>
          <span className="text-white text-sm sm:text-base lg:text-lg">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ── Quick Action Card ──────────────────────────────────────────────────────
function QuickActionCard({ icon, label, color, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 
        shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer group
        hover:border-${color}-300/50`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${color}`}>
          <span className="text-white text-sm sm:text-base lg:text-lg">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
            {label}
          </p>
          <p className="text-[6px] sm:text-[8px] lg:text-[10px] text-gray-400 truncate">
            Click to {label.toLowerCase()}
          </p>
        </div>
        <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all ml-auto" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDuePopup, setShowDuePopup] = useState(false);
  const [dueTask, setDueTask] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalAssignedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    rejectedTasks: 0,
    completionRate: 0,
    activeTasks: 0,
    priorityBreakdown: { Critical: 0, High: 0, Medium: 0, Low: 0 },
    upcomingTasks: [],
    recentlyCompleted: [],
    myCreatedTasks: 0,
    myReportedIssues: 0,
    myExpenses: 0
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Voice Function for Welcome (Female Voice) ──
  const speakWelcome = (name) => {
    if ('speechSynthesis' in window) {
      const message = `Welcome back, ${name}! Have a great day!`;
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Google UK') || 
        voice.name.includes('Victoria') ||
        voice.name.includes('Zira') ||
        voice.name.includes('Marie') ||
        voice.name.includes('Ellen') ||
        voice.name.includes('Susan') ||
        voice.name.includes('Karen')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        utterance.pitch = 1.3;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // ── Voice Function for Due Date Alert ──
  const speakDueAlert = (taskName, dueDate) => {
    if ('speechSynthesis' in window) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let message = '';
      
      if (diffDays < 0) {
        message = `Alert! Your task "${taskName}" is overdue by ${Math.abs(diffDays)} days! Please complete it immediately.`;
      } else if (diffDays === 0) {
        message = `Alert! Your task "${taskName}" is due today! Please complete it today.`;
      } else if (diffDays === 1) {
        message = `Warning! Your task "${taskName}" is due tomorrow! Please complete it before the deadline.`;
      } else if (diffDays <= 3) {
        message = `Reminder! Your task "${taskName}" is due in ${diffDays} days! Please complete it before the deadline.`;
      } else {
        message = `Reminder! Your task "${taskName}" is due on ${formatDate(dueDate)}. Please complete it before the deadline.`;
      }
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Google UK') || 
        voice.name.includes('Victoria') ||
        voice.name.includes('Zira') ||
        voice.name.includes('Marie') ||
        voice.name.includes('Ellen') ||
        voice.name.includes('Susan') ||
        voice.name.includes('Karen')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        utterance.pitch = 1.3;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // ── Dismiss Welcome Popup ──
  const dismissWelcomePopup = () => {
    setShowWelcomePopup(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) { navigate('/'); return; }
    try {
      const d = JSON.parse(raw);
      const name = d.employee?.name || d.name || d.fullName || d.employeeName || d.username ||
                   d.firstName || d.user?.name || d.data?.name || 'Employee';
      const id = d.employee?._id || d.employee?.id || d._id || d.id || 
                 d.employeeId || d.userId || d.user?._id || d.data?._id || '';
      setName(name);
      setEmpId(id);
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  }, [navigate]);

  const fetchNotificationCount = useCallback(async () => {
    if (!employeeId) return;
    try {
      const res = await axios.get(`${NOTIFICATIONS_API}/${employeeId}`);
      if (res.data.success) {
        setNotificationCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Notification count fetch error:', err);
    }
  }, [employeeId]);

  const fetchDashboard = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${TASK_API}/employee-dashboard/${employeeId}`);
      const data = res.data;
      
      if (data.success) {
        setDashboardData(data.dashboard);
        
        if (showWelcomePopup) {
          setTimeout(() => {
            speakWelcome(employeeName);
          }, 800);
        }
        
        const upcoming = data.dashboard.upcomingTasks || [];
        if (upcoming.length > 0) {
          const nearestTask = upcoming[0];
          setDueTask(nearestTask);
          setShowDuePopup(true);
          
          setTimeout(() => {
            speakDueAlert(nearestTask.title || nearestTask.taskName, nearestTask.dueDate);
          }, 1500);
        }
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [employeeId, employeeName, showWelcomePopup]);

  useEffect(() => { 
    if (employeeId) {
      fetchDashboard();
      fetchNotificationCount();
    }
  }, [fetchDashboard, fetchNotificationCount, employeeId]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleTaskClick = (task) => {
    setShowDuePopup(false);
    navigate('/my-task', { state: { task } });
  };

  const closePopup = () => {
    setShowDuePopup(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const navigateToNotifications = () => {
    if (showWelcomePopup) dismissWelcomePopup();
    navigate('/my-notifications');
  };

  const navigateToProfile = () => {
    if (showWelcomePopup) dismissWelcomePopup();
    navigate('/employee-profile');
  };

  const navigateToMyTasks = () => {
    if (showWelcomePopup) dismissWelcomePopup();
    navigate('/my-task');
  };

  const navigateToCreateTask = () => {
    if (showWelcomePopup) dismissWelcomePopup();
    navigate('/create-task');
  };

  const {
    totalAssignedTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    completionRate,
    activeTasks,
    priorityBreakdown,
    upcomingTasks,
    recentlyCompleted,
    myCreatedTasks,
    myReportedIssues,
    myExpenses
  } = dashboardData;

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const mainContentPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]';

  // ── Prepare chart data ──
  const pieData = Object.entries(priorityBreakdown).map(([name, value]) => ({
    name,
    value,
    color: priorityMeta[name]?.color || '#94a3b8'
  })).filter(item => item.value > 0);

  const barData = [
    { name: 'Critical', tasks: priorityBreakdown.Critical || 0, color: '#ef4444' },
    { name: 'High', tasks: priorityBreakdown.High || 0, color: '#f97316' },
    { name: 'Medium', tasks: priorityBreakdown.Medium || 0, color: '#eab308' },
    { name: 'Low', tasks: priorityBreakdown.Low || 0, color: '#22c55e' }
  ];

  const performanceData = [
    { name: 'Tasks Done', value: completedTasks, color: '#6366f1', icon: '📊' },
    { name: 'Active Tasks', value: activeTasks, color: '#f59e0b', icon: '⚡' },
    { name: 'Completion Rate', value: completionRate, color: '#10b981', icon: '📈' },
    { name: 'Created Tasks', value: myCreatedTasks, color: '#8b5cf6', icon: '📝' },
    { name: 'Reported Issues', value: myReportedIssues, color: '#ef4444', icon: '🐛' },
    { name: 'Expenses (₹)', value: myExpenses, color: '#22c55e', icon: '💰' }
  ];

  const extraStatsData = [
    { name: 'Reported Issues', value: myReportedIssues, color: '#ef4444' },
    { name: 'Total Expenses', value: myExpenses / 100, color: '#22c55e' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-lg border border-white/30 text-xs sm:text-sm">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-gray-600">Value: <span className="font-bold">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  const PerformanceTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-lg border border-white/30 text-xs sm:text-sm">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-gray-600">Value: <span className="font-bold">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex">
      <EmployeeSidebar 
        employeeName={employeeName} 
        onLogout={handleLogout}
        onCollapseChange={handleSidebarToggle}
      />

      <div className={`flex-1 ${mainContentPadding} flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
        {/* ── Welcome Popup with BOTTOM MARGIN FIX ── */}
        {showWelcomePopup && (
          <div 
            className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
            onClick={dismissWelcomePopup}
          >
            <div 
              className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl animate-welcome-bounce relative mb-4 sm:mb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={dismissWelcomePopup}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group z-10"
                title="Close"
              >
                <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

              <div className="p-4 sm:p-6 text-center">
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute -top-8 -left-8 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full opacity-50 blur-2xl"></div>
                  <div className="relative flex items-center justify-center">
                    <div 
                      onClick={dismissWelcomePopup}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-float cursor-pointer hover:scale-110 transition-all duration-300 group"
                      title="Click to dismiss"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FiSmile className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        <span className="text-[5px] sm:text-[7px] text-white/90 font-medium mt-0.5 group-hover:scale-110 transition-transform">
                          click me
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  Welcome Back!
                </h2>

                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                  <span className="font-bold text-indigo-600">{employeeName}</span>
                </p>

                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 px-2">
                  We're happy to see you again! Have a productive day ahead. 🎉
                </p>

                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[8px] sm:text-[10px] text-purple-500 font-medium animate-pulse">
                    📍 Female voice speaking...
                  </span>
                </div>

                <button
                  onClick={dismissWelcomePopup}
                  className="group px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2 mx-auto"
                >
                  <FiSmile className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
                  Let's Go!
                </button>

                <p className="text-[6px] sm:text-[8px] text-gray-400 mt-2">
                  Click anywhere outside or click "Let's Go!" to dismiss
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Due Date Popup with BOTTOM MARGIN FIX ── */}
        {showDuePopup && dueTask && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-slideDown relative mb-4 sm:mb-8">
              <button
                onClick={closePopup}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group"
                title="Close"
              >
                <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

              <div className="p-4 sm:p-6">
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute -top-6 sm:-top-8 -left-6 sm:-left-8 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full opacity-50 blur-2xl"></div>
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-pulse-slow">
                      <FiBell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    ⏰ Task Reminder!
                  </h3>
                  <div className="mt-1 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200/50">
                    <FiClockIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-500" />
                    <span className="text-[8px] sm:text-[10px] font-medium text-amber-700">
                      {getDaysLeft(dueTask.dueDate) < 0 ? '⚠️ Overdue!' : 
                       getDaysLeft(dueTask.dueDate) === 0 ? '🔥 Due Today!' :
                       `${getDaysLeft(dueTask.dueDate)} days left`}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-pink-50/80 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-white/50 shadow-inner">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Task Name</p>
                      <p className="text-sm sm:text-base font-bold text-gray-800 mt-0.5">{dueTask.title || dueTask.taskName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Due Date</p>
                        <p className="text-xs sm:text-sm font-semibold text-amber-600 mt-0.5 flex items-center gap-0.5 sm:gap-1">
                          <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {formatDate(dueTask.dueDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</p>
                        <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold mt-0.5 ${statusMeta[dueTask.status]?.bg || 'bg-gray-100'} ${statusMeta[dueTask.status]?.text || 'text-gray-600'} border ${statusMeta[dueTask.status]?.border || 'border-gray-200'}`}>
                          {statusMeta[dueTask.status]?.icon}
                          {dueTask.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Priority</p>
                      <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold mt-0.5 ${priorityMeta[dueTask.priority]?.bg || 'bg-gray-100'} ${priorityMeta[dueTask.priority]?.text || 'text-gray-600'} border ${priorityMeta[dueTask.priority]?.border || 'border-gray-200'}`}>
                        {priorityMeta[dueTask.priority]?.icon}
                        {dueTask.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {dueTask.description && (
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3 px-1 italic line-clamp-2">
                    "{dueTask.description}"
                  </p>
                )}

                <p className="text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4 text-center">
                  {getDaysLeft(dueTask.dueDate) < 0 ? (
                    <span className="text-rose-600 font-semibold">⚠️ This task is overdue! Please complete it immediately.</span>
                  ) : getDaysLeft(dueTask.dueDate) === 0 ? (
                    <span className="text-orange-600 font-semibold">🔥 This task is due today! Please complete it now.</span>
                  ) : getDaysLeft(dueTask.dueDate) <= 3 ? (
                    <span className="text-orange-600 font-semibold">⏳ Hurry up! The deadline is approaching fast.</span>
                  ) : (
                    <span>📌 Please complete this task before the deadline.</span>
                  )}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleTaskClick(dueTask)}
                    className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-[10px] sm:text-xs font-semibold shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-1.5"
                  >
                    <FiEye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    View Task
                  </button>
                  <button
                    onClick={closePopup}
                    className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] sm:text-xs font-medium transition-all hover:scale-105 flex items-center gap-1 sm:gap-1.5"
                  >
                    <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Fixed Header ── */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <FaTasks className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block truncate">
                  Employee Dashboard
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Dashboard
                </h2>
                <p className="text-[8px] sm:text-[10px] text-gray-500 hidden xs:block truncate max-w-[120px] sm:max-w-[200px]">
                  Welcome back, {employeeName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
              <button
                onClick={navigateToNotifications}
                className="relative px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/70 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
              >
                <FiBell className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-indigo-600" />
                <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700 hidden xs:inline">My Notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[8px] sm:text-[10px] font-bold rounded-full shadow-lg shadow-rose-500/30 animate-pulse-slow">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>

              <button 
                onClick={fetchDashboard} 
                className="p-1.5 sm:p-2 lg:p-2.5 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 transition-all hover:scale-105"
                title="Refresh tasks"
              >
                <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[10px] sm:text-xs lg:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
              >
                <FiLogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xs:inline">Logout</span>
              </button>
              <button
                onClick={navigateToProfile}
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs lg:text-sm shadow-lg shadow-indigo-500/30 flex-shrink-0 hover:scale-105 transition-all cursor-pointer"
              >
                {getInitials(employeeName)}
              </button>
            </div>
          </div>
        </header>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {error && (
            <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 
              rounded-xl flex items-center gap-2 sm:gap-3 text-rose-700 text-xs sm:text-sm">
              <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              {error}
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm text-gray-500">Loading dashboard...</p>
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                  <StatCard 
                    label="Total Tasks" 
                    value={totalAssignedTasks} 
                    icon={<FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />} 
                    gradient="bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-indigo-500/30" 
                  />
                  <StatCard 
                    label="In Progress" 
                    value={inProgressTasks} 
                    icon={<FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />} 
                    gradient="bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-500/30" 
                  />
                  <StatCard 
                    label="Completed" 
                    value={completedTasks} 
                    icon={<FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />} 
                    gradient="bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/30" 
                  />
                  <StatCard 
                    label="Pending" 
                    value={pendingTasks} 
                    icon={<FiClock className="w-4 h-4 sm:w-5 sm:h-5" />} 
                    gradient="bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-500/30" 
                  />
                  <StatCard 
                    label="Overdue" 
                    value={overdueTasks} 
                    icon={<FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />} 
                    gradient="bg-gradient-to-r from-rose-400 to-rose-500 shadow-rose-500/30" 
                  />
                  <StatCard 
                    label="Completion Rate" 
                    value={`${completionRate}%`} 
                    icon={<FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />} 
                    gradient="bg-gradient-to-r from-purple-400 to-purple-500 shadow-purple-500/30" 
                  />
                </div>

                {/* ── QUICK ACTIONS ── */}
                <section className="rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                      <FiZap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      Quick Actions
                    </h2>
                    <span className="text-[8px] sm:text-xs text-gray-400">Get things done</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <QuickActionCard 
                      icon={<FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
                      label="Add New Task"
                      color="from-emerald-400 to-emerald-500"
                      onClick={navigateToCreateTask}
                    />
                    
                    <QuickActionCard 
                      icon={<FiList className="w-4 h-4 sm:w-5 sm:h-5" />}
                      label="My Tasks"
                      color="from-indigo-400 to-purple-500"
                      onClick={navigateToMyTasks}
                    />
                  </div>
                </section>

                {/* Performance Metrics - Charts */}
                <section className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-lg">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                      <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      Performance Metrics
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">Task Statistics</h3>
                      <div className="w-full h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={performanceData.slice(0, 4)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} />
                            <YAxis tick={{ fontSize: 8 }} />
                            <Tooltip content={<PerformanceTooltip />} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {performanceData.slice(0, 4).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">Performance Overview</h3>
                      <div className="w-full h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} />
                            <YAxis tick={{ fontSize: 8 }} />
                            <Tooltip content={<PerformanceTooltip />} />
                            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Two columns - Upcoming & Recently Completed */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <section className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-lg">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                        <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                        Upcoming Deadlines
                      </h2>
                      <button 
                        onClick={navigateToMyTasks}
                        className="text-[10px] sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium 
                          flex items-center gap-0.5 sm:gap-1 hover:gap-1 sm:hover:gap-2 transition-all"
                      >
                        View All <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    {upcomingTasks.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <div className="text-3xl sm:text-4xl mb-2 flex justify-center">
                          <FiThumbsUp className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-400" />
                        </div>
                        <p className="text-xs sm:text-sm">No upcoming tasks! 🎉</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 sm:space-y-2 max-h-60 sm:max-h-80 overflow-y-auto pr-1">
                        {upcomingTasks.map(t => {
                          const st = statusMeta[t.status] || statusMeta['Pending'];
                          const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
                          return (
                            <div 
                              key={t._id} 
                              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 
                                bg-white/40 backdrop-blur-sm rounded-xl border border-white/30
                                hover:bg-white/60 transition-all cursor-pointer group"
                              onClick={() => handleTaskClick(t)}
                            >
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0" style={{ background: pr.color }} />
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] sm:text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                                  {t.title || t.taskName}
                                </div>
                                <div className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                                  <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  Due {formatDate(t.dueDate)}
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium flex-shrink-0 ${st.bg} ${st.text} border ${st.border}`}>
                                {st.icon}
                                <span className="hidden xs:inline">{t.status}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-lg">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                        <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        Recently Completed
                      </h2>
                      <span className="text-[8px] sm:text-xs text-gray-500">Last {recentlyCompleted.length}</span>
                    </div>
                    {recentlyCompleted.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <div className="text-3xl sm:text-4xl mb-2 flex justify-center">
                          <FiFolder className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
                        </div>
                        <p className="text-xs sm:text-sm">No completed tasks yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 sm:space-y-2 max-h-60 sm:max-h-80 overflow-y-auto pr-1">
                        {recentlyCompleted.map(t => {
                          const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
                          return (
                            <div 
                              key={t._id} 
                              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 
                                bg-white/40 backdrop-blur-sm rounded-xl border border-white/30
                                hover:bg-white/60 transition-all cursor-pointer group"
                              onClick={() => handleTaskClick(t)}
                            >
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 bg-emerald-500" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] sm:text-sm font-medium text-gray-800 truncate group-hover:text-emerald-600 transition-colors">
                                  {t.title || t.taskName}
                                </div>
                                <div className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                                  <FiCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
                                  Completed
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium flex-shrink-0 ${pr.bg} ${pr.text} border ${pr.border}`}>
                                {pr.icon}
                                <span className="hidden xs:inline">{t.priority}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>

                {/* Issues & Expenses Charts */}
                <section className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-lg">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                      <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                      Issues & Expenses Overview
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">Distribution</h3>
                      <div className="w-full h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Issues', value: myReportedIssues || 1, color: '#ef4444' },
                                { name: 'Expenses (₹)', value: Math.max(myExpenses / 100, 1), color: '#22c55e' }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={55}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              <Cell fill="#ef4444" />
                              <Cell fill="#22c55e" />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                              verticalAlign="bottom" 
                              height={30}
                              formatter={(value) => <span className="text-[8px] sm:text-xs text-gray-700">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">Values</h3>
                      <div className="w-full h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={extraStatsData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} />
                            <YAxis tick={{ fontSize: 8 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {extraStatsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Priority Breakdown - Charts */}
                <section className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-lg">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                      <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                      Priority Breakdown
                    </h2>
                    <button 
                      onClick={navigateToMyTasks}
                      className="text-[10px] sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium 
                        flex items-center gap-0.5 sm:gap-1 hover:gap-1 sm:hover:gap-2 transition-all"
                    >
                      View All <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">Task Distribution</h3>
                      <div className="w-full h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={55}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                              verticalAlign="bottom" 
                              height={30}
                              formatter={(value) => <span className="text-[8px] sm:text-xs text-gray-700">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">Priority Level Tasks</h3>
                      <div className="w-full h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 5, left: 30, bottom: 5 }}>
                            <XAxis type="number" tick={{ fontSize: 8 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} width={50} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255,255,255,0.9)', 
                                backdropFilter: 'blur(8px)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                fontSize: '10px'
                              }}
                            />
                            <Bar dataKey="tasks" radius={[0, 4, 4, 0]}>
                              {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
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
        @keyframes welcomeBounce {
          0% { opacity: 0; transform: scale(0.3) rotate(-3deg); }
          50% { opacity: 1; transform: scale(1.05) rotate(1deg); }
          70% { transform: scale(0.95) rotate(-0.5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-welcome-bounce { animation: welcomeBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }

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

export default EmployeeDashboard;