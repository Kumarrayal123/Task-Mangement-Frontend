// import React, { useEffect, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { 
//   FiRefreshCw, 
//   FiCalendar, 
//   FiFolder, 
//   FiCheckCircle, 
//   FiClock, 
//   FiAlertCircle,
//   FiBarChart2,
//   FiHome,
//   FiList,
//   FiLogOut,
//   FiUser,
//   FiBriefcase,
//   FiChevronRight,
//   FiFlag,
//   FiStar,
//   FiZap,
//   FiTrendingUp,
//   FiTrendingDown,
//   FiAward,
//   FiTarget,
//   FiThumbsUp,
//   FiEye,
//   FiAlertTriangle,
//   FiDollarSign,
//   FiX,
//   FiBell,
//   FiClock as FiClockIcon,
//   FiPlus,
//   FiSmile,
//   FiSun,
//   FiMoon,
//   FiCloud,
//   FiActivity
// } from 'react-icons/fi';
// import { FaTasks, FaRocket, FaChartLine, FaChartPie, FaUsers } from 'react-icons/fa';
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid, AreaChart, Area, ComposedChart } from 'recharts';
// import Navbar from './Navbar';

// const TASK_API = 'https://api.timelyhealth.in/api/tasks';
// const NOTIFICATIONS_API = 'https://api.timelyhealth.in/api/tasks/employeenotifications';

// // Chart color palette - no yellow
// const CHART_COLORS = {
//   completed: '#039855',
//   inProgress: '#175cd3',
//   pending: '#f59e0b',
//   overdue: '#d92d20',
//   primary: '#6366f1',
//   secondary: '#8b5cf6',
//   success: '#10b981',
//   danger: '#ef4444',
//   warning: '#f97316',
//   info: '#3b82f6',
//   purple: '#8b5cf6',
//   pink: '#ec4899',
//   teal: '#14b8a6',
//   cyan: '#06b6d4',
//   indigo: '#6366f1',
//   emerald: '#10b981',
//   rose: '#ef4444',
//   orange: '#f97316',
//   blue: '#3b82f6'
// };

// function getGreeting() {
//   const hour = new Date().getHours();
//   if (hour < 12) return { text: 'Good Morning', icon: <FiSun className="w-4 h-4 text-amber-500" /> };
//   if (hour < 18) return { text: 'Good Afternoon', icon: <FiCloud className="w-4 h-4 text-orange-400" /> };
//   return { text: 'Good Evening', icon: <FiMoon className="w-4 h-4 text-indigo-400" /> };
// }

// const CustomChartTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700/50 shadow-2xl text-xs">
//         <p className="font-semibold text-slate-300 mb-1">{label}</p>
//         {payload.map((entry, index) => (
//           <div key={`item-${index}`} className="flex items-center gap-2">
//             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
//             <span className="text-slate-400 capitalize">{entry.name}:</span>
//             <span className="font-bold text-white">{entry.value}</span>
//           </div>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// // ── Helpers ──────────────────────────────────────────────────────────────────
// const priorityMeta = {
//   Critical: { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiAlertCircle className="w-4 h-4" /> },
//   High:     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiFlag className="w-4 h-4" /> },
//   Medium:   { color: '#8b5cf6', bg: 'bg-purple-50/80', text: 'text-purple-600', border: 'border-purple-200/50', icon: <FiStar className="w-4 h-4" /> },
//   Low:      { color: '#22c55e', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-4 h-4" /> },
// };

// const statusMeta = {
//   'Pending':     { color: '#6366f1', bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-200/50', icon: <FiClock className="w-4 h-4" /> },
//   'In Progress': { color: '#3b82f6', bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-200/50', icon: <FiRefreshCw className="w-4 h-4" /> },
//   'Completed':   { color: '#10b981', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-4 h-4" /> },
//   'Rejected':    { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiX className="w-4 h-4" /> },
//   'Overdue':     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiAlertCircle className="w-4 h-4" /> },
// };

// function formatDate(d) {
//   if (!d) return '—';
//   return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
// }

// function getInitials(name = '') {
//   return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
// }

// // ── Stat Card - FIXED ICON RENDERING ────────────────────────────────────────
// function StatCard({ label, value, icon: IconComponent, gradient, onClick }) {
//   return (
//     <div onClick={onClick} className="relative bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 
//       shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer group overflow-hidden">
//       <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
//       <div className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br ${gradient} rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`}></div>
      
//       <div className="relative z-10 flex items-center gap-1.5 sm:gap-3">
//         <div className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${gradient} group-hover:scale-110 group-hover:rotate-6 transition-all`}>
//           {IconComponent}
//         </div>
//         <div className="min-w-0">
//           <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800">{value}</p>
//           <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider truncate">{label}</p>
//         </div>
//       </div>
      
//       <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${gradient} w-0 group-hover:w-full transition-all duration-500`}></div>
//     </div>
//   );
// }

// // ── Quick Action Card ──────────────────────────────────────────────────────
// function QuickActionCard({ icon: IconComponent, label, color, onClick, description }) {
//   return (
//     <div 
//       onClick={onClick}
//       className={`bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 
//         shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
//     >
//       <div className="flex items-center gap-2 sm:gap-3">
//         <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${color} group-hover:scale-110 transition-all`}>
//           {IconComponent}
//         </div>
//         <div className="min-w-0 flex-1">
//           <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
//             {label}
//           </p>
//           <p className="text-[6px] sm:text-[8px] lg:text-[10px] text-gray-400 truncate">
//             {description || `Click to ${label.toLowerCase()}`}
//           </p>
//         </div>
//         <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all ml-auto flex-shrink-0" />
//       </div>
//     </div>
//   );
// }

// // ── Main Component ────────────────────────────────────────────────────────────
// function EmployeeDashboard() {
//   const navigate = useNavigate();
//   const userRole = localStorage.getItem('userRole') || 'employee';
//   const [employeeName, setName] = useState('');
//   const [employeeId, setEmpId] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showDuePopup, setShowDuePopup] = useState(false);
//   const [dueTask, setDueTask] = useState(null);
//   const [showWelcomePopup, setShowWelcomePopup] = useState(true);
//   const [currentDateTime, setCurrentDateTime] = useState('');
//   const [dashboardData, setDashboardData] = useState({
//     totalAssignedTasks: 0,
//     pendingTasks: 0,
//     inProgressTasks: 0,
//     completedTasks: 0,
//     overdueTasks: 0,
//     rejectedTasks: 0,
//     completionRate: 0,
//     activeTasks: 0,
//     priorityBreakdown: { Critical: 0, High: 0, Medium: 0, Low: 0 },
//     upcomingTasks: [],
//     recentlyCompleted: [],
//     myCreatedTasks: 0,
//     myReportedIssues: 0,
//     myExpenses: 0
//   });
//   const [notificationCount, setNotificationCount] = useState(0);

