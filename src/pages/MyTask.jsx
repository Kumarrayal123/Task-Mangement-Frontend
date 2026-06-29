import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FiRepeat
} from 'react-icons/fi';
import { FaTasks, FaRocket, FaList } from 'react-icons/fa';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { 
  updateTaskByEmployee, 
  reportTaskIssue,
  getTaskIssues,
  deleteTask
} from '../services/taskService';
import './MyTask.css';

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
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function StatCard({ label, value, icon, gradient }) {
  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className={`w-6 h-6 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-lg ${gradient}`}>
          <span className="text-white text-xs sm:text-base lg:text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-[6px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Countdown Timer ───
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
      <FiClock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-500" />
      <div className="flex items-center gap-0.5 sm:gap-1">
        <span className="text-[8px] sm:text-[10px] font-bold text-indigo-600">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[6px] sm:text-[8px] text-gray-500">d</span>
        <span className="text-[8px] sm:text-[10px] font-bold text-indigo-600">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[6px] sm:text-[8px] text-gray-500">h</span>
        <span className="text-[8px] sm:text-[10px] font-bold text-indigo-600">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[6px] sm:text-[8px] text-gray-500">m</span>
        <span className="text-[8px] sm:text-[10px] font-bold text-indigo-600">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[6px] sm:text-[8px] text-gray-500">s</span>
      </div>
      {isExpired && (
        <span className="text-[6px] sm:text-[8px] text-rose-500 font-semibold ml-0.5">⏰ Expired!</span>
      )}
    </div>
  );
};

