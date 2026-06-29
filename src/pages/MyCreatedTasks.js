import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiRefreshCw, FiCheckCircle, FiClock, FiAlertCircle, FiBarChart2,
  FiList, FiLogOut, FiUser, FiFlag, FiStar, FiEdit2, FiPlus,
  FiMic, FiMicOff, FiX, FiEye, FiTrash2, FiInfo, FiSearch,
  FiPaperclip, FiMessageSquare, FiAlertTriangle, FiCircle,
  FiDollarSign, FiMapPin, FiTrash, FiPlus as FiPlusIcon,
  FiChevronDown, FiChevronUp, FiLoader, FiDownload, FiFile,
  FiImage, FiFileText, FiExternalLink
} from 'react-icons/fi';
import { FaTasks, FaRocket } from 'react-icons/fa';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { 
  updateTaskByEmployee, 
  getMyCreatedTasks, 
  createTask, 
  deleteTask,
  getTaskIssues,
  reportTaskIssue
} from '../services/taskService';
import './MyTask.css';
import axios from 'axios';

const TASK_API = 'https://api.timelyhealth.in/api/tasks';
const GEOCODE_API = 'https://nominatim.openstreetmap.org/search';
const BASE_URL = 'https://api.timelyhealth.in';

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

const issueStatusMeta = {
  'Open':        { color: '#6366f1', bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-200/50', icon: <FiCircle className="w-4 h-4" /> },
  'In Progress': { color: '#3b82f6', bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-200/50', icon: <FiRefreshCw className="w-4 h-4" /> },
  'Resolved':    { color: '#10b981', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-4 h-4" /> },
  'Closed':      { color: '#6b7280', bg: 'bg-gray-50/80', text: 'text-gray-600', border: 'border-gray-200/50', icon: <FiX className="w-4 h-4" /> },
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
    <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-lg ${gradient}`}>
          <span className="text-white text-sm sm:text-base lg:text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        </div>
      </div>
    </div>
  );
}

function MyCreatedTasks() {
  const navigate = useNavigate();
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateData, setUpdateData] = useState({
    updateText: '',
    progress: 0,
    remark: '',
    expenses: []
  });
  const [attachments, setAttachments] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    taskName: '',
    title: '',
    description: '',
    priority: 'Medium',
    deadlineType: 'Days',
    deadlineValue: 7,
    remark: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [voiceNoteFile, setVoiceNoteFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
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

  // ─── Handle sidebar collapse state ───
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
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

  const fetchTasks = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getMyCreatedTasks(employeeId);
      let tasksData = [];
      if (res && res.success && res.tasks) {
        tasksData = res.tasks;
      } else if (Array.isArray(res)) {
        tasksData = res;
      } else if (res && res.data && Array.isArray(res.data)) {
        tasksData = res.data;
      }
      setTasks(tasksData);
    } catch (err) {
      console.error(err);
      setError('Failed to load created tasks');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

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

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleUpdateClick = (task) => {
    setSelectedTask(task);
    setUpdateData({
      updateText: '',
      progress: task.progress || 0,
      remark: '',
      expenses: task.expenses || []
    });
    setAttachments([]);
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await updateTaskByEmployee(selectedTask._id, employeeId, updateData, attachments);
      setShowUpdateModal(false);
      fetchTasks();
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

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
      const taskData = {
        ...createData,
        assignType: 'SELF',
        createdBy: employeeId,
        createdByType: 'employee'
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
        deadlineType: 'Days',
        deadlineValue: 7,
        remark: ''
      });
      setVoiceNoteFile(null);
      setIsRecording(false);
      setAudioChunks([]);
      fetchTasks();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create task';
      setError(errorMessage);
      console.error('Create task error:', err.response?.data || err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    } finally {
      setLoading(false);
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
    } catch (err) {
      setError('Failed to report issue');
      console.error(err);
    } finally {
      setReportLoading(false);
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
    if (!fileName) return <FiFile className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
      return <FiImage className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />;
    }
    if (['pdf'].includes(ext)) {
      return <FiFileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />;
    }
    if (['doc', 'docx'].includes(ext)) {
      return <FiFileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />;
    }
    if (['xls', 'xlsx'].includes(ext)) {
      return <FiFileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />;
    }
    return <FiFile className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />;
  };

  const filtered = tasks.filter((t) => {
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || (t.title || t.taskName || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    ALL: tasks.length,
    Pending: tasks.filter((t) => t.status === 'Pending').length,
    'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
    Completed: tasks.filter((t) => t.status === 'Completed').length,
    Overdue: tasks.filter((t) => t.status === 'Overdue').length,
    Rejected: tasks.filter((t) => t.status === 'Rejected').length,
  };

  // ─── Dynamic padding based on sidebar state ───
  const mainContentPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex">
      {/* ─── Sidebar (Desktop) ─── */}
      <EmployeeSidebar 
        employeeName={employeeName} 
        onLogout={handleLogout}
        onCollapseChange={handleSidebarToggle}
      />

      {/* ─── Main Content ─── */}
      <div className={`flex-1 min-h-screen w-full ${mainContentPadding} overflow-y-auto pb-20 lg:pb-0 transition-all duration-300 ease-in-out`}>
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm">
          <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <FaTasks className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block truncate">
                  My Created Tasks
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Created Tasks
                </h2>
                <p className="text-[8px] sm:text-[10px] text-gray-500 hidden xs:block truncate max-w-[100px] sm:max-w-[200px]">
                  {tasks.length} tasks created by you
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
              <button onClick={() => setShowCreateModal(true)} className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-[10px] sm:text-xs lg:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2">
                <FiPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xs:inline">Create Task</span>
                <span className="xs:hidden">Create</span>
              </button>
              <button onClick={fetchTasks} className="p-1.5 sm:p-2 lg:p-2.5 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 transition-all hover:scale-105">
                <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <button onClick={handleLogout} className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[10px] sm:text-xs lg:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2">
                <FiLogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xs:inline">Logout</span>
              </button>
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs lg:text-sm shadow-lg shadow-indigo-500/30 flex-shrink-0">
                {getInitials(employeeName)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              <StatCard label="Total Tasks" value={counts.ALL} icon={<FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-indigo-500/30" />
              <StatCard label="In Progress" value={counts['In Progress']} icon={<FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-500/30" />
              <StatCard label="Completed" value={counts.Completed} icon={<FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/30" />
              <StatCard label="Pending" value={counts.Pending} icon={<FiClock className="w-4 h-4 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-500/30" />
              <StatCard label="Overdue" value={counts.Overdue} icon={<FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-rose-400 to-rose-500 shadow-rose-500/30" />
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="flex-1 min-w-[120px] sm:min-w-[200px] relative">
                <input
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 pl-7 sm:pl-10 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {['ALL', 'Pending', 'In Progress', 'Completed', 'Overdue', 'Rejected'].map((s) => {
                const st = statusMeta[s] || statusMeta['Pending'];
                const isActive = filterStatus === s;
                return (
                  <button
                    key={s}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-[8px] sm:text-sm font-medium transition-all flex items-center gap-0.5 sm:gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/40 backdrop-blur-sm border border-white/30 text-gray-600 hover:bg-white/60'
                    }`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s !== 'ALL' && <span className="hidden xs:inline">{st.icon}</span>}
                    <span className="hidden xs:inline">{s}</span>
                    <span className="xs:hidden">{s.charAt(0)}</span>
                    <span className={`text-[6px] sm:text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>({counts[s] || 0})</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="p-3 sm:p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-xl flex items-center gap-2 sm:gap-3 text-rose-700 text-xs sm:text-sm">
                <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm text-gray-500">Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <FiList className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700">No tasks found</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Create your first task</p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] sm:min-w-[900px]">
                    <thead className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Title</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Status</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Issues</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Progress</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Due Date</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {filtered.map((t, index) => {
                        const st = statusMeta[t.status] || statusMeta['Pending'];
                        const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
                        const issueCount = t.reportedIssues?.length || 0;
                        return (
                          <tr key={t._id} className={`hover:bg-white/30 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}>
                            <td className="px-2 sm:px-4 py-2 sm:py-4">
                              <div className="text-[8px] sm:text-sm font-semibold text-gray-800 truncate max-w-[40px] sm:max-w-[120px]" title={t.taskName}>
                                {t.taskName}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 hidden sm:table-cell">
                              <div className="text-[8px] sm:text-sm text-gray-600 truncate max-w-[60px] sm:max-w-[120px]" title={t.title}>
                                {t.title}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[6px] sm:text-xs font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
                                {pr.icon}
                                <span className="hidden xs:inline">{t.priority}</span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 hidden md:table-cell">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[6px] sm:text-xs font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                                {st.icon}
                                {t.status}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 text-center">
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
                            <td className="px-2 sm:px-4 py-2 sm:py-4 hidden lg:table-cell">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <div className="flex-1 min-w-[30px] sm:min-w-[50px]">
                                  <div className="w-full h-1.5 sm:h-2 bg-gray-200/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${t.progress || 0}%` }} />
                                  </div>
                                </div>
                                <span className="text-[6px] sm:text-xs font-medium text-gray-600 min-w-[20px] sm:min-w-[30px]">{t.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 hidden lg:table-cell">
                              <div className="text-[8px] sm:text-sm text-gray-600">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4">
                              <div className="flex items-center justify-center gap-0.5 sm:gap-1.5">
                                <button 
                                  onClick={() => handleViewTask(t)} 
                                  className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-indigo-50 transition-all group" 
                                  title="View Task"
                                >
                                  <FiEye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateClick(t)} 
                                  className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-amber-50 transition-all group" 
                                  title="Update Task"
                                >
                                  <FiEdit2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button 
                                  onClick={() => handleReportIssueClick(t)} 
                                  className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-all group" 
                                  title="Report Issue"
                                >
                                  <FiAlertTriangle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteTask(t._id)} 
                                  className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-all group" 
                                  title="Delete Task"
                                >
                                  <FiTrash2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                                </button>
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100/50 flex justify-between items-center">
              <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Self Task
              </h3>
              <button className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setShowCreateModal(false)}>
                <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Task Name *</label>
                  <input type="text" required value={createData.taskName} onChange={(e) => setCreateData({...createData, taskName: e.target.value})} placeholder="Enter task name" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Title *</label>
                  <input type="text" required value={createData.title} onChange={(e) => setCreateData({...createData, title: e.target.value})} placeholder="Enter task title" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Description *</label>
                  <textarea required value={createData.description} onChange={(e) => setCreateData({...createData, description: e.target.value})} placeholder="Describe the task..." rows="3" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Priority</label>
                    <select value={createData.priority} onChange={(e) => setCreateData({...createData, priority: e.target.value})} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Deadline Type</label>
                    <select value={createData.deadlineType} onChange={(e) => setCreateData({...createData, deadlineType: e.target.value})} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm">
                      <option value="Days">Days</option>
                      <option value="Week">Week</option>
                      <option value="Month">Month</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Deadline Value</label>
                  <input type="number" min="1" value={createData.deadlineValue} onChange={(e) => setCreateData({...createData, deadlineValue: parseInt(e.target.value)})} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Remark</label>
                  <textarea value={createData.remark} onChange={(e) => setCreateData({...createData, remark: e.target.value})} placeholder="Any additional remarks..." rows="2" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiMic className="inline mr-1 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Voice Note (Optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {!isRecording ? (
                      <button type="button" onClick={startRecording} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-[8px] sm:text-xs font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-1.5">
                        <FiMic className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Start Recording
                      </button>
                    ) : (
                      <button type="button" onClick={stopRecording} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[8px] sm:text-xs font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-1.5">
                        <FiMicOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Stop Recording
                      </button>
                    )}
                    {voiceNoteFile && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <audio controls src={URL.createObjectURL(voiceNoteFile)} className="h-6 sm:h-8" />
                        <button type="button" onClick={() => setVoiceNoteFile(null)} className="p-0.5 sm:p-1 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-colors">
                          <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  {isRecording && (
                    <div className="mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-rose-500 text-[10px] sm:text-sm">
                      <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-rose-500"></span>
                      </span>
                      Recording...
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm">Cancel</button>
                <button type="submit" disabled={createLoading} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  {createLoading ? <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating...</> : <><FaRocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Create Task</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal with Expenses & Auto Location */}
      {showUpdateModal && selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100/50 flex justify-between items-center">
              <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Update Task Progress
              </h3>
              <button className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setShowUpdateModal(false)}>
                <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Task</label>
                  <input type="text" value={selectedTask.title || selectedTask.taskName} disabled className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none text-xs sm:text-sm text-gray-500 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiMessageSquare className="inline mr-1 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Update Text *
                  </label>
                  <textarea
                    required
                    value={updateData.updateText}
                    onChange={(e) => setUpdateData({...updateData, updateText: e.target.value})}
                    placeholder="Describe your progress..."
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Progress: {updateData.progress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={updateData.progress}
                    onChange={(e) => setUpdateData({...updateData, progress: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Remark</label>
                  <textarea
                    value={updateData.remark}
                    onChange={(e) => setUpdateData({...updateData, remark: e.target.value})}
                    placeholder="Any additional remarks..."
                    rows="2"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
                  />
                </div>

                {/* ─── Collapsible Expenses Section ─── */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpensesExpanded(!expensesExpanded)}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl border border-indigo-200/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Expenses</span>
                      {updateData.expenses.length > 0 && (
                        <span className="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[8px] sm:text-xs font-medium">
                          {updateData.expenses.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FiPlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                      <span className="text-[8px] sm:text-xs text-indigo-600 font-medium hidden xs:inline">
                        {expensesExpanded ? 'Collapse' : 'Add Expenses'}
                      </span>
                      {expensesExpanded ? (
                        <FiChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      ) : (
                        <FiChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {expensesExpanded && (
                    <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                      {/* Existing Expenses List */}
                      {updateData.expenses.length > 0 && (
                        <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                          {updateData.expenses.map((exp, idx) => (
                            <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-white/30 flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-800">₹{exp.expenseAmount} - {exp.description}</p>
                                {exp.location?.address && (
                                  <p className="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1 truncate">
                                    <FiMapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                    {exp.location.address}
                                  </p>
                                )}
                                {exp.location?.latitude && exp.location?.longitude && (
                                  <p className="text-[8px] sm:text-[10px] text-gray-400 truncate">
                                    📍 {exp.location.latitude}, {exp.location.longitude}
                                  </p>
                                )}
                                {exp.distance > 0 && (
                                  <p className="text-[8px] sm:text-xs text-gray-500">{exp.distance} km</p>
                                )}
                                <p className="text-[8px] sm:text-[10px] text-gray-400">{formatDate(exp.addedAt)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveExpense(idx)}
                                className="p-1 hover:bg-rose-50 rounded-full transition-colors flex-shrink-0"
                                title="Remove Expense"
                              >
                                <FiTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Expense Form with Visible Lat/Lng */}
                      <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 space-y-2 sm:space-y-3">
                        <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Add New Expense</p>
                        
                        {expenseError && (
                          <p className={`text-[10px] sm:text-xs ${expenseError.includes('✅') ? 'text-emerald-600' : expenseError.includes('❌') ? 'text-rose-600' : 'text-rose-600'}`}>
                            {expenseError}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600">Amount *</label>
                            <input
                              type="number"
                              value={newExpense.expenseAmount}
                              onChange={(e) => setNewExpense({...newExpense, expenseAmount: e.target.value})}
                              placeholder="₹ 0"
                              className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600">Distance (km)</label>
                            <input
                              type="number"
                              value={newExpense.distance}
                              onChange={(e) => setNewExpense({...newExpense, distance: e.target.value})}
                              placeholder="0"
                              className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600">Description *</label>
                          <input
                            type="text"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                            placeholder="Expense description..."
                            className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600">Location Address</label>
                          <div className="flex gap-1 sm:gap-2">
                            <input
                              type="text"
                              value={newExpense.location.address}
                              onChange={(e) => setNewExpense({
                                ...newExpense, 
                                location: {...newExpense.location, address: e.target.value}
                              })}
                              placeholder="Enter address..."
                              className="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => getLocationFromAddress(newExpense.location.address)}
                              disabled={fetchingLocation || !newExpense.location.address}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-[8px] sm:text-xs font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-0.5 sm:gap-1"
                            >
                              {fetchingLocation ? (
                                <FiLoader className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                              ) : (
                                <FiMapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              )}
                              <span className="hidden xs:inline">Get Location</span>
                            </button>
                          </div>
                        </div>

                        {/* ─── VISIBLE LATITUDE & LONGITUDE FIELDS ─── */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600">Latitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={newExpense.location.latitude}
                              onChange={(e) => setNewExpense({
                                ...newExpense,
                                location: {...newExpense.location, latitude: parseFloat(e.target.value) || 0}
                              })}
                              placeholder="0.000000"
                              className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600">Longitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={newExpense.location.longitude}
                              onChange={(e) => setNewExpense({
                                ...newExpense,
                                location: {...newExpense.location, longitude: parseFloat(e.target.value) || 0}
                              })}
                              placeholder="0.000000"
                              className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                            />
                          </div>
                        </div>

                        {newExpense.location.latitude && newExpense.location.longitude && (
                          <p className="text-[8px] sm:text-[10px] text-emerald-600 text-center">
                            ✅ Coordinates ready: {newExpense.location.latitude}, {newExpense.location.longitude}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={handleAddExpense}
                          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-[10px] sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-1 sm:gap-2"
                        >
                          <FiPlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Add Expense
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiPaperclip className="inline mr-1 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Attachments (Optional)
                  </label>
                  <input type="file" multiple onChange={handleFileChange} className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl text-xs sm:text-sm file:mr-2 sm:file:mr-3 file:py-1 sm:file:py-1.5 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-[10px] sm:file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  {attachments.length > 0 && <p className="mt-1 text-[10px] sm:text-xs text-gray-500">{attachments.length} file(s) selected</p>}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50">
                <button type="button" onClick={() => setShowUpdateModal(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm">Cancel</button>
                <button type="submit" disabled={updateLoading} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  {updateLoading ? <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Updating...</> : <><FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Update Progress</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && selectedTaskForReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100/50 flex justify-between items-center">
              <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                Report Issue
              </h3>
              <button className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setShowReportModal(false)}>
                <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Task</label>
                  <input type="text" value={selectedTaskForReport.title || selectedTaskForReport.taskName} disabled className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none text-xs sm:text-sm text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Issue Title *</label>
                  <input type="text" required value={reportData.issueTitle} onChange={(e) => setReportData({...reportData, issueTitle: e.target.value})} placeholder="Brief title of the issue" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Issue Description *</label>
                  <textarea required value={reportData.issueDescription} onChange={(e) => setReportData({...reportData, issueDescription: e.target.value})} placeholder="Describe the issue in detail..." rows="3" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Priority</label>
                  <select value={reportData.priority} onChange={(e) => setReportData({...reportData, priority: e.target.value})} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50">
                <button type="button" onClick={() => setShowReportModal(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm">Cancel</button>
                <button type="submit" disabled={reportLoading} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  {reportLoading ? <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Submitting...</> : <><FiAlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Report Issue</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── COMPLETE VIEW TASK MODAL ─── */}
      {showViewModal && viewTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100/50 flex justify-between items-center">
              <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                Task Details
              </h3>
              <button className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => { setShowViewModal(false); setViewTask(null); }}>
                <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="w-full sm:w-auto">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{viewTask.taskName}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{viewTask.title}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-semibold ${priorityMeta[viewTask.priority]?.bg || 'bg-gray-100'} ${priorityMeta[viewTask.priority]?.text || 'text-gray-600'} border ${priorityMeta[viewTask.priority]?.border || 'border-gray-200'}`}>
                    {priorityMeta[viewTask.priority]?.icon}
                    <span className="hidden xs:inline">{viewTask.priority}</span>
                  </span>
                  <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-semibold ${statusMeta[viewTask.status]?.bg || 'bg-gray-100'} ${statusMeta[viewTask.status]?.text || 'text-gray-600'} border ${statusMeta[viewTask.status]?.border || 'border-gray-200'}`}>
                    {statusMeta[viewTask.status]?.icon}
                    <span className="hidden xs:inline">{viewTask.status}</span>
                  </span>
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
                  <FiMessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                  {viewTask.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5 sm:p-4 border border-white/30">
                  <p className="text-[8px] sm:text-xs text-gray-500">Due Date</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">{formatDate(viewTask.dueDate)}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5 sm:p-4 border border-white/30">
                  <p className="text-[8px] sm:text-xs text-gray-500">Frequency</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">{viewTask.frequency || 'One Time'}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5 sm:p-4 border border-white/30">
                  <p className="text-[8px] sm:text-xs text-gray-500">Deadline</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">{viewTask.deadlineType}: {viewTask.deadlineValue}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5 sm:p-4 border border-white/30">
                  <p className="text-[8px] sm:text-xs text-gray-500">Progress</p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="flex-1 h-1.5 sm:h-2 bg-gray-200/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${viewTask.progress || 0}%`, background: priorityMeta[viewTask.priority]?.color || '#6366f1' }} />
                    </div>
                    <span className="text-[10px] sm:text-sm font-bold text-gray-800">{viewTask.progress || 0}%</span>
                  </div>
                </div>
              </div>

              {/* ─── Employee Updates ─── */}
              {viewTask.employeeUpdates && viewTask.employeeUpdates.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Employee Updates ({viewTask.employeeUpdates.length})
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                    {viewTask.employeeUpdates.map((update, idx) => (
                      <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 border border-white/30">
                        <p className="text-xs sm:text-sm font-medium text-gray-800">{update.updateText}</p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-0.5 sm:mt-1 text-[8px] sm:text-xs text-gray-500">
                          <span>Progress: {update.progress}%</span>
                          {update.remark && <span>Remark: {update.remark}</span>}
                          <span>{formatDateTime(update.updatedAt)}</span>
                        </div>
                        {update.attachments && update.attachments.length > 0 && (
                          <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
                            {update.attachments.map((att, attIdx) => (
                              <div key={attIdx} className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white/30 rounded-lg border border-white/30 hover:bg-white/50 transition-all group">
                                {getFileIcon(att.fileName)}
                                <span className="text-[8px] sm:text-xs text-gray-700 truncate flex-1">{att.fileName}</span>
                                <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleViewAttachment(att.fileUrl, att.fileName)}
                                    className="p-0.5 sm:p-1 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="View"
                                  >
                                    <FiEye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadAttachment(att.fileUrl, att.fileName)}
                                    className="p-0.5 sm:p-1 hover:bg-emerald-50 rounded-full transition-colors"
                                    title="Download"
                                  >
                                    <FiDownload className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-600" />
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

              {/* ─── COMPLETE EXPENSES SECTION ─── */}
              {viewTask.expenses && viewTask.expenses.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <FiDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Expenses ({viewTask.expenses.length})
                  </h4>
                  <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                    {viewTask.expenses.map((exp, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-white/40 to-indigo-50/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <span className="text-xs sm:text-sm font-bold text-gray-800">₹{exp.expenseAmount}</span>
                              <span className="text-xs sm:text-sm font-medium text-gray-600">- {exp.description}</span>
                            </div>
                            
                            {exp.location && (
                              <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
                                {exp.location.address && (
                                  <p className="text-[8px] sm:text-xs text-gray-600 flex items-center gap-0.5 sm:gap-1 truncate">
                                    <FiMapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-500 flex-shrink-0" />
                                    {exp.location.address}
                                  </p>
                                )}
                                {(exp.location.latitude || exp.location.longitude) && (
                                  <p className="text-[8px] sm:text-[10px] text-gray-400 truncate">
                                    📍 Lat: {exp.location.latitude || 'N/A'}, Lng: {exp.location.longitude || 'N/A'}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {exp.distance > 0 && (
                              <p className="text-[8px] sm:text-xs text-gray-500 mt-0.5">📏 {exp.distance} km</p>
                            )}
                            
                            <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-1.5 sm:gap-3 text-[8px] sm:text-[10px] text-gray-400">
                              <span>Added: {formatDateTime(exp.addedAt || exp.expenseDate)}</span>
                              {exp.approvalStatus && (
                                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium ${
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
                  
                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-200/50">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] sm:text-sm font-semibold text-gray-700">Total Expenses</span>
                      <span className="text-sm sm:text-lg font-bold text-indigo-600">
                        ₹{viewTask.expenses.reduce((sum, e) => sum + (e.expenseAmount || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TASK ATTACHMENTS ─── */}
              {viewTask.attachments && viewTask.attachments.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <FiPaperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Attachments ({viewTask.attachments.length})
                  </h4>
                  <div className="space-y-1 sm:space-y-1.5">
                    {viewTask.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 transition-all group">
                        {getFileIcon(att.fileName)}
                        <span className="text-[10px] sm:text-sm text-gray-700 truncate flex-1">{att.fileName}</span>
                        <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewAttachment(att.fileUrl, att.fileName)}
                            className="p-1 sm:p-1.5 hover:bg-indigo-50 rounded-full transition-colors"
                            title="View"
                          >
                            <FiEye className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDownloadAttachment(att.fileUrl, att.fileName)}
                            className="p-1 sm:p-1.5 hover:bg-emerald-50 rounded-full transition-colors"
                            title="Download"
                          >
                            <FiDownload className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remark */}
              {viewTask.remark && (
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
                    <FiInfo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Remark
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                    {viewTask.remark}
                  </p>
                </div>
              )}

              {/* Voice Note */}
              {viewTask.voiceNote && (
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
                    <FiMic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Voice Note
                  </h4>
                  <audio controls src={viewTask.voiceNote} className="w-full" />
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50">
                <button onClick={() => { setShowViewModal(false); setViewTask(null); }} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm">
                  Close
                </button>
                <button onClick={() => { setShowViewModal(false); handleUpdateClick(viewTask); }} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <FiEdit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Issues List Modal */}
      {showIssuesListModal && selectedTaskForIssues && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100/50 flex justify-between items-center">
              <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                Issues for: {selectedTaskForIssues.taskName}
              </h3>
              <button className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => { setShowIssuesListModal(false); setSelectedTaskForIssues(null); setTaskIssues([]); }}>
                <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-6">
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

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }

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

export default MyCreatedTasks;