//   // ─── Update current date and time ───
//   useEffect(() => {
//     const updateDateTime = () => {
//       const now = new Date();
//       const options = {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: true
//       };
//       setCurrentDateTime(now.toLocaleDateString('en-US', options));
//     };
    
//     updateDateTime();
//     const interval = setInterval(updateDateTime, 1000);
    
//     return () => clearInterval(interval);
//   }, []);

//   // ── Voice Function for Welcome (Female Voice) ──
//   const speakWelcome = (name) => {
//     if ('speechSynthesis' in window) {
//       const message = `Welcome back, ${name}! Have a great day!`;
      
//       const utterance = new SpeechSynthesisUtterance(message);
//       utterance.lang = 'en-US';
//       utterance.rate = 0.85;
//       utterance.pitch = 1.2;
//       utterance.volume = 1;
      
//       const voices = window.speechSynthesis.getVoices();
//       const femaleVoice = voices.find(voice => 
//         voice.name.includes('Female') || 
//         voice.name.includes('Samantha') ||
//         voice.name.includes('Google UK') || 
//         voice.name.includes('Victoria') ||
//         voice.name.includes('Zira') ||
//         voice.name.includes('Marie') ||
//         voice.name.includes('Ellen') ||
//         voice.name.includes('Susan') ||
//         voice.name.includes('Karen')
//       );
      
//       if (femaleVoice) {
//         utterance.voice = femaleVoice;
//       } else {
//         utterance.pitch = 1.3;
//       }
      
//       window.speechSynthesis.speak(utterance);
//     }
//   };

//   // ── Voice Function for Due Date Alert ──
//   const speakDueAlert = (taskName, dueDate) => {
//     if ('speechSynthesis' in window) {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const due = new Date(dueDate);
//       due.setHours(0, 0, 0, 0);
      
//       const diffTime = due.getTime() - today.getTime();
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
//       let message = '';
      
//       if (diffDays < 0) {
//         message = `Alert! Your task "${taskName}" is overdue by ${Math.abs(diffDays)} days! Please complete it immediately.`;
//       } else if (diffDays === 0) {
//         message = `Alert! Your task "${taskName}" is due today! Please complete it today.`;
//       } else if (diffDays === 1) {
//         message = `Warning! Your task "${taskName}" is due tomorrow! Please complete it before the deadline.`;
//       } else if (diffDays <= 3) {
//         message = `Reminder! Your task "${taskName}" is due in ${diffDays} days! Please complete it before the deadline.`;
//       } else {
//         message = `Reminder! Your task "${taskName}" is due on ${formatDate(dueDate)}. Please complete it before the deadline.`;
//       }
      
//       const utterance = new SpeechSynthesisUtterance(message);
//       utterance.lang = 'en-US';
//       utterance.rate = 0.85;
//       utterance.pitch = 1.2;
//       utterance.volume = 1;
      
//       const voices = window.speechSynthesis.getVoices();
//       const femaleVoice = voices.find(voice => 
//         voice.name.includes('Female') || 
//         voice.name.includes('Samantha') ||
//         voice.name.includes('Google UK') || 
//         voice.name.includes('Victoria') ||
//         voice.name.includes('Zira') ||
//         voice.name.includes('Marie') ||
//         voice.name.includes('Ellen') ||
//         voice.name.includes('Susan') ||
//         voice.name.includes('Karen')
//       );
      
//       if (femaleVoice) {
//         utterance.voice = femaleVoice;
//       } else {
//         utterance.pitch = 1.3;
//       }
      
//       window.speechSynthesis.speak(utterance);
//     }
//   };


//   // ── Dismiss Welcome Popup ──
//   const dismissWelcomePopup = () => {
//     setShowWelcomePopup(false);
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//     }
//   };

//   useEffect(() => {
//     const raw = localStorage.getItem('userData');
//     if (!raw) { navigate('/'); return; }
//     try {
//       const d = JSON.parse(raw);
//       const name = d.employee?.name || d.name || d.fullName || d.employeeName || d.username ||
//                    d.firstName || d.user?.name || d.data?.name || 'Employee';
//       const id = d.employee?._id || d.employee?.id || d._id || d.id || 
//                  d.employeeId || d.userId || d.user?._id || d.data?._id || '';
//       setName(name);
//       setEmpId(id);
      
//       if ('speechSynthesis' in window) {
//         window.speechSynthesis.getVoices();
//         window.speechSynthesis.onvoiceschanged = () => {
//           window.speechSynthesis.getVoices();
//         };
//       }
//     } catch (err) {
//       console.error(err);
//       navigate('/');
//     }
//   }, [navigate]);

//   const fetchNotificationCount = useCallback(async () => {
//     if (!employeeId) return;
//     try {
//       const res = await axios.get(`${NOTIFICATIONS_API}/${employeeId}`);
//       if (res.data.success) {
//         setNotificationCount(res.data.total || 0);
//       }
//     } catch (err) {
//       console.error('Notification count fetch error:', err);
//     }
//   }, [employeeId]);

