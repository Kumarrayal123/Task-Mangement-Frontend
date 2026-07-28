




// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import { 
//   FiRefreshCw, FiCheckCircle, FiClock, FiAlertCircle, FiBarChart2,
//   FiList, FiLogOut, FiUser, FiFlag, FiStar, FiEdit2, FiPlus,
//   FiMic, FiMicOff, FiX, FiEye, FiTrash2, FiInfo, FiSearch,
//   FiPaperclip, FiMessageSquare, FiAlertTriangle, FiCircle,
//   FiDollarSign, FiMapPin, FiTrash, FiPlus as FiPlusIcon,
//   FiChevronDown, FiChevronUp, FiLoader, FiDownload, FiFile,
//   FiImage, FiFileText, FiExternalLink, FiUsers, FiUserPlus,
//   FiLayers, FiCalendar, FiBell, FiFilter, FiCamera, FiFolder,
//   FiRepeat, FiCheck, FiChevronLeft, FiChevronRight, FiTrendingUp
// } from 'react-icons/fi';
// import { FaTasks, FaRocket, FaList } from 'react-icons/fa';
// import Navbar from '../Navbar';
// import { 
//   updateTaskByEmployee, 
//   reportTaskIssue,
//   getTaskIssues,
//   deleteTask,
//   deleteTaskExpense,
//   updateTaskExpense
// } from '../services/taskService';
// import './DummyDashboard.css';

// const TASK_API = 'https://api.timelyhealth.in/api/tasks';
// const GEOCODE_API = 'https://nominatim.openstreetmap.org/search';
// const BASE_URL = 'https://api.timelyhealth.in';

// const priorityMeta = {
//   Critical: { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   High:     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiFlag className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   Medium:   { color: '#eab308', bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-200/50', icon: <FiStar className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   Low:      { color: '#22c55e', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
// };

// const statusMeta = {
//   'Pending':     { color: '#6366f1', bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-200/50', icon: <FiClock className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   'In Progress': { color: '#3b82f6', bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-200/50', icon: <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   'Completed':   { color: '#10b981', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   'Rejected':    { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiX className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   'Overdue':     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
// };

// const issueStatusMeta = {
//   'Open':        { color: '#6366f1', bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-200/50', icon: <FiCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   'In Progress': { color: '#3b82f6', bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-200/50', icon: <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   'Resolved':    { color: '#10b981', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
//   'Closed':      { color: '#6b7280', bg: 'bg-gray-50/80', text: 'text-gray-600', border: 'border-gray-200/50', icon: <FiX className="w-3 h-3 sm:w-4 sm:h-4" /> },
// };

// function formatDate(d) {
//   if (!d) return '—';
//   return new Date(d).toLocaleDateString('en-IN', {
//     day: '2-digit', month: 'short', year: 'numeric',
//   });
// }

// function formatDateTime(d) {
//   if (!d) return '—';
//   return new Date(d).toLocaleString('en-IN', {
//     day: '2-digit', month: 'short', year: 'numeric',
//     hour: '2-digit', minute: '2-digit'
//   });
// }

// function getInitials(name = '') {
//   if (!name) return '?';
//   return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
// }

// function MyTasks({ defaultStatus = 'ALL', defaultDue = 'ALL' }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const userRole = localStorage.getItem('userRole') || 'employee';
//   const [employeeName, setName] = useState('');
//   const [employeeId, setEmpId] = useState('');
  
//   // ─── Tasks State ───
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   // ─── Filters ───
//   const [filterStatus, setFilterStatus] = useState(() => {
//     return location.state?.filterStatus || defaultStatus;
//   });
//   const [filterPriority, setFilterPriority] = useState('ALL');
//   const [filterType, setFilterType] = useState('ALL');
//   const [filterDue, setFilterDue] = useState(() => {
//     return location.state?.filterDue || defaultDue;
//   });
//   const [search, setSearch] = useState('');

//   // ─── Pagination ───
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [currentDateTime, setCurrentDateTime] = useState('');

//   // ─── Live Clock ───
//   useEffect(() => {
//     const updateDateTime = () => {
//       const now = new Date();
//       const options = {
//         weekday: 'short',
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: true
//       };
//       setCurrentDateTime(now.toLocaleString('en-US', options));
//     };
    
//     updateDateTime();
//     const interval = setInterval(updateDateTime, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Sync state with props or location.state on route transition
//   useEffect(() => {
//     setFilterStatus(location.state?.filterStatus || defaultStatus);
//   }, [defaultStatus, location.state?.filterStatus]);

//   useEffect(() => {
//     setFilterDue(location.state?.filterDue || defaultDue);
//   }, [defaultDue, location.state?.filterDue]);
  
//   // ─── Upcoming Tasks Popup ───
//   const [showUpcomingPopup, setShowUpcomingPopup] = useState(false);
//   const [upcomingTasks, setUpcomingTasks] = useState([]);
//   const [popupShown, setPopupShown] = useState(false);
  
//   // ─── Modals State ───
//   const [showUpdateModal, setShowUpdateModal] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [updateData, setUpdateData] = useState({
//     updateText: '',
//     progress: 0,
//     remark: '',
//     expenses: [],
//     status: ''
//   });
//   const [employeeProgressData, setEmployeeProgressData] = useState([]);
//   const [attachments, setAttachments] = useState([]);
//   const [attachmentPreviews, setAttachmentPreviews] = useState([]);
//   const [updateLoading, setUpdateLoading] = useState(false);
  
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [viewTask, setViewTask] = useState(null);
  
//   const [showIssuesListModal, setShowIssuesListModal] = useState(false);
//   const [selectedTaskForIssues, setSelectedTaskForIssues] = useState(null);
//   const [taskIssues, setTaskIssues] = useState([]);
//   const [issuesLoading, setIssuesLoading] = useState(false);
  
//   const [showReportModal, setShowReportModal] = useState(false);
//   const [selectedTaskForReport, setSelectedTaskForReport] = useState(null);
//   const [reportData, setReportData] = useState({
//     issueTitle: '',
//     issueDescription: '',
//     priority: 'Medium'
//   });
//   const [reportLoading, setReportLoading] = useState(false);

//   // ─── Cute Popup + Female Voice State ───
//   const [showCutePopup, setShowCutePopup] = useState(false);
//   const [cutePopupMessage, setCutePopupMessage] = useState('');
//   const [cutePopupType, setCutePopupType] = useState('success');
//   const [cutePopupSubMessage, setCutePopupSubMessage] = useState('');

//   // ─── File Input Refs ───
//   const galleryInputRef = useRef(null);
//   const cameraInputRef = useRef(null);

//   // ─── Expense State ───
//   const [newExpense, setNewExpense] = useState({
//     location: { address: '', latitude: '', longitude: '' },
//     distance: '',
//     expenseAmount: '',
//     description: ''
//   });
//   const [expenseError, setExpenseError] = useState('');
//   const [expensesExpanded, setExpensesExpanded] = useState(false);
//   const [fetchingLocation, setFetchingLocation] = useState(false);
//   const [existingExpenses, setExistingExpenses] = useState([]);
//   const [editingExistingExpense, setEditingExistingExpense] = useState(null);
//   const [expenseActionLoading, setExpenseActionLoading] = useState(false);

//   // ─── Toast State ───
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [toastType, setToastType] = useState('success');

//   // ─── Female Voice Alert Function ───
//   const speakFemaleVoice = (message) => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
      
//       const utterance = new SpeechSynthesisUtterance(message);
//       utterance.lang = 'en-US';
//       utterance.rate = 0.9;
//       utterance.pitch = 1.1;
//       utterance.volume = 1;
      
//       const voices = window.speechSynthesis.getVoices();
//       const femaleVoice = voices.find(voice => 
//         voice.name.includes('Female') || 
//         voice.name.includes('Google UK') ||
//         voice.name.includes('Samantha') ||
//         voice.name.includes('Victoria') ||
//         voice.name.includes('Karen') ||
//         voice.name.includes('Zira') ||
//         voice.name.includes('Susan')
//       );
      
//       if (femaleVoice) {
//         utterance.voice = femaleVoice;
//       }
      
//       window.speechSynthesis.speak(utterance);
//     }
//   };

//   // ─── Cute Popup + Female Voice Function ───
//   const showCutePopupWithVoice = (message, type = 'success', voiceMessage = null) => {
//     setCutePopupMessage(message);
//     setCutePopupType(type);
//     setCutePopupSubMessage(type === 'success' ? '🎉 Awesome job! Keep it up! ✨' : '😅 Oops! Let\'s fix this! 💪');
//     setShowCutePopup(true);
    
//     const voiceText = voiceMessage || message;
//     speakFemaleVoice(voiceText);
    
//     setTimeout(() => setShowCutePopup(false), 3500);
//   };

//   // ─── Confetti Function ───
//   const triggerConfetti = () => {
//     const emojis = ['🎉', '✨', '🌟', '💖', '🎀', '🌈', '⭐', '🌸', '🎊', '💫'];
//     for (let i = 0; i < 25; i++) {
//       setTimeout(() => {
//         const el = document.createElement('div');
//         el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
//         el.style.cssText = `
//           position: fixed;
//           left: ${Math.random() * window.innerWidth}px;
//           top: -20px;
//           font-size: ${Math.random() * 20 + 14}px;
//           pointer-events: none;
//           z-index: 9999;
//           animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
//         `;
//         document.body.appendChild(el);
//         setTimeout(() => el.remove(), 3000);
//       }, i * 50);
//     }
//   };

//   // ─── Toast Message ───
//   const showToastMessage = (message, type = 'success') => {
//     setToastMessage(message);
//     setToastType(type);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 4000);
//   };

//   useEffect(() => {
//     const raw = localStorage.getItem('userData');
//     if (!raw) { navigate('/'); return; }

//     try {
//       const d = JSON.parse(raw);
//       const name = d.fullName || d.name || d.employeeName || d.username || d.firstName || 'Employee';
//       const id = d.employee?._id || d.employee?.id || d._id || d.id || d.userId || '';
//       setName(name);
//       setEmpId(id);
//     } catch (err) {
//       console.error(err);
//       navigate('/');
//     }
//   }, [navigate]);

//   // ─── Fetch Tasks ───
//   const fetchTasks = useCallback(async () => {
//     if (!employeeId) return;
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${TASK_API}/my-assigned-tasks/${employeeId}`);
//       const data = res.data;
//       const tasksData = Array.isArray(data) ? data : data.tasks || [];
//       setTasks(tasksData);
      
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const sevenDaysFromNow = new Date(today);
//       sevenDaysFromNow.setDate(today.getDate() + 7);
      
//       const upcoming = tasksData.filter(task => {
//         if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
//         if (task.progress >= 100) return false;
//         const submitDate = new Date(task.submitDate);
//         submitDate.setHours(0, 0, 0, 0);
//         return submitDate >= today && submitDate <= sevenDaysFromNow;
//       });
      
//       if (upcoming.length > 0 && !popupShown) {
//         setUpcomingTasks(upcoming);
//         setShowUpcomingPopup(true);
//         setPopupShown(true);
//       }
      
//     } catch (err) {
//       console.error('Fetch tasks error:', err);
//       setError(err.response?.data?.message || 'Failed to load tasks');
//     } finally {
//       setLoading(false);
//     }
//   }, [employeeId, popupShown]);

//   useEffect(() => {
//     if (employeeId) {
//       fetchTasks();
//     }
//   }, [employeeId, fetchTasks]);

//   const fetchTaskIssues = useCallback(async (taskId) => {
//     setIssuesLoading(true);
//     try {
//       const res = await getTaskIssues(taskId);
//       let issuesData = [];
//       if (Array.isArray(res)) {
//         issuesData = res;
//       } else if (res.issues && Array.isArray(res.issues)) {
//         issuesData = res.issues;
//       } else if (res.data && Array.isArray(res.data)) {
//         issuesData = res.data;
//       }
//       setTaskIssues(issuesData);
//       setShowIssuesListModal(true);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to load task issues');
//     } finally {
//       setIssuesLoading(false);
//     }
//   }, []);

//   const handleLogout = () => { 
//     localStorage.clear(); 
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//     }
//     navigate('/'); 
//   };

//   // ─── Handle Update Click with Employee Progress ───
//   const handleUpdateClick = (task) => {
//     setSelectedTask(task);
    
//     let progress = task.progress || 0;
    
//     const assignedEmployees = task.assignedTo || [];
//     const employeeProgress = [];
    
//     if (assignedEmployees.length > 0) {
//       assignedEmployees.forEach(emp => {
//         const empId = emp._id || emp;
//         const empName = emp.name || emp.fullName || emp.email || 'Employee';
        
//         let latestProgress = 0;
//         let hasUpdated = false;
        
//         if (task.employeeSubtaskProgress && task.employeeSubtaskProgress[empId]) {
//           latestProgress = task.employeeSubtaskProgress[empId].progress || 0;
//           hasUpdated = true;
//         } else {
//           const empUpdates = (task.employeeUpdates || []).filter(update => {
//             const updateEmpId = update.employeeId?._id || update.employeeId;
//             return updateEmpId?.toString() === empId?.toString();
//           });
          
//           if (empUpdates.length > 0) {
//             const latest = empUpdates[empUpdates.length - 1];
//             latestProgress = latest.progress || 0;
//             hasUpdated = true;
//           }
//         }
        
//         employeeProgress.push({
//           employeeId: empId,
//           employeeName: empName,
//           progress: latestProgress,
//           hasUpdated: hasUpdated
//         });
//       });
//     }
    
//     setEmployeeProgressData(employeeProgress);
    
//     if (employeeProgress.length > 0) {
//       const total = employeeProgress.reduce((sum, emp) => sum + emp.progress, 0);
//       progress = Math.round(total / employeeProgress.length);
//     }
    
//     let status = task.status || 'Pending';
//     if (progress >= 100) {
//       status = 'Completed';
//     }
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const empUpdates = (task.employeeUpdates || []).filter(update => {
//       const updateEmpId = update.employeeId?._id || update.employeeId;
//       const updateDate = new Date(update.updatedAt);
//       updateDate.setHours(0, 0, 0, 0);
//       return updateEmpId?.toString() === employeeId?.toString() && 
//              updateDate.getTime() === today.getTime();
//     });
    
//     let latestUpdate = null;
//     if (empUpdates.length > 0) {
//       latestUpdate = empUpdates[empUpdates.length - 1];
//     }
    
//     const empExpenses = (task.expenses || []).filter(expense => {
//       const expEmpId = expense.addedBy?._id || expense.addedBy;
//       return expEmpId?.toString() === employeeId?.toString();
//     });
    
//     setExistingExpenses(empExpenses);
    
//     setUpdateData({
//       updateText: latestUpdate?.updateText || '',
//       progress: latestUpdate?.progress || progress,
//       remark: latestUpdate?.remark || '',
//       expenses: [],
//       status: status
//     });
//     setAttachments([]);
//     setAttachmentPreviews([]);
//     setNewExpense({
//       location: { address: '', latitude: '', longitude: '' },
//       distance: '',
//       expenseAmount: '',
//       description: ''
//     });
//     setExpenseError('');
//     setExpensesExpanded(true);
//     setShowUpdateModal(true);
//   };

//   // ─── Handle Status Change for Single Tasks ───
//   const handleStatusChange = (newStatus) => {
//     setUpdateData(prev => ({
//       ...prev,
//       status: newStatus
//     }));
    
//     if (newStatus === 'Completed') {
//       setUpdateData(prev => ({
//         ...prev,
//         status: newStatus,
//         progress: 100
//       }));
      
//       showCutePopupWithVoice(
//         '✅ Task Completed!',
//         'success',
//         `Awesome! You've completed the task! Great job! 🌟`
//       );
//       triggerConfetti();
//     }
//   };

//   // ─── Handle Attachment from Gallery ───
//   const handleGalleryUpload = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;
    
//     setAttachments(prev => [...prev, ...files]);
    
//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAttachmentPreviews(prev => [...prev, { name: file.name, url: reader.result, type: file.type }]);
//       };
//       reader.readAsDataURL(file);
//     });
    
//     e.target.value = '';
//   };

//   // ─── Handle Camera Upload ───
//   const handleCameraUpload = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;
    
//     setAttachments(prev => [...prev, ...files]);
    
//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAttachmentPreviews(prev => [...prev, { name: file.name, url: reader.result, type: file.type }]);
//       };
//       reader.readAsDataURL(file);
//     });
    
//     e.target.value = '';
//   };

//   // ─── Remove Attachment ───
//   const handleRemoveAttachment = (index) => {
//     setAttachments(prev => prev.filter((_, i) => i !== index));
//     setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
//   };

//   // ─── Get Location from Address ───
//   const getLocationFromAddress = async (address) => {
//     setFetchingLocation(true);
//     setExpenseError('');

//     if (!address || address.trim().length === 0) {
//       setExpenseError('Please enter a location address first');
//       setFetchingLocation(false);
//       return;
//     }

