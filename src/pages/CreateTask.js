

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiPlus, FiX, FiMic, FiMicOff, FiCalendar, FiRepeat,
  FiChevronDown, FiChevronUp, FiList, FiFileText,
  FiMessageSquare, FiFlag, FiStar, FiAlertCircle, FiCheckCircle,
  FiClock, FiArrowLeft, FiRefreshCw, FiUser, FiLogOut,
  FiBell, FiSearch, FiFilter, FiBriefcase, FiCheck,
  FiUsers, FiUserPlus, FiLayers
} from 'react-icons/fi';
import { FaTasks, FaRocket, FaList, FaUsers } from 'react-icons/fa';
import Navbar from '../Navbar';
import { createTask } from '../services/taskService';

const priorityMeta = {
  Critical: { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50' },
  High: { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50' },
  Medium: { color: '#eab308', bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-200/50' },
  Low: { color: '#22c55e', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50' },
};

// ─── Subtask Component ───
const SubtaskItem = ({ subtask, index, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 p-2 sm:p-3 hover:shadow-md transition-all">
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
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? <FiChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" /> : <FiChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-gray-200/50 space-y-2 sm:space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5 sm:mb-1">
                Subtask Name
              </label>
              <input
                type="text"
                value={subtask.name || ''}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                placeholder="Subtask name"
              />
            </div>
            <div>
              <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5 sm:mb-1">
                Status
              </label>
              <select
                value={subtask.status || 'Pending'}
                onChange={(e) => onUpdate(index, 'status', e.target.value)}
                className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5 sm:mb-1">
              Description
            </label>
            <input
              type="text"
              value={subtask.description || ''}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
              placeholder="Subtask description"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5 sm:mb-1">
                Submit Date & Time
              </label>
              <input
                type="datetime-local"
                value={subtask.submitDate ? new Date(subtask.submitDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => onUpdate(index, 'submitDate', e.target.value)}
                className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5 sm:mb-1">
                Priority
              </label>
              <select
                value={subtask.priority || 'Medium'}
                onChange={(e) => onUpdate(index, 'priority', e.target.value)}
                className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function CreateTask() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'employee';
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId] = useState('');
  const [employeeDepartment, setEmployeeDepartment] = useState('');

  // ─── Form Data ───
  const [formData, setFormData] = useState({
    taskName: '',
    title: '',
    description: '',
    priority: 'Medium',
    frequency: ['One Time'],
    submitDate: '',
    remark: '',
    assignType: 'INDIVIDUAL',
    assignedTo: [],
    department: '',
    team: ''
  });

  // ─── Employee & Department Data ───
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedDepartmentForFilter, setSelectedDepartmentForFilter] = useState('');

  // ─── Teams Data ───
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // ─── Subtasks ───
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState({
    name: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    submitDate: ''
  });

  // ─── Voice Note ───
  const [voiceNoteFile, setVoiceNoteFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // ─── Loading State ───
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Success Popup State ───
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
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

  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) { navigate('/'); return; }

    try {
      const d = JSON.parse(raw);
      const name = d.fullName || d.name || d.employeeName || d.username || d.firstName || 'Employee';
      const id = d.employee?._id || d.employee?.id || d._id || d.id || d.userId || '';
      const dept = d.department || d.employee?.department || '';

      setName(name);
      setEmpId(id);
      setEmployeeDepartment(dept);
      setFormData(prev => ({ ...prev, department: dept }));
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  }, [navigate]);

  // ─── Fetch Employees and Departments ───
  useEffect(() => {
    const fetchEmployeesAndDepartments = async () => {
      setLoadingEmployees(true);
      try {
        // Fetch employees using the correct API endpoint
        const empResponse = await axios.get('https://api.timelyhealth.in/api/employees/get-employees');
        const employeesData = Array.isArray(empResponse.data) ? empResponse.data : empResponse.data.employees || [];
        const activeEmployees = employeesData.filter(emp => emp.status === 'active');
        setEmployees(activeEmployees);

        // Extract unique departments
        const departmentMap = new Map();
        activeEmployees.forEach((emp) => {
          const deptName = emp.department || emp.departmentName;
          if (deptName && !departmentMap.has(deptName)) {
            departmentMap.set(deptName, { _id: deptName, name: deptName });
          }
        });
        setDepartments(Array.from(departmentMap.values()));
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployeesAndDepartments();
  }, []);

  // ─── Fetch Teams ───
  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const response = await fetch('https://api.timelyhealth.in/api/teams/all');
        const data = await response.json();
        if (data.success) {
          setTeams(data.data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  // ─── Toggle Frequency ───
  const toggleFrequency = (freq) => {
    setFormData(prev => {
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

  // ─── Voice Recording ───
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

  // ─── Submit Form ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!employeeId) {
        setError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      // Validation based on assignment type
      if (formData.assignType === 'INDIVIDUAL' && formData.assignedTo.length === 0) {
        setError('Please select at least one employee.');
        setLoading(false);
        return;
      }

      if (formData.assignType === 'DEPARTMENT' && !formData.department) {
        setError('Please select a department.');
        setLoading(false);
        return;
      }

      if (formData.assignType === 'TEAM' && !formData.team) {
        setError('Please select a team.');
        setLoading(false);
        return;
      }

      const taskData = {
        taskName: formData.taskName,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        frequency: formData.frequency,
        submitDate: formData.submitDate,
        remark: formData.remark,
        assignType: formData.assignType,
        createdBy: employeeId,
        createdByType: 'employee',
        department: formData.assignType === 'SELF' ? employeeDepartment : formData.department,
        assignedTo: formData.assignedTo,
        team: formData.team,
        subtasks: subtasks
      };

      const response = await createTask(taskData, voiceNoteFile);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create task');
      }

      setShowSuccessPopup(true);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create task';
      setError(errorMessage);
      console.error('Create task error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle Success Popup Close ───
  const handlePopupClose = () => {
    setShowSuccessPopup(false);
  };

  // ─── Handle Logout ───
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ─── Get Initials ───
  const getInitials = (name) => {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex flex-col">
      {/* ─── Horizontal Top Navbar ─── */}
      <Navbar userRole={userRole} onLogout={handleLogout} />

      {/* ─── Main Content Area (Full Width Layout) ─── */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="admin-dash">

          {/* Header Section */}
          <div className="admin-dash__header">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <FiPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="admin-dash__greeting flex items-center gap-2 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Create New Task
                  </h1>
                  <p className="admin-dash__subtitle text-sm sm:text-base">
                    Create and assign tasks to individuals, teams, or departments
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {/* ─── Live Date & Time Display ─── */}
              <div className="admin-dash__date-pill flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-indigo-200/50 rounded-2xl shadow-md shadow-indigo-100/50 text-slate-700 font-semibold text-xs sm:text-sm">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDateTime}</span>
              </div>

              <button
                onClick={() => navigate('/task')}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 text-sm"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Tasks
              </button>

            </div>
          </div>

          <div className="space-y-6">

            {/* ─── Form Card ─── */}
            <div className="admin-dash__card bg-white/80 backdrop-blur-xl border border-indigo-100/50 shadow-xl shadow-indigo-500/10">
              <div className="admin-dash__card-header">
                <div>
                  <h3 className="admin-dash__card-title flex items-center gap-2 text-lg sm:text-xl">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <FaTasks className="w-4 h-4 text-white" />
                    </div>
                    Task Details
                  </h3>
                  <p className="admin-dash__card-desc">Fill in all the required fields to create your task</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-200/50 shadow-sm">
                    {subtasks.length} Subtasks
                  </span>
                </div>
              </div>

              <div className="admin-dash__card-body">
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* ─── Error ─── */}
                  {error && (
                    <div className="p-3 sm:p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 sm:gap-3 text-rose-700 text-xs sm:text-sm shadow-xs">
                      <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* ─── Task Name ─── */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <FiFileText className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                      Task Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.taskName}
                      onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-sm shadow-sm hover:border-indigo-300"
                      placeholder="Enter task name..."
                    />
                  </div>

                  {/* ─── Title ─── */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <FiList className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-sm shadow-sm hover:border-indigo-300"
                      placeholder="Enter task title..."
                    />
                  </div>

                  {/* ─── Description ─── */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-sm resize-none shadow-sm hover:border-indigo-300"
                      placeholder="Describe the task in detail..."
                    />
                  </div>

                  {/* ─── Priority & Submit Date ─── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        <FiFlag className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-sm shadow-sm hover:border-indigo-300 cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        <FiCalendar className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                        Submit Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.submitDate}
                        onChange={(e) => setFormData({ ...formData, submitDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-sm shadow-sm hover:border-indigo-300"
                      />
                    </div>
                  </div>

                  {/* ─── Frequency ─── */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <FiRepeat className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                      Task Frequency
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['One Time', 'Daily', 'Weekly', 'Monthly'].map((type) => {
                        const isChecked = formData.frequency?.includes(type) || false;
                        return (
                          <label
                            key={type}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${isChecked
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105'
                                : 'bg-white/70 backdrop-blur-sm border-slate-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFrequency(type)}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                            />
                            {type}
                          </label>
                        );
                      })}
                    </div>
                    {formData.frequency?.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3 text-indigo-600" />
                        Selected: <span className="font-semibold text-indigo-600">{formData.frequency.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  {/* ─── Assignment Type ─── */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <FiUsers className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                      Assign To
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { value: 'INDIVIDUAL', label: 'Individual', icon: <FiUserPlus className="w-4 h-4" /> },
                        { value: 'TEAM', label: 'Team', icon: <FaUsers className="w-4 h-4" /> },
                        { value: 'DEPARTMENT', label: 'Department', icon: <FiBriefcase className="w-4 h-4" /> },
                        { value: 'ALL', label: 'All', icon: <FiLayers className="w-4 h-4" /> }
                      ].map((type) => {
                        const isChecked = formData.assignType === type.value;
                        return (
                          <label
                            key={type.value}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${isChecked
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105'
                                : 'bg-white/70 backdrop-blur-sm border-slate-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                              }`}
                          >
                            <input
                              type="radio"
                              name="assignType"
                              checked={isChecked}
                              onChange={() => setFormData({ ...formData, assignType: type.value, assignedTo: [], team: '' })}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                            />
                            {type.icon}
                            {type.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* ─── Individual Employee Selection ─── */}
                  {formData.assignType === 'INDIVIDUAL' && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                        <FiUserPlus className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Select Employees
                      </label>
                      
                      {/* Department Filter */}
                      <div className="mb-3">
                        <select
                          value={selectedDepartmentForFilter}
                          onChange={(e) => {
                            setSelectedDepartmentForFilter(e.target.value);
                            setFormData({ ...formData, assignedTo: [] });
                          }}
                          className="w-full px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs sm:text-sm"
                        >
                          <option value="">All Departments</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name} ({employees.filter(e => e.department === dept._id || e.departmentId === dept._id).length} employees)
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {loadingEmployees ? (
                        <div className="text-xs sm:text-sm text-gray-500">Loading employees...</div>
                      ) : (
                        <>
                          {/* Select All / Clear All buttons */}
                          <div className="flex gap-2 mb-2">
                            <button
                              type="button"
                              onClick={() => {
                                const filteredEmps = employees.filter(emp => {
                                  if (!selectedDepartmentForFilter) return true;
                                  return emp.department === selectedDepartmentForFilter || emp.departmentId === selectedDepartmentForFilter;
                                });
                                setFormData({ ...formData, assignedTo: filteredEmps.map(e => e._id) });
                              }}
                              className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, assignedTo: [] })}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                            >
                              Clear All
                            </button>
                          </div>
                          
                          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white">
                            {employees.filter(emp => {
                              if (!selectedDepartmentForFilter) return true;
                              return emp.department === selectedDepartmentForFilter || emp.departmentId === selectedDepartmentForFilter;
                            }).length === 0 ? (
                              <div className="text-xs sm:text-sm text-gray-500 p-2">
                                {selectedDepartmentForFilter ? 'No employees found in this department' : 'No active employees found'}
                              </div>
                            ) : (
                              employees
                                .filter(emp => {
                                  if (!selectedDepartmentForFilter) return true;
                                  return emp.department === selectedDepartmentForFilter || emp.departmentId === selectedDepartmentForFilter;
                                })
                                .map((emp) => (
                                  <label
                                    key={emp._id}
                                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-gray-100 last:border-0"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.assignedTo.includes(emp._id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData({ ...formData, assignedTo: [...formData.assignedTo, emp._id] });
                                        } else {
                                          setFormData({ ...formData, assignedTo: formData.assignedTo.filter(id => id !== emp._id) });
                                        }
                                      }}
                                      className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                    />
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs flex-shrink-0">
                                      {(emp.fullName || emp.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs sm:text-sm font-medium text-gray-800 truncate">{emp.fullName || emp.name}</div>
                                      <div className="text-[10px] sm:text-xs text-gray-500 truncate">{emp.department || emp.departmentName || 'No department'}</div>
                                    </div>
                                    {formData.assignedTo.includes(emp._id) && (
                                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <FiCheck className="w-3 h-3 text-emerald-600" />
                                      </div>
                                    )}
                                  </label>
                                ))
                            )}
                          </div>
                        </>
                      )}
                      {formData.assignedTo.length > 0 && (
                        <div className="mt-2 p-2 bg-indigo-50 rounded-lg">
                          <p className="text-[10px] sm:text-xs text-gray-600">
                            <span className="font-semibold text-indigo-600">{formData.assignedTo.length} employee(s)</span> selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Department Selection ─── */}
                  {formData.assignType === 'DEPARTMENT' && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                        <FiBriefcase className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Select Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => {
                          setFormData({ ...formData, department: e.target.value, assignedTo: [] });
                        }}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs sm:text-sm"
                      >
                        <option value="">Select a department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name} ({employees.filter(e => e.department === dept._id || e.departmentId === dept._id).length} employees)
                          </option>
                        ))}
                      </select>
                      
                      {/* Show employees in selected department */}
                      {formData.department && (
                        <div className="mt-3">
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                            <FiUsers className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Employees in Department
                          </label>
                          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white">
                            {employees.filter(emp => emp.department === formData.department || emp.departmentId === formData.department).length === 0 ? (
                              <div className="text-xs sm:text-sm text-gray-500 p-2">No employees found in this department</div>
                            ) : (
                              employees
                                .filter(emp => emp.department === formData.department || emp.departmentId === formData.department)
                                .map((emp) => (
                                  <div
                                    key={emp._id}
                                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg mb-1"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                      {(emp.fullName || emp.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs sm:text-sm font-medium text-gray-800">{emp.fullName || emp.name}</div>
                                      <div className="text-[10px] sm:text-xs text-gray-500">{emp.employeeId || 'N/A'}</div>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                          <p className="mt-1.5 text-[10px] sm:text-xs text-gray-500">
                            {employees.filter(emp => emp.department === formData.department || emp.departmentId === formData.department).length} employee(s) in this department
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Team Selection ─── */}
                  {formData.assignType === 'TEAM' && (
                    <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl p-4 border border-indigo-100/50">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        <FaUsers className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                        Select Team
                      </label>
                      {loadingTeams ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                          Loading teams...
                        </div>
                      ) : (
                        <>
                          <select
                            value={formData.team}
                            onChange={(e) => {
                              const selectedTeam = teams.find(t => t._id === e.target.value);
                              const memberIds = selectedTeam?.members?.map(m => m._id) || [];
                              setFormData({ ...formData, team: e.target.value, assignedTo: memberIds });
                            }}
                            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-sm shadow-sm hover:border-indigo-300 cursor-pointer"
                          >
                            <option value="">Select a team</option>
                            {teams.map((team) => (
                              <option key={team._id} value={team._id}>
                                {team.teamName} ({team.members?.length || 0} members)
                              </option>
                            ))}
                          </select>
                          
                          {/* Show team members */}
                          {formData.team && (
                            <div className="mt-4">
                              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                                <FiUsers className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                                Team Members
                              </label>
                              <div className="max-h-56 overflow-y-auto border border-indigo-100/50 rounded-xl p-3 bg-white/50 backdrop-blur-sm">
                                {(() => {
                                  const selectedTeam = teams.find(t => t._id === formData.team);
                                  if (!selectedTeam || !selectedTeam.members || selectedTeam.members.length === 0) {
                                    return <div className="text-sm text-gray-500 p-3 text-center">No members found in this team</div>;
                                  }
                                  return selectedTeam.members.map((member) => (
                                    <div
                                      key={member._id}
                                      className="flex items-center gap-3 p-3 bg-white rounded-xl mb-2 last:mb-0 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                                        {(member.name || member.fullName || 'U').charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-800">{member.name || member.fullName}</div>
                                        <div className="text-xs text-gray-500">{member.employeeId || 'N/A'}</div>
                                      </div>
                                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                <FiUsers className="w-3 h-3 text-indigo-600" />
                                <span>{(() => {
                                  const selectedTeam = teams.find(t => t._id === formData.team);
                                  return selectedTeam?.members?.length || 0;
                                })()} member(s) in this team</span>
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* ─── Subtasks ─── */}
                  <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl p-4 border border-indigo-100/50">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <FaList className="w-3 h-3 text-white" />
                        </div>
                        Subtasks ({subtasks.length})
                      </label>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                        {subtasks.filter(s => s.status === 'Completed').length} completed
                      </span>
                    </div>

                    {/* Add Subtask Form */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-indigo-100/50 mb-3 shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={newSubtask.name}
                          onChange={(e) => setNewSubtask({ ...newSubtask, name: e.target.value })}
                          placeholder="Subtask name *"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs sm:text-sm transition-all duration-200"
                        />
                        <input
                          type="text"
                          value={newSubtask.description}
                          onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                          placeholder="Description"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs sm:text-sm transition-all duration-200"
                        />
                        <input
                          type="datetime-local"
                          value={newSubtask.submitDate}
                          onChange={(e) => setNewSubtask({ ...newSubtask, submitDate: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs sm:text-sm transition-all duration-200"
                        />
                        <div className="flex gap-2">
                          <select
                            value={newSubtask.priority}
                            onChange={(e) => setNewSubtask({ ...newSubtask, priority: e.target.value })}
                            className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs sm:text-sm transition-all duration-200 cursor-pointer"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                          <button
                            type="button"
                            onClick={addSubtask}
                            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1 flex-shrink-0"
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
                          <SubtaskItem
                            key={subtask._id || index}
                            subtask={subtask}
                            index={index}
                            onUpdate={updateSubtask}
                            onRemove={removeSubtask}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ─── Remark ─── */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                      Remark
                    </label>
                    <textarea
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-sm resize-none shadow-sm hover:border-indigo-300"
                      placeholder="Add any additional remarks..."
                    />
                  </div>

                  {/* ─── Voice Note ─── */}
                  <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl p-4 border border-indigo-100/50">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                      <FiMic className="inline mr-1.5 sm:mr-2 w-4 h-4 text-indigo-600" />
                      Voice Note (Optional)
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-2"
                        >
                          <FiMic className="w-4 h-4" />
                          Start Recording
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-2"
                        >
                          <FiMicOff className="w-4 h-4" />
                          Stop Recording
                        </button>
                      )}
                      {voiceNoteFile && (
                        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-indigo-100/50 shadow-sm">
                          <audio controls src={URL.createObjectURL(voiceNoteFile)} className="h-8" />
                          <button
                            type="button"
                            onClick={() => setVoiceNoteFile(null)}
                            className="p-2 bg-rose-100 rounded-lg hover:bg-rose-200 transition-colors"
                          >
                            <FiX className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      )}
                    </div>
                    {isRecording && (
                      <div className="mt-3 flex items-center gap-2 text-rose-600 text-sm">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                        <span className="font-semibold">Recording in progress...</span>
                      </div>
                    )}
                  </div>

                  {/* ─── Submit Buttons ─── */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-indigo-100/50">
                    <button
                      type="button"
                      onClick={() => navigate('/task')}
                      className="px-6 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating Task...
                        </>
                      ) : (
                        <>
                          <FaRocket className="w-5 h-5" />
                          Create Task
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ─── Success Popup ─── */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-200/50 p-6 sm:p-8 animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl"></div>
            </div>

            {/* Close Button */}
            <button
              onClick={handlePopupClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 hover:bg-gray-100 transition-all z-10"
            >
              <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Animated Icon */}
              <div className="relative inline-block mb-4 sm:mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                  <FiCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                🎉 Task Created Successfully!
              </h3>

              {/* Message */}
              <div className="space-y-2 mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-600">
                  Your task <span className="font-semibold text-indigo-600">"{formData.taskName}"</span> has been created!
                </p>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-emerald-600">
                  <FiCheck className="w-4 h-4" />
                  <span>Task saved in your dashboard</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handlePopupClose}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 text-sm sm:text-base"
                >
                  View My Tasks
                </button>
                <button
                  onClick={() => {
                    setShowSuccessPopup(false);
                    setFormData({
                      taskName: '',
                      title: '',
                      description: '',
                      priority: 'Medium',
                      frequency: ['One Time'],
                      submitDate: '',
                      remark: ''
                    });
                    setSubtasks([]);
                    setVoiceNoteFile(null);
                  }}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white border border-slate-200 text-gray-700 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm sm:text-base"
                >
                  Create Another Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes slideDown { 
          from { 
            opacity: 0; 
            transform: translateY(-50px) scale(0.9); 
          } 
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          } 
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
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

export default CreateTask;