//   const fetchDashboard = useCallback(async () => {
//     if (!employeeId) return;
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${TASK_API}/employee-dashboard/${employeeId}`);
//       const data = res.data;
      
//       if (data.success) {
//         setDashboardData(data.dashboard);
        
//         if (showWelcomePopup) {
//           setTimeout(() => {
//             speakWelcome(employeeName);
//           }, 800);
//         }
        
//         const upcoming = data.dashboard.upcomingTasks || [];
//         if (upcoming.length > 0) {
//           const nearestTask = upcoming[0];
//           setDueTask(nearestTask);
//           setShowDuePopup(true);
          
//           setTimeout(() => {
//             speakDueAlert(nearestTask.title || nearestTask.taskName, nearestTask.dueDate);
//           }, 1500);
//         }
//       } else {
//         setError('Failed to load dashboard data');
//       }
//     } catch (err) {
//       console.error('Dashboard fetch error:', err);
//       setError(err.response?.data?.message || 'Failed to load dashboard. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [employeeId, employeeName, showWelcomePopup]);

//   useEffect(() => { 
//     if (employeeId) {
//       fetchDashboard();
//       fetchNotificationCount();
//     }
//   }, [fetchDashboard, fetchNotificationCount, employeeId]);

//   const handleLogout = () => { localStorage.clear(); navigate('/'); };

//   const handleTaskClick = (task) => {
//     setShowDuePopup(false);
//     navigate('/my-task', { state: { task } });
//   };

//   const closePopup = () => {
//     setShowDuePopup(false);
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//     }
//   };

//   const navigateToNotifications = () => {
//     if (showWelcomePopup) dismissWelcomePopup();
//     navigate('/my-notifications');
//   };

//   const navigateToProfile = () => {
//     if (showWelcomePopup) dismissWelcomePopup();
//     navigate('/employee-profile');
//   };

//   const navigateToMyTasks = () => {
//     if (showWelcomePopup) dismissWelcomePopup();
//     navigate('/my-task');
//   };

//   const navigateToTodayTasks = () => {
//     if (showWelcomePopup) dismissWelcomePopup();
//     navigate('/my-today-tasks');
//   };

//   const navigateToCreateTask = () => {
//     if (showWelcomePopup) dismissWelcomePopup();
//     navigate('/create-task');
//   };

//   const {
//     totalAssignedTasks,
//     pendingTasks,
//     inProgressTasks,
//     completedTasks,
//     overdueTasks,
//     completionRate,
//     activeTasks,
//     priorityBreakdown,
//     upcomingTasks,
//     recentlyCompleted,
//     myCreatedTasks,
//     myReportedIssues,
//     myExpenses
//   } = dashboardData;

//   const getDaysLeft = (dueDate) => {
//     if (!dueDate) return 0;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const due = new Date(dueDate);
//     due.setHours(0, 0, 0, 0);
//     const diffTime = due.getTime() - today.getTime();
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   };

//   // ── Prepare chart data with improved colors ──
//   const pieData = Object.entries(priorityBreakdown).map(([name, value]) => ({
//     name,
//     value,
//     color: priorityMeta[name]?.color || CHART_COLORS.purple
//   })).filter(item => item.value > 0);

//   const barData = [
//     { name: 'Critical', tasks: priorityBreakdown.Critical || 0, color: CHART_COLORS.danger },
//     { name: 'High', tasks: priorityBreakdown.High || 0, color: CHART_COLORS.warning },
//     { name: 'Medium', tasks: priorityBreakdown.Medium || 0, color: CHART_COLORS.purple },
//     { name: 'Low', tasks: priorityBreakdown.Low || 0, color: CHART_COLORS.success }
//   ];

//   const performanceData = [
//     { name: 'Tasks Done', value: completedTasks, color: CHART_COLORS.indigo, icon: '📊' },
//     { name: 'Active Tasks', value: activeTasks, color: CHART_COLORS.warning, icon: '⚡' },
//     { name: 'Completion Rate', value: completionRate, color: CHART_COLORS.success, icon: '📈' },
//     { name: 'Created Tasks', value: myCreatedTasks, color: CHART_COLORS.purple, icon: '📝' },
//     { name: 'Reported Issues', value: myReportedIssues, color: CHART_COLORS.danger, icon: '🐛' },
//     { name: 'Expenses (₹)', value: myExpenses, color: CHART_COLORS.teal, icon: '💰' }
//   ];

//   const extraStatsData = [
//     { name: 'Reported Issues', value: myReportedIssues, color: CHART_COLORS.danger },
//     { name: 'Total Expenses', value: myExpenses / 100, color: CHART_COLORS.teal }
//   ];

//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-lg border border-white/30 text-xs sm:text-sm">
//           <p className="font-semibold text-gray-800">{payload[0].name}</p>
//           <p className="text-gray-600">Value: <span className="font-bold">{payload[0].value}</span></p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const PerformanceTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-lg border border-white/30 text-xs sm:text-sm">
//           <p className="font-semibold text-gray-800">{payload[0].name}</p>
//           <p className="text-gray-600">Value: <span className="font-bold">{payload[0].value}</span></p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col">
//       {/* ─── Horizontal Top Navbar ─── */}
//       <Navbar userRole={userRole} onLogout={handleLogout} />

//       {/* ─── Main Content Area (Full Width Layout) ─── */}
//       <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
//         <div className="admin-dash">
//         {/* ── Welcome Popup ── */}
//         {showWelcomePopup && (
//           <div 
//             className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
//             onClick={dismissWelcomePopup}
//           >
//             <div 
//               className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl animate-welcome-bounce relative mb-4 sm:mb-8"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 onClick={dismissWelcomePopup}
//                 className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group z-10"
//                 title="Close"
//               >
//                 <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
//               </button>

//               <div className="p-4 sm:p-6 text-center">
//                 <div className="relative mb-3 sm:mb-4">
//                   <div className="absolute -top-8 -left-8 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full opacity-50 blur-2xl"></div>
//                   <div className="relative flex items-center justify-center">
//                     <div 
//                       onClick={dismissWelcomePopup}
//                       className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-float cursor-pointer hover:scale-110 transition-all duration-300 group"
//                       title="Click to dismiss"
//                     >
//                       <div className="flex flex-col items-center justify-center">
//                         <FiSmile className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
//                         <span className="text-[5px] sm:text-[7px] text-white/90 font-medium mt-0.5 group-hover:scale-110 transition-transform">
//                           click me
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <h2 className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
//                   Welcome Back!
//                 </h2>

//                 <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
//                   <span className="font-bold text-indigo-600">{employeeName}</span>
//                 </p>

//                 <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 px-2">
//                   We're happy to see you again! Have a productive day ahead. 🎉
//                 </p>

//                 <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
//                   <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
//                   <span className="text-[8px] sm:text-[10px] text-purple-500 font-medium animate-pulse">
//                     📍 Female voice speaking...
//                   </span>
//                 </div>

//                 <button
//                   onClick={dismissWelcomePopup}
//                   className="group px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2 mx-auto"
//                 >
//                   <FiSmile className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
//                   Let's Go!
//                 </button>

//                 <p className="text-[6px] sm:text-[8px] text-gray-400 mt-2">
//                   Click anywhere outside or click "Let's Go!" to dismiss
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Due Date Popup ── */}
//         {showDuePopup && dueTask && (
//           <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
//             <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-slideDown relative mb-4 sm:mb-8">
//               <button
//                 onClick={closePopup}
//                 className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group"
//                 title="Close"
//               >
//                 <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
//               </button>

//               <div className="p-4 sm:p-6">
//                 <div className="relative mb-3 sm:mb-4">
//                   <div className="absolute -top-6 sm:-top-8 -left-6 sm:-left-8 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full opacity-50 blur-2xl"></div>
//                   <div className="relative flex items-center justify-center">
//                     <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-pulse-slow">
//                       <FiBell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="text-center mb-3 sm:mb-4">
//                   <h3 className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
//                     ⏰ Task Reminder!
//                   </h3>
//                   <div className="mt-1 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200/50">
//                     <FiClockIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-500" />
//                     <span className="text-[8px] sm:text-[10px] font-medium text-amber-700">
//                       {getDaysLeft(dueTask.dueDate) < 0 ? '⚠️ Overdue!' : 
//                        getDaysLeft(dueTask.dueDate) === 0 ? '🔥 Due Today!' :
//                        `${getDaysLeft(dueTask.dueDate)} days left`}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-pink-50/80 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-white/50 shadow-inner">
//                   <div className="space-y-2 sm:space-y-3">
//                     <div>
//                       <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Task Name</p>
//                       <p className="text-sm sm:text-base font-bold text-gray-800 mt-0.5">{dueTask.title || dueTask.taskName}</p>
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-2 sm:gap-3">
//                       <div>
//                         <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Due Date</p>
//                         <p className="text-xs sm:text-sm font-semibold text-amber-600 mt-0.5 flex items-center gap-0.5 sm:gap-1">
//                           <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                           {formatDate(dueTask.dueDate)}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</p>
//                         <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold mt-0.5 ${statusMeta[dueTask.status]?.bg || 'bg-gray-100'} ${statusMeta[dueTask.status]?.text || 'text-gray-600'} border ${statusMeta[dueTask.status]?.border || 'border-gray-200'}`}>
//                           {statusMeta[dueTask.status]?.icon}
//                           {dueTask.status}
//                         </span>
//                       </div>
//                     </div>