//     if (address.trim().length < 2) {
//       setExpenseError('Please enter at least 2 characters');
//       setFetchingLocation(false);
//       return;
//     }

//     try {
//       const response = await axios.get(GEOCODE_API, {
//         params: {
//           q: address,
//           format: 'json',
//           limit: 1,
//           countrycodes: 'in'
//         }
//       });

//       if (response.data && response.data.length > 0) {
//         const location = response.data[0];
//         setNewExpense(prev => ({
//           ...prev,
//           location: {
//             address: location.display_name || address,
//             latitude: parseFloat(location.lat) || 0,
//             longitude: parseFloat(location.lon) || 0
//           }
//         }));
//         setExpenseError(`✅ Location found: ${location.display_name.split(',')[0]}`);
//         setTimeout(() => setExpenseError(''), 3000);
//       } else {
//         setExpenseError('❌ Location not found. Please try again.');
//       }
//     } catch (err) {
//       console.error('Geocode error:', err);
//       setExpenseError('❌ Failed to fetch location. Please try again.');
//     } finally {
//       setFetchingLocation(false);
//     }
//   };

//   // ─── Add Expense ───
//   const handleAddExpense = () => {
//     if (!newExpense.expenseAmount || !newExpense.description) {
//       setExpenseError('Please fill at least Amount and Description');
//       return;
//     }

//     const expense = {
//       _id: newExpense._id || undefined,
//       location: {
//         address: newExpense.location.address || 'N/A',
//         latitude: parseFloat(newExpense.location.latitude) || 0,
//         longitude: parseFloat(newExpense.location.longitude) || 0
//       },
//       distance: parseFloat(newExpense.distance) || 0,
//       expenseAmount: parseFloat(newExpense.expenseAmount) || 0,
//       description: newExpense.description,
//       addedBy: employeeId,
//       addedAt: new Date().toISOString(),
//       expenseDate: new Date().toISOString()
//     };

//     setUpdateData(prev => ({
//       ...prev,
//       expenses: [...prev.expenses, expense]
//     }));

//     setNewExpense({
//       location: { address: '', latitude: '', longitude: '' },
//       distance: '',
//       expenseAmount: '',
//       description: ''
//     });
//     setExpenseError('');
//   };

//   // ─── Delete an already-saved expense from DB ───
//   const handleDeleteExistingExpense = async (expense) => {
//     if (!window.confirm(`Delete expense "₹${expense.expenseAmount} - ${expense.description}"?`)) return;
//     setExpenseActionLoading(true);
//     try {
//       await deleteTaskExpense(selectedTask._id, expense._id, employeeId);
//       setExistingExpenses(prev => prev.filter(e => e._id !== expense._id));
//       showToastMessage('Expense deleted successfully!', 'success');
//     } catch (err) {
//       showToastMessage(err.response?.data?.message || 'Failed to delete expense', 'error');
//     } finally {
//       setExpenseActionLoading(false);
//     }
//   };

//   // ─── Start editing an already-saved expense ───
//   const handleStartEditExistingExpense = (expense) => {
//     setEditingExistingExpense(expense._id);
//     setNewExpense({
//       _id: expense._id,
//       location: {
//         address: expense.location?.address || '',
//         latitude: expense.location?.latitude || '',
//         longitude: expense.location?.longitude || ''
//       },
//       distance: expense.distance || '',
//       expenseAmount: expense.expenseAmount || '',
//       description: expense.description || ''
//     });
//     setExpensesExpanded(true);
//     setTimeout(() => {
//       document.getElementById('expense-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 100);
//   };

//   // ─── Save edit of an already-saved expense to DB ───
//   const handleSaveExistingExpenseEdit = async () => {
//     if (!newExpense.expenseAmount || !newExpense.description) {
//       setExpenseError('Please fill at least Amount and Description');
//       return;
//     }
//     setExpenseActionLoading(true);
//     try {
//       await updateTaskExpense(selectedTask._id, editingExistingExpense, employeeId, {
//         location: newExpense.location,
//         distance: parseFloat(newExpense.distance) || 0,
//         expenseAmount: parseFloat(newExpense.expenseAmount) || 0,
//         description: newExpense.description
//       });
//       setExistingExpenses(prev => prev.map(e =>
//         e._id === editingExistingExpense
//           ? { ...e, ...newExpense, expenseAmount: parseFloat(newExpense.expenseAmount), distance: parseFloat(newExpense.distance) || 0 }
//           : e
//       ));
//       setEditingExistingExpense(null);
//       setNewExpense({ location: { address: '', latitude: '', longitude: '' }, distance: '', expenseAmount: '', description: '' });
//       setExpenseError('');
//       showToastMessage('Expense updated successfully!', 'success');
//     } catch (err) {
//       showToastMessage(err.response?.data?.message || 'Failed to update expense', 'error');
//     } finally {
//       setExpenseActionLoading(false);
//     }
//   };

//   // ─── Remove Expense (new, unsaved) ───
//   const handleRemoveExpense = (index) => {
//     setUpdateData(prev => ({
//       ...prev,
//       expenses: prev.expenses.filter((_, i) => i !== index)
//     }));
//   };

//   // ─── Edit Expense ───
//   const handleEditExpense = (expense, index) => {
//     setNewExpense({
//       _id: expense._id,
//       location: {
//         address: expense.location?.address || '',
//         latitude: expense.location?.latitude || '',
//         longitude: expense.location?.longitude || ''
//       },
//       distance: expense.distance || '',
//       expenseAmount: expense.expenseAmount || '',
//       description: expense.description || ''
//     });
//     setUpdateData(prev => ({
//       ...prev,
//       expenses: prev.expenses.filter((_, i) => i !== index)
//     }));
//   };

//   // ─── Update Subtask Status ───
//   const updateSubtaskStatus = (subtaskId, status) => {
//     if (!selectedTask) return;
    
//     const updatedSubtasks = selectedTask.subtasks.map(subtask => {
//       if (subtask._id === subtaskId) {
//         return {
//           ...subtask,
//           status: status,
//         };
//       }
//       return subtask;
//     });
    
//     setSelectedTask({
//       ...selectedTask,
//       subtasks: updatedSubtasks
//     });
//   };

//   // ─── Handle Subtask Checkbox Click ───
//   const handleSubtaskCheckboxChange = (subtask, isCompleted) => {
//     updateSubtaskStatus(subtask._id, isCompleted ? 'Completed' : 'Pending');
    
//     if (isCompleted) {
//       showCutePopupWithVoice(
//         '✅ Subtask Completed!',
//         'success',
//         `Awesome! You completed "${subtask.name}"! Keep going! You're doing great! 🌟`
//       );
//       triggerConfetti();
//     }
//   };

//   // ─── Calculate progress from subtasks ───
//   const calculateProgressFromSubtasks = (subtasks) => {
//     if (!subtasks || subtasks.length === 0) return 0;
//     const completed = subtasks.filter(s => s.status === 'Completed').length;
//     return Math.round((completed / subtasks.length) * 100);
//   };

//   // ─── Get subtask progress for UI ───
//   const getSubtaskProgress = (subtasks) => {
//     if (!subtasks || subtasks.length === 0) return 0;
//     const completed = subtasks.filter(s => s.status === 'Completed').length;
//     return Math.round((completed / subtasks.length) * 100);
//   };

//   // ─── UPDATE SUBMIT ───
//   const handleUpdateSubmit = async (e) => {
//     e.preventDefault();
//     setUpdateLoading(true);
    
//     try {
//       let subtasksToSend = selectedTask.subtasks || [];
      
//       let calculatedProgress = updateData.progress;
      
//       if (subtasksToSend.length > 0) {
//         calculatedProgress = calculateProgressFromSubtasks(subtasksToSend);
//       }
      
//       let finalStatus = updateData.status;
//       if (calculatedProgress >= 100) {
//         finalStatus = 'Completed';
//       }
      
//       const updatePayload = {
//         updateText: updateData.updateText,
//         progress: calculatedProgress,
//         remark: updateData.remark,
//         expenses: updateData.expenses,
//         subtasks: subtasksToSend,
//         status: finalStatus
//       };
      
//       const response = await updateTaskByEmployee(selectedTask._id, employeeId, updatePayload, attachments);
      
//       if (response.success) {
//         setShowUpdateModal(false);
//         fetchTasks();
        
//         triggerConfetti();
        
//         showCutePopupWithVoice(
//           '✅ Task Updated Successfully!',
//           'success',
//           `Hey ${employeeName}! Great job! Your task "${selectedTask.taskName || selectedTask.title}" has been updated successfully! Keep up the amazing work! 🌟`
//         );
        
//         showToastMessage('Task updated successfully!', 'success');
//       }
//     } catch (err) {
//       if (err.response?.data?.type === 'EARLY_COMPLETION_ERROR') {
//         const errorMsg = err.response?.data?.message || 'Cannot complete subtask before scheduled time';
        
//         showCutePopupWithVoice(
//           '⚠️ ' + errorMsg,
//           'error',
//           `Sorry! ${errorMsg}. Please check the date and time, and try again!`
//         );
        
//         showToastMessage(errorMsg, 'error');
//       } else {
//         setError('Failed to update task');
        
//         showCutePopupWithVoice(
//           '❌ Failed to update task',
//           'error',
//           'Oops! Something went wrong while updating the task. Please try again!'
//         );
        
//         showToastMessage('Failed to update task', 'error');
//         console.error(err);
//       }
//     } finally {
//       setUpdateLoading(false);
//     }
//   };

//   const handleViewTask = (task) => {
//     setViewTask(task);
//     setShowViewModal(true);
//   };

//   const handleViewTaskIssues = (task) => {
//     setSelectedTaskForIssues(task);
//     fetchTaskIssues(task._id);
//   };

//   const handleReportIssueClick = (task) => {
//     setSelectedTaskForReport(task);
//     setReportData({
//       issueTitle: '',
//       issueDescription: '',
//       priority: 'Medium'
//     });
//     setShowReportModal(true);
//   };

//   const handleReportSubmit = async (e) => {
//     e.preventDefault();
//     setReportLoading(true);
//     try {
//       await reportTaskIssue(selectedTaskForReport._id, employeeId, reportData);
//       setShowReportModal(false);
//       setSelectedTaskForReport(null);
//       setReportData({
//         issueTitle: '',
//         issueDescription: '',
//         priority: 'Medium'
//       });
//       fetchTasks();
      
//       showCutePopupWithVoice(
//         '✅ Issue Reported Successfully!',
//         'success',
//         `Thank you ${employeeName}! Your issue has been reported successfully. The team will look into it!`
//       );
      
//       showToastMessage('Issue reported successfully!', 'success');
//     } catch (err) {
//       setError('Failed to report issue');
//       showToastMessage('Failed to report issue', 'error');
//       console.error(err);
//     } finally {
//       setReportLoading(false);
//     }
//   };

//   const handleDeleteTask = async (taskId) => {
//     if (!window.confirm('Are you sure you want to delete this task?')) return;
//     try {
//       await deleteTask(taskId);
//       fetchTasks();
//       showToastMessage('Task deleted successfully!', 'success');
//     } catch (err) {
//       setError('Failed to delete task');
//       showToastMessage('Failed to delete task', 'error');
//       console.error(err);
//     }
//   };

//   // ─── Handle View Attachment ───
//   const handleViewAttachment = (fileUrl, fileName) => {
//     const fullUrl = `${BASE_URL}/${fileUrl}`;
//     window.open(fullUrl, '_blank');
//   };

//   // ─── Handle Download Attachment ───
//   const handleDownloadAttachment = async (fileUrl, fileName) => {
//     try {
//       const fullUrl = `${BASE_URL}/${fileUrl}`;
//       const response = await axios.get(fullUrl, {
//         responseType: 'blob'
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = fileName || fileUrl.split('/').pop();
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error('Download error:', err);
//       alert('Failed to download attachment. Please try again.');
//     }
//   };

//   // ─── Get File Icon ───
//   const getFileIcon = (fileName) => {
//     if (!fileName) return <FiFile className="w-3 h-3 sm:w-4 sm:h-4" />;
//     const ext = fileName.split('.').pop()?.toLowerCase();
//     if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
//       return <FiImage className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />;
//     }
//     if (['pdf'].includes(ext)) {
//       return <FiFileText className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500" />;
//     }
//     if (['doc', 'docx'].includes(ext)) {
//       return <FiFileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />;
//     }
//     if (['xls', 'xlsx'].includes(ext)) {
//       return <FiFileText className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />;
//     }
//     return <FiFile className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />;
//   };

//   // ─── Filter Tasks ───
//   const getFilteredTasks = () => {
//     let filtered = [...tasks];
    
//     if (filterType === 'ASSIGNED') {
//       filtered = filtered.filter(t => t.assignType !== 'SELF');
//     } else if (filterType === 'CREATED') {
//       filtered = filtered.filter(t => t.assignType === 'SELF');
//     }
    
//     if (filterStatus !== 'ALL') {
//       filtered = filtered.filter((t) => {
//         if (filterStatus === 'Completed') {
//           return t.progress >= 100 || t.status === 'Completed';
//         }
//         return t.status === filterStatus && t.progress < 100;
//       });
//     }
    
//     if (filterPriority !== 'ALL') {
//       filtered = filtered.filter((t) => t.priority === filterPriority);
//     }
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const sevenDaysFromNow = new Date(today);
//     sevenDaysFromNow.setDate(today.getDate() + 7);
    
//     if (filterDue === 'TODAY') {
//       filtered = filtered.filter(task => {
//         if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
//         const submitDate = new Date(task.submitDate);
//         submitDate.setHours(0, 0, 0, 0);
//         return submitDate.getTime() === today.getTime();
//       });
//     } else if (filterDue === 'UPCOMING') {
//       filtered = filtered.filter(task => {
//         if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
//         const submitDate = new Date(task.submitDate);
//         submitDate.setHours(0, 0, 0, 0);
//         return submitDate >= today && submitDate <= sevenDaysFromNow && submitDate.getTime() !== today.getTime();
//       });
//     } else if (filterDue === 'OVERDUE') {
//       filtered = filtered.filter(task => {
//         if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
//         const submitDate = new Date(task.submitDate);
//         submitDate.setHours(0, 0, 0, 0);
//         return submitDate < today;
//       });
//     }
    
//     if (search) {
//       const q = search.toLowerCase();
//       filtered = filtered.filter((t) => 
//         (t.title || t.taskName || '').toLowerCase().includes(q) || 
//         (t.description || '').toLowerCase().includes(q)
//       );
//     }
    
//     return filtered;
//   };

//   const filteredTasks = getFilteredTasks();

//   // ─── Pagination ───
//   const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentTasks = filteredTasks.slice(startIndex, endIndex);

//   const totalTasks = tasks.length;
  
//   const counts = {
//     ALL: tasks.length,
//     Pending: tasks.filter((t) => t.status === 'Pending' && t.progress < 100).length,
//     'In Progress': tasks.filter((t) => t.status === 'In Progress' && t.progress < 100).length,
//     Completed: tasks.filter((t) => t.progress >= 100 || t.status === 'Completed').length,
//     Overdue: tasks.filter((t) => t.status === 'Overdue' && t.progress < 100).length,
//     Rejected: tasks.filter((t) => t.status === 'Rejected').length,
//   };

//   const typeCounts = {
//     ALL: tasks.length,
//     ASSIGNED: tasks.filter(t => t.assignType !== 'SELF').length,
//     CREATED: tasks.filter(t => t.assignType === 'SELF').length,
//   };

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const sevenDaysFromNow = new Date(today);
//   sevenDaysFromNow.setDate(today.getDate() + 7);

//   const dueCounts = {
//     ALL: tasks.length,
//     TODAY: tasks.filter(task => {
//       if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
//       const submitDate = new Date(task.submitDate);
//       submitDate.setHours(0, 0, 0, 0);
//       return submitDate.getTime() === today.getTime();
//     }).length,
//     UPCOMING: tasks.filter(task => {
//       if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
//       const submitDate = new Date(task.submitDate);
//       submitDate.setHours(0, 0, 0, 0);
//       return submitDate >= today && submitDate <= sevenDaysFromNow && submitDate.getTime() !== today.getTime();
//     }).length,
//     OVERDUE: tasks.filter(task => {
//       if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
//       const submitDate = new Date(task.submitDate);
//       submitDate.setHours(0, 0, 0, 0);
//       return submitDate < today;
//     }).length,
//   };

//   const closeUpcomingPopup = () => {
//     setShowUpcomingPopup(false);
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//     }
//   };

//   const getUpcomingTasksList = (tasks) => {
//     const today = new Date();
//     const sevenDaysFromNow = new Date(today);
//     sevenDaysFromNow.setDate(today.getDate() + 7);
    
