import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiPlus, FiX, FiMic, FiMicOff, FiCalendar, FiRepeat, 
  FiChevronDown, FiChevronUp, FiList, FiFileText, 
  FiMessageSquare, FiFlag, FiStar, FiAlertCircle, FiCheckCircle,
  FiClock, FiArrowLeft, FiRefreshCw
} from 'react-icons/fi';
import { FaTasks, FaRocket, FaList, FaCheck } from 'react-icons/fa';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { createTask } from '../services/taskService';

const priorityMeta = {
  Critical: { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50' },
  High:     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50' },
  Medium:   { color: '#eab308', bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-200/50' },
  Low:      { color: '#22c55e', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50' },
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
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
                subtask.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
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
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId] = useState('');
  const [employeeDepartment, setEmployeeDepartment] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // ─── Form Data ───
  const [formData, setFormData] = useState({
    taskName: '',
    title: '',
    description: '',
    priority: 'Medium',
    frequency: ['One Time'],
    submitDate: '',
    remark: ''
  });
  
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

  // ─── Handle sidebar collapse ───
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
      const dept = d.department || d.employee?.department || '';
      
      setName(name);
      setEmpId(id);
      setEmployeeDepartment(dept);
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  }, [navigate]);

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
      
      const taskData = {
        taskName: formData.taskName,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        frequency: formData.frequency,
        submitDate: formData.submitDate,
        remark: formData.remark,
        assignType: 'SELF',
        createdBy: employeeId,
        createdByType: 'employee',
        department: employeeDepartment,
        subtasks: subtasks
      };
      
      const response = await createTask(taskData, voiceNoteFile);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create task');
      }
      
      // Show success popup instead of direct navigation
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
    navigate('/my-task');
  };

  // ─── Handle Profile Click ───
  const handleProfileClick = () => {
    navigate('/employee-profile');
  };

  const mainContentPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]';

  // ─── Get Initials ───
  const getInitials = (name) => {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex">
      {/* ─── Sidebar ─── */}
      <EmployeeSidebar 
        employeeName={employeeName} 
        onLogout={() => {
          localStorage.clear();
          navigate('/');
        }}
        onCollapseChange={handleSidebarToggle}
      />

      {/* ─── Main Content ─── */}
      <div className={`flex-1 min-h-screen w-full ${mainContentPadding} flex flex-col transition-all duration-300 ease-in-out`}>
        {/* ─── Header ─── */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <FaTasks className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block truncate">
                  Create New Task
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Create Task
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-wrap">
              <button
                onClick={handleProfileClick}
                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[8px] sm:text-xs lg:text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all flex-shrink-0 cursor-pointer"
              >
                {getInitials(employeeName)}
              </button>
            </div>
          </div>
        </header>

        {/* ─── Form Content ─── */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/30 shadow-lg p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* ─── Error ─── */}
                {error && (
                  <div className="p-3 sm:p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-xl flex items-center gap-2 sm:gap-3 text-rose-700 text-xs sm:text-sm">
                    <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* ─── Task Name ─── */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiFileText className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Task Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.taskName}
                    onChange={(e) => setFormData({...formData, taskName: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                    placeholder="Enter task name..."
                  />
                </div>

                {/* ─── Title ─── */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiList className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                    placeholder="Enter task title..."
                  />
                </div>

                {/* ─── Description ─── */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
                    placeholder="Describe the task..."
                  />
                </div>

                {/* ─── Priority & Submit Date ─── */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                      <FiFlag className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                      <FiCalendar className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Submit Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.submitDate}
                      onChange={(e) => setFormData({...formData, submitDate: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* ─── Frequency ─── */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiRepeat className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Task Frequency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['One Time', 'Daily', 'Weekly', 'Monthly'].map((type) => {
                      const isChecked = formData.frequency?.includes(type) || false;
                      return (
                        <label
                          key={type}
                          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                              : 'bg-white/40 backdrop-blur-sm border border-white/30 text-gray-600 hover:bg-white/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFrequency(type)}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          {type === 'One Time' && <FiCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                          {type === 'Daily' && <FiRefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                          {type === 'Weekly' && <FiCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                          {type === 'Monthly' && <FiCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                          {type}
                        </label>
                      );
                    })}
                  </div>
                  {formData.frequency?.length > 0 && (
                    <p className="mt-1 text-[10px] sm:text-xs text-gray-500">
                      Selected: {formData.frequency.join(', ')}
                    </p>
                  )}
                </div>

                {/* ─── Subtasks ─── */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                    Subtasks ({subtasks.length})
                  </label>
                  
                  {/* Add Subtask Form */}
                  <div className="bg-indigo-50/50 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-indigo-200/50 mb-2 sm:mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={newSubtask.name}
                        onChange={(e) => setNewSubtask({...newSubtask, name: e.target.value})}
                        placeholder="Subtask name *"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                      />
                      <input
                        type="text"
                        value={newSubtask.description}
                        onChange={(e) => setNewSubtask({...newSubtask, description: e.target.value})}
                        placeholder="Description"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={newSubtask.submitDate}
                        onChange={(e) => setNewSubtask({...newSubtask, submitDate: e.target.value})}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                      />
                      <div className="flex gap-1 sm:gap-2">
                        <select
                          value={newSubtask.priority}
                          onChange={(e) => setNewSubtask({...newSubtask, priority: e.target.value})}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[10px] sm:text-sm"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <button
                          type="button"
                          onClick={addSubtask}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-[10px] sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1"
                        >
                          <FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtasks List */}
                  {subtasks.length > 0 && (
                    <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-56 overflow-y-auto pr-1">
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
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Remark
                  </label>
                  <textarea
                    value={formData.remark}
                    onChange={(e) => setFormData({...formData, remark: e.target.value})}
                    rows="2"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
                    placeholder="Add any additional remarks..."
                  />
                </div>

                {/* ─── Voice Note ─── */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                    <FiMic className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Voice Note (Optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
                      >
                        <FiMic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Start Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
                      >
                        <FiMicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Stop Recording
                      </button>
                    )}
                    {voiceNoteFile && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <audio controls src={URL.createObjectURL(voiceNoteFile)} className="h-8 sm:h-10" />
                        <button
                          type="button"
                          onClick={() => setVoiceNoteFile(null)}
                          className="p-1 sm:p-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-colors"
                        >
                          <FiX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  {isRecording && (
                    <div className="mt-1 sm:mt-2 flex items-center gap-1 sm:gap-2 text-rose-500 text-xs sm:text-sm">
                      <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-rose-500"></span>
                      </span>
                      <span>Recording...</span>
                    </div>
                  )}
                </div>

                {/* ─── Submit Buttons ─── */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-100/50">
                  <button
                    type="button"
                    onClick={() => navigate('/my-task')}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaRocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Create Task
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* ─── Success Popup ─── */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div 
            className="relative max-w-md w-full bg-gradient-to-br from-white via-emerald-50/90 to-white rounded-3xl shadow-2xl border border-emerald-200/50 p-6 sm:p-8 animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
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
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                🎉 Woohoo! Task Created!
              </h3>
              
              {/* Message */}
              <div className="space-y-2 mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-600">
                  Your task <span className="font-semibold text-indigo-600">"{formData.taskName}"</span> has been created successfully!
                </p>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-emerald-600">
                  <FaCheck className="w-4 h-4" />
                  <span>Task saved in your dashboard</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={handlePopupClose}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 text-sm sm:text-base"
                >
                  View My Tasks
                </button>
                <button
                  onClick={() => {
                    setShowSuccessPopup(false);
                    // Reset form
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
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all text-sm sm:text-base"
                >
                  Create Another Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Animations ─── */}
      <style>{`
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
        @keyframes pulse-slow { 
          0%, 100% { transform: scale(1); } 
          50% { transform: scale(1.05); } 
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-bounce { animation: bounce 1s ease-in-out infinite; }
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

export default CreateTask;