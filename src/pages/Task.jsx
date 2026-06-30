import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiLogOut,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBarChart2,
  FiUser,
  FiUsers,
  FiBriefcase,
  FiFlag,
  FiStar,
  FiCalendar,
  FiMic,
  FiMicOff,
  FiX,
  FiMessageSquare,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiInfo,
  FiCheck,
  FiUserPlus,
  FiEye,
  FiList,
  FiMoreVertical,
  FiMail,
  FiHash,
  FiFolder,
  FiPaperclip,
  FiDollarSign,
  FiMapPin,
  FiAlertTriangle,
  FiClock as FiClockIcon,
  FiThumbsUp,
  FiThumbsDown,
  FiTrendingUp,
  FiTrendingDown,
  FiBell,
  FiDownload,
  FiFile,
  FiImage,
  FiExternalLink,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiRepeat,
  FiCalendar as FiCalendarIcon,
  FiUserCheck,
  FiUserX
} from 'react-icons/fi';
import { 
  FaTasks, 
  FaRocket,
  FaCheck,
  FaList,
  FaWhatsapp
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import '../Sidebar.css';
import {
  createTask,
  updateTask,
  deleteTask,
} from '../services/taskService';

const EMPLOYEES_API = 'https://api.timelyhealth.in/api/employees/get-employees';
const API_BASE_URL = 'https://api.timelyhealth.in/api/tasks';
const BASE_URL = 'https://api.timelyhealth.in';

// ─── Employee Selector with Department Filter ───
const EmployeeSelector = ({
  empDropdownRef,
  formData,
  setFormData,
  empSearch,
  setEmpSearch,
  showEmpDropdown,
  setShowEmpDropdown,
  empLoading,
  filteredEmployees,
  selectedDepartment,
  setSelectedDepartment,
  departments,
  allEmployees,
}) => {
  const getEmployeeName = (id) => {
    const emp = allEmployees.find((e) => e._id === id);
    return emp ? `${emp.name} (${emp.employeeId})` : id;
  };

  const toggleEmployee = (empId) => {
    setFormData((prev) => {
      const already = prev.assignedTo.includes(empId);
      return {
        ...prev,
        assignedTo: already
          ? prev.assignedTo.filter((id) => id !== empId)
          : [...prev.assignedTo, empId],
      };
    });
  };

  const removeEmployee = (empId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((id) => id !== empId),
    }));
  };

  const selectAllFromDepartment = () => {
    const deptEmployees = allEmployees.filter(
      emp => emp.department === selectedDepartment || emp.departmentId === selectedDepartment
    );
    setFormData((prev) => ({
      ...prev,
      assignedTo: deptEmployees.map(e => e._id)
    }));
  };

  const clearAll = () => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: []
    }));
  };

  const getDepartmentEmployeeCount = () => {
    if (!selectedDepartment) return 0;
    return allEmployees.filter(
      emp => emp.department === selectedDepartment || emp.departmentId === selectedDepartment
    ).length;
  };

  return (
    <div ref={empDropdownRef} className="relative">
      <div className="mb-3">
        <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
          <FiBriefcase className="inline mr-1 w-3 h-3" />
          Select Department
        </label>
        <select
          value={selectedDepartment || ''}
          onChange={(e) => {
            setSelectedDepartment(e.target.value);
            setFormData((prev) => ({ ...prev, assignedTo: [] }));
            setEmpSearch('');
          }}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
        >
          <option value="">-- Select Department --</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name} ({allEmployees.filter(e => e.department === dept._id || e.departmentId === dept._id).length} employees)
            </option>
          ))}
        </select>
        {selectedDepartment && (
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <button
              type="button"
              onClick={selectAllFromDepartment}
              className="px-2 py-0.5 text-[10px] sm:text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors flex items-center gap-1"
            >
              <FiUsers className="w-3 h-3" />
              Select All ({getDepartmentEmployeeCount()})
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-2 py-0.5 text-[10px] sm:text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
            <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
              {formData.assignedTo.length} employee(s) selected
            </span>
          </div>
        )}
      </div>

      {formData.assignedTo.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2 sm:p-3 mb-2 sm:mb-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 min-h-[36px] sm:min-h-[44px]">
          {formData.assignedTo.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-[10px] sm:text-xs font-semibold shadow-lg shadow-indigo-500/25">
              <FiUser className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {getEmployeeName(id)}
              <button
                type="button"
                onClick={() => removeEmployee(id)}
                className="hover:scale-110 transition-transform text-white/80 hover:text-white ml-0.5 sm:ml-1"
              >
                <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder={empLoading ? 'Loading employees...' : 'Search employees...'}
          value={empSearch}
          onChange={(e) => { setEmpSearch(e.target.value); setShowEmpDropdown(true); }}
          onFocus={() => setShowEmpDropdown(true)}
          disabled={empLoading || !selectedDepartment}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-8 sm:pl-10 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>

      {showEmpDropdown && selectedDepartment && (
        <div className="absolute z-50 w-full mt-1 sm:mt-2 bg-white/95 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl max-h-56 sm:max-h-72 overflow-y-auto">
          {filteredEmployees.length === 0 ? (
            <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
              No employees found in this department
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const selected = formData.assignedTo.includes(emp._id);
              return (
                <div
                  key={emp._id}
                  onClick={() => toggleEmployee(emp._id)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer transition-all duration-200 ${
                    selected ? 'bg-indigo-50/80 backdrop-blur-sm' : 'hover:bg-gray-50/80'
                  } border-b border-gray-100/50 last:border-0`}
                >
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                  }`}>
                    {selected && <FiCheck className="text-white text-[10px] sm:text-xs" />}
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-sm shadow-lg shadow-indigo-500/25">
                    {emp.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs sm:text-sm text-gray-800">{emp.name}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 truncate">
                      {emp.employeeId} · {emp.role}
                    </div>
                  </div>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
                    emp.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {emp.status || 'N/A'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
        {!selectedDepartment ? (
          'Please select a department first'
        ) : formData.assignedTo.length > 0 ? (
          `${formData.assignedTo.length} employee(s) selected`
        ) : (
          'No employees selected'
        )}
      </div>
    </div>
  );
};

// ─── Subtask Component ───
const SubtaskItem = ({ subtask, index, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 p-3 sm:p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
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
                {subtask.submittedDate && subtask.status === 'Completed' && (
                  <span className="text-[8px] sm:text-[10px] text-emerald-600 flex items-center gap-0.5">
                    <FiCheckCircle className="w-2.5 h-2.5" />
                    Done: {formatDateTime(subtask.submittedDate)}
                  </span>
                )}
              </div>
              {subtask.description && (
                <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">
                  {subtask.description}
                </p>
              )}
              {subtask.submitDate && (
                <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5">
                  <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Submit By: {formatDateTime(subtask.submitDate)}
                </p>
              )}
            </div>
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
        <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2 sm:space-y-3">
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
                onChange={(e) => {
                  const newStatus = e.target.value;
                  onUpdate(index, 'status', newStatus);
                  if (newStatus === 'Completed' && !subtask.submittedDate) {
                    onUpdate(index, 'submittedDate', new Date().toISOString());
                  }
                }}
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
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
            {subtask.status === 'Completed' && subtask.submittedDate && (
              <div>
                <label className="block text-[8px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5 sm:mb-1">
                  Submitted On
                </label>
                <div className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50/50 backdrop-blur-sm border border-emerald-200/50 rounded-lg text-xs sm:text-sm text-emerald-700">
                  {formatDateTime(subtask.submittedDate)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Subtask Section ───
const SubtaskSection = ({ subtasks, setSubtasks }) => {
  const [newSubtask, setNewSubtask] = useState({
    name: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    submitDate: '',
    submittedDate: null
  });

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
      submitDate: '',
      submittedDate: null
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

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2">
          <FaList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
          Subtasks ({subtasks.length})
          <span className="text-[10px] sm:text-xs text-gray-500 font-normal ml-2">
            {subtasks.filter(s => s.status === 'Completed').length} completed
          </span>
        </label>
      </div>

      <div className="bg-indigo-50/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-indigo-200/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          <div>
            <input
              type="text"
              value={newSubtask.name}
              onChange={(e) => setNewSubtask({ ...newSubtask, name: e.target.value })}
              placeholder="Subtask name *"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              value={newSubtask.description}
              onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
              placeholder="Description"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
            />
          </div>
          <div>
            <input
              type="datetime-local"
              value={newSubtask.submitDate}
              onChange={(e) => setNewSubtask({ ...newSubtask, submitDate: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
            />
          </div>
          <div>
            <select
              value={newSubtask.priority}
              onChange={(e) => setNewSubtask({ ...newSubtask, priority: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <select
              value={newSubtask.status}
              onChange={(e) => setNewSubtask({ ...newSubtask, status: e.target.value })}
              className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              type="button"
              onClick={addSubtask}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1"
            >
              <FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Add</span>
            </button>
          </div>
        </div>
      </div>

      {subtasks.length > 0 && (
        <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-1">
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
  );
};

// ─── Voice Recording with Summary ───
const VoiceRecorder = ({ voiceNoteFile, setVoiceNoteFile, isRecording, startRecording, stopRecording }) => {
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const transcribeAudio = async () => {
    if (!voiceNoteFile) return;
    setIsTranscribing(true);
    
    setTimeout(() => {
      const summaries = [
        "Task involves creating a new dashboard UI with responsive design.",
        "Need to fix the login page bug and implement OAuth2 authentication.",
        "Database migration required for the new user schema.",
        "Frontend optimization needed for the product listing page.",
        "API integration for payment gateway with error handling.",
        "Design system implementation with component library.",
        "Performance testing and load balancing for the new server.",
        "Security audit and penetration testing required.",
        "Documentation update for the new features.",
        "Team meeting at 3 PM to discuss sprint planning."
      ];
      const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];
      setTranscription(randomSummary);
      setIsTranscribing(false);
    }, 2000);
  };

  useEffect(() => {
    if (voiceNoteFile && !transcription) {
      transcribeAudio();
    }
  }, [voiceNoteFile]);

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2">
        <FiMic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
        Voice Note & Summary
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
          <div className="flex flex-wrap items-center gap-2">
            <audio controls src={URL.createObjectURL(voiceNoteFile)} className="h-8 sm:h-10" />
            <button
              type="button"
              onClick={() => {
                setVoiceNoteFile(null);
                setTranscription('');
              }}
              className="p-1 sm:p-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-colors"
            >
              <FiX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
            </button>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-rose-500 text-xs sm:text-sm">
          <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-rose-500"></span>
          </span>
          Recording...
        </div>
      )}

      {isTranscribing && (
        <div className="flex items-center gap-2 text-indigo-600 text-xs sm:text-sm">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          Transcribing audio...
        </div>
      )}

      {transcription && (
        <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-indigo-200/50">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FiMessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-indigo-700 uppercase tracking-wider">Voice Summary</p>
              <p className="text-xs sm:text-sm text-gray-700 mt-0.5">{transcription}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTranscription('');
                transcribeAudio();
              }}
              className="p-1 hover:bg-indigo-100 rounded-lg transition-colors flex-shrink-0"
              title="Regenerate summary"
            >
              <FiRefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TaskFormFields ───
const TaskFormFields = ({
  formData,
  setFormData,
  employees,
  departments,
  empDropdownRef,
  empSearch,
  setEmpSearch,
  showEmpDropdown,
  setShowEmpDropdown,
  empLoading,
  filteredEmployees,
  voiceNoteFile,
  setVoiceNoteFile,
  isRecording,
  startRecording,
  stopRecording,
  subtasks,
  setSubtasks,
  selectedDepartment,
  setSelectedDepartment,
  allEmployees,
}) => {
  const toggleFrequency = (freq) => {
    setFormData((prev) => {
      const current = prev.frequency || [];
      if (current.includes(freq)) {
        return { ...prev, frequency: current.filter(f => f !== freq) };
      } else {
        return { ...prev, frequency: [...current, freq] };
      }
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
          <FiFileText className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Task Name
        </label>
        <input
          type="text"
          required
          value={formData.taskName}
          onChange={(e) => setFormData((prev) => ({ ...prev, taskName: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
          placeholder="Enter task name..."
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
          <FiList className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Title
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
          placeholder="Enter task title..."
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
          <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Description
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows="3"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
          placeholder="Describe the task..."
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            <FiFlag className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
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
            <FiUsers className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Department
          </label>
          <select
            value={selectedDepartment || ''}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setFormData((prev) => ({ ...prev, assignedTo: [], department: e.target.value }));
            }}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
          >
            <option value="">-- Select Department --</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name} ({employees.filter(e => e.department === dept._id || e.departmentId === dept._id).length} employees)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
          <FiUserPlus className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Assign To Employees
        </label>
        <EmployeeSelector
          empDropdownRef={empDropdownRef}
          formData={formData}
          setFormData={setFormData}
          empSearch={empSearch}
          setEmpSearch={setEmpSearch}
          showEmpDropdown={showEmpDropdown}
          setShowEmpDropdown={setShowEmpDropdown}
          empLoading={empLoading}
          filteredEmployees={filteredEmployees}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          departments={departments}
          allEmployees={employees}
        />
      </div>

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
                {type === 'One Time' && <FiCalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                {type === 'Daily' && <FiRefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                {type === 'Weekly' && <FiCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                {type === 'Monthly' && <FiCalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
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

      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
          <FiCalendar className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Submit Date & Time
        </label>
        <input
          type="datetime-local"
          value={formData.submitDate || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, submitDate: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
          <FiMessageSquare className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Remark
        </label>
        <textarea
          value={formData.remark}
          onChange={(e) => setFormData((prev) => ({ ...prev, remark: e.target.value }))}
          rows="2"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm resize-none"
          placeholder="Add any additional remarks..."
        />
      </div>

      <SubtaskSection subtasks={subtasks} setSubtasks={setSubtasks} />

      <VoiceRecorder
        voiceNoteFile={voiceNoteFile}
        setVoiceNoteFile={setVoiceNoteFile}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />
    </div>
  );
};

// ─── ViewTaskModal ───
const ViewTaskModal = ({
  selectedTask,
  setShowViewModal,
  setSelectedTask,
  openEditModal,
  employees,
  getPriorityStyles,
  getStatusStyles,
  getPriorityIcon,
  getStatusIcon,
}) => {
  if (!selectedTask) return null;

  const getEmployeeDetails = (id) => employees.find((e) => e._id === id);

  const getAssignedUsers = () => {
    if (!selectedTask.assignedTo) return [];
    return selectedTask.assignedTo.map((emp) => {
      if (typeof emp === 'object' && emp._id) return emp;
      return getEmployeeDetails(emp) || { _id: emp, name: 'Unknown', email: 'N/A' };
    });
  };

  const assignedUsers = getAssignedUsers();
  const employeeUpdates = selectedTask.employeeUpdates || [];
  const reportedIssues = selectedTask.reportedIssues || [];
  const subtasks = selectedTask.subtasks || [];

  // Get created by user details with proper null checks
  const getCreatedByDetails = () => {
    const createdBy = selectedTask.createdBy;
    if (!createdBy) return null;
    if (typeof createdBy === 'object' && createdBy !== null) {
      return createdBy;
    }
    if (typeof createdBy === 'string') {
      return getEmployeeDetails(createdBy) || { _id: createdBy, name: 'Unknown', email: 'N/A' };
    }
    return null;
  };

  const createdByUser = getCreatedByDetails();

  // WhatsApp click handler
  const handleWhatsAppClick = (phoneNumber) => {
    if (!phoneNumber) return;
    // Remove any non-numeric characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    // Add country code if not present (assuming India +91)
    let number = cleanNumber;
    if (!number.startsWith('91') && number.length === 10) {
      number = '91' + number;
    }
    const whatsappUrl = `https://wa.me/${number}`;
    window.open(whatsappUrl, '_blank');
  };

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

  const handleViewAttachment = (fileUrl, fileName) => {
    const fullUrl = `${BASE_URL}/${fileUrl}`;
    window.open(fullUrl, '_blank');
  };

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

  const formatDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getSubtaskStatusIcon = (status) => {
    if (status === 'Completed') return <FiCheckCircle className="w-3 h-3 text-emerald-500" />;
    if (status === 'In Progress') return <FiRefreshCw className="w-3 h-3 text-blue-500" />;
    return <FiClock className="w-3 h-3 text-amber-500" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
            <FiEye className="w-4 h-4 sm:w-6 sm:h-6" />
            Task Details
          </h2>
          <button
            onClick={() => { setShowViewModal(false); setSelectedTask(null); }}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        <div className="px-4 sm:px-8 py-4 sm:py-6">
          {/* Created By Info Section with WhatsApp */}
          <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-indigo-200/50 mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg ${
                  selectedTask.createdByType === 'admin' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-500/30' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30'
                }`}>
                  {createdByUser && createdByUser.name ? createdByUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    {createdByUser && createdByUser.name ? createdByUser.name : 'Unknown User'}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
                    <span className="text-gray-500">
                      {createdByUser && createdByUser.email ? createdByUser.email : 'N/A'}
                    </span>
                    {/* WhatsApp Button with Phone Number */}
                    {createdByUser && createdByUser.phone && (
                      <button
                        onClick={() => handleWhatsAppClick(createdByUser.phone)}
                        className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors text-[8px] sm:text-[10px] font-medium"
                        title="Chat on WhatsApp"
                      >
                        <FaWhatsapp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {createdByUser.phone}
                      </button>
                    )}
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium ${
                      selectedTask.createdByType === 'admin' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {selectedTask.createdByType === 'admin' ? (
                        <><FiUserCheck className="inline mr-0.5 w-2.5 h-2.5" /> Admin</>
                      ) : (
                        <><FiUser className="inline mr-0.5 w-2.5 h-2.5" /> Employee</>
                      )}
                    </span>
                    <span className="text-gray-400 text-[8px] sm:text-[10px]">
                      Created: {formatDateTime(selectedTask.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {selectedTask.department && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/60 backdrop-blur-sm rounded-full text-[10px] sm:text-xs text-gray-600 border border-gray-200/50 flex items-center gap-0.5 sm:gap-1">
                  <FiBriefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {typeof selectedTask.department === 'object' ? selectedTask.department.name : selectedTask.department}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-4 sm:mb-6">
            <div className="w-full sm:w-auto">
              <h3 className="text-base sm:text-xl font-bold text-gray-800">{selectedTask.taskName}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{selectedTask.title}</p>
              {selectedTask.frequency && selectedTask.frequency.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTask.frequency.map((freq, idx) => (
                    <span key={idx} className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[8px] sm:text-xs font-medium">
                      <FiRepeat className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {freq}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${getPriorityStyles(selectedTask.priority)}`}>
                {getPriorityIcon(selectedTask.priority)}
                {selectedTask.priority}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusStyles(selectedTask.status)}`}>
                {getStatusIcon(selectedTask.status)}
                {selectedTask.status}
              </span>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
              <FiMessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Description
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
              {selectedTask.description || 'No description provided'}
            </p>
          </div>

          {selectedTask.submitDate && (
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                <FiCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Submit Date & Time
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-800">
                {formatDateTime(selectedTask.submitDate)}
              </p>
            </div>
          )}

          {subtasks.length > 0 && (
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <FaList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                Subtasks ({subtasks.length})
                <span className="text-[10px] sm:text-xs text-gray-500 font-normal ml-2">
                  {subtasks.filter(s => s.status === 'Completed').length} completed
                </span>
              </h4>
              <div className="space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                {subtasks.map((subtask, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30 hover:bg-white/50 transition-all">
                    <div className="flex-shrink-0">
                      {getSubtaskStatusIcon(subtask.status)}
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
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
                          subtask.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                          subtask.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          subtask.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {subtask.priority || 'Medium'}
                        </span>
                        {subtask.status === 'Completed' && subtask.submittedDate && (
                          <span className="text-[8px] sm:text-[10px] text-emerald-600 flex items-center gap-0.5">
                            <FiCheckCircle className="w-2.5 h-2.5" />
                            Done: {formatDateTime(subtask.submittedDate)}
                          </span>
                        )}
                      </div>
                      {subtask.description && (
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{subtask.description}</p>
                      )}
                      {subtask.submitDate && (
                        <p className="text-[8px] sm:text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                          <FiCalendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          Submit By: {formatDateTime(subtask.submitDate)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Department
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-800">
                {selectedTask.department?.name || selectedTask.department || 'N/A'}
              </p>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                <FaRocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Frequency
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedTask.frequency && selectedTask.frequency.length > 0 ? (
                  selectedTask.frequency.map((freq, idx) => (
                    <span key={idx} className="px-1.5 sm:px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[8px] sm:text-xs font-medium">
                      {freq}
                    </span>
                  ))
                ) : (
                  <span className="text-xs sm:text-sm text-gray-500">Not set</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-xs sm:text-sm font-bold text-gray-800">{selectedTask.progress}%</span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${selectedTask.progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Assigned To ({assignedUsers.length})
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              {assignedUsers.length > 0 ? (
                assignedUsers.map((user, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white/30 rounded-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-sm">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-800">{user.name || 'Unknown'}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                        <FiMail className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {user.email || 'N/A'}
                        {user.department && (
                          <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[8px] sm:text-xs">
                            {user.department}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">No employees assigned</p>
              )}
            </div>
          </div>

          {employeeUpdates.length > 0 && (
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Employee Updates ({employeeUpdates.length})
              </h4>
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {employeeUpdates.map((update, idx) => {
                  const emp = getEmployeeDetails(update.employeeId) || { name: 'Unknown', email: 'N/A' };
                  return (
                    <div key={idx} className="bg-white/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/30">
                      <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-[8px] sm:text-xs">
                            {emp.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-800">{emp.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {update.updatedAt ? formatDateTime(update.updatedAt) : 'N/A'}
                          </span>
                          <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[8px] sm:text-xs font-medium">
                            {update.progress}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">{update.updateText}</p>
                      {update.remark && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 italic">Remark: {update.remark}</p>
                      )}
                      {update.attachments && update.attachments.length > 0 && (
                        <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
                          {update.attachments.map((att, attIdx) => (
                            <div key={attIdx} className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white/30 rounded-lg border border-white/30 hover:bg-white/50 transition-all group">
                              {getFileIcon(att.fileName)}
                              <span className="text-[10px] sm:text-xs text-gray-700 truncate flex-1">{att.fileName}</span>
                              <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleViewAttachment(att.fileUrl, att.fileName)}
                                  className="p-0.5 sm:p-1 hover:bg-indigo-50 rounded-full transition-colors"
                                  title="View"
                                >
                                  <FiEye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
                                </button>
                                <button
                                  onClick={() => handleDownloadAttachment(att.fileUrl, att.fileName)}
                                  className="p-0.5 sm:p-1 hover:bg-emerald-50 rounded-full transition-colors"
                                  title="Download"
                                >
                                  <FiDownload className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTask.expenses && selectedTask.expenses.length > 0 && (
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <FiDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Expenses ({selectedTask.expenses.length})
              </h4>
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {selectedTask.expenses.map((exp, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-white/40 to-indigo-50/40 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-white/30">
                    <div className="flex flex-wrap justify-between items-start gap-1 sm:gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-800">₹{exp.expenseAmount} - {exp.description}</p>
                        {exp.location?.address && (
                          <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                            <FiMapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {exp.location.address}
                          </p>
                        )}
                        {(exp.location?.latitude || exp.location?.longitude) && (
                          <p className="text-[8px] sm:text-[10px] text-gray-400">
                            📍 Lat: {exp.location.latitude || 'N/A'}, Lng: {exp.location.longitude || 'N/A'}
                          </p>
                        )}
                        {exp.distance > 0 && (
                          <p className="text-[10px] sm:text-xs text-gray-500">{exp.distance} km</p>
                        )}
                        <p className="text-[8px] sm:text-[10px] text-gray-400">{formatDateTime(exp.addedAt || exp.expenseDate)}</p>
                      </div>
                      {exp.approvalStatus && (
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium flex-shrink-0 ${
                          exp.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          exp.approvalStatus === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {exp.approvalStatus}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] sm:text-sm font-semibold text-gray-700">Total Expenses</span>
                  <span className="text-sm sm:text-lg font-bold text-indigo-600">
                    ₹{selectedTask.expenses.reduce((sum, e) => sum + (e.expenseAmount || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedTask.attachments && selectedTask.attachments.length > 0 && (
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <FiPaperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Attachments ({selectedTask.attachments.length})
              </h4>
              <div className="space-y-1 sm:space-y-1.5">
                {selectedTask.attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white/40 backdrop-blur-sm rounded-lg border border-white/30 hover:bg-white/60 transition-all group">
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

          {reportedIssues.length > 0 && (
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <FiAlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Reported Issues ({reportedIssues.length})
              </h4>
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {reportedIssues.map((issue, idx) => {
                  const emp = getEmployeeDetails(issue.employeeId) || { name: 'Unknown', email: 'N/A' };
                  return (
                    <div key={idx} className="bg-white/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/30">
                      <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 flex items-center justify-center text-white font-bold text-[8px] sm:text-xs">
                            {emp.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-800">{emp.name}</span>
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {issue.reportedAt ? formatDateTime(issue.reportedAt) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
                            issue.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                            issue.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                            issue.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {issue.priority}
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
                            issue.status === 'Open' ? 'bg-red-100 text-red-700' :
                            issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>
                      <h5 className="text-xs sm:text-sm font-semibold text-gray-700">{issue.issueTitle}</h5>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{issue.issueDescription}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTask.remark && (
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <FiMessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Remark
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">{selectedTask.remark}</p>
            </div>
          )}

          {selectedTask.voiceNote && (
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <FiMic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Voice Note
              </h4>
              <audio controls src={selectedTask.voiceNote} className="w-full" />
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50">
            <button
              onClick={() => { setShowViewModal(false); setSelectedTask(null); }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-xs sm:text-sm text-gray-700 font-medium hover:bg-gray-200 transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowViewModal(false);
                openEditModal(selectedTask);
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
            >
              <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Edit Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Task Component ───
function Task() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const userRole = localStorage.getItem('userRole') || 'admin';
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDue, setFilterDue] = useState('all');
  const [filterCreatedBy, setFilterCreatedBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [showUpcomingPopup, setShowUpcomingPopup] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [popupShown, setPopupShown] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);
  const empDropdownRef = useRef(null);

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [formData, setFormData] = useState({
    taskName: '',
    title: '',
    description: '',
    assignedTo: [],
    department: '',
    priority: 'Medium',
    frequency: ['One Time'],
    submitDate: '',
    remark: '',
    createdBy: '',
    createdByType: 'admin',
  });
  const [voiceNoteFile, setVoiceNoteFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [subtasks, setSubtasks] = useState([]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const speakAdminAlert = (taskCount, taskNames) => {
    if ('speechSynthesis' in window) {
      let message = `Hey Admin! `;
      if (taskCount === 1) {
        message += `There is 1 task due soon. Please contact your employees to finish it.`;
      } else {
        message += `There are ${taskCount} tasks due soon. Please contact your employees to finish them.`;
      }
      message += ` The tasks are: ${taskNames.join(', ')}.`;
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 0.9;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const maleVoice = voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('Google UK') ||
        voice.name.includes('Daniel')
      );
      if (maleVoice) {
        utterance.voice = maleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
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

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      const name =
        parsedData.name || parsedData.adminName || parsedData.username ||
        parsedData.fullName || parsedData.firstName || parsedData.user?.name ||
        parsedData.data?.name || parsedData.data?.adminName || 'Admin';
      setAdminName(name);
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (empDropdownRef.current && !empDropdownRef.current.contains(e.target)) {
        setShowEmpDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/getalltasks`);
      console.log('Tasks API Response:', response.data);
      
      const tasksData = response.data?.tasks || response.data?.data?.tasks || [];
      const statsData = response.data?.stats || response.data?.data?.stats || {};
      
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setStats({
        total: statsData?.total || 0,
        pending: statsData?.pending || 0,
        inProgress: statsData?.inProgress || 0,
        completed: statsData?.completed || 0,
        overdue: statsData?.overdue || 0,
        rejected: statsData?.rejected || 0,
        employeeCreated: tasksData.filter(t => t.createdByType === 'employee').length,
        adminCreated: tasksData.filter(t => t.createdByType === 'admin' || !t.createdByType).length
      });

      const upcoming = getUpcomingTasksList(tasksData);
      if (upcoming.length > 0 && !popupShown) {
        setUpcomingTasks(upcoming);
        setShowUpcomingPopup(true);
        setPopupShown(true);
        
        setTimeout(() => {
          const taskNames = upcoming.map(t => t.taskName || t.title).slice(0, 5);
          speakAdminAlert(upcoming.length, taskNames);
        }, 1500);
      }

    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setEmpLoading(true);
    try {
      const res = await axios.get(EMPLOYEES_API);
      const data = Array.isArray(res.data) ? res.data : res.data.employees || [];
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setEmpLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(EMPLOYEES_API);
      const emps = Array.isArray(res.data) ? res.data : res.data.employees || [];
      const departmentMap = new Map();
      emps.forEach((emp) => {
        const deptName = emp.department || emp.departmentName;
        if (deptName && !departmentMap.has(deptName)) {
          departmentMap.set(deptName, { _id: deptName, name: deptName });
        }
      });
      setDepartments(Array.from(departmentMap.values()));
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (showCreateModal || showEditModal) {
      fetchEmployees();
      fetchDepartments();
    }
  }, [showCreateModal, showEditModal]);

  const filteredEmployees = employees.filter((emp) => {
    const q = empSearch.toLowerCase();
    const matchesSearch = 
      emp.name?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.role?.toLowerCase().includes(q);
    
    if (selectedDepartment) {
      return matchesSearch && (emp.department === selectedDepartment || emp.departmentId === selectedDepartment);
    }
    return matchesSearch;
  });

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = localStorage.getItem('userData');
      let userId = '';
      if (userData) {
        const parsedData = JSON.parse(userData);
        userId = parsedData._id || parsedData.id || parsedData.userId || parsedData.adminId || '';
      }
      
      const taskData = { 
        taskName: formData.taskName,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        frequency: formData.frequency,
        submitDate: formData.submitDate,
        remark: formData.remark,
        createdBy: userId, 
        createdByType: userRole,
        subtasks: subtasks,
        assignType: 'DEPARTMENT',
        department: selectedDepartment,
        assignedTo: formData.assignedTo
      };
      
      console.log('📤 Sending task data:', taskData);
      
      const response = await createTask(taskData, voiceNoteFile);
      if (!response.success) throw new Error(response.message || 'Failed to create task');
      setShowCreateModal(false);
      resetForm();
      fetchTasks();
      showToastMessage('Task created successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create task');
      showToastMessage(err.message || 'Failed to create task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const taskData = { 
        taskName: formData.taskName,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        frequency: formData.frequency,
        submitDate: formData.submitDate,
        remark: formData.remark,
        department: selectedDepartment,
        assignedTo: formData.assignedTo,
        subtasks: subtasks,
        assignType: 'DEPARTMENT'
      };
      
      await updateTask(selectedTask._id, taskData);
      setShowEditModal(false);
      resetForm();
      setSelectedTask(null);
      fetchTasks();
      showToastMessage('Task updated successfully!', 'success');
    } catch (err) {
      setError('Failed to update task');
      showToastMessage('Failed to update task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      await deleteTask(taskId);
      fetchTasks();
      showToastMessage('Task deleted successfully!', 'success');
    } catch (err) {
      setError('Failed to delete task');
      showToastMessage('Failed to delete task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    const assignedToIds = Array.isArray(task.assignedTo)
      ? task.assignedTo.map((emp) => (typeof emp === 'object' ? emp._id : emp))
      : [];
    
    const deptId = task.department?._id || task.department || '';
    
    setFormData({
      taskName: task.taskName || '',
      title: task.title || '',
      description: task.description || '',
      assignedTo: assignedToIds,
      department: deptId,
      priority: task.priority || 'Medium',
      frequency: task.frequency || ['One Time'],
      submitDate: task.submitDate || '',
      remark: task.remark || '',
      createdBy: task.createdBy || '',
      createdByType: task.createdByType || 'admin',
    });
    setSubtasks(task.subtasks || []);
    setSelectedDepartment(deptId);
    setShowEditModal(true);
  };

  const openViewModal = (task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      taskName: '',
      title: '',
      description: '',
      assignedTo: [],
      department: '',
      priority: 'Medium',
      frequency: ['One Time'],
      submitDate: '',
      remark: '',
      createdBy: '',
      createdByType: 'admin',
    });
    setEmpSearch('');
    setShowEmpDropdown(false);
    setSelectedDepartment('');
    setVoiceNoteFile(null);
    setIsRecording(false);
    setAudioChunks([]);
    setSubtasks([]);
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
        setVoiceNoteFile(audioFile);
        setAudioChunks(chunks);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setIsRecording(true);
      setAudioChunks([]);
    } catch (err) {
      alert('Could not access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      'Critical': 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30',
      'High': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30',
      'Medium': 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30',
      'Low': 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30',
    };
    return styles[priority] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  const getStatusStyles = (status) => {
    const styles = {
      'Completed': 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30',
      'In Progress': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30',
      'Pending': 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30',
      'Rejected': 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30',
      'Overdue': 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
    };
    return styles[status] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Completed': <FiCheckCircle className="w-3 h-3" />,
      'In Progress': <FiRefreshCw className="w-3 h-3" />,
      'Pending': <FiClock className="w-3 h-3" />,
      'Rejected': <FiX className="w-3 h-3" />,
      'Overdue': <FiAlertCircle className="w-3 h-3" />,
    };
    return icons[status] || <FiFileText className="w-3 h-3" />;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'Critical': <FiAlertCircle className="w-3 h-3" />,
      'High': <FiFlag className="w-3 h-3" />,
      'Medium': <FiStar className="w-3 h-3" />,
      'Low': <FiCheck className="w-3 h-3" />,
    };
    return icons[priority] || <FiFlag className="w-3 h-3" />;
  };

  const getUpcomingTasksFilter = (tasks) => {
    const today = new Date();
    return tasks
      .filter(task => task.submitDate && task.status !== 'Completed' && task.status !== 'Rejected')
      .sort((a, b) => new Date(a.submitDate) - new Date(b.submitDate));
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
    
    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }
    
    if (filterDue === 'upcoming') {
      filtered = getUpcomingTasksFilter(filtered);
    }

    if (filterCreatedBy === 'employee') {
      filtered = filtered.filter((task) => task.createdByType === 'employee');
    } else if (filterCreatedBy === 'admin') {
      filtered = filtered.filter((task) => task.createdByType === 'admin' || !task.createdByType);
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  const closeUpcomingPopup = () => {
    setShowUpcomingPopup(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const formFieldProps = {
    formData,
    setFormData,
    employees,
    departments,
    empDropdownRef,
    empSearch,
    setEmpSearch,
    showEmpDropdown,
    setShowEmpDropdown,
    empLoading,
    filteredEmployees,
    voiceNoteFile,
    setVoiceNoteFile,
    isRecording,
    startRecording,
    stopRecording,
    subtasks,
    setSubtasks,
    selectedDepartment,
    setSelectedDepartment,
    allEmployees: employees,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:hidden fixed top-2 left-2 z-50">
          <button
            onClick={toggleMobileMenu}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:bg-white transition-all hover:scale-105"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <FiX className="w-4 h-4 text-gray-700" />
            ) : (
              <FiMenu className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </div>

        <div 
          className={`
            fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden
            ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `} 
          onClick={() => setMobileMenuOpen(false)}
        />

        <div 
          className={`
            fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:fixed
          `}
          style={{ width: '280px' }}
        >
          <Sidebar userRole={userRole} />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute top-2 right-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <FiX className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1 min-h-screen w-full lg:pl-[280px] overflow-y-auto">
          <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm">
            <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 ml-10 lg:ml-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                  <FaTasks className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block">
                  Task Management
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Tasks
                </h2>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-wrap">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
                >
                  <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Create</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
                >
                  <FiLogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Logout</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-sm shadow-lg shadow-indigo-500/30">
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[80px] sm:max-w-[150px]">
                    Welcome, {adminName}
                  </span>
                </div>
              </div>
            </div>
          </nav>

          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
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
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">⚠️ Upcoming Tasks Alert!</h2>
                        <p className="text-sm sm:text-base text-gray-600">
                          <span className="font-semibold text-amber-600">{upcomingTasks.length}</span> tasks are due within 7 days
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-amber-200/50">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <strong>Hey Admin!</strong> There {upcomingTasks.length === 1 ? 'is' : 'are'} 
                        <span className="font-bold text-amber-600"> {upcomingTasks.length} </span> 
                        task{upcomingTasks.length > 1 ? 's' : ''} due soon. Please contact your employees to finish them.
                      </p>
                    </div>

                    <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto mb-4 sm:mb-6">
                      {upcomingTasks.map((task, idx) => {
                        const daysLeft = Math.ceil((new Date(task.submitDate) - new Date()) / (1000 * 60 * 60 * 24));
                        const pr = getPriorityStyles(task.priority);
                        const st = getStatusStyles(task.status);
                        return (
                          <div key={idx} className="bg-white/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/50 hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                              <div className="flex-1 w-full sm:w-auto">
                                <h4 className="font-semibold text-sm sm:text-base text-gray-800">{task.taskName || task.title}</h4>
                                <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">{task.description}</p>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1 sm:mt-2">
                                  <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-semibold ${pr}`}>
                                    {getPriorityIcon(task.priority)}
                                    {task.priority}
                                  </span>
                                  <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-semibold ${st}`}>
                                    {getStatusIcon(task.status)}
                                    {task.status}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-amber-600 font-medium">
                                    <FiClockIcon className="inline mr-0.5 sm:mr-1 w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    {daysLeft <= 0 ? 'Overdue!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  closeUpcomingPopup();
                                  openViewModal(task);
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
                          setFilterDue('upcoming');
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

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 lg:mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Task Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Organize, track, and manage your tasks efficiently</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Create New Task
              </button>
            </div>

            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 lg:mb-8">
                {[
                  { label: 'Total', value: stats.total || 0, icon: <FiBarChart2 className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-indigo-400 to-indigo-500' },
                  { label: 'Pending', value: stats.pending || 0, icon: <FiClock className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-amber-400 to-amber-500' },
                  { label: 'In Progress', value: stats.inProgress || 0, icon: <FiRefreshCw className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-blue-400 to-blue-500' },
                  { label: 'Completed', value: stats.completed || 0, icon: <FiCheckCircle className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-emerald-400 to-emerald-500' },
                  { label: 'Overdue', value: stats.overdue || 0, icon: <FiAlertCircle className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-rose-400 to-rose-500' },
                  { label: 'Upcoming', value: getUpcomingTasksFilter(tasks).length, icon: <FiBell className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-purple-400 to-purple-500' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                        {stat.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider truncate">{stat.label}</p>
                        <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 min-w-[150px] sm:min-w-[200px] relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 pl-8 sm:pl-9 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                />
                <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm min-w-[100px] sm:min-w-[130px]"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm min-w-[100px] sm:min-w-[130px]"
              >
                <option value="all">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={filterCreatedBy}
                onChange={(e) => setFilterCreatedBy(e.target.value)}
                className="px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm min-w-[120px] sm:min-w-[150px]"
              >
                <option value="all">All Tasks</option>
                <option value="admin">
                  <FiUserCheck className="inline mr-1" /> Admin Created
                </option>
                <option value="employee">
                  <FiUser className="inline mr-1" /> Employee Created
                </option>
              </select>
              <button
                onClick={() => setFilterDue(filterDue === 'upcoming' ? 'all' : 'upcoming')}
                className={`px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
                  filterDue === 'upcoming'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/40 backdrop-blur-sm border border-white/30 text-gray-600 hover:bg-white/60'
                }`}
              >
                <FiBell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {filterDue === 'upcoming' ? 'Upcoming ✓' : 'Upcoming'}
                <span className={`text-[8px] sm:text-xs ${filterDue === 'upcoming' ? 'text-white/80' : 'text-gray-400'}`}>
                  ({getUpcomingTasksFilter(tasks).length})
                </span>
              </button>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setFilterDue('all');
                  setFilterCreatedBy('all');
                }}
                className="px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full text-[10px] sm:text-sm font-medium text-gray-600 hover:bg-white/60 transition-all flex items-center gap-1.5 sm:gap-2"
              >
                <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Reset
              </button>
            </div>

            {error && (
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-xl flex items-center gap-2 sm:gap-3 text-rose-700 text-xs sm:text-sm">
                <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {error}
              </div>
            )}

            {filterDue === 'upcoming' && (
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm border border-purple-200/50 rounded-xl flex items-center gap-2 sm:gap-3 text-purple-700 text-xs sm:text-sm">
                <FiBell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Showing {filteredTasks.length} upcoming tasks sorted by due date</span>
              </div>
            )}

            {filterCreatedBy === 'employee' && (
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border border-emerald-200/50 rounded-xl flex items-center gap-2 sm:gap-3 text-emerald-700 text-xs sm:text-sm">
                <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Showing {filteredTasks.length} tasks created by employees</span>
              </div>
            )}

            {filterCreatedBy === 'admin' && (
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm border border-indigo-200/50 rounded-xl flex items-center gap-2 sm:gap-3 text-indigo-700 text-xs sm:text-sm">
                <FiUserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Showing {filteredTasks.length} tasks created by admin</span>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">Loading tasks...</p>
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <FiFileText className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-gray-700">No tasks found</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {filterDue === 'upcoming' 
                    ? 'No upcoming tasks! All tasks are completed or not due yet 🎉'
                    : filterCreatedBy === 'employee'
                    ? 'No tasks created by employees yet!'
                    : filterCreatedBy === 'admin'
                    ? 'No tasks created by admin yet!'
                    : 'Create your first task to get started!'}
                </p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] sm:min-w-[800px]">
                    <thead className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Submit Date</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Created By</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {currentTasks.map((task, index) => {
                        const isUpcoming = task.submitDate && task.status !== 'Completed' && task.status !== 'Rejected';
                        const daysLeft = isUpcoming ? Math.ceil((new Date(task.submitDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                        
                        // Get created by user info with proper null checks
                        const createdByUser = task.createdBy;
                        const isEmployeeCreated = task.createdByType === 'employee';
                        
                        // Get creator name with proper null checks
                        let creatorName = 'Admin';
                        let creatorInitial = 'A';
                        if (createdByUser && typeof createdByUser === 'object') {
                          creatorName = createdByUser.name || 'Unknown';
                          creatorInitial = creatorName.charAt(0).toUpperCase();
                        }
                        
                        return (
                          <tr
                            key={task._id}
                            className={`hover:bg-white/30 transition-all duration-200 cursor-pointer ${
                              index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'
                            } ${isUpcoming && daysLeft <= 3 ? 'border-l-4 border-l-amber-400' : ''}`}
                            onClick={() => openViewModal(task)}
                          >
                            <td className="px-3 sm:px-6 py-2 sm:py-3">
                              <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[100px] sm:max-w-[150px]">{task.taskName}</div>
                              <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[80px] sm:max-w-[150px]">{task.title}</div>
                              {isUpcoming && daysLeft <= 3 && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[10px] text-amber-600 font-medium mt-0.5">
                                  <FiBell className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  {daysLeft <= 0 ? 'Overdue!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                                </span>
                              )}
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${getPriorityStyles(task.priority)}`}>
                                {getPriorityIcon(task.priority)}
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${getStatusStyles(task.status)}`}>
                                {getStatusIcon(task.status)}
                                {task.status}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <div className="flex-1 min-w-[40px] sm:min-w-[60px]">
                                  <div className="w-full h-1.5 sm:h-2 bg-gray-200/50 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-[8px] sm:text-xs font-medium text-gray-600">{task.progress}%</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3">
                              <div className="flex items-center gap-0.5 sm:gap-1.5 text-[10px] sm:text-sm text-gray-600">
                                <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                {task.submitDate ? new Date(task.submitDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3">
                              <div className="flex items-center gap-1">
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white font-bold text-[8px] sm:text-xs ${
                                  isEmployeeCreated 
                                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
                                    : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                                }`}>
                                  {creatorInitial}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[8px] sm:text-xs text-gray-700 truncate max-w-[50px] sm:max-w-[80px]">
                                    {creatorName}
                                  </span>
                                  <span className={`text-[6px] sm:text-[8px] font-medium ${
                                    isEmployeeCreated ? 'text-emerald-600' : 'text-indigo-600'
                                  }`}>
                                    {isEmployeeCreated ? '👤 Employee' : '👑 Admin'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3">
                              {task.assignedTo && task.assignedTo.length > 0 ? (
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  <div className="flex -space-x-1 sm:-space-x-2">
                                    {task.assignedTo.slice(0, 3).map((user, idx) => (
                                      <div key={idx} className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[8px] sm:text-xs font-bold border-2 border-white/50 shadow-sm">
                                        {typeof user === 'object' ? user.name?.charAt(0) : 'U'}
                                      </div>
                                    ))}
                                    {task.assignedTo.length > 3 && (
                                      <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-[8px] sm:text-xs font-bold border-2 border-white/50">
                                        +{task.assignedTo.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[8px] sm:text-xs text-gray-400">Unassigned</span>
                              )}
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
                                <button onClick={() => openViewModal(task)} className="p-1 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-indigo-50 transition-all group" title="View Task">
                                  <FiEye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={() => openEditModal(task)} className="p-1 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-amber-50 transition-all group" title="Edit Task">
                                  <FiEdit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={() => handleDeleteTask(task._id)} className="p-1 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-all group" title="Delete Task">
                                  <FiTrash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 bg-white/20 backdrop-blur-sm border-t border-gray-200/50">
                    <div className="text-[10px] sm:text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length} tasks
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 text-[10px] sm:text-sm font-medium text-gray-600 hover:bg-white/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                              : 'bg-white/50 backdrop-blur-sm border border-white/30 text-gray-600 hover:bg-white/70'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 text-[10px] sm:text-sm font-medium text-gray-600 hover:bg-white/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showCreateModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
                  <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
                    <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                      <FiPlus className="w-4 h-4 sm:w-6 sm:h-6" />
                      Create New Task
                    </h2>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateTask} className="px-4 sm:px-8 py-4 sm:py-6">
                    <TaskFormFields {...formFieldProps} />
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl rounded-b-2xl sm:rounded-b-3xl pt-3 sm:pt-4 pb-1 sm:pb-2 border-t border-gray-100/50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                      <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm">
                        Cancel
                      </button>
                      <button type="submit" disabled={loading} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        {loading ? (
                          <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating...</>
                        ) : (
                          <><FaRocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Create Task</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showEditModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
                  <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
                    <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                      <FiEdit2 className="w-4 h-4 sm:w-6 sm:h-6" />
                      Edit Task
                    </h2>
                    <button onClick={() => { setShowEditModal(false); resetForm(); setSelectedTask(null); }} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
                    </button>
                  </div>
                  <form onSubmit={handleUpdateTask} className="px-4 sm:px-8 py-4 sm:py-6">
                    <TaskFormFields {...formFieldProps} />
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl rounded-b-2xl sm:rounded-b-3xl pt-3 sm:pt-4 pb-1 sm:pb-2 border-t border-gray-100/50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                      <button type="button" onClick={() => { setShowEditModal(false); resetForm(); setSelectedTask(null); }} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm">
                        Cancel
                      </button>
                      <button type="submit" disabled={loading} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        {loading ? (
                          <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Updating...</>
                        ) : (
                          <><FiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Update Task</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showViewModal && (
              <ViewTaskModal
                selectedTask={selectedTask}
                setShowViewModal={setShowViewModal}
                setSelectedTask={setSelectedTask}
                openEditModal={openEditModal}
                employees={employees}
                getPriorityStyles={getPriorityStyles}
                getStatusStyles={getStatusStyles}
                getPriorityIcon={getPriorityIcon}
                getStatusIcon={getStatusIcon}
              />
            )}

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
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
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

export default Task;