//     return tasks
//       .filter(task => 
//         task.submitDate && 
//         task.status !== 'Completed' && 
//         task.status !== 'Rejected' &&
//         new Date(task.submitDate) <= sevenDaysFromNow &&
//         new Date(task.submitDate) >= today
//       )
//       .sort((a, b) => new Date(a.submitDate) - new Date(b.submitDate));
//   };

//   const getPriorityStyles = (priority) => {
//     const styles = {
//       'Critical': 'bg-rose-50 text-rose-700 border-rose-200',
//       'High': 'bg-orange-50 text-orange-700 border-orange-200',
//       'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
//       'Low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
//     };
//     return styles[priority] || 'bg-slate-100 text-slate-700 border-slate-200';
//   };

//   const getStatusStyles = (status) => {
//     const styles = {
//       'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
//       'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
//       'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
//       'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
//       'Overdue': 'bg-red-50 text-red-700 border-red-200',
//     };
//     return styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       'Completed': <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
//       'In Progress': <FiRefreshCw className="w-3.5 h-3.5 text-blue-600" />,
//       'Pending': <FiClock className="w-3.5 h-3.5 text-amber-600" />,
//       'Rejected': <FiX className="w-3.5 h-3.5 text-rose-600" />,
//       'Overdue': <FiAlertCircle className="w-3.5 h-3.5 text-red-600" />,
//     };
//     return icons[status] || <FiFileText className="w-3.5 h-3.5 text-slate-600" />;
//   };

//   const getPriorityIcon = (priority) => {
//     const icons = {
//       'Critical': <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />,
//       'High': <FiFlag className="w-3.5 h-3.5 text-orange-600" />,
//       'Medium': <FiStar className="w-3.5 h-3.5 text-amber-600" />,
//       'Low': <FiCheck className="w-3.5 h-3.5 text-emerald-600" />,
//     };
//     return icons[priority] || <FiFlag className="w-3.5 h-3.5 text-slate-600" />;
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col">
//       {/* ─── Horizontal Top Navbar ─── */}
//       <Navbar userRole={userRole} onLogout={handleLogout} />

//       {/* ─── Main Content Area (Full Width Layout) ─── */}
//       <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
//         <div className="admin-dash">
          
//           {/* Header Section */}
//           <div className="admin-dash__header">
//             <div>
//               <h1 className="admin-dash__greeting flex items-center gap-2">
//                 <FaTasks className="w-5 h-5 text-indigo-600" /> My <span>Tasks</span>
//               </h1>
//               <p className="admin-dash__subtitle">
//                 Welcome back, {employeeName}. Track and manage your assigned tasks.
//               </p>
//             </div>
//             <div className="flex items-center gap-4 flex-wrap">
//               {/* ─── Live Date & Time Display ─── */}
//               <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-700 font-semibold text-xs">
//                 <FiCalendar className="w-4 h-4 text-indigo-600" />
//                 <span>{currentDateTime}</span>
//               </div>
              
//               <button
//                 onClick={() => navigate('/create-task')}
//                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-sm"
//               >
//                 <FiPlus className="w-4 h-4" />
//                 Create Task
//               </button>
              
//               {/* <button
//                 onClick={fetchTasks}
//                 className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-sm"
//                 title="Refresh Tasks"
//               >
//                 <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//               </button> */}
//             </div>
//           </div>

//           <div className="space-y-6">
//             {/* ─── Upcoming Tasks Popup ─── */}
//             {showUpcomingPopup && upcomingTasks.length > 0 && (
//               <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
//                 <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideDown relative">
//                   <button
//                     onClick={closeUpcomingPopup}
//                     className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group"
//                     title="Close"
//                   >
//                     <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
//                   </button>

//                   <div className="p-4 sm:p-8">
//                     <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
//                       <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-pulse-slow flex-shrink-0">
//                         <FiBell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
//                       </div>
//                       <div className="text-center sm:text-left">
//                         <h2 className="text-lg sm:text-2xl font-bold text-gray-800">🔔 Upcoming Tasks Alert!</h2>
//                         <p className="text-sm sm:text-base text-gray-600">
//                           <span className="font-semibold text-amber-600">{upcomingTasks.length}</span> tasks are due within 7 days
//                         </p>
//                       </div>
//                     </div>

//                     <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-amber-200/50">
//                       <p className="text-xs sm:text-sm text-gray-700">
//                         <strong>Hey {employeeName}!</strong> There {upcomingTasks.length === 1 ? 'is' : 'are'} 
//                         <span className="font-bold text-amber-600"> {upcomingTasks.length} </span> 
//                         task{upcomingTasks.length > 1 ? 's' : ''} due soon. Please complete them before they become overdue! ⏰
//                       </p>
//                     </div>

//                     <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto mb-4 sm:mb-6">
//                       {upcomingTasks.map((task, idx) => {
//                         const daysLeft = Math.ceil((new Date(task.submitDate) - new Date()) / (1000 * 60 * 60 * 24));
//                         const pr = priorityMeta[task.priority] || priorityMeta['Medium'];
//                         const st = statusMeta[task.status] || statusMeta['Pending'];
//                         return (
//                           <div key={idx} className="bg-white/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/50 hover:shadow-md transition-all">
//                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
//                               <div className="flex-1 w-full sm:w-auto">
//                                 <h4 className="font-semibold text-sm sm:text-base text-gray-800">{task.taskName || task.title}</h4>
//                                 <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">{task.description}</p>
//                                 <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1 sm:mt-2">
//                                   <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
//                                     {pr.icon}
//                                     {task.priority}
//                                   </span>
//                                   <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-semibold ${st.bg} ${st.text} border ${st.border}`}>
//                                     {st.icon}
//                                     {task.status}
//                                   </span>
//                                   <span className="text-[10px] sm:text-xs text-amber-600 font-medium">
//                                     <FiClock className="inline mr-0.5 sm:mr-1 w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                                     {daysLeft <= 0 ? 'Overdue!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
//                                   </span>
//                                 </div>
//                               </div>
//                               <button
//                                 onClick={() => {
//                                   closeUpcomingPopup();
//                                   handleViewTask(task);
//                                 }}
//                                 className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:scale-105 transition-all flex-shrink-0"
//                               >
//                                 View
//                               </button>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>

//                     <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
//                       <button
//                         onClick={closeUpcomingPopup}
//                         className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium transition-all"
//                       >
//                         Dismiss
//                       </button>
//                       <button
//                         onClick={() => {
//                           closeUpcomingPopup();
//                           setFilterDue('UPCOMING');
//                         }}
//                         className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
//                       >
//                         <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
//                         View All
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ─── Stats Section ─── */}
//             <div className="admin-dash__stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
//               <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('ALL'); setFilterDue('ALL'); }}>
//                 <div className="admin-dash__stat-top">
//                   <span className="admin-dash__stat-label">Total Tasks</span>
//                   <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
//                     <FiBarChart2 className="w-5 h-5" />
//                   </div>
//                 </div>
//                 <div className="admin-dash__stat-value">{totalTasks}</div>
//                 <div className="admin-dash__stat-meta">all tasks</div>
//               </div>
              
//               <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('Pending'); setFilterDue('ALL'); }}>
//                 <div className="admin-dash__stat-top">
//                   <span className="admin-dash__stat-label">Pending</span>
//                   <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
//                     <FiClock className="w-5 h-5" />
//                   </div>
//                 </div>
//                 <div className="admin-dash__stat-value">{counts.Pending}</div>
//                 <div className="admin-dash__stat-meta">awaiting action</div>
//               </div>
              
//               <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('In Progress'); setFilterDue('ALL'); }}>
//                 <div className="admin-dash__stat-top">
//                   <span className="admin-dash__stat-label">In Progress</span>
//                   <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
//                     <FiRefreshCw className="w-5 h-5" />
//                   </div>
//                 </div>
//                 <div className="admin-dash__stat-value">{counts['In Progress']}</div>
//                 <div className="admin-dash__stat-meta">currently active</div>
//               </div>
              
//               <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('Completed'); setFilterDue('ALL'); }}>
//                 <div className="admin-dash__stat-top">
//                   <span className="admin-dash__stat-label">Completed</span>
//                   <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
//                     <FiCheckCircle className="w-5 h-5" />
//                   </div>
//                 </div>
//                 <div className="admin-dash__stat-value">{counts.Completed}</div>
//                 <div className="admin-dash__stat-meta">successfully done</div>
//               </div>
              
//               <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('Overdue'); setFilterDue('ALL'); }}>
//                 <div className="admin-dash__stat-top">
//                   <span className="admin-dash__stat-label">Overdue</span>
//                   <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
//                     <FiAlertCircle className="w-5 h-5" />
//                   </div>
//                 </div>
//                 <div className="admin-dash__stat-value">{dueCounts.OVERDUE}</div>
//                 <div className="admin-dash__stat-meta">past deadline</div>
//               </div>

//             </div>

//             {/* ─── Filters Section ─── */}
//             <div className="admin-dash__card">
//               <div className="admin-dash__card-header">
//                 <div>
//                   <h3 className="admin-dash__card-title flex items-center gap-2">
//                     <FiFilter className="w-4 h-4 text-indigo-600" />
//                     Filter Tasks
//                   </h3>
//                   <p className="admin-dash__card-desc">Filter, search, and manage your assigned tasks</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
//                     {filteredTasks.length} Tasks Found
//                   </span>
//                 </div>
//               </div>

//               <div className="admin-dash__card-body space-y-4">
//                 {/* Search & Filters */}
//                 <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
//                   <div className="flex flex-wrap items-center justify-between gap-3">
                    
//                     {/* Search Bar */}
//                     <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
//                       <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                       <input
//                         type="text"
//                         placeholder="Search tasks by name or title..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
//                       />
//                       {search && (
//                         <button 
//                           onClick={() => setSearch('')}
//                           className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
//                         >
//                           <FiX className="w-3.5 h-3.5" />
//                         </button>
//                       )}
//                     </div>

//                     {/* Filter Selects & Controls */}
//                     <div className="flex items-center gap-2.5 flex-wrap">
//                       <select
//                         value={filterStatus}
//                         onChange={(e) => setFilterStatus(e.target.value)}
//                         className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
//                       >
//                         <option value="ALL">All Statuses</option>
//                         <option value="Pending">Pending</option>
//                         <option value="In Progress">In Progress</option>
//                         <option value="Completed">Completed</option>
//                         <option value="Overdue">Overdue</option>
//                       </select>

//                       <select
//                         value={filterPriority}
//                         onChange={(e) => setFilterPriority(e.target.value)}
//                         className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
//                       >
//                         <option value="ALL">All Priorities</option>
//                         <option value="Critical">Critical</option>
//                         <option value="High">High</option>
//                         <option value="Medium">Medium</option>
//                         <option value="Low">Low</option>
//                       </select>

//                       <select
//                         value={filterDue}
//                         onChange={(e) => setFilterDue(e.target.value)}
//                         className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
//                       >
//                         <option value="ALL">All Due Dates</option>
//                         <option value="TODAY">Today</option>
//                         <option value="UPCOMING">Upcoming</option>
//                         <option value="OVERDUE">Overdue</option>
//                       </select>

//                       <select
//                         value={filterType}
//                         onChange={(e) => setFilterType(e.target.value)}
//                         className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
//                       >
//                         <option value="ALL">All Types</option>
//                         <option value="ASSIGNED">Assigned</option>
//                         <option value="CREATED">Created</option>
//                       </select>

//                       {(search || filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterDue !== 'ALL' || filterType !== 'ALL') && (
//                         <button
//                           onClick={() => {
//                             setSearch('');
//                             setFilterStatus('ALL');
//                             setFilterPriority('ALL');
//                             setFilterDue('ALL');
//                             setFilterType('ALL');
//                           }}
//                           className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
//                         >
//                           <FiRefreshCw className="w-3.5 h-3.5" />
//                           Reset
//                         </button>
//                       )}
//                     </div>

//                   </div>
//                 </div>

//                 {error && (
//                   <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold shadow-xs">
//                     <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
//                     <span>{error}</span>
//                   </div>
//                 )}

//                 {loading ? (
//                   <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
//                     <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//                     <p className="mt-3 text-xs font-semibold text-slate-500">Loading your tasks...</p>
//                   </div>
//                 ) : currentTasks.length === 0 ? (
//                   <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
//                     <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
//                       <FiList className="w-8 h-8 text-indigo-500" />
//                     </div>
//                     <h3 className="text-base font-bold text-slate-800">No tasks found</h3>
//                     <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
//                       {filterType === 'ASSIGNED' ? 'No tasks assigned to you' : 
//                        filterType === 'CREATED' ? 'You haven\'t created any tasks' : 
//                        filterDue === 'TODAY' ? 'No tasks due today 🎉' :
//                        filterDue === 'UPCOMING' ? 'No upcoming tasks in next 7 days 🎉' :
//                        filterDue === 'OVERDUE' ? 'No overdue tasks! Great job! 🎉' :
//                        'No tasks found'}
//                     </p>
//                     <button
//                       onClick={() => {
//                         setFilterType('ALL');
//                         setFilterStatus('ALL');
//                         setFilterPriority('ALL');
//                         setFilterDue('ALL');
//                         setSearch('');
//                       }}
//                       className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105"
//                     >
//                       View All Tasks
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-left border-collapse">
//                         <thead>
//                           <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
//                             <th className="py-3.5 px-4 sm:px-6">Task</th>
//                             <th className="py-3.5 px-4 sm:px-6">Priority</th>
//                             <th className="py-3.5 px-4 sm:px-6">Status</th>
//                             <th className="py-3.5 px-4 sm:px-6">Type</th>
//                             <th className="py-3.5 px-4 sm:px-6">Progress</th>
//                             <th className="py-3.5 px-4 sm:px-6">Submit Date</th>
//                             <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100 text-xs">
//                           {currentTasks.map((t) => {
//                             const isCompleted = t.progress >= 100;
//                             const effectiveStatus = isCompleted ? 'Completed' : t.status;
//                             const isOverdue = t.submitDate && 
//                                               new Date(t.submitDate) < new Date() && 
//                                               !isCompleted &&
//                                               t.status !== 'Rejected' &&
//                                               t.progress < 100;
//                             const issueCount = t.reportedIssues?.length || 0;
//                             const daysLeft = t.submitDate ? Math.ceil((new Date(t.submitDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                            
//                             return (
//                               <tr
//                                 key={t._id}
//                                 className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
//                                   isOverdue ? 'border-l-4 border-l-rose-400 bg-rose-50/20' : ''
//                                 } ${isCompleted ? 'border-l-4 border-l-emerald-400' : ''}`}
//                                 onClick={() => handleViewTask(t)}
//                               >
//                                 <td className="py-3.5 px-4 sm:px-6">
//                                   <div className="font-semibold text-slate-800 truncate max-w-[180px]">{t.taskName || t.title}</div>
//                                   <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{t.title}</div>
//                                   {isOverdue && (
//                                     <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold mt-1">
//                                       <FiAlertCircle className="w-3 h-3" />
//                                       Overdue!
//                                     </span>
//                                   )}
//                                   {isCompleted && (
//                                     <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
//                                       <FiCheckCircle className="w-3 h-3" />
//                                       Completed
//                                     </span>
//                                   )}
//                                 </td>

//                                 <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
//                                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getPriorityStyles(t.priority)}`}>
//                                     {getPriorityIcon(t.priority)}
//                                     {t.priority}
//                                   </span>
//                                 </td>

//                                 <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
//                                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyles(effectiveStatus)}`}>
//                                     {getStatusIcon(effectiveStatus)}
//                                     {effectiveStatus}
//                                   </span>
//                                 </td>

//                                 <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
//                                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
//                                     t.assignType === 'SELF' 
//                                       ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
//                                       : 'bg-blue-100 text-blue-700 border border-blue-200'
//                                   }`}>
//                                     {t.assignType === 'SELF' ? 'Created' : 'Assigned'}
//                                   </span>
//                                 </td>

//                                 <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
//                                   <div className="flex items-center gap-2 min-w-[100px]">
//                                     <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
//                                       <div
//                                         className="h-full rounded-full transition-all duration-300"
//                                         style={{ 
//                                           width: `${t.progress || 0}%`,
//                                           background: t.progress >= 100 ? '#10b981' : '#6366f1'
//                                         }}
//                                       />
//                                     </div>
//                                     <span className="text-[11px] font-bold text-slate-700">{t.progress || 0}%</span>
//                                   </div>
//                                 </td>

//                                 <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600 font-medium">
//                                   <div className="flex flex-col items-start">
//                                     <div className="flex items-center gap-1.5">
//                                       <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
//                                       {t.submitDate ? formatDate(t.submitDate) : 'N/A'}
//                                     </div>
//                                     {daysLeft !== null && !isCompleted && t.status !== 'Rejected' && daysLeft > 0 && (
//                                       <span className="text-[10px] text-amber-600 font-medium mt-0.5">
//                                         {daysLeft} day{daysLeft > 1 ? 's' : ''} left
//                                       </span>
//                                     )}
//                                   </div>
//                                 </td>