//                     <div>
//                       <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Priority</p>
//                       <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold mt-0.5 ${priorityMeta[dueTask.priority]?.bg || 'bg-gray-100'} ${priorityMeta[dueTask.priority]?.text || 'text-gray-600'} border ${priorityMeta[dueTask.priority]?.border || 'border-gray-200'}`}>
//                         {priorityMeta[dueTask.priority]?.icon}
//                         {dueTask.priority}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {dueTask.description && (
//                   <p className="text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3 px-1 italic line-clamp-2">
//                     "{dueTask.description}"
//                   </p>
//                 )}

//                 <p className="text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4 text-center">
//                   {getDaysLeft(dueTask.dueDate) < 0 ? (
//                     <span className="text-rose-600 font-semibold">⚠️ This task is overdue! Please complete it immediately.</span>
//                   ) : getDaysLeft(dueTask.dueDate) === 0 ? (
//                     <span className="text-orange-600 font-semibold">🔥 This task is due today! Please complete it now.</span>
//                   ) : getDaysLeft(dueTask.dueDate) <= 3 ? (
//                     <span className="text-orange-600 font-semibold">⏳ Hurry up! The deadline is approaching fast.</span>
//                   ) : (
//                     <span>📌 Please complete this task before the deadline.</span>
//                   )}
//                 </p>

//                 <div className="flex items-center justify-center gap-2">
//                   <button
//                     onClick={() => handleTaskClick(dueTask)}
//                     className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-[10px] sm:text-xs font-semibold shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-1.5"
//                   >
//                     <FiEye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                     View Task
//                   </button>
//                   <button
//                     onClick={closePopup}
//                     className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] sm:text-xs font-medium transition-all hover:scale-105 flex items-center gap-1 sm:gap-1.5"
//                   >
//                     <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                     Dismiss
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

            
//             {/* Header Section */}
//             <div className="admin-dash__header">
//               <div>
//                 <h1 className="admin-dash__greeting flex items-center gap-2">
//                   <FiSun className="w-4 h-4 text-amber-500" /> Employee <span>Dashboard</span>
//                 </h1>
//                 <p className="admin-dash__subtitle">
//                   Welcome back, {employeeName}. Track your tasks and performance in one place.
//                 </p>
//               </div>
//               <div className="flex items-center gap-4 flex-wrap">
//                 {/* ─── Live Date & Time Display ─── */}
//                 <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-700 font-semibold text-xs">
//                   <FiCalendar className="w-4 h-4 text-indigo-600" />
//                   <span>{currentDateTime}</span>
//                 </div>
                
//                 <button
//                   onClick={fetchDashboard}
//                   className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-sm"
//                   title="Refresh Data"
//                 >
//                   <FiRefreshCw className="w-4 h-4" />
//                 </button>

//                 <button
//                   onClick={navigateToCreateTask}
//                   className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
//                 >
//                   <FiPlus size={18} />
//                   Create Task
//                 </button>
//               </div>
//             </div>

//             <div className="space-y-8">
//               {error && (
//                 <div className="p-4 mb-6 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
//                   <FiAlertCircle className="w-5 h-5" />
//                   {error}
//                 </div>
//               )}

//               {loading ? (
//                 <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
//                   <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
//                   <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* 5 KPI Summary Stat Cards */}
//                   <div className="admin-dash__stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    
//                     <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/my-task')}>
//                       <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Total Tasks</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
//                           <FiBriefcase />
//                         </div>
//                       </div>
//                       <div className="admin-dash__stat-value">{totalAssignedTasks}</div>
//                       <div className="admin-dash__stat-meta">assigned to you</div>
//                     </div>

//                     <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/emp-pending-task')}>
//                       <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Pending</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
//                           <FiClock />
//                         </div>
//                       </div>
//                       <div className="admin-dash__stat-value">{pendingTasks}</div>
//                       <div className="admin-dash__stat-meta">awaiting action</div>
//                     </div>

//                     <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/emp-progress-task')}>
//                       <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">In Progress</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
//                           <FiTrendingUp />
//                         </div>
//                       </div>
//                       <div className="admin-dash__stat-value">{inProgressTasks}</div>
//                       <div className="admin-dash__stat-meta">currently active</div>
//                     </div>

//                     <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/emp-completed-task')}>
//                       <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Completed</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
//                           <FiCheckCircle />
//                         </div>
//                       </div>
//                       <div className="admin-dash__stat-value">{completedTasks}</div>
//                       <div className="admin-dash__stat-meta">successfully done</div>
//                     </div>

//                     <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/emp-overdue-task')}>
//                       <div className="admin-dash__stat-top">
//                         <span className="admin-dash__stat-label">Overdue</span>
//                         <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
//                           <FiAlertCircle />
//                         </div>
//                       </div>
//                       <div className="admin-dash__stat-value">{overdueTasks}</div>
//                       <div className="admin-dash__stat-meta">needs attention</div>
//                     </div>

//                   </div>

//                   {/* Quick Actions */}
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <button
//                       onClick={navigateToCreateTask}
//                       className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 text-slate-700 hover:text-indigo-700 transition text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
//                     >
//                       <FiPlus size={18} className="text-indigo-600" />
//                       Create Task
//                     </button>
//                     <button
//                       onClick={navigateToMyTasks}
//                       className="p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-300 text-slate-700 hover:text-purple-700 transition text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
//                     >
//                       <FiList size={18} className="text-purple-600" />
//                       My Tasks
//                     </button>
//                     <button
//                       onClick={navigateToTodayTasks}
//                       className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 text-slate-700 hover:text-amber-700 transition text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
//                     >
//                       <FiSun size={18} className="text-amber-600" />
//                       Today's Tasks
//                     </button>
//                   </div>

//                   {/* Task Distribution Chart */}
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
//                     <div className="admin-dash__card">
//                       <div className="admin-dash__card-header">
//                         <div>
//                           <h3 className="admin-dash__card-title">Task Distribution</h3>
//                           <p className="admin-dash__card-desc">Overview by status</p>
//                         </div>
//                         <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
//                           {completionRate}% Completed
//                         </span>
//                       </div>
//                       <div className="admin-dash__card-body">
//                         <div className="h-64">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                               <Pie
//                                 data={[
//                                   { name: 'Completed', value: completedTasks || 0, color: '#039855' },
//                                   { name: 'In Progress', value: inProgressTasks || 0, color: '#175cd3' },
//                                   { name: 'Pending', value: pendingTasks || 0, color: '#f59e0b' },
//                                   { name: 'Overdue', value: overdueTasks || 0, color: '#d92d20' }
//                                 ].filter(item => item.value > 0)}
//                                 cx="50%"
//                                 cy="50%"
//                                 innerRadius={60}
//                                 outerRadius={90}
//                                 paddingAngle={4}
//                                 dataKey="value"
//                               >
//                                 {[
//                                   { name: 'Completed', value: completedTasks || 0, color: '#039855' },
//                                   { name: 'In Progress', value: inProgressTasks || 0, color: '#175cd3' },
//                                   { name: 'Pending', value: pendingTasks || 0, color: '#f59e0b' },
//                                   { name: 'Overdue', value: overdueTasks || 0, color: '#d92d20' }
//                                 ].filter(item => item.value > 0).map((entry, index) => (
//                                   <Cell key={`cell-${index}`} fill={entry.color} />
//                                 ))}
//                               </Pie>
//                               <Tooltip content={<CustomTooltip />} />
//                             </PieChart>
//                           </ResponsiveContainer>
//                         </div>