function MyTasks() {
  const navigate = useNavigate();
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId] = useState('');
  
  // ─── Tasks State ───
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ─── Filters ───
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDue, setFilterDue] = useState('ALL');
  const [search, setSearch] = useState('');
  
  // ─── Upcoming Tasks Popup ───
  const [showUpcomingPopup, setShowUpcomingPopup] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [popupShown, setPopupShown] = useState(false);
  const [voiceAlertShown, setVoiceAlertShown] = useState(false);
  
  // ─── Modals State ───
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateData, setUpdateData] = useState({
    updateText: '',
    progress: 0,
    remark: '',
    expenses: []
  });
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  // ─── Handle sidebar collapse ───
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // ─── Toast Message ───
  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
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
        const submitDate = new Date(task.submitDate);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate >= today && submitDate <= sevenDaysFromNow;
      });
      
      const todayTasks = tasksData.filter(task => {
        if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
        const submitDate = new Date(task.submitDate);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate.getTime() === today.getTime();
      });
      
      const overdueTasks = tasksData.filter(task => {
        if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
        const submitDate = new Date(task.submitDate);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate < today;
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

  const handleUpdateClick = (task) => {
    setSelectedTask(task);
    
    let progress = task.progress || 0;
    if (task.subtasks && task.subtasks.length > 0) {
      const completed = task.subtasks.filter(s => s.status === 'Completed').length;
      progress = Math.round((completed / task.subtasks.length) * 100);
    }
    
    setUpdateData({
      updateText: '',
      progress: progress,
      remark: '',
      expenses: task.expenses || []
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
    setExpensesExpanded(false);
    setShowUpdateModal(true);
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
      location: {
        address: newExpense.location.address || 'N/A',
        latitude: parseFloat(newExpense.location.latitude) || 0,
        longitude: parseFloat(newExpense.location.longitude) || 0
      },
      distance: parseFloat(newExpense.distance) || 0,
      expenseAmount: parseFloat(newExpense.expenseAmount) || 0,
      description: newExpense.description,
      addedBy: employeeId,
      addedAt: new Date().toISOString()
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

  // ─── Remove Expense ───
  const handleRemoveExpense = (index) => {
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
    
    const completed = updatedSubtasks.filter(s => s.status === 'Completed').length;
    const progress = updatedSubtasks.length > 0 ? Math.round((completed / updatedSubtasks.length) * 100) : 0;
    
    setSelectedTask({
      ...selectedTask,
      subtasks: updatedSubtasks
    });
    
    setUpdateData(prev => ({
      ...prev,
      progress: progress
    }));
  };

  // ─── Check if subtask can be completed ───
  const canCompleteSubtask = (subtask) => {
    if (!subtask.submitDate) return true;
    if (subtask.status === 'Completed') return true;
    const now = new Date();
    const submitDate = new Date(subtask.submitDate);
    return now >= submitDate;
  };

  // ─── Handle Subtask Checkbox Click ───
  const handleSubtaskCheckboxChange = (subtask, isCompleted) => {
    if (isCompleted) {
      if (!canCompleteSubtask(subtask)) {
        const formattedDate = new Date(subtask.submitDate).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
        
        showCutePopupWithVoice(
          '⏰ Wait! Not yet!',
          'error',
          `Sorry! You cannot complete "${subtask.name}" before ${formattedDate}. Please wait until the scheduled time.`
        );
        
        showToastMessage(`⚠️ Cannot complete "${subtask.name}" before ${formattedDate}`, 'error');
        return;
      }
    }
    
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

  // ─── UPDATE SUBMIT ───
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const updatePayload = {
        updateText: updateData.updateText,
        progress: updateData.progress,
        remark: updateData.remark,
        expenses: updateData.expenses,
        subtasks: selectedTask.subtasks
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

  // ─── Filter Tasks ───
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    if (filterType === 'ASSIGNED') {
      filtered = filtered.filter(t => t.assignType !== 'SELF');
    } else if (filterType === 'CREATED') {
      filtered = filtered.filter(t => t.assignType === 'SELF');
    }
    
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((t) => t.status === filterStatus);
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
        if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
        const submitDate = new Date(task.submitDate);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate.getTime() === today.getTime();
      });
    } else if (filterDue === 'UPCOMING') {
      filtered = filtered.filter(task => {
        if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
        const submitDate = new Date(task.submitDate);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate >= today && submitDate <= sevenDaysFromNow && submitDate.getTime() !== today.getTime();
      });
    } else if (filterDue === 'OVERDUE') {
      filtered = filtered.filter(task => {
        if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
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

  const totalTasks = tasks.length;
  
  const counts = {
    ALL: tasks.length,
    Pending: tasks.filter((t) => t.status === 'Pending').length,
    'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
    Completed: tasks.filter((t) => t.status === 'Completed').length,
    Overdue: tasks.filter((t) => t.status === 'Overdue').length,
    Rejected: tasks.filter((t) => t.status === 'Rejected').length,
  };

  const typeCounts = {
    ALL: tasks.length,
    ASSIGNED: tasks.filter(t => t.assignType !== 'SELF').length,
    CREATED: tasks.filter(t => t.assignType === 'SELF').length,
  };

  const priorityCounts = {
    ALL: tasks.length,
    Low: tasks.filter(t => t.priority === 'Low').length,
    Medium: tasks.filter(t => t.priority === 'Medium').length,
    High: tasks.filter(t => t.priority === 'High').length,
    Critical: tasks.filter(t => t.priority === 'Critical').length,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const dueCounts = {
    ALL: tasks.length,
    TODAY: tasks.filter(task => {
      if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
      const submitDate = new Date(task.submitDate);
      submitDate.setHours(0, 0, 0, 0);
      return submitDate.getTime() === today.getTime();
    }).length,
    UPCOMING: tasks.filter(task => {
      if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
      const submitDate = new Date(task.submitDate);
      submitDate.setHours(0, 0, 0, 0);
      return submitDate >= today && submitDate <= sevenDaysFromNow && submitDate.getTime() !== today.getTime();
    }).length,
    OVERDUE: tasks.filter(task => {
      if (!task.submitDate || task.status === 'Completed' || task.status === 'Rejected') return false;
      const submitDate = new Date(task.submitDate);
      submitDate.setHours(0, 0, 0, 0);
      return submitDate < today;
    }).length,
  };

  const mainContentPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]';

  const closeUpcomingPopup = () => {
    setShowUpcomingPopup(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex">
      <EmployeeSidebar 
        employeeName={employeeName} 
        onLogout={handleLogout}
        onCollapseChange={handleSidebarToggle}
      />

      <div className={`flex-1 min-h-screen w-full ${mainContentPadding} flex flex-col transition-all duration-300 ease-in-out`}>
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <FaTasks className="text-white w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block truncate">
                  My Tasks
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  My Tasks
                </h2>
                <p className="text-[6px] sm:text-[10px] text-gray-500 hidden xs:block truncate max-w-[100px] sm:max-w-[200px]">
                  {tasks.length} tasks assigned
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-wrap">
              <button onClick={() => navigate('/create-task')} className="px-1.5 sm:px-3 lg:px-4 py-0.5 sm:py-1.5 lg:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-[8px] sm:text-xs lg:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2">
                <FiPlus className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xs:inline">Create</span>
              </button>
              <button onClick={fetchTasks} className="p-1 sm:p-2 lg:p-2.5 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 transition-all hover:scale-105">
                <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <button onClick={handleLogout} className="px-1.5 sm:px-3 lg:px-4 py-0.5 sm:py-1.5 lg:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[8px] sm:text-xs lg:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2">
                <FiLogOut className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xs:inline">Logout</span>
              </button>
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[8px] sm:text-xs lg:text-sm shadow-lg shadow-indigo-500/30 flex-shrink-0">
                {getInitials(employeeName)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="space-y-3 sm:space-y-6">
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

            {/* ─── Stats ─── */}
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-3 md:gap-4">
              <StatCard label="Total" value={totalTasks} icon={<FiBarChart2 className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-indigo-500/30" />
              <StatCard label="In Progress" value={counts['In Progress']} icon={<FiRefreshCw className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-500/30" />
              <StatCard label="Completed" value={counts.Completed} icon={<FiCheckCircle className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/30" />
              <StatCard label="Pending" value={counts.Pending} icon={<FiClock className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-500/30" />
              <StatCard label="Today Due" value={dueCounts.TODAY} icon={<FiCalendar className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-purple-400 to-purple-500 shadow-purple-500/30" />
              <StatCard label="Overdue" value={dueCounts.OVERDUE} icon={<FiAlertCircle className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-rose-400 to-rose-500 shadow-rose-500/30" />
            </div>

            {/* ─── Dropdown Filters ─── */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2 sm:px-4 py-1 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[8px] sm:text-sm appearance-none pr-6 sm:pr-8 min-w-[100px] sm:min-w-[130px]"
                >
                  <option value="ALL">All ({typeCounts.ALL})</option>
                  <option value="ASSIGNED">Assigned ({typeCounts.ASSIGNED})</option>
                  <option value="CREATED">Created ({typeCounts.CREATED})</option>
                </select>
                <FiChevronDown className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2 sm:px-4 py-1 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[8px] sm:text-sm appearance-none pr-6 sm:pr-8 min-w-[100px] sm:min-w-[130px]"
                >
                  <option value="ALL">All Status</option>
                  <option value="Pending">Pending ({counts.Pending})</option>
                  <option value="In Progress">In Progress ({counts['In Progress']})</option>
                  <option value="Completed">Completed ({counts.Completed})</option>
                  <option value="Overdue">Overdue ({counts.Overdue})</option>
                  <option value="Rejected">Rejected ({counts.Rejected})</option>
                </select>
                <FiChevronDown className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-2 sm:px-4 py-1 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[8px] sm:text-sm appearance-none pr-6 sm:pr-8 min-w-[100px] sm:min-w-[130px]"
                >
                  <option value="ALL">All Priority</option>
                  <option value="Low">Low ({priorityCounts.Low})</option>
                  <option value="Medium">Medium ({priorityCounts.Medium})</option>
                  <option value="High">High ({priorityCounts.High})</option>
                  <option value="Critical">Critical ({priorityCounts.Critical})</option>
                </select>
                <FiChevronDown className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filterDue}
                  onChange={(e) => setFilterDue(e.target.value)}
                  className={`px-2 sm:px-4 py-1 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[8px] sm:text-sm appearance-none pr-6 sm:pr-8 min-w-[100px] sm:min-w-[130px] ${
                    filterDue !== 'ALL' ? 'border-indigo-500/50 bg-indigo-50/30' : ''
                  }`}
                >
                  <option value="ALL">All Due</option>
                  <option value="TODAY">Today ({dueCounts.TODAY})</option>
                  <option value="UPCOMING">Upcoming ({dueCounts.UPCOMING})</option>
                  <option value="OVERDUE">Overdue ({dueCounts.OVERDUE})</option>
                </select>
                <FiChevronDown className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" />
              </div>

              {(filterType !== 'ALL' || filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterDue !== 'ALL' || search) && (
                <button
                  onClick={() => {
                    setFilterType('ALL');
                    setFilterStatus('ALL');
                    setFilterPriority('ALL');
                    setFilterDue('ALL');
                    setSearch('');
                  }}
                  className="px-2 sm:px-4 py-1 sm:py-2 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-full text-[8px] sm:text-sm font-medium text-rose-600 hover:bg-rose-100 transition-all flex items-center gap-0.5 sm:gap-1.5"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  Reset
                </button>
              )}
            </div>

            {/* ─── Search ─── */}
            <div className="flex flex-wrap gap-1.5 sm:gap-4">
              <div className="flex-1 min-w-[80px] sm:min-w-[200px] relative">
                <input
                  className="w-full px-2 sm:px-4 py-1 sm:py-2.5 pl-6 sm:pl-10 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[8px] sm:text-sm"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FiSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>

            {error && (
              <div className="p-2 sm:p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-xl flex items-center gap-1.5 sm:gap-3 text-rose-700 text-[10px] sm:text-sm">
                <FiAlertCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="mt-1.5 sm:mt-3 lg:mt-4 text-[10px] sm:text-sm text-gray-500">Loading...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                  <FiList className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-400" />
                </div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-700">No tasks found</h3>
                <p className="text-[10px] sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                  {filterType === 'ASSIGNED' ? 'No tasks assigned to you' : 
                   filterType === 'CREATED' ? 'You haven\'t created any tasks' : 
                   filterDue === 'TODAY' ? 'No tasks due today 🎉' :
                   filterDue === 'UPCOMING' ? 'No upcoming tasks in next 7 days 🎉' :
                   filterDue === 'OVERDUE' ? 'No overdue tasks! Great job! 🎉' :
                   'No tasks found'}
                </p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                {/* ─── TABLE WITH VERTICAL SCROLL ON MOBILE ─── */}
                <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-none">
                  <table className="w-full min-w-[700px] sm:min-w-full">
                    <thead className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm sticky top-0 z-10">
                      <tr>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Issues</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Submit Date</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {filteredTasks.map((t, index) => {
                        const st = statusMeta[t.status] || statusMeta['Pending'];
                        const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
                        const issueCount = t.reportedIssues?.length || 0;
                        
                        const isOverdue = t.submitDate && new Date(t.submitDate) < new Date() && t.status !== 'Completed' && t.status !== 'Rejected';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isToday = t.submitDate && new Date(t.submitDate).setHours(0,0,0,0) === today.getTime();
                        
                        return (
                          <tr key={t._id} className={`hover:bg-white/30 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'} ${isOverdue ? 'border-l-4 border-l-rose-500' : ''} ${isToday && !isOverdue ? 'border-l-4 border-l-purple-500' : ''}`}>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <div className="text-[8px] sm:text-sm font-semibold text-gray-800 truncate max-w-[60px] sm:max-w-[150px]">{t.taskName}</div>
                              {isOverdue && (
                                <span className="inline-flex items-center gap-0.5 text-[6px] sm:text-[10px] text-rose-600 font-medium">
                                  <FiAlertCircle className="w-2 h-2 sm:w-3 sm:h-3" />
                                  Overdue!
                                </span>
                              )}
                              {isToday && !isOverdue && (
                                <span className="inline-flex items-center gap-0.5 text-[6px] sm:text-[10px] text-purple-600 font-medium">
                                  <FiCalendar className="w-2 h-2 sm:w-3 sm:h-3" />
                                  Due Today!
                                </span>
                              )}
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <div className="text-[8px] sm:text-sm text-gray-600 truncate max-w-[50px] sm:max-w-[150px]">{t.title}</div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[6px] sm:text-xs font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
                                {pr.icon}
                                <span className="hidden xs:inline">{t.priority}</span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[6px] sm:text-xs font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                                {st.icon}
                                <span className="hidden xs:inline">{t.status}</span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4 text-center">
                              <button
                                onClick={() => handleViewTaskIssues(t)}
                                className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold transition-all ${
                                  issueCount > 0 
                                    ? 'bg-rose-50/80 text-rose-600 border border-rose-200/50 hover:bg-rose-100' 
                                    : 'bg-gray-50/80 text-gray-400 border border-gray-200/50'
                                }`}
                              >
                                <FiAlertTriangle className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${issueCount > 0 ? 'text-rose-500' : 'text-gray-400'}`} />
                                {issueCount}
                              </button>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <div className="flex items-center gap-0.5 sm:gap-2">
                                <div className="flex-1 min-w-[20px] sm:min-w-[60px]">
                                  <div className="w-full h-1 sm:h-2 bg-gray-200/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${t.progress || 0}%` }} />
                                  </div>
                                </div>
                                <span className="text-[6px] sm:text-xs font-medium text-gray-600">{t.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <div className="text-[8px] sm:text-sm text-gray-600">
                                {t.submitDate ? new Date(t.submitDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4 text-right">
                              <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
                                <button onClick={() => handleViewTask(t)} className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-indigo-50 transition-all group" title="View Task">
                                  <FiEye className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={() => handleUpdateClick(t)} className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-amber-50 transition-all group" title="Update Task">
                                  <FiEdit2 className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                                </button>
                                {t.assignType === 'SELF' && (
                                  <button onClick={() => handleDeleteTask(t._id)} className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-all group" title="Delete Task">
                                    <FiTrash2 className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                                  </button>
                                )}
                                {t.assignType !== 'SELF' && (
                                  <button onClick={() => handleReportIssueClick(t)} className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-all group" title="Report Issue">
                                    <FiAlertTriangle className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
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
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── UPDATE MODAL ─── */}
      {showUpdateModal && selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-100/50 flex justify-between items-center z-10">
              <h3 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1 sm:gap-2">
                <FiEdit2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                Update Task Progress
              </h3>
              <button className="p-0.5 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setShowUpdateModal(false)}>
                <FiX className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="px-3 sm:px-6 py-3 sm:py-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5">Task</label>
                  <input type="text" value={selectedTask.title || selectedTask.taskName} disabled className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none text-[10px] sm:text-sm text-gray-500 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5">
                    <FiMessageSquare className="inline mr-0.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    Update Text *
                  </label>
                  <textarea
                    required
                    value={updateData.updateText}
                    onChange={(e) => setUpdateData({...updateData, updateText: e.target.value})}
                    placeholder="Describe your progress..."
                    rows="3"
                    className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm resize-none"
                  />
                </div>

                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div>
                    <label className="block text-[10px] sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FiList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                      Subtasks ({selectedTask.subtasks.length})
                      <span className="text-[8px] sm:text-[10px] text-gray-500 font-normal">
                        {selectedTask.subtasks.filter(s => s.status === 'Completed').length} completed
                      </span>
                      <span className="text-[8px] sm:text-[10px] text-emerald-600 font-medium ml-1">
                        • Progress: {updateData.progress}%
                      </span>
                    </label>
                    <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-56 overflow-y-auto pr-1">
                      {selectedTask.subtasks.map((subtask, idx) => {
                        const isCompleted = subtask.status === 'Completed';
                        const isInProgress = subtask.status === 'In Progress';
                        
                        return (
                          <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-white/30 hover:shadow-md transition-all">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-1 h-10 sm:h-12 rounded-full" style={{ 
                                background: isCompleted ? '#10b981' : 
                                            isInProgress ? '#3b82f6' : '#f59e0b'
                              }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] sm:text-sm font-medium text-gray-800 truncate">{subtask.name}</p>
                                {subtask.description && (
                                  <p className="text-[8px] sm:text-xs text-gray-500 truncate">{subtask.description}</p>
                                )}
                                {subtask.submitDate && (
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                    <p className="text-[6px] sm:text-[10px] text-gray-400">
                                      <FiCalendar className="inline mr-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      Submit by: {formatDate(subtask.submitDate)}
                                    </p>
                                    <CountdownTimer targetDate={subtask.submitDate} />
                                  </div>
                                )}
                                {isCompleted && subtask.submittedDate && (
                                  <p className="text-[6px] sm:text-[10px] text-emerald-600">
                                    ✅ Completed: {formatDateTime(subtask.submittedDate)}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 sm:gap-1.5 flex-shrink-0">
                                <label className="flex items-center gap-1 sm:gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={() => handleSubtaskCheckboxChange(subtask, !isCompleted)}
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <span className={`text-[8px] sm:text-[10px] font-medium ${isCompleted ? 'text-emerald-600' : 'text-gray-500'}`}>
                                    Done
                                  </span>
                                </label>
                                
                                <label className="flex items-center gap-1 sm:gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isInProgress}
                                    onChange={() => updateSubtaskStatus(subtask._id, isInProgress ? 'Pending' : 'In Progress')}
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span className={`text-[8px] sm:text-[10px] font-medium ${isInProgress ? 'text-blue-600' : 'text-gray-500'}`}>
                                    Progress
                                  </span>
                                </label>
                                
                                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[6px] sm:text-[10px] font-medium text-center ${
                                  isCompleted ? 'bg-emerald-100 text-emerald-700' :
                                  isInProgress ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {subtask.status || 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] sm:text-sm font-semibold text-gray-700">Progress</span>
                      <span className="text-[10px] sm:text-sm font-bold text-gray-800">{updateData.progress}%</span>
                    </div>
                    <div className="w-full h-2 sm:h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${updateData.progress}%` }}
                      />
                    </div>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5">
                      {selectedTask.subtasks.filter(s => s.status === 'Completed').length} of {selectedTask.subtasks.length} subtasks completed
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5">Remark</label>
                  <textarea
                    value={updateData.remark}
                    onChange={(e) => setUpdateData({...updateData, remark: e.target.value})}
                    placeholder="Any additional remarks..."
                    rows="2"
                    className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm resize-none"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setExpensesExpanded(!expensesExpanded)}
                    className="w-full flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl border border-indigo-200/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FiDollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-indigo-600" />
                      <span className="text-[10px] sm:text-sm font-semibold text-gray-700">Expenses</span>
                      {updateData.expenses.length > 0 && (
                        <span className="ml-0.5 sm:ml-1 px-1 sm:px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[6px] sm:text-xs font-medium">
                          {updateData.expenses.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-2">
                      <FiPlusIcon className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                      <span className="text-[8px] sm:text-xs text-indigo-600 font-medium hidden xs:inline">
                        {expensesExpanded ? 'Collapse' : 'Add Expenses'}
                      </span>
                      {expensesExpanded ? (
                        <FiChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      ) : (
                        <FiChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {expensesExpanded && (
                    <div className="mt-1.5 sm:mt-3 space-y-1.5 sm:space-y-3">
                      {updateData.expenses.length > 0 && (
                        <div className="space-y-1 sm:space-y-2 max-h-24 sm:max-h-40 overflow-y-auto">
                          {updateData.expenses.map((exp, idx) => (
                            <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-xl p-1.5 sm:p-3 border border-white/30 flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] sm:text-sm font-medium text-gray-800">₹{exp.expenseAmount} - {exp.description}</p>
                                {exp.location?.address && (
                                  <p className="text-[6px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1 truncate">
                                    <FiMapPin className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                                    {exp.location.address}
                                  </p>
                                )}
                                {exp.location?.latitude && exp.location?.longitude && (
                                  <p className="text-[6px] sm:text-[10px] text-gray-400 truncate">
                                    📍 {exp.location.latitude}, {exp.location.longitude}
                                  </p>
                                )}
                                {exp.distance > 0 && (
                                  <p className="text-[6px] sm:text-xs text-gray-500">{exp.distance} km</p>
                                )}
                                <p className="text-[6px] sm:text-[10px] text-gray-400">{formatDate(exp.addedAt)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveExpense(idx)}
                                className="p-0.5 sm:p-1 hover:bg-rose-50 rounded-full transition-colors flex-shrink-0"
                                title="Remove Expense"
                              >
                                <FiTrash className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-white/30 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-white/30 space-y-1.5 sm:space-y-3">
                        <p className="text-[8px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Add New Expense</p>
                        
                        {expenseError && (
                          <p className={`text-[8px] sm:text-xs ${expenseError.includes('✅') ? 'text-emerald-600' : expenseError.includes('❌') ? 'text-rose-600' : 'text-rose-600'}`}>
                            {expenseError}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
                          <div>
                            <label className="block text-[6px] sm:text-[10px] font-semibold text-gray-600">Amount *</label>
                            <input
                              type="number"
                              value={newExpense.expenseAmount}
                              onChange={(e) => setNewExpense({...newExpense, expenseAmount: e.target.value})}
                              placeholder="₹ 0"
                              className="w-full px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[6px] sm:text-[10px] font-semibold text-gray-600">Distance (km)</label>
                            <input
                              type="number"
                              value={newExpense.distance}
                              onChange={(e) => setNewExpense({...newExpense, distance: e.target.value})}
                              placeholder="0"
                              className="w-full px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[6px] sm:text-[10px] font-semibold text-gray-600">Description *</label>
                          <input
                            type="text"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                            placeholder="Expense description..."
                            className="w-full px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[6px] sm:text-[10px] font-semibold text-gray-600">Location Address</label>
                          <div className="flex gap-0.5 sm:gap-2">
                            <input
                              type="text"
                              value={newExpense.location.address}
                              onChange={(e) => setNewExpense({
                                ...newExpense, 
                                location: {...newExpense.location, address: e.target.value}
                              })}
                              placeholder="Enter address..."
                              className="flex-1 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => getLocationFromAddress(newExpense.location.address)}
                              disabled={fetchingLocation}
                              className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-[7px] sm:text-xs font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-0.5 sm:gap-1"
                            >
                              {fetchingLocation ? (
                                <FiLoader className="w-2 h-2 sm:w-3 sm:h-3 animate-spin" />
                              ) : (
                                <FiMapPin className="w-2 h-2 sm:w-3 sm:h-3" />
                              )}
                              <span className="hidden xs:inline">Get Location</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
                          <div>
                            <label className="block text-[6px] sm:text-[10px] font-semibold text-gray-600">Latitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={newExpense.location.latitude}
                              onChange={(e) => setNewExpense({
                                ...newExpense,
                                location: {...newExpense.location, latitude: parseFloat(e.target.value) || 0}
                              })}
                              placeholder="0.000000"
                              className="w-full px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[6px] sm:text-[10px] font-semibold text-gray-600">Longitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={newExpense.location.longitude}
                              onChange={(e) => setNewExpense({
                                ...newExpense,
                                location: {...newExpense.location, longitude: parseFloat(e.target.value) || 0}
                              })}
                              placeholder="0.000000"
                              className="w-full px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                            />
                          </div>
                        </div>

                        {newExpense.location.latitude && newExpense.location.longitude && (
                          <p className="text-[6px] sm:text-[10px] text-emerald-600 text-center">
                            ✅ Coordinates ready: {newExpense.location.latitude}, {newExpense.location.longitude}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={handleAddExpense}
                          className="w-full px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-[8px] sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-0.5 sm:gap-2"
                        >
                          <FiPlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Expense
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiPaperclip className="inline mr-0.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Attachments (Optional)
                  </label>
                  
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-[8px] sm:text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
                    >
                      <FiFolder className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-[8px] sm:text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
                    >
                      <FiCamera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Camera
                    </button>
                    
                    <input
                      ref={galleryInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      capture="environment"
                      accept="image/*"
                      onChange={handleCameraUpload}
                      className="hidden"
                    />
                  </div>

                  {attachmentPreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                      {attachmentPreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          {preview.type?.startsWith('image/') ? (
                            <img 
                              src={preview.url} 
                              alt={preview.name}
                              className="w-full h-14 sm:h-20 object-cover rounded-lg border border-white/30"
                            />
                          ) : (
                            <div className="w-full h-14 sm:h-20 bg-gray-100/50 rounded-lg border border-white/30 flex items-center justify-center">
                              {getFileIcon(preview.name)}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="absolute -top-1 -right-1 p-0.5 sm:p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all hover:scale-110"
                          >
                            <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                          <p className="text-[6px] sm:text-[8px] text-gray-500 truncate text-center mt-0.5">{preview.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {attachments.length > 0 && (
                    <p className="mt-1 text-[8px] sm:text-xs text-emerald-600">
                      ✅ {attachments.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-1.5 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50">
                <button type="button" onClick={() => setShowUpdateModal(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-[10px] sm:text-sm">Cancel</button>
                <button type="submit" disabled={updateLoading} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm">
                  {updateLoading ? <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Updating...</> : <><FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Update Progress</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Report Issue Modal ─── */}
      {showReportModal && selectedTaskForReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-100/50 flex justify-between items-center">
              <h3 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent flex items-center gap-1 sm:gap-2">
                <FiAlertTriangle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-rose-500" />
                Report Issue
              </h3>
              <button className="p-0.5 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setShowReportModal(false)}>
                <FiX className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="px-3 sm:px-6 py-3 sm:py-6">
              <div className="space-y-2 sm:space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5">Task</label>
                  <input type="text" value={selectedTaskForReport.title || selectedTaskForReport.taskName} disabled className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none text-[10px] sm:text-sm text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5">Issue Title *</label>
                  <input type="text" required value={reportData.issueTitle} onChange={(e) => setReportData({...reportData, issueTitle: e.target.value})} placeholder="Brief title of the issue" className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5">Issue Description *</label>
                  <textarea required value={reportData.issueDescription} onChange={(e) => setReportData({...reportData, issueDescription: e.target.value})} placeholder="Describe the issue in detail..." rows="3" className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5">Priority</label>
                  <select value={reportData.priority} onChange={(e) => setReportData({...reportData, priority: e.target.value})} className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-1.5 sm:gap-3 mt-3 sm:mt-6 pt-2 sm:pt-4 border-t border-gray-100/50">
                <button type="button" onClick={() => setShowReportModal(false)} className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-[10px] sm:text-sm">Cancel</button>
                <button type="submit" disabled={reportLoading} className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm">
                  {reportLoading ? <><div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Submitting...</> : <><FiAlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />Report Issue</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── View Task Modal ─── */}
      {showViewModal && viewTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-100/50 flex justify-between items-center">
              <h3 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1 sm:gap-2">
                <FiEye className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                Task Details
              </h3>
              <button className="p-0.5 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => { setShowViewModal(false); setViewTask(null); }}>
                <FiX className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-3 sm:px-6 py-3 sm:py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-1.5 sm:gap-0 mb-2 sm:mb-4">
                <div className="w-full sm:w-auto">
                  <h2 className="text-sm sm:text-2xl font-bold text-gray-800">{viewTask.taskName}</h2>
                  <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{viewTask.title}</p>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[6px] sm:text-xs font-semibold ${priorityMeta[viewTask.priority]?.bg || 'bg-gray-100'} ${priorityMeta[viewTask.priority]?.text || 'text-gray-600'} border ${priorityMeta[viewTask.priority]?.border || 'border-gray-200'}`}>
                    {priorityMeta[viewTask.priority]?.icon}
                    <span className="hidden xs:inline">{viewTask.priority}</span>
                  </span>
                  <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[6px] sm:text-xs font-semibold ${statusMeta[viewTask.status]?.bg || 'bg-gray-100'} ${statusMeta[viewTask.status]?.text || 'text-gray-600'} border ${statusMeta[viewTask.status]?.border || 'border-gray-200'}`}>
                    {statusMeta[viewTask.status]?.icon}
                    <span className="hidden xs:inline">{viewTask.status}</span>
                  </span>
                </div>
              </div>

              <div className="mb-2 sm:mb-4">
                <h4 className="text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5 flex items-center gap-1 sm:gap-2">
                  <FiMessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  Description
                </h4>
                <p className="text-[10px] sm:text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-white/30">
                  {viewTask.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-4 mb-2 sm:mb-4">
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-1.5 sm:p-4 border border-white/30">
                  <p className="text-[6px] sm:text-xs text-gray-500">Submit Date</p>
                  <p className="text-[10px] sm:text-sm font-semibold text-gray-800">{formatDate(viewTask.submitDate)}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-1.5 sm:p-4 border border-white/30">
                  <p className="text-[6px] sm:text-xs text-gray-500">Priority</p>
                  <p className="text-[10px] sm:text-sm font-semibold text-gray-800">{viewTask.priority}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-1.5 sm:p-4 border border-white/30">
                  <p className="text-[6px] sm:text-xs text-gray-500">Status</p>
                  <p className="text-[10px] sm:text-sm font-semibold text-gray-800">{viewTask.status}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-1.5 sm:p-4 border border-white/30">
                  <p className="text-[6px] sm:text-xs text-gray-500">Progress</p>
                  <div className="flex items-center gap-0.5 sm:gap-2">
                    <div className="flex-1 h-1 sm:h-2 bg-gray-200/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${viewTask.progress || 0}%`, background: priorityMeta[viewTask.priority]?.color || '#6366f1' }} />
                    </div>
                    <span className="text-[8px] sm:text-sm font-bold text-gray-800">{viewTask.progress || 0}%</span>
                  </div>
                </div>
              </div>

              {viewTask.subtasks && viewTask.subtasks.length > 0 && (
                <div className="mb-2 sm:mb-4">
                  <h4 className="text-[10px] sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FiList className="w-3 h-3 sm:w-4 sm:h-4" />
                    Subtasks ({viewTask.subtasks.length})
                  </h4>
                  <div className="space-y-1 sm:space-y-2 max-h-24 sm:max-h-40 overflow-y-auto">
                    {viewTask.subtasks.map((subtask, idx) => (
                      <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-xl p-1.5 sm:p-3 border border-white/30">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`w-1.5 h-5 sm:h-6 rounded-full ${
                            subtask.status === 'Completed' ? 'bg-emerald-500' : 
                            subtask.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-[10px] sm:text-sm font-medium text-gray-800">{subtask.name}</p>
                            <p className="text-[8px] sm:text-xs text-gray-500">{subtask.description}</p>
                            {subtask.submitDate && (
                              <p className="text-[6px] sm:text-[10px] text-gray-400">Submit by: {formatDate(subtask.submitDate)}</p>
                            )}
                          </div>
                          <span className={`px-1 sm:px-2 py-0.5 rounded-full text-[6px] sm:text-[10px] font-medium ${
                            subtask.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            subtask.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {subtask.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewTask.employeeUpdates && viewTask.employeeUpdates.length > 0 && (
                <div className="mb-2 sm:mb-4">
                  <h4 className="text-[10px] sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    Employee Updates ({viewTask.employeeUpdates.length})
                  </h4>
                  <div className="space-y-1 sm:space-y-2 max-h-24 sm:max-h-40 overflow-y-auto">
                    {viewTask.employeeUpdates.map((update, idx) => (
                      <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-xl p-1.5 sm:p-3 border border-white/30">
                        <p className="text-[10px] sm:text-sm font-medium text-gray-800">{update.updateText}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-3 mt-0.5 sm:mt-1 text-[6px] sm:text-xs text-gray-500">
                          <span>Progress: {update.progress}%</span>
                          {update.remark && <span>Remark: {update.remark}</span>}
                          <span>{formatDateTime(update.updatedAt)}</span>
                        </div>
                        {update.attachments && update.attachments.length > 0 && (
                          <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
                            {update.attachments.map((att, attIdx) => (
                              <div key={attIdx} className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1.5 bg-white/30 rounded-lg border border-white/30 hover:bg-white/50 transition-all group">
                                {getFileIcon(att.fileName)}
                                <span className="text-[6px] sm:text-xs text-gray-700 truncate flex-1">{att.fileName}</span>
                                <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleViewAttachment(att.fileUrl, att.fileName)}
                                    className="p-0.5 sm:p-1 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="View"
                                  >
                                    <FiEye className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-indigo-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadAttachment(att.fileUrl, att.fileName)}
                                    className="p-0.5 sm:p-1 hover:bg-emerald-50 rounded-full transition-colors"
                                    title="Download"
                                  >
                                    <FiDownload className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewTask.expenses && viewTask.expenses.length > 0 && (
                <div className="mb-2 sm:mb-4">
                  <h4 className="text-[10px] sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                    Expenses ({viewTask.expenses.length})
                  </h4>
                  <div className="space-y-1.5 sm:space-y-3 max-h-36 sm:max-h-60 overflow-y-auto">
                    {viewTask.expenses.map((exp, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-white/40 to-indigo-50/40 backdrop-blur-sm rounded-xl p-1.5 sm:p-4 border border-white/30 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-0.5 sm:gap-2">
                              <span className="text-[10px] sm:text-sm font-bold text-gray-800">₹{exp.expenseAmount}</span>
                              <span className="text-[10px] sm:text-sm font-medium text-gray-600">- {exp.description}</span>
                            </div>
                            
                            {exp.location && (
                              <div className="mt-0.5 sm:mt-2 space-y-0.5">
                                {exp.location.address && (
                                  <p className="text-[6px] sm:text-xs text-gray-600 flex items-center gap-0.5 sm:gap-1 truncate">
                                    <FiMapPin className="w-2 h-2 sm:w-3 sm:h-3 text-indigo-500 flex-shrink-0" />
                                    {exp.location.address}
                                  </p>
                                )}
                                {(exp.location.latitude || exp.location.longitude) && (
                                  <p className="text-[6px] sm:text-[10px] text-gray-400 truncate">
                                    📍 Lat: {exp.location.latitude || 'N/A'}, Lng: {exp.location.longitude || 'N/A'}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {exp.distance > 0 && (
                              <p className="text-[6px] sm:text-xs text-gray-500 mt-0.5">📏 {exp.distance} km</p>
                            )}
                            
                            <div className="mt-0.5 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-3 text-[6px] sm:text-[10px] text-gray-400">
                              <span>Added: {formatDateTime(exp.addedAt || exp.expenseDate)}</span>
                              {exp.approvalStatus && (
                                <span className={`px-1 sm:px-2 py-0.5 rounded-full text-[6px] sm:text-[10px] font-medium ${
                                  exp.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                  exp.approvalStatus === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {exp.approvalStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-1.5 sm:mt-3 p-1.5 sm:p-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-200/50">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-sm font-semibold text-gray-700">Total Expenses</span>
                      <span className="text-sm sm:text-lg font-bold text-indigo-600">
                        ₹{viewTask.expenses.reduce((sum, e) => sum + (e.expenseAmount || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {viewTask.attachments && viewTask.attachments.length > 0 && (
                <div className="mb-2 sm:mb-4">
                  <h4 className="text-[10px] sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FiPaperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                    Attachments ({viewTask.attachments.length})
                  </h4>
                  <div className="space-y-0.5 sm:space-y-1.5">
                    {viewTask.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 transition-all group">
                        {getFileIcon(att.fileName)}
                        <span className="text-[8px] sm:text-sm text-gray-700 truncate flex-1">{att.fileName}</span>
                        <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewAttachment(att.fileUrl, att.fileName)}
                            className="p-0.5 sm:p-1.5 hover:bg-indigo-50 rounded-full transition-colors"
                            title="View"
                          >
                            <FiEye className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-indigo-600 hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDownloadAttachment(att.fileUrl, att.fileName)}
                            className="p-0.5 sm:p-1.5 hover:bg-emerald-50 rounded-full transition-colors"
                            title="Download"
                          >
                            <FiDownload className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-emerald-600 hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewTask.remark && (
                <div className="mb-2 sm:mb-4">
                  <h4 className="text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5 flex items-center gap-1 sm:gap-2">
                    <FiInfo className="w-3 h-3 sm:w-4 sm:h-4" />
                    Remark
                  </h4>
                  <p className="text-[10px] sm:text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-white/30">
                    {viewTask.remark}
                  </p>
                </div>
              )}

              {viewTask.voiceNote && (
                <div className="mb-2 sm:mb-4">
                  <h4 className="text-[10px] sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1.5 flex items-center gap-1 sm:gap-2">
                    <FiMic className="w-3 h-3 sm:w-4 sm:h-4" />
                    Voice Note
                  </h4>
                  <audio controls src={viewTask.voiceNote} className="w-full" />
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-1.5 sm:gap-3 mt-3 sm:mt-6 pt-2 sm:pt-4 border-t border-gray-100/50">
                <button onClick={() => { setShowViewModal(false); setViewTask(null); }} className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-[10px] sm:text-sm">
                  Close
                </button>
                <button onClick={() => { setShowViewModal(false); handleUpdateClick(viewTask); }} className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm">
                  <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Issues List Modal ─── */}
      {showIssuesListModal && selectedTaskForIssues && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-100/50 flex justify-between items-center">
              <h3 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent flex items-center gap-1 sm:gap-2">
                <FiAlertTriangle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-rose-500" />
                Issues for: {selectedTaskForIssues.taskName}
              </h3>
              <button className="p-0.5 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => { setShowIssuesListModal(false); setSelectedTaskForIssues(null); setTaskIssues([]); }}>
                <FiX className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-3 sm:px-6 py-3 sm:py-6">
              {issuesLoading ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">Loading issues...</div>
              ) : taskIssues.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500 text-sm">No issues reported for this task</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {taskIssues.map((issue, idx) => {
                    const st = issueStatusMeta[issue.status] || issueStatusMeta['Open'];
                    const pr = priorityMeta[issue.priority] || priorityMeta['Medium'];
                    return (
                      <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 hover:shadow-lg transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-800">{issue.issueTitle}</h4>
                            <p className="text-[10px] sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{issue.issueDescription}</p>
                            <p className="text-[8px] sm:text-xs text-gray-400 mt-1">Reported: {formatDate(issue.reportedAt)}</p>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2 ml-0 sm:ml-4">
                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
                              {pr.icon}
                              <span className="hidden xs:inline">{issue.priority}</span>
                            </span>
                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                              {st.icon}
                              <span className="hidden xs:inline">{issue.status}</span>
                            </span>
                          </div>
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

      {/* ─── CUTE POPUP WITH FEMALE VOICE ─── */}
      {showCutePopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
          <div className={`pointer-events-auto animate-pop-bounce px-5 sm:px-7 py-4 sm:py-5 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl border-2 max-w-xs sm:max-w-sm mx-4 ${
            cutePopupType === 'success' 
              ? 'bg-gradient-to-br from-emerald-50/95 to-teal-50/95 border-emerald-300 shadow-emerald-500/40' 
              : 'bg-gradient-to-br from-rose-50/95 to-pink-50/95 border-rose-300 shadow-rose-500/40'
          }`}>
            <div className="absolute -top-3 -right-3 text-2xl sm:text-3xl animate-float">
              {cutePopupType === 'success' ? '🎉' : '😅'}
            </div>
            
            <div className="absolute -top-2 -left-2 text-lg sm:text-xl animate-sparkle">
              {cutePopupType === 'success' ? '✨' : '💫'}
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                cutePopupType === 'success' 
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-400/50' 
                  : 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-rose-400/50'
              }`}>
                {cutePopupType === 'success' ? (
                  <FiCheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                ) : (
                  <FiAlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-bold ${
                  cutePopupType === 'success' ? 'text-emerald-800' : 'text-rose-800'
                }`}>
                  {cutePopupMessage}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <span>🎀</span>
                  {cutePopupSubMessage}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[8px] sm:text-[10px] text-purple-500 font-medium animate-pulse">
                    🔊
                  </span>
                  <span className="text-[6px] sm:text-[8px] text-gray-400 animate-pulse">
                    female voice speaking...
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 h-1.5 w-full bg-gray-200/50 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-[3500ms] ${
                cutePopupType === 'success' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-pink-500'
              }`} style={{ width: '100%' }} />
            </div>
            
            <div className="flex justify-center gap-1 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300/50 animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300/50 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Notification ─── */}
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
        @keyframes sparkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; } 50% { transform: scale(1.3) rotate(45deg); opacity: 1; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-6px); opacity: 1; } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; } }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-pop-bounce { animation: popBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
        .animate-float { animation: float 2s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 1.5s ease-in-out infinite; }
        .animate-bounce { animation: bounce 1s ease-in-out infinite; }

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