//                                 <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
//                                   <div className="flex items-center justify-end gap-1.5">
//                                     <button 
//                                       onClick={() => handleViewTaskIssues(t)} 
//                                       className={`p-2 rounded-xl transition shadow-2xs ${
//                                         issueCount > 0 
//                                           ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
//                                           : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
//                                       }`}
//                                       title={`${issueCount} issues reported`}
//                                     >
//                                       <FiAlertTriangle className="w-3.5 h-3.5" />
//                                     </button>
//                                     <button 
//                                       onClick={() => handleViewTask(t)} 
//                                       className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition shadow-2xs" 
//                                       title="View Task Details"
//                                     >
//                                       <FiEye className="w-3.5 h-3.5" />
//                                     </button>
//                                     {!isCompleted && (
//                                       <button 
//                                         onClick={() => handleUpdateClick(t)} 
//                                         className="p-2 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-xl transition shadow-2xs" 
//                                         title="Update Task"
//                                       >
//                                         <FiEdit2 className="w-3.5 h-3.5" />
//                                       </button>
//                                     )}
//                                     {t.assignType === 'SELF' && (
//                                       <button 
//                                         onClick={() => handleDeleteTask(t._id)} 
//                                         className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition shadow-2xs" 
//                                         title="Delete Task"
//                                       >
//                                         <FiTrash2 className="w-3.5 h-3.5" />
//                                       </button>
//                                     )}
//                                     {t.assignType !== 'SELF' && !isCompleted && (
//                                       <button 
//                                         onClick={() => handleReportIssueClick(t)} 
//                                         className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition shadow-2xs" 
//                                         title="Report Issue"
//                                       >
//                                         <FiAlertTriangle className="w-3.5 h-3.5" />
//                                       </button>
//                                     )}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Pagination Bar */}
//                     {totalPages > 1 && (
//                       <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
//                         <div>
//                           Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{' '}
//                           <span className="font-bold text-slate-800">{Math.min(endIndex, filteredTasks.length)}</span> of{' '}
//                           <span className="font-bold text-slate-800">{filteredTasks.length}</span> tasks
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                           <button
//                             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                             disabled={currentPage === 1}
//                             className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
//                           >
//                             <FiChevronLeft className="w-4 h-4" />
//                           </button>
//                           {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                             let pageNum;
//                             if (totalPages <= 5) {
//                               pageNum = i + 1;
//                             } else if (currentPage <= 3) {
//                               pageNum = i + 1;
//                             } else if (currentPage >= totalPages - 2) {
//                               pageNum = totalPages - 4 + i;
//                             } else {
//                               pageNum = currentPage - 2 + i;
//                             }
//                             return (
//                               <button
//                                 key={pageNum}
//                                 onClick={() => setCurrentPage(pageNum)}
//                                 className={`w-8 h-8 rounded-lg font-bold transition text-xs ${
//                                   currentPage === pageNum
//                                     ? 'bg-indigo-600 text-white shadow-xs'
//                                     : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
//                                 }`}
//                               >
//                                 {pageNum}
//                               </button>
//                             );
//                           })}
//                           <button
//                             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                             disabled={currentPage === totalPages}
//                             className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
//                           >
//                             <FiChevronRight className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ─── UPDATE MODAL ─── */}
//         {showUpdateModal && selectedTask && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
//             <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
//               <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
//                 <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
//                   <FiEdit2 className="w-4 h-4 sm:w-6 sm:h-6" />
//                   Update Task Progress
//                 </h2>
//                 <button onClick={() => setShowUpdateModal(false)} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
//                   <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
//                 </button>
//               </div>
//               <form onSubmit={handleUpdateSubmit} className="px-4 sm:px-8 py-4 sm:py-6">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Task</label>
//                     <input type="text" value={selectedTask.title || selectedTask.taskName} disabled className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none text-xs sm:text-sm text-gray-500 cursor-not-allowed" />
//                   </div>

//                   <div>
//                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
//                       <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                       Update Text *
//                     </label>
//                     <textarea
//                       required
//                       value={updateData.updateText}
//                       onChange={(e) => setUpdateData({...updateData, updateText: e.target.value})}
//                       placeholder="Describe your progress..."
//                       rows="3"
//                       className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
//                     />
//                   </div>

//                   {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) && selectedTask?.assignedTo?.length === 1 && (
//                     <div>
//                       <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
//                         <FiFlag className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         Status
//                       </label>
//                       <select
//                         value={updateData.status}
//                         onChange={(e) => handleStatusChange(e.target.value)}
//                         className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
//                       >
//                         <option value="Pending">Pending</option>
//                         <option value="In Progress">In Progress</option>
//                         <option value="Completed">✅ Completed</option>
//                       </select>
//                     </div>
//                   )}

//                   {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
//                     <div>
//                       <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                         <FiList className="w-4 h-4 text-indigo-500" />
//                         Subtasks ({selectedTask.subtasks.length})
//                         <span className="text-[10px] text-gray-500 font-normal">
//                           {selectedTask.subtasks.filter(s => s.status === 'Completed').length} completed
//                         </span>
//                       </label>
//                       <div className="space-y-2 bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 max-h-60 overflow-y-auto">
//                         {selectedTask.subtasks.map((subtask, idx) => (
//                           <div key={subtask._id || idx} className="flex items-start gap-2 sm:gap-3 p-2 bg-white/40 rounded-lg border border-white/30">
//                             <input
//                               type="checkbox"
//                               checked={subtask.status === 'Completed'}
//                               onChange={(e) => handleSubtaskCheckboxChange(subtask, e.target.checked)}
//                               className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
//                             />
//                             <div className="flex-1 min-w-0">
//                               <p className="text-xs sm:text-sm font-medium text-gray-800">{subtask.name}</p>
//                               {subtask.description && (
//                                 <p className="text-[10px] sm:text-xs text-gray-500 truncate">{subtask.description}</p>
//                               )}
//                               {subtask.submitDate && (
//                                 <p className="text-[8px] sm:text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
//                                   <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                                   Due: {formatDate(subtask.submitDate)}
//                                 </p>
//                               )}
//                             </div>
//                             <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
//                               subtask.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
//                               subtask.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
//                               'bg-amber-100 text-amber-700'
//                             }`}>
//                               {subtask.status || 'Pending'}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) && (
//                     <div>
//                       <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
//                         <FiBarChart2 className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         Progress: {updateData.progress}%
//                       </label>
//                       <input
//                         type="range"
//                         min="0"
//                         max="100"
//                         value={updateData.progress}
//                         onChange={(e) => setUpdateData({...updateData, progress: parseInt(e.target.value)})}
//                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
//                       />
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
//                       <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                       Remark
//                     </label>
//                     <textarea
//                       value={updateData.remark}
//                       onChange={(e) => setUpdateData({...updateData, remark: e.target.value})}
//                       placeholder="Add any additional remarks..."
//                       rows="2"
//                       className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
//                       <FiPaperclip className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                       Attachments
//                     </label>
//                     <div className="flex flex-wrap gap-2">
//                       <button
//                         type="button"
//                         onClick={() => galleryInputRef.current?.click()}
//                         className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl text-xs font-medium hover:bg-white/60 transition-all flex items-center gap-2"
//                       >
//                         <FiImage className="w-4 h-4" />
//                         Gallery
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => cameraInputRef.current?.click()}
//                         className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl text-xs font-medium hover:bg-white/60 transition-all flex items-center gap-2"
//                       >
//                         <FiCamera className="w-4 h-4" />
//                         Camera
//                       </button>
//                       <input
//                         type="file"
//                         ref={galleryInputRef}
//                         onChange={handleGalleryUpload}
//                         multiple
//                         accept="image/*,.pdf,.doc,.docx"
//                         className="hidden"
//                       />
//                       <input
//                         type="file"
//                         ref={cameraInputRef}
//                         onChange={handleCameraUpload}
//                         multiple
//                         accept="image/*"
//                         capture="environment"
//                         className="hidden"
//                       />
//                     </div>
//                     {attachmentPreviews.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mt-2">
//                         {attachmentPreviews.map((preview, idx) => (
//                           <div key={idx} className="relative group">
//                             <img
//                               src={preview.url}
//                               alt={preview.name}
//                               className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-white/30"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => handleRemoveAttachment(idx)}
//                               className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//                             >
//                               <FiX className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <div className="flex items-center justify-between mb-1.5">
//                       <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
//                         <FiDollarSign className="w-4 h-4" />
//                         Expenses
//                       </label>
//                       <button
//                         type="button"
//                         onClick={() => setExpensesExpanded(!expensesExpanded)}
//                         className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-800 font-medium"
//                       >
//                         {expensesExpanded ? 'Hide' : 'Show'}
//                       </button>
//                     </div>

//                     {expensesExpanded && (
//                       <div className="space-y-3 bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
//                         <div id="expense-form-section" className="space-y-3 border-b border-gray-200/50 pb-4">
//                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                             <div>
//                               <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Amount (₹)</label>
//                               <input
//                                 type="number"
//                                 value={newExpense.expenseAmount}
//                                 onChange={(e) => setNewExpense({...newExpense, expenseAmount: e.target.value})}
//                                 placeholder="0.00"
//                                 className="w-full px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Distance (km)</label>
//                               <input
//                                 type="number"
//                                 value={newExpense.distance}
//                                 onChange={(e) => setNewExpense({...newExpense, distance: e.target.value})}
//                                 placeholder="0"
//                                 className="w-full px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
//                               />
//                             </div>
//                           </div>
//                           <div>
//                             <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Location Address</label>
//                             <div className="flex gap-2">
//                               <input
//                                 type="text"
//                                 value={newExpense.location.address}
//                                 onChange={(e) => setNewExpense({...newExpense, location: {...newExpense.location, address: e.target.value}})}
//                                 placeholder="Enter address..."
//                                 className="flex-1 px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
//                               />
//                               <button
//                                 type="button"
//                                 onClick={() => getLocationFromAddress(newExpense.location.address)}
//                                 disabled={fetchingLocation}
//                                 className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-1"
//                               >
//                                 {fetchingLocation ? (
//                                   <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                 ) : (
//                                   <FiMapPin className="w-4 h-4" />
//                                 )}
//                               </button>
//                             </div>
//                           </div>
//                           <div>
//                             <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Description</label>
//                             <input
//                               type="text"
//                               value={newExpense.description}
//                               onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
//                               placeholder="Expense description..."
//                               className="w-full px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
//                             />
//                           </div>
//                           {expenseError && (
//                             <p className={`text-xs ${expenseError.includes('✅') ? 'text-emerald-600' : 'text-rose-600'}`}>
//                               {expenseError}
//                             </p>
//                           )}
//                           <button
//                             type="button"
//                             onClick={editingExistingExpense ? handleSaveExistingExpenseEdit : handleAddExpense}
//                             disabled={expenseActionLoading}
//                             className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//                           >
//                             {expenseActionLoading ? (
//                               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                             ) : editingExistingExpense ? (
//                               <><FiCheck className="w-4 h-4" /> Update Expense</>
//                             ) : (
//                               <><FiPlus className="w-4 h-4" /> Add Expense</>
//                             )}
//                           </button>
//                         </div>

//                         {existingExpenses.length > 0 && (
//                           <div className="space-y-2">
//                             <p className="text-[10px] font-semibold text-gray-600">Previous Expenses</p>
//                             {existingExpenses.map((expense, idx) => (
//                               <div key={expense._id} className="flex items-center justify-between p-2 bg-white/40 rounded-lg border border-white/30">
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-xs font-medium text-gray-800">₹{expense.expenseAmount} - {expense.description}</p>
//                                   <p className="text-[10px] text-gray-500">{expense.location?.address || 'N/A'}</p>
//                                 </div>
//                                 <div className="flex items-center gap-1">
//                                   <button
//                                     type="button"
//                                     onClick={() => handleStartEditExistingExpense(expense)}
//                                     className="p-1 hover:bg-amber-50 rounded transition-colors"
//                                     title="Edit"
//                                   >
//                                     <FiEdit2 className="w-3.5 h-3.5 text-amber-600" />
//                                   </button>
//                                   <button
//                                     type="button"
//                                     onClick={() => handleDeleteExistingExpense(expense)}
//                                     className="p-1 hover:bg-rose-50 rounded transition-colors"
//                                     title="Delete"
//                                   >
//                                     <FiTrash className="w-3.5 h-3.5 text-rose-600" />
//                                   </button>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}