//                         <div className="grid grid-cols-2 gap-3 mt-4">
//                           <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
//                               <span className="text-xs font-medium text-emerald-800">Completed</span>
//                             </div>
//                             <span className="text-xs font-bold text-emerald-900">{completedTasks}</span>
//                           </div>

//                           <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
//                               <span className="text-xs font-medium text-blue-800">In Progress</span>
//                             </div>
//                             <span className="text-xs font-bold text-blue-900">{inProgressTasks}</span>
//                           </div>

//                           <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
//                               <span className="text-xs font-medium text-amber-800">Pending</span>
//                             </div>
//                             <span className="text-xs font-bold text-amber-900">{pendingTasks}</span>
//                           </div>

//                           <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
//                               <span className="text-xs font-medium text-rose-800">Overdue</span>
//                             </div>
//                             <span className="text-xs font-bold text-rose-900">{overdueTasks}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Priority Breakdown Card */}
//                     <div className="admin-dash__card">
//                       <div className="admin-dash__card-header">
//                         <div>
//                           <h3 className="admin-dash__card-title">Priority Breakdown</h3>
//                           <p className="admin-dash__card-desc">Tasks grouped by urgency</p>
//                         </div>
//                         <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
//                           {totalAssignedTasks} Total Tasks
//                         </span>
//                       </div>
//                       <div className="admin-dash__card-body space-y-3">
//                         {Object.entries(priorityBreakdown).map(([name, count]) => {
//                           const meta = priorityMeta[name] || priorityMeta['Medium'];
//                           const percentage = totalAssignedTasks > 0 ? Math.round((count / totalAssignedTasks) * 100) : 0;
//                           return (
//                             <div 
//                               key={name}
//                               onClick={() => navigate('/my-task')}
//                               className={`p-3 rounded-xl ${meta.bg} border ${meta.border} hover:shadow-sm transition cursor-pointer`}
//                             >
//                               <div className="flex items-center justify-between mb-1.5">
//                                 <div className="flex items-center gap-2">
//                                   {meta.icon}
//                                   <span className={`text-xs font-bold ${meta.text}`}>{name} Priority</span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <span className="text-xs font-bold text-slate-800">{count} tasks</span>
//                                   <span className={`text-[10px] font-bold ${meta.text} bg-white px-2 py-0.5 rounded-full border border-slate-200`}>
//                                     {percentage}%
//                                   </span>
//                                 </div>
//                               </div>

//                               <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
//                                 <div 
//                                   className={`h-full bg-gradient-to-r from-${name === 'Critical' ? 'red-500 to-rose-600' : name === 'High' ? 'orange-500 to-amber-600' : name === 'Medium' ? 'purple-500 to-indigo-600' : 'emerald-500 to-teal-600'} rounded-full transition-all duration-500`}
//                                   style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
//                                 />
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>

//                   </div>

//                   {/* Upcoming & Recently Completed */}
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
//                     <div className="admin-dash__card">
//                       <div className="admin-dash__card-header">
//                         <div>
//                           <h3 className="admin-dash__card-title">Upcoming Deadlines</h3>
//                           <p className="admin-dash__card-desc">Tasks due soon</p>
//                         </div>
//                         <button 
//                           onClick={navigateToMyTasks}
//                           className="admin-dash__card-link"
//                         >
//                           View All <FiChevronRight />
//                         </button>
//                       </div>
//                       <div className="admin-dash__card-body">
//                         {upcomingTasks.length === 0 ? (
//                           <div className="text-center py-8">
//                             <FiThumbsUp size={32} className="mx-auto text-slate-300 mb-2" />
//                             <p className="text-xs font-semibold text-slate-600">No upcoming tasks</p>
//                             <p className="text-[10px] text-slate-400">You're all caught up! 🎉</p>
//                           </div>
//                         ) : (
//                           <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
//                             {upcomingTasks.map(t => {
//                               const st = statusMeta[t.status] || statusMeta['Pending'];
//                               const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
//                               return (
//                                 <div 
//                                   key={t._id}
//                                   onClick={() => handleTaskClick(t)}
//                                   className="py-2.5 px-1 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg transition cursor-pointer group"
//                                 >
//                                   <div className="flex items-center gap-3 min-w-0">
//                                     <div className="w-2 h-2 rounded-full" style={{ background: pr.color }} />
//                                     <div className="min-w-0">
//                                       <p className="text-xs font-medium text-slate-800 truncate group-hover:text-indigo-600">
//                                         {t.title || t.taskName}
//                                       </p>
//                                       <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
//                                         <FiCalendar size={12} />
//                                         Due {formatDate(t.dueDate)}
//                                       </p>
//                                     </div>
//                                   </div>
//                                   <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>
//                                     {st.icon}
//                                     {t.status}
//                                   </span>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div className="admin-dash__card">
//                       <div className="admin-dash__card-header">
//                         <div>
//                           <h3 className="admin-dash__card-title">Recently Completed</h3>
//                           <p className="admin-dash__card-desc">Your latest achievements</p>
//                         </div>
//                         <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
//                           {recentlyCompleted.length} tasks
//                         </span>
//                       </div>
//                       <div className="admin-dash__card-body">
//                         {recentlyCompleted.length === 0 ? (
//                           <div className="text-center py-8">
//                             <FiFolder size={32} className="mx-auto text-slate-300 mb-2" />
//                             <p className="text-xs font-semibold text-slate-600">No completed tasks yet</p>
//                             <p className="text-[10px] text-slate-400">Complete your first task to see it here</p>
//                           </div>
//                         ) : (
//                           <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
//                             {recentlyCompleted.map(t => {
//                               const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
//                               return (
//                                 <div 
//                                   key={t._id}
//                                   onClick={() => handleTaskClick(t)}
//                                   className="py-2.5 px-1 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg transition cursor-pointer group"
//                                 >
//                                   <div className="flex items-center gap-3 min-w-0">
//                                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
//                                     <div className="min-w-0">
//                                       <p className="text-xs font-medium text-slate-800 truncate group-hover:text-emerald-600">
//                                         {t.title || t.taskName}
//                                       </p>
//                                       <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
//                                         <FiCheckCircle size={12} className="text-emerald-500" />
//                                         Completed
//                                       </p>
//                                     </div>
//                                   </div>
//                                   <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
//                                     {pr.icon}
//                                     {t.priority}
//                                   </span>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                   </div>

