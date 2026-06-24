import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Sidebar';
import '../Sidebar.css';
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../services/taskService';

const EMPLOYEES_API = 'https://api.timelyhealth.in/api/employees/get-employees';

function Task() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const userRole = localStorage.getItem('userRole') || 'admin';
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Employee state
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);
  const empDropdownRef = useRef(null);

  // Departments state
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      const name =
        parsedData.name ||
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (empDropdownRef.current && !empDropdownRef.current.contains(e.target)) {
        setShowEmpDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    taskName: '',
    title: '',
    description: '',
    assignType: 'INDIVIDUAL',
    assignedTo: [],
    department: '',
    priority: 'Medium',
    deadlineType: 'Days',
    deadlineValue: 7,
    frequency: 'One Time',
    remark: '',
    createdBy: '',
    createdByType: 'admin',
  });
  const [voiceNoteFile, setVoiceNoteFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  // Fetch employees & departments when modal opens
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      fetchEmployees();
      fetchDepartments();
    }
  }, [showCreateModal, showEditModal]);

  // When assignType changes to ALL, auto-fill all employee IDs
  useEffect(() => {
    if (formData.assignType === 'ALL' && employees.length > 0) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: employees.map((e) => e._id),
      }));
    } else if (formData.assignType !== 'INDIVIDUAL' && formData.assignType !== 'DEPARTMENT') {
      setFormData((prev) => ({ ...prev, assignedTo: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.assignType, employees]);

  // When department changes, auto-assign employees from that department
  useEffect(() => {
    if (formData.assignType === 'DEPARTMENT' && formData.department && employees.length > 0) {
      const deptEmployees = employees.filter(emp => emp.department === formData.department || emp.departmentId === formData.department);
      setFormData((prev) => ({
        ...prev,
        assignedTo: deptEmployees.map(e => e._id),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.department, formData.assignType, employees]);

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
      const employees = Array.isArray(res.data) ? res.data : res.data.employees || [];
      
      // Extract unique departments from employees
      const uniqueDepartments = [];
      const departmentMap = new Map();
      
      employees.forEach(emp => {
        const deptName = emp.department || emp.departmentName;
        if (deptName && !departmentMap.has(deptName)) {
          departmentMap.set(deptName, {
            _id: deptName, // Use department name as ID for matching
            name: deptName
          });
        }
      });
      
      setDepartments(Array.from(departmentMap.values()));
    } catch (err) {
      console.error('Failed to fetch departments from employees API', err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getAllTasks();
      setTasks(response.tasks || []);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getTaskStats();
      setStats(response);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  // Employee helpers
  const filteredEmployees = employees.filter((emp) => {
    const q = empSearch.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.role?.toLowerCase().includes(q)
    );
  });

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

  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e._id === id);
    return emp ? `${emp.name} (${emp.employeeId})` : id;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = localStorage.getItem('userData');
      let userId = '';
      if (userData) {
        const parsedData = JSON.parse(userData);
        userId =
          parsedData._id ||
          parsedData.id ||
          parsedData.userId ||
          parsedData.adminId ||
          '';
      }

      const taskData = {
        ...formData,
        createdBy: userId,
        createdByType: userRole,
      };

      const response = await createTask(taskData, voiceNoteFile);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create task');
      }

      setShowCreateModal(false);
      resetForm();
      setVoiceNoteFile(null);
      fetchTasks();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTask(selectedTask._id, formData);
      setShowEditModal(false);
      resetForm();
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
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
      fetchStats();
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
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
    // Extract IDs from assignedTo if they are objects
    const assignedToIds = Array.isArray(task.assignedTo) 
      ? task.assignedTo.map(emp => typeof emp === 'object' ? emp._id : emp)
      : [];
    
    setFormData({
      taskName: task.taskName || '',
      title: task.title || '',
      description: task.description || '',
      assignType: task.assignType || 'INDIVIDUAL',
      assignedTo: assignedToIds,
      department: task.department || '',
      priority: task.priority || 'Medium',
      deadlineType: task.deadlineType || 'Days',
      deadlineValue: task.deadlineValue || 7,
      frequency: task.frequency || 'One Time',
      remark: task.remark || '',
      createdBy: task.createdBy || '',
      createdByType: task.createdByType || 'admin',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      taskName: '',
      title: '',
      description: '',
      assignType: 'INDIVIDUAL',
      assignedTo: [],
      department: '',
      priority: 'Medium',
      deadlineType: 'Days',
      deadlineValue: 7,
      frequency: 'One Time',
      remark: '',
      createdBy: '',
      createdByType: 'admin',
    });
    setEmpSearch('');
    setShowEmpDropdown(false);
    setVoiceNoteFile(null);
    setIsRecording(false);
    setAudioChunks([]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Overdue': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ── Employee Selector Component (inline) ──────────────────────────────────
  const EmployeeSelector = () => (
    <div ref={empDropdownRef} style={{ position: 'relative' }}>
      {/* Selected employees chips */}
      {formData.assignedTo.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px',
          marginBottom: '8px', padding: '8px',
          border: '1px solid #e5e7eb', borderRadius: '8px',
          background: '#f9fafb', minHeight: '40px'
        }}>
          {formData.assignedTo.map((id) => (
            <span key={id} style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: '#dbeafe', color: '#1d4ed8',
              padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500
            }}>
              {getEmployeeName(id)}
              <button
                type="button"
                onClick={() => removeEmployee(id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', fontWeight: 'bold', fontSize: '14px', lineHeight: 1 }}
              >×</button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <input
        type="text"
        placeholder={empLoading ? 'Loading employees...' : '🔍 Search by name, ID, department or role...'}
        value={empSearch}
        onChange={(e) => { setEmpSearch(e.target.value); setShowEmpDropdown(true); }}
        onFocus={() => setShowEmpDropdown(true)}
        disabled={empLoading}
        style={{
          width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
          borderRadius: '8px', fontSize: '14px', outline: 'none',
          boxSizing: 'border-box'
        }}
      />

      {/* Dropdown list */}
      {showEmpDropdown && (
        <div style={{
          position: 'absolute', zIndex: 100, top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '260px', overflowY: 'auto'
        }}>
          {filteredEmployees.length === 0 ? (
            <div style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
              No employees found
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const selected = formData.assignedTo.includes(emp._id);
              return (
                <div
                  key={emp._id}
                  onClick={() => toggleEmployee(emp._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', cursor: 'pointer',
                    background: selected ? '#eff6ff' : 'transparent',
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Checkbox */}
                  <span style={{
                    width: '18px', height: '18px', border: selected ? 'none' : '2px solid #d1d5db',
                    borderRadius: '4px', background: selected ? '#2563eb' : '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {selected && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                  </span>

                  {/* Avatar */}
                  <span style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '13px', flexShrink: 0
                  }}>
                    {emp.name?.charAt(0).toUpperCase()}
                  </span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {emp.employeeId} · {emp.department} · {emp.role}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600,
                    background: emp.status === 'active' ? '#dcfce7' : '#f3f4f6',
                    color: emp.status === 'active' ? '#16a34a' : '#6b7280',
                    flexShrink: 0
                  }}>
                    {emp.status || 'N/A'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
        {formData.assignedTo.length > 0
          ? `${formData.assignedTo.length} employee(s) selected`
          : 'No employees selected'}
      </div>
    </div>
  );

  // ── Task Form Fields (shared between Create & Edit) ───────────────────────
  const TaskFormFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
        <input
          type="text"
          required
          value={formData.taskName}
          onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="3"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Assign Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Type</label>
          <select
            value={formData.assignType}
            onChange={(e) => {
              setEmpSearch('');
              setShowEmpDropdown(false);
              setFormData({ ...formData, assignType: e.target.value, assignedTo: [] });
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="ALL">All Employees</option>
            <option value="DEPARTMENT">Department</option>
            <option value="SELF">Self</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Employee Selector — shown only for INDIVIDUAL */}
      {formData.assignType === 'INDIVIDUAL' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To Employees
          </label>
          <EmployeeSelector />
        </div>
      )}

      {/* ALL info banner */}
      {formData.assignType === 'ALL' && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>👥</span>
          <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 500 }}>
            This task will be assigned to all <strong>{employees.length}</strong> employees.
          </span>
        </div>
      )}

      {/* Department selector — sends ObjectId, displays name */}
      {formData.assignType === 'DEPARTMENT' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Department --</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
          {departments.length === 0 && (
            <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
              ⚠ No departments found. Please add departments before assigning by department.
            </p>
          )}
          {formData.department && (
            <div style={{
              background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
              marginTop: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>🏢</span>
              <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 500 }}>
                This task will be assigned to <strong>{formData.assignedTo.length}</strong> employee(s) in this department.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Type</label>
          <select
            value={formData.deadlineType}
            onChange={(e) => setFormData({ ...formData, deadlineType: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Days">Days</option>
            <option value="Week">Week</option>
            <option value="Month">Month</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Value</label>
          <input
            type="number"
            value={formData.deadlineValue}
            onChange={(e) => setFormData({ ...formData, deadlineValue: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
        <select
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="One Time">One Time</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
        <textarea
          value={formData.remark}
          onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
          rows="2"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Voice Note (Optional)</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#6366f1',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🎤 Start Recording
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⏹️ Stop Recording
            </button>
          )}
          {voiceNoteFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <audio controls src={URL.createObjectURL(voiceNoteFile)} style={{ height: '32px' }} />
              <button
                type="button"
                onClick={() => setVoiceNoteFile(null)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #ef4444',
                  background: '#fff',
                  color: '#ef4444',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        {isRecording && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
            Recording...
          </p>
        )}
      </div>
    </>
  );

  return (
    <div className="dashboard-container">
      <Sidebar userRole={userRole} />
      <div className="main-content">
        <nav className="dashboard-navbar">
          <div className="navbar-brand">
            <h2>Task Management System</h2>
          </div>
          <div className="navbar-user">
            <span className="user-name">Welcome, {adminName}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </nav>

        <div className="dashboard-content">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create Task
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue || 0}</p>
              </div>
            </div>
          )}

          {/* Tasks Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                  ) : tasks.length === 0 ? (
                    <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No tasks found</td></tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.taskName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                          </div>
                          <span className="text-xs">{task.progress}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => openEditModal(task)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button onClick={() => handleDeleteTask(task._id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Task Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <TaskFormFields />
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setShowCreateModal(false); resetForm(); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Task Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
                <form onSubmit={handleUpdateTask} className="space-y-4">
                  <TaskFormFields />
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setShowEditModal(false); resetForm(); setSelectedTask(null); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Task'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Task;