//                         {updateData.expenses.length > 0 && (
//                           <div className="space-y-2">
//                             <p className="text-[10px] font-semibold text-gray-600">New Expenses (This Session)</p>
//                             {updateData.expenses.map((expense, idx) => (
//                               <div key={idx} className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-lg border border-indigo-200/50">
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-xs font-medium text-gray-800">₹{expense.expenseAmount} - {expense.description}</p>
//                                   <p className="text-[10px] text-gray-500">{expense.location?.address || 'N/A'}</p>
//                                 </div>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleRemoveExpense(idx)}
//                                   className="p-1 hover:bg-rose-50 rounded transition-colors"
//                                   title="Remove"
//                                 >
//                                   <FiX className="w-3.5 h-3.5 text-rose-600" />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200/50">
//                     <button
//                       type="button"
//                       onClick={() => setShowUpdateModal(false)}
//                       className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={updateLoading}
//                       className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
//                     >
//                       {updateLoading ? (
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       ) : (
//                         <><FiCheck className="w-4 h-4" /> Update Task</>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* ─── VIEW MODAL ─── */}
//         {showViewModal && viewTask && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
//             <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
//               <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center z-10">
//                 <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
//                   <FiEye className="w-4 h-4 sm:w-6 sm:h-6" />
//                   Task Details
//                 </h2>
//                 <button
//                   onClick={() => { setShowViewModal(false); setViewTask(null); }}
//                   className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
//                 >
//                   <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
//                 </button>
//               </div>

//               <div className="px-4 sm:px-8 py-4 sm:py-6">
//                 <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-4 sm:mb-6">
//                   <div className="w-full sm:w-auto">
//                     <h3 className="text-base sm:text-xl font-bold text-gray-800">{viewTask.taskName || viewTask.title}</h3>
//                     <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{viewTask.title || viewTask.taskName}</p>
//                   </div>
//                   <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                     <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${getPriorityStyles(viewTask.priority)}`}>
//                       {getPriorityIcon(viewTask.priority)}
//                       {viewTask.priority}
//                     </span>
//                     <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusStyles(viewTask.status)}`}>
//                       {getStatusIcon(viewTask.status)}
//                       {viewTask.status}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mb-4 sm:mb-6">
//                   <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
//                     <FiMessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                     Description
//                   </h4>
//                   <p className="text-xs sm:text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
//                     {viewTask.description || 'No description provided'}
//                   </p>
//                 </div>

//                 <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
//                   <div className="flex justify-between items-center mb-1.5 sm:mb-2">
//                     <span className="text-xs sm:text-sm font-semibold text-gray-700">Progress</span>
//                     <span className="text-xs sm:text-sm font-bold text-gray-800">{viewTask.progress}%</span>
//                   </div>
//                   <div className="w-full h-1.5 sm:h-2 bg-gray-200/50 rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
//                       style={{ width: `${viewTask.progress}%` }}
//                     />
//                   </div>
//                 </div>

//                 <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
//                   <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
//                     <FiCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                     Submit Date & Time
//                   </div>
//                   <p className="text-xs sm:text-sm font-medium text-gray-800">
//                     {formatDateTime(viewTask.submitDate)}
//                   </p>
//                 </div>

//                 <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
//                   <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
//                     <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                     Assigned To
//                   </h4>
//                   <div className="space-y-1.5 sm:space-y-2">
//                     {Array.isArray(viewTask.assignedTo) && viewTask.assignedTo.length > 0 ? (
//                       viewTask.assignedTo.map((emp, idx) => (
//                         <div key={idx} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white/30 rounded-lg">
//                           <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-sm flex-shrink-0">
//                             {getInitials(emp.name || emp.fullName || emp.email || 'U')}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{emp.name || emp.fullName || 'Unknown'}</p>
//                             <p className="text-[10px] sm:text-xs text-gray-500 truncate">{emp.email || 'N/A'}</p>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-xs sm:text-sm text-gray-500">No employees assigned</p>
//                     )}
//                   </div>
//                 </div>

//                 {viewTask.subtasks && viewTask.subtasks.length > 0 && (
//                   <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
//                     <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
//                       <FaList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
//                       Subtasks ({viewTask.subtasks.length})
//                       <span className="text-[10px] sm:text-xs text-gray-500 font-normal ml-2">
//                         {viewTask.subtasks.filter(s => s.status === 'Completed').length} completed
//                       </span>
//                     </h4>
//                     <div className="space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
//                       {viewTask.subtasks.map((subtask, idx) => (
//                         <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
//                           <div className="flex-shrink-0">
//                             {subtask.status === 'Completed' ? <FiCheckCircle className="w-3 h-3 text-emerald-500" /> :
//                              subtask.status === 'In Progress' ? <FiRefreshCw className="w-3 h-3 text-blue-500" /> :
//                              <FiClock className="w-3 h-3 text-amber-500" />}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="flex flex-wrap items-center gap-1 sm:gap-2">
//                               <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">{subtask.name}</span>
//                               <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
//                                 subtask.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
//                                 subtask.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
//                                 'bg-amber-100 text-amber-700'
//                               }`}>
//                                 {subtask.status || 'Pending'}
//                               </span>
//                             </div>
//                             {subtask.description && (
//                               <p className="text-[10px] sm:text-xs text-gray-500 truncate">{subtask.description}</p>
//                             )}
//                             {subtask.submitDate && (
//                               <p className="text-[8px] sm:text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
//                                 <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                                 Due: {formatDateTime(subtask.submitDate)}
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {viewTask.employeeUpdates && viewTask.employeeUpdates.length > 0 && (
//                   <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
//                     <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
//                       <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                       Employee Updates ({viewTask.employeeUpdates.length})
//                     </h4>
//                     <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
//                       {viewTask.employeeUpdates.map((update, idx) => (
//                         <div key={idx} className="p-2 sm:p-3 bg-white/30 rounded-lg border border-white/30">
//                           <div className="flex items-center justify-between mb-1">
//                             <span className="text-xs sm:text-sm font-medium text-gray-800">
//                               {update.employeeId?.name || update.employeeId?.fullName || 'Unknown'}
//                             </span>
//                             <span className="text-[10px] sm:text-xs text-gray-500">{formatDateTime(update.updatedAt)}</span>
//                           </div>
//                           <p className="text-[10px] sm:text-xs text-gray-600 mb-1">{update.updateText || 'No update text'}</p>
//                           <div className="flex items-center gap-2">
//                             <span className="text-[10px] sm:text-xs font-semibold text-indigo-600">{update.progress}%</span>
//                             <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                               <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${update.progress}%` }} />
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ─── ISSUES LIST MODAL ─── */}
//         {showIssuesListModal && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
//             <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
//               <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center z-10">
//                 <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
//                   <FiAlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
//                   Task Issues
//                 </h2>
//                 <button
//                   onClick={() => { setShowIssuesListModal(false); setSelectedTaskForIssues(null); }}
//                   className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
//                 >
//                   <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
//                 </button>
//               </div>
//               <div className="px-4 sm:px-8 py-4 sm:py-6">
//                 {issuesLoading ? (
//                   <div className="flex flex-col items-center justify-center py-8">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
//                     <p className="mt-3 text-xs sm:text-sm text-gray-500">Loading issues...</p>
//                   </div>
//                 ) : taskIssues.length === 0 ? (
//                   <div className="text-center py-8">
//                     <FiInfo className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
//                     <p className="text-xs sm:text-sm text-gray-500">No issues reported for this task</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {taskIssues.map((issue, idx) => {
//                       const st = issueStatusMeta[issue.status] || issueStatusMeta['Open'];
//                       const pr = priorityMeta[issue.priority] || priorityMeta['Medium'];
//                       return (
//                         <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
//                           <div className="flex items-start justify-between mb-2">
//                             <div className="flex-1">
//                               <h4 className="text-sm sm:text-base font-semibold text-gray-800">{issue.issueTitle}</h4>
//                               <p className="text-xs sm:text-sm text-gray-600 mt-1">{issue.issueDescription}</p>
//                             </div>
//                             <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
//                               issue.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
//                               issue.priority === 'High' ? 'bg-orange-100 text-orange-700' :
//                               'bg-amber-100 text-amber-700'
//                             }`}>
//                               {issue.priority}
//                             </span>
//                           </div>
//                           <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
//                             <span>Reported by: {issue.reportedBy?.name || 'Unknown'}</span>
//                             <span className={`px-2 py-0.5 rounded-full ${
//                               issue.status === 'Open' ? 'bg-indigo-100 text-indigo-700' :
//                               issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
//                               issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
//                               'bg-gray-100 text-gray-700'
//                             }`}>
//                               {issue.status}
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ─── REPORT ISSUE MODAL ─── */}
//         {showReportModal && selectedTaskForReport && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
//             <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
//               <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center z-10">
//                 <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
//                   <FiAlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
//                   Report Issue
//                 </h2>
//                 <button
//                   onClick={() => { setShowReportModal(false); setSelectedTaskForReport(null); }}
//                   className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
//                 >
//                   <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
//                 </button>
//               </div>
//               <form onSubmit={handleReportSubmit} className="px-4 sm:px-8 py-4 sm:py-6">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Issue Title *</label>
//                     <input
//                       type="text"
//                       required
//                       value={reportData.issueTitle}
//                       onChange={(e) => setReportData({...reportData, issueTitle: e.target.value})}
//                       placeholder="Brief description of the issue..."
//                       className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Issue Description *</label>
//                     <textarea
//                       required
//                       value={reportData.issueDescription}
//                       onChange={(e) => setReportData({...reportData, issueDescription: e.target.value})}
//                       placeholder="Detailed description of the issue..."
//                       rows="4"
//                       className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
//                     <select
//                       value={reportData.priority}
//                       onChange={(e) => setReportData({...reportData, priority: e.target.value})}
//                       className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
//                     >
//                       <option value="Low">Low</option>
//                       <option value="Medium">Medium</option>
//                       <option value="High">High</option>
//                       <option value="Critical">Critical</option>
//                     </select>
//                   </div>
//                   <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200/50">
//                     <button
//                       type="button"
//                       onClick={() => { setShowReportModal(false); setSelectedTaskForReport(null); }}
//                       className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={reportLoading}
//                       className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
//                     >
//                       {reportLoading ? (
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       ) : (
//                         <><FiAlertTriangle className="w-4 h-4" /> Report Issue</>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* ─── CUTE POPUP ─── */}
//         {showCutePopup && (
//           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
//             <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30 animate-pop-bounce max-w-md text-center">
//               <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg animate-float">
//                 {cutePopupType === 'success' ? (
//                   <FiCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
//                 ) : (
//                   <FiAlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
//                 )}
//               </div>
//               <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{cutePopupMessage}</h3>
//               <p className="text-sm text-gray-600">{cutePopupSubMessage}</p>
//             </div>
//           </div>
//         )}

//         {/* ─── TOAST ─── */}
//         {showToast && (
//           <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-[200] animate-slideUp">
//             <div className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-xl shadow-2xl border border-white/30 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm ${
//               toastType === 'success' ? 'bg-emerald-50/90 text-emerald-800' : 'bg-rose-50/90 text-rose-800'
//             }`}>
//               {toastType === 'success' ? <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
//               <span className="font-medium">{toastMessage}</span>
//             </div>
//           </div>
//         )}
//       </main>

//       <style jsx>{`
//         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
//         @keyframes slideDown { from { opacity: 0; transform: translateY(-30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
//         @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes pulse-slow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
//         @keyframes popBounce {
//           0% { opacity: 0; transform: scale(0.2) translateY(-30px) rotate(-5deg); }
//           40% { opacity: 1; transform: scale(1.1) translateY(0) rotate(2deg); }
//           60% { transform: scale(0.95) translateY(-5px) rotate(-1deg); }
//           80% { transform: scale(1.02) translateY(2px) rotate(0.5deg); }
//           100% { transform: scale(1) translateY(0) rotate(0deg); }
//         }
//         @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(8deg); } }
//         @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; } }
        
//         .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
//         .animate-slideDown { animation: slideDown 0.3s ease-out; }
//         .animate-slideUp { animation: slideUp 0.3s ease-out; }
//         .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
//         .animate-pop-bounce { animation: popBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
//         .animate-float { animation: float 2s ease-in-out infinite; }

//         @media (max-width: 480px) {
//           .xs\\:block { display: block; }
//           .xs\\:hidden { display: none; }
//         }
//         @media (min-width: 481px) {
//           .xs\\:block { display: block; }
//           .xs\\:hidden { display: none; }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default MyTasks;


import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FiRefreshCw, FiCheckCircle, FiClock, FiAlertCircle, FiBarChart2,
  FiList, FiLogOut, FiUser, FiFlag, FiStar, FiEdit2, FiPlus,
  FiMic, FiMicOff, FiX, FiEye, FiTrash2, FiInfo, FiSearch,
  FiPaperclip, FiMessageSquare, FiAlertTriangle, FiCircle,
  FiDollarSign, FiMapPin, FiTrash, FiPlus as FiPlusIcon,
  FiChevronDown, FiChevronUp, FiLoader, FiDownload, FiFile,
  FiImage, FiFileText, FiExternalLink, FiUsers, FiUserPlus,
  FiLayers, FiCalendar, FiBell, FiFilter, FiCamera, FiFolder,
  FiRepeat, FiCheck, FiChevronLeft, FiChevronRight, FiTrendingUp
} from 'react-icons/fi';
import { FaTasks, FaRocket, FaList } from 'react-icons/fa';
import Navbar from '../Navbar';
import { 
  updateTaskByEmployee, 
  reportTaskIssue,
  getTaskIssues,
  deleteTask,
  deleteTaskExpense,
  updateTaskExpense,
  createTask
} from '../services/taskService';
import './DummyDashboard.css';

const TASK_API = 'https://api.timelyhealth.in/api/tasks';
const GEOCODE_API = 'https://nominatim.openstreetmap.org/search';
const BASE_URL = 'https://api.timelyhealth.in';