//                   {/* Bottom Navigation Links */}
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
//                     <button
//                       onClick={navigateToMyTasks}
//                       className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 transition text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
//                     >
//                       <FiBriefcase size={16} className="text-indigo-600" />
//                       My Tasks
//                     </button>
//                     <button
//                       onClick={navigateToCreateTask}
//                       className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 transition text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
//                     >
//                       <FiPlus size={16} className="text-purple-600" />
//                       Create Task
//                     </button>
//                     <button
//                       onClick={navigateToProfile}
//                       className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 transition text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
//                     >
//                       <FiUser size={16} className="text-rose-600" />
//                       My Profile
//                     </button>
//                   </div>

        

//       </div>
//       </div>
//         </main>
//       </div>
//       )}
//     </div>
//   );
// }

// export default EmployeeDashboard;


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
  FiSmile,
  FiSun,
  FiMoon,
  FiCloud,
  FiActivity,
  FiPieChart,
  FiBarChart
} from 'react-icons/fi';
import { FaTasks, FaRocket, FaChartLine, FaChartPie, FaUsers, FaChartBar } from 'react-icons/fa';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, CartesianGrid, AreaChart, Area, 
  ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar
} from 'recharts';
import Navbar from './Navbar';  // ← Fixed: removed '../components/' prefix

const TASK_API = 'https://api.timelyhealth.in/api/tasks';
const NOTIFICATIONS_API = 'https://api.timelyhealth.in/api/tasks/employeenotifications';