const priorityMeta = {
  Critical: { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
  High:     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiFlag className="w-3 h-3 sm:w-4 sm:h-4" /> },
  Medium:   { color: '#eab308', bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-200/50', icon: <FiStar className="w-3 h-3 sm:w-4 sm:h-4" /> },
  Low:      { color: '#22c55e', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
};

const statusMeta = {
  'Pending':     { color: '#6366f1', bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-200/50', icon: <FiClock className="w-3 h-3 sm:w-4 sm:h-4" /> },
  'In Progress': { color: '#3b82f6', bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-200/50', icon: <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" /> },
  'Completed':   { color: '#10b981', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
  'Rejected':    { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiX className="w-3 h-3 sm:w-4 sm:h-4" /> },
  'Overdue':     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
};

const issueStatusMeta = {
  'Open':        { color: '#6366f1', bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-200/50', icon: <FiCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
  'In Progress': { color: '#3b82f6', bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-200/50', icon: <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" /> },
  'Resolved':    { color: '#10b981', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
  'Closed':      { color: '#6b7280', bg: 'bg-gray-50/80', text: 'text-gray-600', border: 'border-gray-200/50', icon: <FiX className="w-3 h-3 sm:w-4 sm:h-4" /> },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getInitials(name = '') {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function MyTasks({ defaultStatus = 'ALL', defaultDue = 'ALL' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole') || 'employee';
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId] = useState('');
  
  // ─── Tasks State ───
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ─── Filters ───
  const [filterStatus, setFilterStatus] = useState(() => {
    return location.state?.filterStatus || defaultStatus;
  });
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDue, setFilterDue] = useState(() => {
    return location.state?.filterDue || defaultDue;
  });
  const [search, setSearch] = useState('');

  // ─── Pagination ───
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentDateTime, setCurrentDateTime] = useState('');

  // ─── Live Clock ───
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentDateTime(now.toLocaleString('en-US', options));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync state with props or location.state on route transition
  useEffect(() => {
    setFilterStatus(location.state?.filterStatus || defaultStatus);
  }, [defaultStatus, location.state?.filterStatus]);

  useEffect(() => {
    setFilterDue(location.state?.filterDue || defaultDue);
  }, [defaultDue, location.state?.filterDue]);
  
  // ─── Upcoming Tasks Popup ───
  const [showUpcomingPopup, setShowUpcomingPopup] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [popupShown, setPopupShown] = useState(false);
  
  // ─── Modals State ───
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateData, setUpdateData] = useState({
    updateText: '',
    progress: 0,
    remark: '',
    expenses: [],
    status: ''
  });
  const [employeeProgressData, setEmployeeProgressData] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  
  const [showIssuesListModal, setShowIssuesListModal] = useState(false);
  const [selectedTaskForIssues, setSelectedTaskForIssues] = useState(null);
  const [taskIssues, setTaskIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTaskForReport, setSelectedTaskForReport] = useState(null);
  const [reportData, setReportData] = useState({
    issueTitle: '',
    issueDescription: '',
    priority: 'Medium'
  });
  const [reportLoading, setReportLoading] = useState(false);

  // ─── Create Task Modal State ───
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    taskName: '',
    title: '',
    description: '',
    priority: 'Medium',
    frequency: ['One Time'],
    submitDate: '',
    remark: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [voiceNoteFile, setVoiceNoteFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // ─── Subtasks State ───
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState({
    name: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    submitDate: ''
  });

  // ─── Cute Popup + Female Voice State ───
  const [showCutePopup, setShowCutePopup] = useState(false);
  const [cutePopupMessage, setCutePopupMessage] = useState('');
  const [cutePopupType, setCutePopupType] = useState('success');
  const [cutePopupSubMessage, setCutePopupSubMessage] = useState('');

  // ─── File Input Refs ───
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // ─── Expense State ───
  const [newExpense, setNewExpense] = useState({
    location: { address: '', latitude: '', longitude: '' },
    distance: '',
    expenseAmount: '',
    description: ''
  });
  const [expenseError, setExpenseError] = useState('');
  const [expensesExpanded, setExpensesExpanded] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [existingExpenses, setExistingExpenses] = useState([]);
  const [editingExistingExpense, setEditingExistingExpense] = useState(null);
  const [expenseActionLoading, setExpenseActionLoading] = useState(false);

  // ─── Toast State ───
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // ─── Female Voice Alert Function ───
  const speakFemaleVoice = (message) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Google UK') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Zira') ||
        voice.name.includes('Susan')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // ─── Cute Popup + Female Voice Function ───
  const showCutePopupWithVoice = (message, type = 'success', voiceMessage = null) => {
    setCutePopupMessage(message);
    setCutePopupType(type);
    setCutePopupSubMessage(type === 'success' ? '🎉 Awesome job! Keep it up! ✨' : '😅 Oops! Let\'s fix this! 💪');
    setShowCutePopup(true);
    
    const voiceText = voiceMessage || message;
    speakFemaleVoice(voiceText);
    
    setTimeout(() => setShowCutePopup(false), 3500);
  };

  // ─── Confetti Function ───
  const triggerConfetti = () => {
    const emojis = ['🎉', '✨', '🌟', '💖', '🎀', '🌈', '⭐', '🌸', '🎊', '💫'];
    for (let i = 0; i < 25; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.cssText = `
          position: fixed;
          left: ${Math.random() * window.innerWidth}px;
          top: -20px;
          font-size: ${Math.random() * 20 + 14}px;
          pointer-events: none;
          z-index: 9999;
          animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
      }, i * 50);
    }
  };

  // ─── Toast Message ───
  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // ─── Toggle Frequency ───
  const toggleFrequency = (freq) => {
    setCreateData(prev => {
      const current = prev.frequency || [];
      if (current.includes(freq)) {
        return { ...prev, frequency: current.filter(f => f !== freq) };
      } else {
        return { ...prev, frequency: [...current, freq] };
      }
    });
  };

  // ─── Subtask Functions ───
  const addSubtask = () => {
    if (!newSubtask.name.trim()) {
      alert('Please enter subtask name');
      return;
    }
    setSubtasks([...subtasks, { ...newSubtask, _id: Date.now().toString() }]);
    setNewSubtask({
      name: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      submitDate: ''
    });
  };

  const updateSubtask = (index, field, value) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], [field]: value };
    setSubtasks(updated);
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) { navigate('/'); return; }

    try {
      const d = JSON.parse(raw);
      const name = d.fullName || d.name || d.employeeName || d.username || d.firstName || 'Employee';
      const id = d.employee?._id || d.employee?.id || d._id || d.id || d.userId || '';
      setName(name);
      setEmpId(id);
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  }, [navigate]);

  // ─── Fetch Tasks ───
  const fetchTasks = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${TASK_API}/my-assigned-tasks/${employeeId}`);
      const data = res.data;
      const tasksData = Array.isArray(data) ? data : data.tasks || [];
      setTasks(tasksData);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      const upcoming = tasksData.filter(task => {
        if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
        if (task.progress >= 100) return false;
        const submitDate = new Date(task.submitDate);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate >= today && submitDate <= sevenDaysFromNow;
      });
      
      if (upcoming.length > 0 && !popupShown) {
        setUpcomingTasks(upcoming);
        setShowUpcomingPopup(true);
        setPopupShown(true);
      }
      
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [employeeId, popupShown]);

  useEffect(() => {
    if (employeeId) {
      fetchTasks();
    }
  }, [employeeId, fetchTasks]);

  const fetchTaskIssues = useCallback(async (taskId) => {
    setIssuesLoading(true);
    try {
      const res = await getTaskIssues(taskId);
      let issuesData = [];
      if (Array.isArray(res)) {
        issuesData = res;
      } else if (res.issues && Array.isArray(res.issues)) {
        issuesData = res.issues;
      } else if (res.data && Array.isArray(res.data)) {
        issuesData = res.data;
      }
      setTaskIssues(issuesData);
      setShowIssuesListModal(true);
    } catch (err) {
      console.error(err);
      setError('Failed to load task issues');
    } finally {
      setIssuesLoading(false);
    }
  }, []);

  const handleLogout = () => { 
    localStorage.clear(); 
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    navigate('/'); 
  };

  // ─── Handle Update Click with Employee Progress ───
  const handleUpdateClick = (task) => {
    setSelectedTask(task);
    
    let progress = task.progress || 0;
    
    const assignedEmployees = task.assignedTo || [];
    const employeeProgress = [];
    
    if (assignedEmployees.length > 0) {
      assignedEmployees.forEach(emp => {
        const empId = emp._id || emp;
        const empName = emp.name || emp.fullName || emp.email || 'Employee';
        
        let latestProgress = 0;
        let hasUpdated = false;
        
        if (task.employeeSubtaskProgress && task.employeeSubtaskProgress[empId]) {
          latestProgress = task.employeeSubtaskProgress[empId].progress || 0;
          hasUpdated = true;
        } else {
          const empUpdates = (task.employeeUpdates || []).filter(update => {
            const updateEmpId = update.employeeId?._id || update.employeeId;
            return updateEmpId?.toString() === empId?.toString();
          });
          
          if (empUpdates.length > 0) {
            const latest = empUpdates[empUpdates.length - 1];
            latestProgress = latest.progress || 0;
            hasUpdated = true;
          }
        }
        
        employeeProgress.push({
          employeeId: empId,
          employeeName: empName,
          progress: latestProgress,
          hasUpdated: hasUpdated
        });
      });
    }
    
    setEmployeeProgressData(employeeProgress);
    
    if (employeeProgress.length > 0) {
      const total = employeeProgress.reduce((sum, emp) => sum + emp.progress, 0);
      progress = Math.round(total / employeeProgress.length);
    }
    
    let status = task.status || 'Pending';
    if (progress >= 100) {
      status = 'Completed';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const empUpdates = (task.employeeUpdates || []).filter(update => {
      const updateEmpId = update.employeeId?._id || update.employeeId;
      const updateDate = new Date(update.updatedAt);
      updateDate.setHours(0, 0, 0, 0);
      return updateEmpId?.toString() === employeeId?.toString() && 
             updateDate.getTime() === today.getTime();
    });
    
    let latestUpdate = null;
    if (empUpdates.length > 0) {
      latestUpdate = empUpdates[empUpdates.length - 1];
    }
    
    const empExpenses = (task.expenses || []).filter(expense => {
      const expEmpId = expense.addedBy?._id || expense.addedBy;
      return expEmpId?.toString() === employeeId?.toString();
    });
    
    setExistingExpenses(empExpenses);
    
    setUpdateData({
      updateText: latestUpdate?.updateText || '',
      progress: latestUpdate?.progress || progress,
      remark: latestUpdate?.remark || '',
      expenses: [],
      status: status
    });
    setAttachments([]);
    setAttachmentPreviews([]);
    setNewExpense({
      location: { address: '', latitude: '', longitude: '' },
      distance: '',
      expenseAmount: '',
      description: ''
    });
    setExpenseError('');
    setExpensesExpanded(true);
    setShowUpdateModal(true);
  };

  // ─── Handle Status Change for Single Tasks ───
  const handleStatusChange = (newStatus) => {
    setUpdateData(prev => ({
      ...prev,
      status: newStatus
    }));
    
    if (newStatus === 'Completed') {
      setUpdateData(prev => ({
        ...prev,
        status: newStatus,
        progress: 100
      }));
      
      showCutePopupWithVoice(
        '✅ Task Completed!',
        'success',
        `Awesome! You've completed the task! Great job! 🌟`
      );
      triggerConfetti();
    }
  };

  // ─── Handle Attachment from Gallery ───
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setAttachments(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreviews(prev => [...prev, { name: file.name, url: reader.result, type: file.type }]);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  // ─── Handle Camera Upload ───
  const handleCameraUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setAttachments(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreviews(prev => [...prev, { name: file.name, url: reader.result, type: file.type }]);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  // ─── Remove Attachment ───
  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Get Location from Address ───
  const getLocationFromAddress = async (address) => {
    setFetchingLocation(true);
    setExpenseError('');

    if (!address || address.trim().length === 0) {
      setExpenseError('Please enter a location address first');
      setFetchingLocation(false);
      return;
    }

    if (address.trim().length < 2) {
      setExpenseError('Please enter at least 2 characters');
      setFetchingLocation(false);
      return;
    }

    try {
      const response = await axios.get(GEOCODE_API, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          countrycodes: 'in'
        }
      });

      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        setNewExpense(prev => ({
          ...prev,
          location: {
            address: location.display_name || address,
            latitude: parseFloat(location.lat) || 0,
            longitude: parseFloat(location.lon) || 0
          }
        }));
        setExpenseError(`✅ Location found: ${location.display_name.split(',')[0]}`);
        setTimeout(() => setExpenseError(''), 3000);
      } else {
        setExpenseError('❌ Location not found. Please try again.');
      }
    } catch (err) {
      console.error('Geocode error:', err);
      setExpenseError('❌ Failed to fetch location. Please try again.');
    } finally {
      setFetchingLocation(false);
    }
  };

  // ─── Add Expense ───
  const handleAddExpense = () => {
    if (!newExpense.expenseAmount || !newExpense.description) {
      setExpenseError('Please fill at least Amount and Description');
      return;
    }

    const expense = {
      _id: newExpense._id || undefined,
      location: {
        address: newExpense.location.address || 'N/A',
        latitude: parseFloat(newExpense.location.latitude) || 0,
        longitude: parseFloat(newExpense.location.longitude) || 0
      },
      distance: parseFloat(newExpense.distance) || 0,
      expenseAmount: parseFloat(newExpense.expenseAmount) || 0,
      description: newExpense.description,
      addedBy: employeeId,
      addedAt: new Date().toISOString(),
      expenseDate: new Date().toISOString()
    };

    setUpdateData(prev => ({
      ...prev,
      expenses: [...prev.expenses, expense]
    }));

    setNewExpense({
      location: { address: '', latitude: '', longitude: '' },
      distance: '',
      expenseAmount: '',
      description: ''
    });
    setExpenseError('');
  };

  // ─── Delete an already-saved expense from DB ───
  const handleDeleteExistingExpense = async (expense) => {
    if (!window.confirm(`Delete expense "₹${expense.expenseAmount} - ${expense.description}"?`)) return;
    setExpenseActionLoading(true);
    try {
      await deleteTaskExpense(selectedTask._id, expense._id, employeeId);
      setExistingExpenses(prev => prev.filter(e => e._id !== expense._id));
      showToastMessage('Expense deleted successfully!', 'success');
    } catch (err) {
      showToastMessage(err.response?.data?.message || 'Failed to delete expense', 'error');
    } finally {
      setExpenseActionLoading(false);
    }
  };

  // ─── Start editing an already-saved expense ───
  const handleStartEditExistingExpense = (expense) => {
    setEditingExistingExpense(expense._id);
    setNewExpense({
      _id: expense._id,
      location: {
        address: expense.location?.address || '',
        latitude: expense.location?.latitude || '',
        longitude: expense.location?.longitude || ''
      },
      distance: expense.distance || '',
      expenseAmount: expense.expenseAmount || '',
      description: expense.description || ''
    });
    setExpensesExpanded(true);
    setTimeout(() => {
      document.getElementById('expense-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // ─── Save edit of an already-saved expense to DB ───
  const handleSaveExistingExpenseEdit = async () => {
    if (!newExpense.expenseAmount || !newExpense.description) {
      setExpenseError('Please fill at least Amount and Description');
      return;
    }
    setExpenseActionLoading(true);
    try {
      await updateTaskExpense(selectedTask._id, editingExistingExpense, employeeId, {
        location: newExpense.location,
        distance: parseFloat(newExpense.distance) || 0,
        expenseAmount: parseFloat(newExpense.expenseAmount) || 0,
        description: newExpense.description
      });
      setExistingExpenses(prev => prev.map(e =>
        e._id === editingExistingExpense
          ? { ...e, ...newExpense, expenseAmount: parseFloat(newExpense.expenseAmount), distance: parseFloat(newExpense.distance) || 0 }
          : e
      ));
      setEditingExistingExpense(null);
      setNewExpense({ location: { address: '', latitude: '', longitude: '' }, distance: '', expenseAmount: '', description: '' });
      setExpenseError('');
      showToastMessage('Expense updated successfully!', 'success');
    } catch (err) {
      showToastMessage(err.response?.data?.message || 'Failed to update expense', 'error');
    } finally {
      setExpenseActionLoading(false);
    }
  };

  // ─── Remove Expense (new, unsaved) ───
  const handleRemoveExpense = (index) => {
    setUpdateData(prev => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index)
    }));
  };

  // ─── Edit Expense ───
  const handleEditExpense = (expense, index) => {
    setNewExpense({
      _id: expense._id,
      location: {
        address: expense.location?.address || '',
        latitude: expense.location?.latitude || '',
        longitude: expense.location?.longitude || ''
      },
      distance: expense.distance || '',
      expenseAmount: expense.expenseAmount || '',
      description: expense.description || ''
    });
    setUpdateData(prev => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index)
    }));
  };

  // ─── Update Subtask Status ───
  const updateSubtaskStatus = (subtaskId, status) => {
    if (!selectedTask) return;
    
    const updatedSubtasks = selectedTask.subtasks.map(subtask => {
      if (subtask._id === subtaskId) {
        return {
          ...subtask,
          status: status,
        };
      }
      return subtask;
    });
    
    setSelectedTask({
      ...selectedTask,
      subtasks: updatedSubtasks
    });
  };

  // ─── Handle Subtask Checkbox Click ───
  const handleSubtaskCheckboxChange = (subtask, isCompleted) => {
    updateSubtaskStatus(subtask._id, isCompleted ? 'Completed' : 'Pending');
    
    if (isCompleted) {
      showCutePopupWithVoice(
        '✅ Subtask Completed!',
        'success',
        `Awesome! You completed "${subtask.name}"! Keep going! You're doing great! 🌟`
      );
      triggerConfetti();
    }
  };

  // ─── Calculate progress from subtasks ───
  const calculateProgressFromSubtasks = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter(s => s.status === 'Completed').length;
    return Math.round((completed / subtasks.length) * 100);
  };

  // ─── Get subtask progress for UI ───
  const getSubtaskProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter(s => s.status === 'Completed').length;
    return Math.round((completed / subtasks.length) * 100);
  };

  // ─── UPDATE SUBMIT ───
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    
    try {
      let subtasksToSend = selectedTask.subtasks || [];
      
      let calculatedProgress = updateData.progress;
      
      if (subtasksToSend.length > 0) {
        calculatedProgress = calculateProgressFromSubtasks(subtasksToSend);
      }
      
      let finalStatus = updateData.status;
      if (calculatedProgress >= 100) {
        finalStatus = 'Completed';
      }
      
      const updatePayload = {
        updateText: updateData.updateText,
        progress: calculatedProgress,
        remark: updateData.remark,
        expenses: updateData.expenses,
        subtasks: subtasksToSend,
        status: finalStatus
      };
      
      const response = await updateTaskByEmployee(selectedTask._id, employeeId, updatePayload, attachments);
      
      if (response.success) {
        setShowUpdateModal(false);
        fetchTasks();
        
        triggerConfetti();
        
        showCutePopupWithVoice(
          '✅ Task Updated Successfully!',
          'success',
          `Hey ${employeeName}! Great job! Your task "${selectedTask.taskName || selectedTask.title}" has been updated successfully! Keep up the amazing work! 🌟`
        );
        
        showToastMessage('Task updated successfully!', 'success');
      }
    } catch (err) {
      if (err.response?.data?.type === 'EARLY_COMPLETION_ERROR') {
        const errorMsg = err.response?.data?.message || 'Cannot complete subtask before scheduled time';
        
        showCutePopupWithVoice(
          '⚠️ ' + errorMsg,
          'error',
          `Sorry! ${errorMsg}. Please check the date and time, and try again!`
        );
        
        showToastMessage(errorMsg, 'error');
      } else {
        setError('Failed to update task');
        
        showCutePopupWithVoice(
          '❌ Failed to update task',
          'error',
          'Oops! Something went wrong while updating the task. Please try again!'
        );
        
        showToastMessage('Failed to update task', 'error');
        console.error(err);
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleViewTask = (task) => {
    setViewTask(task);
    setShowViewModal(true);
  };

  const handleViewTaskIssues = (task) => {
    setSelectedTaskForIssues(task);
    fetchTaskIssues(task._id);
  };

  const handleReportIssueClick = (task) => {
    setSelectedTaskForReport(task);
    setReportData({
      issueTitle: '',
      issueDescription: '',
      priority: 'Medium'
    });
    setShowReportModal(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      await reportTaskIssue(selectedTaskForReport._id, employeeId, reportData);
      setShowReportModal(false);
      setSelectedTaskForReport(null);
      setReportData({
        issueTitle: '',
        issueDescription: '',
        priority: 'Medium'
      });
      fetchTasks();
      
      showCutePopupWithVoice(
        '✅ Issue Reported Successfully!',
        'success',
        `Thank you ${employeeName}! Your issue has been reported successfully. The team will look into it!`
      );
      
      showToastMessage('Issue reported successfully!', 'success');
    } catch (err) {
      setError('Failed to report issue');
      showToastMessage('Failed to report issue', 'error');
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      fetchTasks();
      showToastMessage('Task deleted successfully!', 'success');
    } catch (err) {
      setError('Failed to delete task');
      showToastMessage('Failed to delete task', 'error');
      console.error(err);
    }
  };

  // ─── Handle View Attachment ───
  const handleViewAttachment = (fileUrl, fileName) => {
    const fullUrl = `${BASE_URL}/${fileUrl}`;
    window.open(fullUrl, '_blank');
  };

  // ─── Handle Download Attachment ───
  const handleDownloadAttachment = async (fileUrl, fileName) => {
    try {
      const fullUrl = `${BASE_URL}/${fileUrl}`;
      const response = await axios.get(fullUrl, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || fileUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download attachment. Please try again.');
    }
  };

  // ─── Get File Icon ───
  const getFileIcon = (fileName) => {
    if (!fileName) return <FiFile className="w-3 h-3 sm:w-4 sm:h-4" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
      return <FiImage className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />;
    }
    if (['pdf'].includes(ext)) {
      return <FiFileText className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500" />;
    }
    if (['doc', 'docx'].includes(ext)) {
      return <FiFileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />;
    }
    if (['xls', 'xlsx'].includes(ext)) {
      return <FiFileText className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />;
    }
    return <FiFile className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />;
  };

  // ─── Create Task Functions ───
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
        setVoiceNoteFile(audioFile);
        setAudioChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
      setAudioChunks([]);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    try {
      if (!employeeId) {
        setError('User ID not found. Please login again.');
        setCreateLoading(false);
        return;
      }

      // Get department from localStorage
      const raw = localStorage.getItem('userData');
      let department = '';
      if (raw) {
        try {
          const d = JSON.parse(raw);
          department = d.department || d.employee?.department || '';
        } catch (err) {
          console.error('Error parsing userData:', err);
        }
      }

      const taskData = {
        taskName: createData.taskName,
        title: createData.title,
        description: createData.description,
        priority: createData.priority,
        frequency: createData.frequency,
        submitDate: createData.submitDate,
        remark: createData.remark,
        assignType: 'SELF',
        createdBy: employeeId,
        createdByType: 'employee',
        department: department,
        subtasks: subtasks
      };
      const response = await createTask(taskData, voiceNoteFile);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create task');
      }
      setShowCreateModal(false);
      setCreateData({
        taskName: '',
        title: '',
        description: '',
        priority: 'Medium',
        frequency: ['One Time'],
        submitDate: '',
        remark: ''
      });
      setSubtasks([]);
      setNewSubtask({
        name: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        submitDate: ''
      });
      setVoiceNoteFile(null);
      setIsRecording(false);
      setAudioChunks([]);
      fetchTasks();

      showCutePopupWithVoice(
        '✅ Task Created Successfully!',
        'success',
        `Hey ${employeeName}! Your task "${createData.taskName}" has been created successfully!`
      );

      showToastMessage('Task created successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create task';
      setError(errorMessage);
      console.error('Create task error:', err.response?.data || err);
    } finally {
      setCreateLoading(false);
    }
  };

  // ─── Filter Tasks ───
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    if (filterType === 'ASSIGNED') {
      filtered = filtered.filter(t => t.assignType !== 'SELF');
    } else if (filterType === 'CREATED') {
      filtered = filtered.filter(t => t.assignType === 'SELF');
    }
    
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((t) => {
        if (filterStatus === 'Completed') {
          return t.progress >= 100 || t.status === 'Completed';
        }
        return t.status === filterStatus && t.progress < 100;
      });
    }
    
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    if (filterDue === 'TODAY') {
      filtered = filtered.filter(task => {
        if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
        const submitDate = new Date(task.submitDate);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate.getTime() === today.getTime();
      });
    } else if (filterDue === 'UPCOMING') {
      filtered = filtered.filter(task => {
        if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
        const submitDate = new Date(task.submitDate);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate >= today && submitDate <= sevenDaysFromNow && submitDate.getTime() !== today.getTime();
      });
    } else if (filterDue === 'OVERDUE') {
      filtered = filtered.filter(task => {
        if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
        const submitDate = new Date(task.submitDate);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate < today;
      });
    }
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((t) => 
        (t.title || t.taskName || '').toLowerCase().includes(q) || 
        (t.description || '').toLowerCase().includes(q)
      );
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // ─── Pagination ───
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  const totalTasks = tasks.length;
  
  const counts = {
    ALL: tasks.length,
    Pending: tasks.filter((t) => t.status === 'Pending' && t.progress < 100).length,
    'In Progress': tasks.filter((t) => t.status === 'In Progress' && t.progress < 100).length,
    Completed: tasks.filter((t) => t.progress >= 100 || t.status === 'Completed').length,
    Overdue: tasks.filter((t) => t.status === 'Overdue' && t.progress < 100).length,
    Rejected: tasks.filter((t) => t.status === 'Rejected').length,
  };

  const typeCounts = {
    ALL: tasks.length,
    ASSIGNED: tasks.filter(t => t.assignType !== 'SELF').length,
    CREATED: tasks.filter(t => t.assignType === 'SELF').length,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const dueCounts = {
    ALL: tasks.length,
    TODAY: tasks.filter(task => {
      if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
      const submitDate = new Date(task.submitDate);
      submitDate.setHours(0, 0, 0, 0);
      return submitDate.getTime() === today.getTime();
    }).length,
    UPCOMING: tasks.filter(task => {
      if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
      const submitDate = new Date(task.submitDate);
      submitDate.setHours(0, 0, 0, 0);
      return submitDate >= today && submitDate <= sevenDaysFromNow && submitDate.getTime() !== today.getTime();
    }).length,
    OVERDUE: tasks.filter(task => {
      if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected' || task.progress >= 100) return false;
      const submitDate = new Date(task.submitDate);
      submitDate.setHours(0, 0, 0, 0);
      return submitDate < today;
    }).length,
  };

  const closeUpcomingPopup = () => {
    setShowUpcomingPopup(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const getUpcomingTasksList = (tasks) => {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    return tasks
      .filter(task => 
        task.submitDate && 
        task.status !== 'Completed' && 
        task.status !== 'Rejected' &&
        new Date(task.submitDate) <= sevenDaysFromNow &&
        new Date(task.submitDate) >= today
      )
      .sort((a, b) => new Date(a.submitDate) - new Date(b.submitDate));
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      'Critical': 'bg-rose-50 text-rose-700 border-rose-200',
      'High': 'bg-orange-50 text-orange-700 border-orange-200',
      'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
      'Low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return styles[priority] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusStyles = (status) => {
    const styles = {
      'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
      'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
      'Overdue': 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Completed': <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
      'In Progress': <FiRefreshCw className="w-3.5 h-3.5 text-blue-600" />,
      'Pending': <FiClock className="w-3.5 h-3.5 text-amber-600" />,
      'Rejected': <FiX className="w-3.5 h-3.5 text-rose-600" />,
      'Overdue': <FiAlertCircle className="w-3.5 h-3.5 text-red-600" />,
    };
    return icons[status] || <FiFileText className="w-3.5 h-3.5 text-slate-600" />;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'Critical': <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />,
      'High': <FiFlag className="w-3.5 h-3.5 text-orange-600" />,
      'Medium': <FiStar className="w-3.5 h-3.5 text-amber-600" />,
      'Low': <FiCheck className="w-3.5 h-3.5 text-emerald-600" />,
    };
    return icons[priority] || <FiFlag className="w-3.5 h-3.5 text-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ─── Horizontal Top Navbar ─── */}
      <Navbar userRole={userRole} onLogout={handleLogout} />

      {/* ─── Main Content Area (Full Width Layout) ─── */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="admin-dash">
          
          {/* Header Section */}
          <div className="admin-dash__header">
            <div>
              <h1 className="admin-dash__greeting flex items-center gap-2">
                <FaTasks className="w-5 h-5 text-indigo-600" /> My <span>Tasks</span>
              </h1>
              <p className="admin-dash__subtitle">
                Welcome back, {employeeName}. Track and manage your assigned tasks.
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {/* ─── Live Date & Time Display ─── */}
              <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-700 font-semibold text-xs">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDateTime}</span>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Create Task
              </button>
              
              <button
                onClick={fetchTasks}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-sm"
                title="Refresh Tasks"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* ─── Upcoming Tasks Popup ─── */}
            {showUpcomingPopup && upcomingTasks.length > 0 && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
                <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideDown relative">
                  <button
                    onClick={closeUpcomingPopup}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group"
                    title="Close"
                  >
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>

                  <div className="p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-pulse-slow flex-shrink-0">
                        <FiBell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="text-center sm:text-left">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">🔔 Upcoming Tasks Alert!</h2>
                        <p className="text-sm sm:text-base text-gray-600">
                          <span className="font-semibold text-amber-600">{upcomingTasks.length}</span> tasks are due within 7 days
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-amber-200/50">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <strong>Hey {employeeName}!</strong> There {upcomingTasks.length === 1 ? 'is' : 'are'} 
                        <span className="font-bold text-amber-600"> {upcomingTasks.length} </span> 
                        task{upcomingTasks.length > 1 ? 's' : ''} due soon. Please complete them before they become overdue! ⏰
                      </p>
                    </div>

                    <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto mb-4 sm:mb-6">
                      {upcomingTasks.map((task, idx) => {
                        const daysLeft = Math.ceil((new Date(task.submitDate) - new Date()) / (1000 * 60 * 60 * 24));
                        const pr = priorityMeta[task.priority] || priorityMeta['Medium'];
                        const st = statusMeta[task.status] || statusMeta['Pending'];
                        return (
                          <div key={idx} className="bg-white/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/50 hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                              <div className="flex-1 w-full sm:w-auto">
                                <h4 className="font-semibold text-sm sm:text-base text-gray-800">{task.taskName || task.title}</h4>
                                <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">{task.description}</p>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1 sm:mt-2">
                                  <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
                                    {pr.icon}
                                    {task.priority}
                                  </span>
                                  <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                                    {st.icon}
                                    {task.status}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-amber-600 font-medium">
                                    <FiClock className="inline mr-0.5 sm:mr-1 w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    {daysLeft <= 0 ? 'Overdue!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  closeUpcomingPopup();
                                  handleViewTask(task);
                                }}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:scale-105 transition-all flex-shrink-0"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
                      <button
                        onClick={closeUpcomingPopup}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium transition-all"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => {
                          closeUpcomingPopup();
                          setFilterDue('UPCOMING');
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
                      >
                        <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                        View All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Stats Section ─── */}
            <div className="admin-dash__stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('ALL'); setFilterDue('ALL'); }}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Total Tasks</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                    <FiBarChart2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{totalTasks}</div>
                <div className="admin-dash__stat-meta">all tasks</div>
              </div>
              
              <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('Pending'); setFilterDue('ALL'); }}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Pending</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                    <FiClock className="w-5 h-5" />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.Pending}</div>
                <div className="admin-dash__stat-meta">awaiting action</div>
              </div>
              
              <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('In Progress'); setFilterDue('ALL'); }}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">In Progress</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                    <FiRefreshCw className="w-5 h-5" />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts['In Progress']}</div>
                <div className="admin-dash__stat-meta">currently active</div>
              </div>
              
              <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('Completed'); setFilterDue('ALL'); }}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Completed</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.Completed}</div>
                <div className="admin-dash__stat-meta">successfully done</div>
              </div>
              
              <div className="admin-dash__stat cursor-pointer" onClick={() => { setFilterStatus('Overdue'); setFilterDue('ALL'); }}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Overdue</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
                    <FiAlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{dueCounts.OVERDUE}</div>
                <div className="admin-dash__stat-meta">past deadline</div>
              </div>

            </div>

            {/* ─── Filters Section ─── */}
            <div className="admin-dash__card">
              <div className="admin-dash__card-header">
                <div>
                  <h3 className="admin-dash__card-title flex items-center gap-2">
                    <FiFilter className="w-4 h-4 text-indigo-600" />
                    Filter Tasks
                  </h3>
                  <p className="admin-dash__card-desc">Filter, search, and manage your assigned tasks</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {filteredTasks.length} Tasks Found
                  </span>
                </div>
              </div>

              <div className="admin-dash__card-body space-y-4">
                {/* Search & Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
                      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search tasks by name or title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                      {search && (
                        <button 
                          onClick={() => setSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Selects & Controls */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                      </select>

                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="ALL">All Priorities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>

                      <select
                        value={filterDue}
                        onChange={(e) => setFilterDue(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="ALL">All Due Dates</option>
                        <option value="TODAY">Today</option>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>

                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="ALL">All Types</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="CREATED">Created</option>
                      </select>

                      {(search || filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterDue !== 'ALL' || filterType !== 'ALL') && (
                        <button
                          onClick={() => {
                            setSearch('');
                            setFilterStatus('ALL');
                            setFilterPriority('ALL');
                            setFilterDue('ALL');
                            setFilterType('ALL');
                          }}
                          className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <FiRefreshCw className="w-3.5 h-3.5" />
                          Reset
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold shadow-xs">
                    <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-3 text-xs font-semibold text-slate-500">Loading your tasks...</p>
                  </div>
                ) : currentTasks.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                    <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                      <FiList className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No tasks found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {filterType === 'ASSIGNED' ? 'No tasks assigned to you' : 
                       filterType === 'CREATED' ? 'You haven\'t created any tasks' : 
                       filterDue === 'TODAY' ? 'No tasks due today 🎉' :
                       filterDue === 'UPCOMING' ? 'No upcoming tasks in next 7 days 🎉' :
                       filterDue === 'OVERDUE' ? 'No overdue tasks! Great job! 🎉' :
                       'No tasks found'}
                    </p>
                    <button
                      onClick={() => {
                        setFilterType('ALL');
                        setFilterStatus('ALL');
                        setFilterPriority('ALL');
                        setFilterDue('ALL');
                        setSearch('');
                      }}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105"
                    >
                      View All Tasks
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-3.5 px-4 sm:px-6">Task</th>
                            <th className="py-3.5 px-4 sm:px-6">Priority</th>
                            <th className="py-3.5 px-4 sm:px-6">Status</th>
                            <th className="py-3.5 px-4 sm:px-6">Type</th>
                            <th className="py-3.5 px-4 sm:px-6">Progress</th>
                            <th className="py-3.5 px-4 sm:px-6">Submit Date</th>
                            <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {currentTasks.map((t) => {
                            const isCompleted = t.progress >= 100;
                            const effectiveStatus = isCompleted ? 'Completed' : t.status;
                            const isOverdue = t.submitDate && 
                                              new Date(t.submitDate) < new Date() && 
                                              !isCompleted &&
                                              t.status !== 'Rejected' &&
                                              t.progress < 100;
                            const issueCount = t.reportedIssues?.length || 0;
                            const daysLeft = t.submitDate ? Math.ceil((new Date(t.submitDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                            
                            return (
                              <tr
                                key={t._id}
                                className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                  isOverdue ? 'border-l-4 border-l-rose-400 bg-rose-50/20' : ''
                                } ${isCompleted ? 'border-l-4 border-l-emerald-400' : ''}`}
                                onClick={() => handleViewTask(t)}
                              >
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="font-semibold text-slate-800 truncate max-w-[180px]">{t.taskName || t.title}</div>
                                  <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{t.title}</div>
                                  {isOverdue && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold mt-1">
                                      <FiAlertCircle className="w-3 h-3" />
                                      Overdue!
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
                                      <FiCheckCircle className="w-3 h-3" />
                                      Completed
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getPriorityStyles(t.priority)}`}>
                                    {getPriorityIcon(t.priority)}
                                    {t.priority}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyles(effectiveStatus)}`}>
                                    {getStatusIcon(effectiveStatus)}
                                    {effectiveStatus}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    t.assignType === 'SELF' 
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                                  }`}>
                                    {t.assignType === 'SELF' ? 'Created' : 'Assigned'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                  <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{ 
                                          width: `${t.progress || 0}%`,
                                          background: t.progress >= 100 ? '#10b981' : '#6366f1'
                                        }}
                                      />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700">{t.progress || 0}%</span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600 font-medium">
                                  <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-1.5">
                                      <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                                      {t.submitDate ? formatDate(t.submitDate) : 'N/A'}
                                    </div>
                                    {daysLeft !== null && !isCompleted && t.status !== 'Rejected' && daysLeft > 0 && (
                                      <span className="text-[10px] text-amber-600 font-medium mt-0.5">
                                        {daysLeft} day{daysLeft > 1 ? 's' : ''} left
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button 
                                      onClick={() => handleViewTaskIssues(t)} 
                                      className={`p-2 rounded-xl transition shadow-2xs ${
                                        issueCount > 0 
                                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}
                                      title={`${issueCount} issues reported`}
                                    >
                                      <FiAlertTriangle className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleViewTask(t)} 
                                      className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition shadow-2xs" 
                                      title="View Task Details"
                                    >
                                      <FiEye className="w-3.5 h-3.5" />
                                    </button>
                                    {!isCompleted && (
                                      <button 
                                        onClick={() => handleUpdateClick(t)} 
                                        className="p-2 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-xl transition shadow-2xs" 
                                        title="Update Task"
                                      >
                                        <FiEdit2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {t.assignType === 'SELF' && (
                                      <button 
                                        onClick={() => handleDeleteTask(t._id)} 
                                        className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition shadow-2xs" 
                                        title="Delete Task"
                                      >
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {t.assignType !== 'SELF' && !isCompleted && (
                                      <button 
                                        onClick={() => handleReportIssueClick(t)} 
                                        className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition shadow-2xs" 
                                        title="Report Issue"
                                      >
                                        <FiAlertTriangle className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                        <div>
                          Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{' '}
                          <span className="font-bold text-slate-800">{Math.min(endIndex, filteredTasks.length)}</span> of{' '}
                          <span className="font-bold text-slate-800">{filteredTasks.length}</span> tasks
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <FiChevronLeft className="w-4 h-4" />
                          </button>
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 rounded-lg font-bold transition text-xs ${
                                  currentPage === pageNum
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <FiChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── CREATE TASK MODAL ─── */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
              <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                  <FiPlus className="w-4 h-4 sm:w-6 sm:h-6" />
                  Create Task
                </h2>
                <button onClick={() => { setShowCreateModal(false); }} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="px-4 sm:px-8 py-4 sm:py-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Task Name *</label>
                    <input type="text" required value={createData.taskName} onChange={(e) => setCreateData({...createData, taskName: e.target.value})} placeholder="Enter task name" className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                    <input type="text" required value={createData.title} onChange={(e) => setCreateData({...createData, title: e.target.value})} placeholder="Enter task title" className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                    <textarea required value={createData.description} onChange={(e) => setCreateData({...createData, description: e.target.value})} placeholder="Describe the task..." rows="3" className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs sm:text-sm resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                      <select value={createData.priority} onChange={(e) => setCreateData({...createData, priority: e.target.value})} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs sm:text-sm">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Submit Date & Time</label>
                      <input type="datetime-local" value={createData.submitDate} onChange={(e) => setCreateData({...createData, submitDate: e.target.value})} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs sm:text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Task Frequency</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['One Time', 'Daily', 'Weekly', 'Monthly'].map((type) => {
                        const isChecked = createData.frequency?.includes(type) || false;
                        return (
                          <label
                            key={type}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${isChecked
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-white border-slate-200 text-gray-600 hover:bg-slate-50'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFrequency(type)}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            {type}
                          </label>
                        );
                      })}
                    </div>
                    {createData.frequency?.length > 0 && (
                      <p className="mt-1.5 text-[10px] sm:text-xs text-gray-500">
                        Selected: <span className="font-medium text-indigo-600">{createData.frequency.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  {/* ─── Subtasks ─── */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                        Subtasks ({subtasks.length})
                      </label>
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        {subtasks.filter(s => s.status === 'Completed').length} completed
                      </span>
                    </div>

                    {/* Add Subtask Form */}
                    <div className="bg-indigo-50/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-indigo-200/50 mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={newSubtask.name}
                          onChange={(e) => setNewSubtask({ ...newSubtask, name: e.target.value })}
                          placeholder="Subtask name *"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm"
                        />
                        <input
                          type="text"
                          value={newSubtask.description}
                          onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                          placeholder="Description"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm"
                        />
                        <input
                          type="datetime-local"
                          value={newSubtask.submitDate}
                          onChange={(e) => setNewSubtask({ ...newSubtask, submitDate: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm"
                        />
                        <div className="flex gap-2">
                          <select
                            value={newSubtask.priority}
                            onChange={(e) => setNewSubtask({ ...newSubtask, priority: e.target.value })}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                          <button
                            type="button"
                            onClick={addSubtask}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-1 flex-shrink-0"
                          >
                            <FiPlus className="w-4 h-4" />
                            <span className="hidden xs:inline">Add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subtasks List */}
                    {subtasks.length > 0 && (
                      <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto pr-1">
                        {subtasks.map((subtask, index) => (
                          <div key={subtask._id || index} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 p-2 sm:p-3 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="w-1.5 h-8 sm:h-10 rounded-full" style={{
                                  background: subtask.priority === 'Critical' ? '#ef4444' :
                                    subtask.priority === 'High' ? '#f97316' :
                                      subtask.priority === 'Medium' ? '#eab308' : '#22c55e'
                                }} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                                      {subtask.name || `Subtask ${index + 1}`}
                                    </span>
                                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${subtask.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                        subtask.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                          'bg-amber-100 text-amber-700'
                                      }`}>
                                      {subtask.status || 'Pending'}
                                    </span>
                                  </div>
                                  {subtask.description && (
                                    <p className="text-[8px] sm:text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
                                      {subtask.description}
                                    </p>
                                  )}
                                  {subtask.submitDate && (
                                    <p className="text-[6px] sm:text-[10px] text-gray-400 flex items-center gap-0.5">
                                      <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      Submit: {new Date(subtask.submitDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSubtask(index)}
                                className="p-1 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Remark</label>
                    <textarea value={createData.remark} onChange={(e) => setCreateData({...createData, remark: e.target.value})} placeholder="Any additional remarks..." rows="2" className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs sm:text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                      <FiMic className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Voice Note (Optional)
                    </label>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {!isRecording ? (
                        <button type="button" onClick={startRecording} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
                          <FiMic className="w-4 h-4" />
                          Start Recording
                        </button>
                      ) : (
                        <button type="button" onClick={stopRecording} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
                          <FiMicOff className="w-4 h-4" />
                          Stop Recording
                        </button>
                      )}
                      {voiceNoteFile && (
                        <div className="flex items-center gap-2">
                          <audio controls src={URL.createObjectURL(voiceNoteFile)} className="h-9 sm:h-10" />
                          <button type="button" onClick={() => setVoiceNoteFile(null)} className="p-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-colors">
                            <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    {isRecording && (
                      <div className="mt-2 flex items-center gap-2 text-rose-500 text-xs sm:text-sm">
                        <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-rose-500"></span>
                        </span>
                        <span className="font-medium">Recording...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition text-xs sm:text-sm">Cancel</button>
                  <button type="submit" disabled={createLoading} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm">
                    {createLoading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating...</>
                    ) : (
                      <><FaRocket className="w-4 h-4" /> Create Task</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── UPDATE MODAL ─── */}
        {showUpdateModal && selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
              <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                  <FiEdit2 className="w-4 h-4 sm:w-6 sm:h-6" />
                  Update Task Progress
                </h2>
                <button onClick={() => setShowUpdateModal(false)} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleUpdateSubmit} className="px-4 sm:px-8 py-4 sm:py-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Task</label>
                    <input type="text" value={selectedTask.title || selectedTask.taskName} disabled className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none text-xs sm:text-sm text-gray-500 cursor-not-allowed" />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                      <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Update Text *
                    </label>
                    <textarea
                      required
                      value={updateData.updateText}
                      onChange={(e) => setUpdateData({...updateData, updateText: e.target.value})}
                      placeholder="Describe your progress..."
                      rows="3"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
                    />
                  </div>

                  {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) && selectedTask?.assignedTo?.length === 1 && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                        <FiFlag className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Status
                      </label>
                      <select
                        value={updateData.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">✅ Completed</option>
                      </select>
                    </div>
                  )}

                  {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiList className="w-4 h-4 text-indigo-500" />
                        Subtasks ({selectedTask.subtasks.length})
                        <span className="text-[10px] text-gray-500 font-normal">
                          {selectedTask.subtasks.filter(s => s.status === 'Completed').length} completed
                        </span>
                      </label>
                      <div className="space-y-2 bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 max-h-60 overflow-y-auto">
                        {selectedTask.subtasks.map((subtask, idx) => (
                          <div key={subtask._id || idx} className="flex items-start gap-2 sm:gap-3 p-2 bg-white/40 rounded-lg border border-white/30">
                            <input
                              type="checkbox"
                              checked={subtask.status === 'Completed'}
                              onChange={(e) => handleSubtaskCheckboxChange(subtask, e.target.checked)}
                              className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-800">{subtask.name}</p>
                              {subtask.description && (
                                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{subtask.description}</p>
                              )}
                              {subtask.submitDate && (
                                <p className="text-[8px] sm:text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                  <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  Due: {formatDate(subtask.submitDate)}
                                </p>
                              )}
                            </div>
                            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
                              subtask.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                              subtask.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {subtask.status || 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                        <FiBarChart2 className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Progress: {updateData.progress}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={updateData.progress}
                        onChange={(e) => setUpdateData({...updateData, progress: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                      <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Remark
                    </label>
                    <textarea
                      value={updateData.remark}
                      onChange={(e) => setUpdateData({...updateData, remark: e.target.value})}
                      placeholder="Add any additional remarks..."
                      rows="2"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                      <FiPaperclip className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Attachments
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl text-xs font-medium hover:bg-white/60 transition-all flex items-center gap-2"
                      >
                        <FiImage className="w-4 h-4" />
                        Gallery
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl text-xs font-medium hover:bg-white/60 transition-all flex items-center gap-2"
                      >
                        <FiCamera className="w-4 h-4" />
                        Camera
                      </button>
                      <input
                        type="file"
                        ref={galleryInputRef}
                        onChange={handleGalleryUpload}
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                      <input
                        type="file"
                        ref={cameraInputRef}
                        onChange={handleCameraUpload}
                        multiple
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                      />
                    </div>
                    {attachmentPreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {attachmentPreviews.map((preview, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={preview.url}
                              alt={preview.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-white/30"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4" />
                        Expenses
                      </label>
                      <button
                        type="button"
                        onClick={() => setExpensesExpanded(!expensesExpanded)}
                        className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {expensesExpanded ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {expensesExpanded && (
                      <div className="space-y-3 bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                        <div id="expense-form-section" className="space-y-3 border-b border-gray-200/50 pb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Amount (₹)</label>
                              <input
                                type="number"
                                value={newExpense.expenseAmount}
                                onChange={(e) => setNewExpense({...newExpense, expenseAmount: e.target.value})}
                                placeholder="0.00"
                                className="w-full px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Distance (km)</label>
                              <input
                                type="number"
                                value={newExpense.distance}
                                onChange={(e) => setNewExpense({...newExpense, distance: e.target.value})}
                                placeholder="0"
                                className="w-full px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Location Address</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newExpense.location.address}
                                onChange={(e) => setNewExpense({...newExpense, location: {...newExpense.location, address: e.target.value}})}
                                placeholder="Enter address..."
                                className="flex-1 px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                              <button
                                type="button"
                                onClick={() => getLocationFromAddress(newExpense.location.address)}
                                disabled={fetchingLocation}
                                className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {fetchingLocation ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiMapPin className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Description</label>
                            <input
                              type="text"
                              value={newExpense.description}
                              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                              placeholder="Expense description..."
                              className="w-full px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                          {expenseError && (
                            <p className={`text-xs ${expenseError.includes('✅') ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {expenseError}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={editingExistingExpense ? handleSaveExistingExpenseEdit : handleAddExpense}
                            disabled={expenseActionLoading}
                            className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {expenseActionLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : editingExistingExpense ? (
                              <><FiCheck className="w-4 h-4" /> Update Expense</>
                            ) : (
                              <><FiPlus className="w-4 h-4" /> Add Expense</>
                            )}
                          </button>
                        </div>

                        {existingExpenses.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-gray-600">Previous Expenses</p>
                            {existingExpenses.map((expense, idx) => (
                              <div key={expense._id} className="flex items-center justify-between p-2 bg-white/40 rounded-lg border border-white/30">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-800">₹{expense.expenseAmount} - {expense.description}</p>
                                  <p className="text-[10px] text-gray-500">{expense.location?.address || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditExistingExpense(expense)}
                                    className="p-1 hover:bg-amber-50 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <FiEdit2 className="w-3.5 h-3.5 text-amber-600" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteExistingExpense(expense)}
                                    className="p-1 hover:bg-rose-50 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <FiTrash className="w-3.5 h-3.5 text-rose-600" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {updateData.expenses.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-gray-600">New Expenses (This Session)</p>
                            {updateData.expenses.map((expense, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-lg border border-indigo-200/50">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-800">₹{expense.expenseAmount} - {expense.description}</p>
                                  <p className="text-[10px] text-gray-500">{expense.location?.address || 'N/A'}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExpense(idx)}
                                  className="p-1 hover:bg-rose-50 rounded transition-colors"
                                  title="Remove"
                                >
                                  <FiX className="w-3.5 h-3.5 text-rose-600" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200/50">
                    <button
                      type="button"
                      onClick={() => setShowUpdateModal(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {updateLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><FiCheck className="w-4 h-4" /> Update Task</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── VIEW MODAL ─── */}
        {showViewModal && viewTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
              <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center z-10">
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                  <FiEye className="w-4 h-4 sm:w-6 sm:h-6" />
                  Task Details
                </h2>
                <button
                  onClick={() => { setShowViewModal(false); setViewTask(null); }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>

              <div className="px-4 sm:px-8 py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-4 sm:mb-6">
                  <div className="w-full sm:w-auto">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800">{viewTask.taskName || viewTask.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{viewTask.title || viewTask.taskName}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${getPriorityStyles(viewTask.priority)}`}>
                      {getPriorityIcon(viewTask.priority)}
                      {viewTask.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusStyles(viewTask.status)}`}>
                      {getStatusIcon(viewTask.status)}
                      {viewTask.status}
                    </span>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <FiMessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Description
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                    {viewTask.description || 'No description provided'}
                  </p>
                </div>

                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">Progress</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">{viewTask.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-gray-200/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${viewTask.progress}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                    <FiCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Submit Date & Time
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">
                    {formatDateTime(viewTask.submitDate)}
                  </p>
                </div>

                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                    <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Assigned To
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    {Array.isArray(viewTask.assignedTo) && viewTask.assignedTo.length > 0 ? (
                      viewTask.assignedTo.map((emp, idx) => (
                        <div key={idx} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white/30 rounded-lg">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-sm flex-shrink-0">
                            {getInitials(emp.name || emp.fullName || emp.email || 'U')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{emp.name || emp.fullName || 'Unknown'}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{emp.email || 'N/A'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500">No employees assigned</p>
                    )}
                  </div>
                </div>

                {viewTask.subtasks && viewTask.subtasks.length > 0 && (
                  <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <FaList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                      Subtasks ({viewTask.subtasks.length})
                      <span className="text-[10px] sm:text-xs text-gray-500 font-normal ml-2">
                        {viewTask.subtasks.filter(s => s.status === 'Completed').length} completed
                      </span>
                    </h4>
                    <div className="space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                      {viewTask.subtasks.map((subtask, idx) => (
                        <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
                          <div className="flex-shrink-0">
                            {subtask.status === 'Completed' ? <FiCheckCircle className="w-3 h-3 text-emerald-500" /> :
                             subtask.status === 'In Progress' ? <FiRefreshCw className="w-3 h-3 text-blue-500" /> :
                             <FiClock className="w-3 h-3 text-amber-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">{subtask.name}</span>
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
                                subtask.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                subtask.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {subtask.status || 'Pending'}
                              </span>
                            </div>
                            {subtask.description && (
                              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{subtask.description}</p>
                            )}
                            {subtask.submitDate && (
                              <p className="text-[8px] sm:text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                Due: {formatDateTime(subtask.submitDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewTask.employeeUpdates && viewTask.employeeUpdates.length > 0 && (
                  <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Employee Updates ({viewTask.employeeUpdates.length})
                    </h4>
                    <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                      {viewTask.employeeUpdates.map((update, idx) => (
                        <div key={idx} className="p-2 sm:p-3 bg-white/30 rounded-lg border border-white/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs sm:text-sm font-medium text-gray-800">
                              {update.employeeId?.name || update.employeeId?.fullName || 'Unknown'}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500">{formatDateTime(update.updatedAt)}</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-600 mb-1">{update.updateText || 'No update text'}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] sm:text-xs font-semibold text-indigo-600">{update.progress}%</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${update.progress}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── ISSUES LIST MODAL ─── */}
        {showIssuesListModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
              <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center z-10">
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                  <FiAlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
                  Task Issues
                </h2>
                <button
                  onClick={() => { setShowIssuesListModal(false); setSelectedTaskForIssues(null); }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>
              <div className="px-4 sm:px-8 py-4 sm:py-6">
                {issuesLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-3 text-xs sm:text-sm text-gray-500">Loading issues...</p>
                  </div>
                ) : taskIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <FiInfo className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-xs sm:text-sm text-gray-500">No issues reported for this task</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {taskIssues.map((issue, idx) => {
                      const st = issueStatusMeta[issue.status] || issueStatusMeta['Open'];
                      const pr = priorityMeta[issue.priority] || priorityMeta['Medium'];
                      return (
                        <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-sm sm:text-base font-semibold text-gray-800">{issue.issueTitle}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">{issue.issueDescription}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                              issue.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                              issue.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {issue.priority}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
                            <span>Reported by: {issue.reportedBy?.name || 'Unknown'}</span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              issue.status === 'Open' ? 'bg-indigo-100 text-indigo-700' :
                              issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {issue.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── REPORT ISSUE MODAL ─── */}
        {showReportModal && selectedTaskForReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
              <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center z-10">
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                  <FiAlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
                  Report Issue
                </h2>
                <button
                  onClick={() => { setShowReportModal(false); setSelectedTaskForReport(null); }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleReportSubmit} className="px-4 sm:px-8 py-4 sm:py-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Issue Title *</label>
                    <input
                      type="text"
                      required
                      value={reportData.issueTitle}
                      onChange={(e) => setReportData({...reportData, issueTitle: e.target.value})}
                      placeholder="Brief description of the issue..."
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Issue Description *</label>
                    <textarea
                      required
                      value={reportData.issueDescription}
                      onChange={(e) => setReportData({...reportData, issueDescription: e.target.value})}
                      placeholder="Detailed description of the issue..."
                      rows="4"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                    <select
                      value={reportData.priority}
                      onChange={(e) => setReportData({...reportData, priority: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200/50">
                    <button
                      type="button"
                      onClick={() => { setShowReportModal(false); setSelectedTaskForReport(null); }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reportLoading}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {reportLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><FiAlertTriangle className="w-4 h-4" /> Report Issue</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── CUTE POPUP ─── */}
        {showCutePopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30 animate-pop-bounce max-w-md text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg animate-float">
                {cutePopupType === 'success' ? (
                  <FiCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                ) : (
                  <FiAlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{cutePopupMessage}</h3>
              <p className="text-sm text-gray-600">{cutePopupSubMessage}</p>
            </div>
          </div>
        )}

        {/* ─── TOAST ─── */}
        {showToast && (
          <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-[200] animate-slideUp">
            <div className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-xl shadow-2xl border border-white/30 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm ${
              toastType === 'success' ? 'bg-emerald-50/90 text-emerald-800' : 'bg-rose-50/90 text-rose-800'
            }`}>
              {toastType === 'success' ? <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes popBounce {
          0% { opacity: 0; transform: scale(0.2) translateY(-30px) rotate(-5deg); }
          40% { opacity: 1; transform: scale(1.1) translateY(0) rotate(2deg); }
          60% { transform: scale(0.95) translateY(-5px) rotate(-1deg); }
          80% { transform: scale(1.02) translateY(2px) rotate(0.5deg); }
          100% { transform: scale(1) translateY(0) rotate(0deg); }
        }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(8deg); } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; } }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-pop-bounce { animation: popBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
        .animate-float { animation: float 2s ease-in-out infinite; }

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

export default MyTasks;