// Chart color palette
const CHART_COLORS = {
  completed: '#039855',
  inProgress: '#175cd3',
  pending: '#f59e0b',
  overdue: '#d92d20',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f97316',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  emerald: '#10b981',
  rose: '#ef4444',
  orange: '#f97316',
  blue: '#3b82f6',
  amber: '#f59e0b',
  violet: '#7c3aed'
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: <FiSun className="w-4 h-4 text-amber-500" /> };
  if (hour < 18) return { text: 'Good Afternoon', icon: <FiCloud className="w-4 h-4 text-orange-400" /> };
  return { text: 'Good Evening', icon: <FiMoon className="w-4 h-4 text-indigo-400" /> };
}

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700/50 shadow-2xl text-xs">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const priorityMeta = {
  Critical: { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiAlertCircle className="w-4 h-4" /> },
  High:     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiFlag className="w-4 h-4" /> },
  Medium:   { color: '#8b5cf6', bg: 'bg-purple-50/80', text: 'text-purple-600', border: 'border-purple-200/50', icon: <FiStar className="w-4 h-4" /> },
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

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: IconComponent, gradient, onClick }) {
  return (
    <div onClick={onClick} className="relative bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 
      shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer group overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br ${gradient} rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`}></div>
      
      <div className="relative z-10 flex items-center gap-1.5 sm:gap-3">
        <div className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${gradient} group-hover:scale-110 group-hover:rotate-6 transition-all`}>
          {IconComponent}
        </div>
        <div className="min-w-0">
          <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider truncate">{label}</p>
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${gradient} w-0 group-hover:w-full transition-all duration-500`}></div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function EmployeeDashboard() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'employee';
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDuePopup, setShowDuePopup] = useState(false);
  const [dueTask, setDueTask] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState('');
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
    myExpenses: 0,
    weeklyProgress: [],
    monthlyStats: []
  });
  const [notificationCount, setNotificationCount] = useState(0);

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

  // ── Voice Function for Welcome ──
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
        voice.name.includes('Female') || voice.name.includes('Samantha') ||
        voice.name.includes('Google UK') || voice.name.includes('Victoria') ||
        voice.name.includes('Zira') || voice.name.includes('Marie')
      );
      
      if (femaleVoice) utterance.voice = femaleVoice;
      else utterance.pitch = 1.3;
      
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
      
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let message = '';
      if (diffDays < 0) message = `Alert! Your task "${taskName}" is overdue by ${Math.abs(diffDays)} days!`;
      else if (diffDays === 0) message = `Alert! Your task "${taskName}" is due today!`;
      else if (diffDays === 1) message = `Warning! Your task "${taskName}" is due tomorrow!`;
      else if (diffDays <= 3) message = `Reminder! Your task "${taskName}" is due in ${diffDays} days!`;
      else message = `Reminder! Your task "${taskName}" is due on ${formatDate(dueDate)}.`;
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Samantha') ||
        voice.name.includes('Google UK') || voice.name.includes('Victoria')
      );
      
      if (femaleVoice) utterance.voice = femaleVoice;
      else utterance.pitch = 1.3;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const dismissWelcomePopup = () => {
    setShowWelcomePopup(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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
          setTimeout(() => speakWelcome(employeeName), 800);
        }
        
        const upcoming = data.dashboard.upcomingTasks || [];
        if (upcoming.length > 0) {
          const nearestTask = upcoming[0];
          setDueTask(nearestTask);
          setShowDuePopup(true);
          setTimeout(() => speakDueAlert(nearestTask.title || nearestTask.taskName, nearestTask.dueDate), 1500);
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
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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

  const navigateToTodayTasks = () => {
    if (showWelcomePopup) dismissWelcomePopup();
    navigate('/my-today-tasks');
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
    myExpenses,
    weeklyProgress = [],
    monthlyStats = []
  } = dashboardData;

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // ── Prepare chart data ──
  const statusPieData = [
    { name: 'Completed', value: completedTasks || 0, color: CHART_COLORS.completed },
    { name: 'In Progress', value: inProgressTasks || 0, color: CHART_COLORS.inProgress },
    { name: 'Pending', value: pendingTasks || 0, color: CHART_COLORS.pending },
    { name: 'Overdue', value: overdueTasks || 0, color: CHART_COLORS.overdue }
  ].filter(item => item.value > 0);

  const priorityPieData = Object.entries(priorityBreakdown).map(([name, value]) => ({
    name,
    value,
    color: priorityMeta[name]?.color || CHART_COLORS.purple
  })).filter(item => item.value > 0);

  const priorityBarData = [
    { name: 'Critical', tasks: priorityBreakdown.Critical || 0, color: CHART_COLORS.danger },
    { name: 'High', tasks: priorityBreakdown.High || 0, color: CHART_COLORS.warning },
    { name: 'Medium', tasks: priorityBreakdown.Medium || 0, color: CHART_COLORS.purple },
    { name: 'Low', tasks: priorityBreakdown.Low || 0, color: CHART_COLORS.success }
  ];

  // ── Weekly progress data for area chart ──
  const defaultWeeklyData = [
    { day: 'Mon', tasks: 0 },
    { day: 'Tue', tasks: 0 },
    { day: 'Wed', tasks: 0 },
    { day: 'Thu', tasks: 0 },
    { day: 'Fri', tasks: 0 },
    { day: 'Sat', tasks: 0 },
    { day: 'Sun', tasks: 0 }
  ];

  const weeklyData = weeklyProgress.length > 0 
    ? weeklyProgress.map(w => ({ day: w.day || w.label || 'Mon', tasks: w.value || w.count || 0 }))
    : defaultWeeklyData;

  // ── Monthly stats for radar chart ──
  const defaultMonthlyData = [
    { subject: 'Completed', value: 0 },
    { subject: 'In Progress', value: 0 },
    { subject: 'Pending', value: 0 },
    { subject: 'Overdue', value: 0 },
    { subject: 'Rejected', value: 0 }
  ];

  const monthlyRadarData = monthlyStats.length > 0
    ? monthlyStats.map(m => ({ subject: m.name || m.label || 'Task', value: m.value || m.count || 0 }))
    : defaultMonthlyData;

  // ── Completion progress data ──
  const completionData = [
    { name: 'Total', value: totalAssignedTasks || 0, color: CHART_COLORS.indigo },
    { name: 'Completed', value: completedTasks || 0, color: CHART_COLORS.success },
    { name: 'In Progress', value: inProgressTasks || 0, color: CHART_COLORS.info },
    { name: 'Pending', value: pendingTasks || 0, color: CHART_COLORS.warning }
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userRole={userRole} onLogout={handleLogout} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="admin-dash">
          
          {/* ── Welcome Popup ── */}
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
                >
                  <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600" />
                </button>

                <div className="p-4 sm:p-6 text-center">
                  <div className="relative mb-3 sm:mb-4">
                    <div className="absolute -top-8 -left-8 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full opacity-50 blur-2xl"></div>
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-float cursor-pointer hover:scale-110 transition-all duration-300 group">
                        <FiSmile className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
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

                  <button
                    onClick={dismissWelcomePopup}
                    className="group px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2 mx-auto"
                  >
                    <FiSmile className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
                    Let's Go!
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Due Date Popup ── */}
          {showDuePopup && dueTask && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
              <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-slideDown relative mb-4 sm:mb-8">
                <button
                  onClick={closePopup}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group"
                >
                  <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600" />
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
                    </div>
                  </div>

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

          {/* Header Section */}
          <div className="admin-dash__header">
            <div>
              <h1 className="admin-dash__greeting flex items-center gap-2">
                <FiSun className="w-4 h-4 text-amber-500" /> Employee <span>Dashboard</span>
              </h1>
              <p className="admin-dash__subtitle">
                Welcome back, {employeeName}. Track your tasks and performance in one place.
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-700 font-semibold text-xs">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDateTime}</span>
              </div>
              
              {/* <button
                onClick={fetchDashboard}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-sm"
                title="Refresh Data"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button> */}

              {/* <button
                onClick={navigateToCreateTask}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
              >
                <FiPlus size={18} />
                Create Task
              </button> */}
                
                            {/* <button
                              onClick={() => navigate('/create-task')}
                              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-sm"
                            >
                              <FiPlus className="w-4 h-4" />
                              Create Task
                            </button> */}
            </div>
          </div>

          <div className="space-y-8">
            {error && (
              <div className="p-4 mb-6 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
                <FiAlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
              </div>
            ) : (
              <>
                {/* 5 KPI Summary Stat Cards */}
                <div className="admin-dash__stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/my-task')}>
                    <div className="admin-dash__stat-top">
                      <span className="admin-dash__stat-label">Total Tasks</span>
                      <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                        <FiBriefcase />
                      </div>
                    </div>
                    <div className="admin-dash__stat-value">{totalAssignedTasks}</div>
                    <div className="admin-dash__stat-meta">assigned to you</div>
                  </div>

                  <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/emp-pending-task')}>
                    <div className="admin-dash__stat-top">
                      <span className="admin-dash__stat-label">Pending</span>
                      <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                        <FiClock />
                      </div>
                    </div>
                    <div className="admin-dash__stat-value">{pendingTasks}</div>
                    <div className="admin-dash__stat-meta">awaiting action</div>
                  </div>

                  <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/emp-progress-task')}>
                    <div className="admin-dash__stat-top">
                      <span className="admin-dash__stat-label">In Progress</span>
                      <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                        <FiTrendingUp />
                      </div>
                    </div>
                    <div className="admin-dash__stat-value">{inProgressTasks}</div>
                    <div className="admin-dash__stat-meta">currently active</div>
                  </div>

                  <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/emp-completed-task')}>
                    <div className="admin-dash__stat-top">
                      <span className="admin-dash__stat-label">Completed</span>
                      <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                        <FiCheckCircle />
                      </div>
                    </div>
                    <div className="admin-dash__stat-value">{completedTasks}</div>
                    <div className="admin-dash__stat-meta">successfully done</div>
                  </div>

                  <div className="admin-dash__stat cursor-pointer" onClick={() => navigate('/emp-overdue-task')}>
                    <div className="admin-dash__stat-top">
                      <span className="admin-dash__stat-label">Overdue</span>
                      <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
                        <FiAlertCircle />
                      </div>
                    </div>
                    <div className="admin-dash__stat-value">{overdueTasks}</div>
                    <div className="admin-dash__stat-meta">needs attention</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={navigateToCreateTask}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 text-slate-700 hover:text-indigo-700 transition text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FiPlus size={18} className="text-indigo-600" />
                    Create Task
                  </button>
                  <button
                    onClick={navigateToMyTasks}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-300 text-slate-700 hover:text-purple-700 transition text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FiList size={18} className="text-purple-600" />
                    My Tasks
                  </button>
                  <button
                    onClick={navigateToTodayTasks}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 text-slate-700 hover:text-amber-700 transition text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FiSun size={18} className="text-amber-600" />
                    Today's Tasks
                  </button>
                </div>

                {/* ── Task Distribution Charts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Status Pie Chart */}
                  <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                      <div>
                        <h3 className="admin-dash__card-title flex items-center gap-2">
                          <FiPieChart className="w-4 h-4 text-indigo-600" />
                          Task Distribution
                        </h3>
                        <p className="admin-dash__card-desc">Overview by status</p>
                      </div>
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        {completionRate}% Completed
                      </span>
                    </div>
                    <div className="admin-dash__card-body">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={4}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={true}
                            >
                              {statusPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {statusPieData.map((item) => (
                          <div key={item.name} className="p-2.5 rounded-xl border flex items-center justify-between" style={{ borderColor: item.color + '40', backgroundColor: item.color + '10' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-xs font-medium" style={{ color: item.color }}>{item.name}</span>
                            </div>
                            <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Priority Breakdown - Bar Chart */}
                  <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                      <div>
                        <h3 className="admin-dash__card-title flex items-center gap-2">
                          <FiBarChart className="w-4 h-4 text-purple-600" />
                          Priority Breakdown
                        </h3>
                        <p className="admin-dash__card-desc">Tasks grouped by urgency</p>
                      </div>
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                        {totalAssignedTasks} Total
                      </span>
                    </div>
                    <div className="admin-dash__card-body">
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={priorityBarData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="tasks" radius={[0, 4, 4, 0]}>
                              {priorityBarData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {priorityBarData.map((item) => {
                          const percentage = totalAssignedTasks > 0 ? Math.round((item.tasks / totalAssignedTasks) * 100) : 0;
                          return (
                            <div key={item.name} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: item.color + '10', borderColor: item.color + '30', borderWidth: '1px' }}>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs font-medium" style={{ color: item.color }}>{item.name}</span>
                              </div>
                              <span className="text-xs font-bold">{item.tasks} ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* ── Additional Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Weekly Progress - Area Chart */}
                  <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                      <div>
                        <h3 className="admin-dash__card-title flex items-center gap-2">
                          <FiTrendingUp className="w-4 h-4 text-emerald-600" />
                          Weekly Progress
                        </h3>
                        <p className="admin-dash__card-desc">Tasks completed this week</p>
                      </div>
                    </div>
                    <div className="admin-dash__card-body">
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="tasks" 
                              stroke={CHART_COLORS.indigo} 
                              fill={CHART_COLORS.indigo} 
                              fillOpacity={0.2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Completion Progress - Radial Bar Chart */}
                  <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                      <div>
                        <h3 className="admin-dash__card-title flex items-center gap-2">
                          <FiTarget className="w-4 h-4 text-rose-600" />
                          Completion Progress
                        </h3>
                        <p className="admin-dash__card-desc">Task completion breakdown</p>
                      </div>
                    </div>
                    <div className="admin-dash__card-body">
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart 
                            innerRadius="20%" 
                            outerRadius="100%" 
                            data={completionData}
                            startAngle={180}
                            endAngle={-180}
                          >
                            <RadialBar
                              minAngle={15}
                              background
                              clockWise
                              dataKey="value"
                            >
                              {completionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </RadialBar>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                              iconSize={8} 
                              layout="vertical" 
                              verticalAlign="middle" 
                              align="right"
                              formatter={(value) => <span className="text-xs text-slate-700">{value}</span>}
                            />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Stats - Radar Chart */}
                  <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                      <div>
                        <h3 className="admin-dash__card-title flex items-center gap-2">
                          <FaChartPie className="w-4 h-4 text-cyan-600" />
                          Monthly Performance
                        </h3>
                        <p className="admin-dash__card-desc">Task performance metrics</p>
                      </div>
                    </div>
                    <div className="admin-dash__card-body">
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={monthlyRadarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
                            <PolarRadiusAxis tick={{ fontSize: 8 }} />
                            <Radar
                              name="Tasks"
                              dataKey="value"
                              stroke={CHART_COLORS.indigo}
                              fill={CHART_COLORS.indigo}
                              fillOpacity={0.3}
                            />
                            <Tooltip content={<CustomTooltip />} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                </div>

                {/* ── Upcoming & Recently Completed ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                      <div>
                        <h3 className="admin-dash__card-title flex items-center gap-2">
                          <FiClockIcon className="w-4 h-4 text-amber-600" />
                          Upcoming Deadlines
                        </h3>
                        <p className="admin-dash__card-desc">Tasks due soon</p>
                      </div>
                      <button 
                        onClick={navigateToMyTasks}
                        className="admin-dash__card-link"
                      >
                        View All <FiChevronRight />
                      </button>
                    </div>
                    <div className="admin-dash__card-body">
                      {upcomingTasks.length === 0 ? (
                        <div className="text-center py-8">
                          <FiThumbsUp size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-xs font-semibold text-slate-600">No upcoming tasks</p>
                          <p className="text-[10px] text-slate-400">You're all caught up! 🎉</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {upcomingTasks.map((t, idx) => {
                            const st = statusMeta[t.status] || statusMeta['Pending'];
                            const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
                            const daysLeft = getDaysLeft(t.dueDate);
                            return (
                              <div 
                                key={t._id || idx}
                                onClick={() => handleTaskClick(t)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md group ${
                                  daysLeft < 0 ? 'border-rose-200 bg-rose-50/30' :
                                  daysLeft === 0 ? 'border-orange-200 bg-orange-50/30' :
                                  daysLeft <= 3 ? 'border-amber-200 bg-amber-50/30' :
                                  'border-slate-200 bg-white/50 hover:bg-white'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{ background: pr.color }} />
                                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                        {t.title || t.taskName}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                                        {st.icon}
                                        {t.status}
                                      </span>
                                      <span className="text-[8px] text-slate-400 flex items-center gap-0.5">
                                        <FiCalendar size={10} />
                                        {formatDate(t.dueDate)}
                                      </span>
                                      {daysLeft < 0 ? (
                                        <span className="text-[8px] font-bold text-rose-600">⚠️ Overdue</span>
                                      ) : daysLeft === 0 ? (
                                        <span className="text-[8px] font-bold text-orange-600">🔥 Today</span>
                                      ) : daysLeft <= 3 ? (
                                        <span className="text-[8px] font-bold text-amber-600">{daysLeft} days</span>
                                      ) : null}
                                    </div>
                                  </div>
                                  <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-dash__card">
                    <div className="admin-dash__card-header">
                      <div>
                        <h3 className="admin-dash__card-title flex items-center gap-2">
                          <FiAward className="w-4 h-4 text-emerald-600" />
                          Recently Completed
                        </h3>
                        <p className="admin-dash__card-desc">Your latest achievements</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        {recentlyCompleted.length} tasks
                      </span>
                    </div>
                    <div className="admin-dash__card-body">
                      {recentlyCompleted.length === 0 ? (
                        <div className="text-center py-8">
                          <FiFolder size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-xs font-semibold text-slate-600">No completed tasks yet</p>
                          <p className="text-[10px] text-slate-400">Complete your first task to see it here</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {recentlyCompleted.map((t, idx) => {
                            const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
                            return (
                              <div 
                                key={t._id || idx}
                                onClick={() => handleTaskClick(t)}
                                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 cursor-pointer transition-all hover:shadow-md hover:bg-emerald-50/50 group"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                                        {t.title || t.taskName}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
                                        {pr.icon}
                                        {t.priority}
                                      </span>
                                      <span className="text-[8px] text-slate-400 flex items-center gap-0.5">
                                        <FiCheckCircle size={10} className="text-emerald-500" />
                                        Completed
                                      </span>
                                      {t.completedAt && (
                                        <span className="text-[8px] text-slate-400">
                                          {formatDate(t.completedAt)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Bottom Navigation Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <button
                    onClick={navigateToMyTasks}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 transition text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FiBriefcase size={16} className="text-indigo-600" />
                    My Tasks
                  </button>
                  <button
                    onClick={navigateToCreateTask}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 transition text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FiPlus size={16} className="text-purple-600" />
                    Create Task
                  </button>
                  <button
                    onClick={navigateToProfile}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 transition text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FiUser size={16} className="text-rose-600" />
                    My Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboard;