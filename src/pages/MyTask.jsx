import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { updateTaskByEmployee, getMyCreatedTasks, createTask, reportTaskIssue, getMyReportedIssues } from '../services/taskService';
import './MyTask.css';

const TASK_API = 'http://localhost:5001/api/tasks';

// ── Helpers ──────────────────────────────────────────────────────────────────
const priorityMeta = {
  Critical: { color: '#ef4444', bg: '#fef2f2', label: 'Critical' },
  High:     { color: '#f97316', bg: '#fff7ed', label: 'High'     },
  Medium:   { color: '#eab308', bg: '#fefce8', label: 'Medium'   },
  Low:      { color: '#22c55e', bg: '#f0fdf4', label: 'Low'      },
};

const statusMeta = {
  Pending:      { color: '#6366f1', bg: '#eef2ff', icon: '⏳' },
  'In Progress':{ color: '#3b82f6', bg: '#eff6ff', icon: '🔄' },
  Completed:    { color: '#10b981', bg: '#ecfdf5', icon: '✅' },
  Rejected:     { color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  Overdue:      { color: '#f97316', bg: '#fff7ed', icon: '⚠️' },
};

const issueStatusMeta = {
  Open:        { color: '#6366f1', bg: '#eef2ff', icon: '🔵' },
  'In Progress': { color: '#3b82f6', bg: '#eff6ff', icon: '🔄' },
  Resolved:    { color: '#10b981', bg: '#ecfdf5', icon: '✅' },
  Closed:      { color: '#6b7280', bg: '#f3f4f6', icon: '🔒' },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Task Row ──────────────────────────────────────────────────────────────────
function TaskRow({ task, onUpdateClick, onReportIssueClick }) {
  const st = statusMeta[task.status]  || statusMeta['Pending'];
  const pr = priorityMeta[task.priority] || priorityMeta['Medium'];

  return (
    <div className="mt-task-row">
      <div className="mt-task-main">
        <div className="mt-task-title">{task.title || task.taskName}</div>
        <div className="mt-task-desc">{task.description}</div>
        <div className="mt-task-meta">
          <span className="mt-task-due">📅 {formatDate(task.dueDate)}</span>
          {task.projectId?.projectName && (
            <span className="mt-task-project">📁 {task.projectId.projectName}</span>
          )}
        </div>
      </div>

      <div className="mt-task-badges">
        <span className="mt-badge" style={{ color: pr.color, background: pr.bg }}>
          {pr.label}
        </span>
        <span className="mt-badge" style={{ color: st.color, background: st.bg }}>
          {st.icon} {task.status}
        </span>
      </div>

      <div className="mt-task-progress">
        <div className="mt-progress-bar">
          <div
            className="mt-progress-fill"
            style={{ width: `${task.progress || 0}%`, background: pr.color }}
          />
        </div>
        <span className="mt-progress-pct">{task.progress || 0}%</span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="mt-update-btn"
          onClick={() => onUpdateClick(task)}
          title="Update Progress"
        >
          ✏️ Update
        </button>
        <button
          className="mt-report-btn"
          onClick={() => onReportIssueClick(task)}
          title="Report Issue"
        >
          ⚠️ Issue
        </button>
      </div>
    </div>
  );
}

// ── Issue Row ──────────────────────────────────────────────────────────────────
function IssueRow({ item }) {
  // Backend returns different structure for employee issues (flat) vs admin issues (nested)
  const isEmployeeIssues = item.issueId !== undefined;
  
  if (isEmployeeIssues) {
    // Employee issues structure: flat with issueId, issueTitle, etc.
    const pr = priorityMeta[item.issuePriority] || priorityMeta['Medium'];
    const st = issueStatusMeta[item.issueStatus] || issueStatusMeta['Open'];

    return (
      <div className="mt-task-row">
        <div className="mt-task-main">
          <div className="mt-task-title">{item.issueTitle || 'No Title'}</div>
          <div className="mt-task-desc">{item.issueDescription || 'No description'}</div>
          <div className="mt-task-meta">
            <span className="mt-task-due">📋 Task: {item.taskName || item.title || 'N/A'}</span>
            <span className="mt-task-due">📅 {formatDate(item.reportedAt)}</span>
          </div>
        </div>

        <div className="mt-task-badges">
          <span className="mt-badge" style={{ color: pr.color, background: pr.bg }}>
            {pr.label}
          </span>
          <span className="mt-badge" style={{ color: st.color, background: st.bg }}>
            {st.icon} {item.issueStatus}
          </span>
        </div>

        <div className="mt-task-progress">
          <div className="mt-progress-bar">
            <div
              className="mt-progress-fill"
              style={{ width: '100%', background: pr.color }}
            />
          </div>
          <span className="mt-progress-pct">Issue</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="mt-badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>
            Reported by you
          </span>
        </div>
      </div>
    );
  } else {
    // Admin issues structure: nested with issue: {...}
    const issue = item.issue || {};
    const pr = priorityMeta[issue.priority] || priorityMeta['Medium'];
    const st = issueStatusMeta[issue.status] || issueStatusMeta['Open'];

    return (
      <div className="mt-task-row">
        <div className="mt-task-main">
          <div className="mt-task-title">{issue.issueTitle || 'No Title'}</div>
          <div className="mt-task-desc">{issue.issueDescription || 'No description'}</div>
          <div className="mt-task-meta">
            <span className="mt-task-due">📋 Task: {item.taskName || item.title || 'N/A'}</span>
            <span className="mt-task-due">📅 {formatDate(issue.reportedAt)}</span>
          </div>
        </div>

        <div className="mt-task-badges">
          <span className="mt-badge" style={{ color: pr.color, background: pr.bg }}>
            {pr.label}
          </span>
          <span className="mt-badge" style={{ color: st.color, background: st.bg }}>
            {st.icon} {issue.status}
          </span>
        </div>

        <div className="mt-task-progress">
          <div className="mt-progress-bar">
            <div
              className="mt-progress-fill"
              style={{ width: '100%', background: pr.color }}
            />
          </div>
          <span className="mt-progress-pct">Issue</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="mt-badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>
            Reported by you
          </span>
        </div>
      </div>
    );
  }
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function MyTask() {
  const navigate = useNavigate();
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId]  = useState('');
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch]     = useState('');
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
  const [taskTab, setTaskTab] = useState('assigned'); // 'assigned', 'created', or 'issues'
  const [createdTasks, setCreatedTasks] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTaskForReport, setSelectedTaskForReport] = useState(null);
  const [reportData, setReportData] = useState({
    issueTitle: '',
    issueDescription: '',
    priority: 'Medium'
  });
  const [reportLoading, setReportLoading] = useState(false);

  // ── Auth guard + load user ──
  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) { navigate('/'); return; }

    try {
      const d = JSON.parse(raw);

      // ── Debug: log the full stored object so we can see its shape
      console.log('[MyTask] localStorage userData:', d);

      // ── Name extraction (try multiple nesting patterns)
      const name =
        d.fullName ||
        d.name ||
        d.employeeName ||
        d.username ||
        d.firstName ||
        d.employee?.name ||
        d.employee?.fullName ||
        d.user?.name ||
        d.data?.name ||
        'Employee';

      // ── MongoDB _id extraction
      // Login response shape: { success, message, employee: { id, name, employeeId, ... } }
      // The MongoDB ObjectId is at d.employee.id  (or d.employee._id)
      const id =
        d.employee?._id ||
        d.employee?.id ||
        d._id ||
        d.id ||
        d.userId ||
        d.user?._id ||
        d.data?._id ||
        '';

      console.log('[MyTask] resolved employeeId (MongoDB _id):', id);

      setName(name);
      setEmpId(id);
    } catch (err) {
      console.error('[MyTask] Failed to parse userData:', err);
      navigate('/');
    }
  }, [navigate]);

  // ── Fetch tasks ──
  const fetchTasks = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      console.log('[MyTask] Fetching tasks for MongoDB _id:', employeeId);
      const res  = await axios.get(`${TASK_API}/my-assigned-tasks/${employeeId}`);
      const data = res.data;
      console.log('[MyTask] API response:', data);
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      console.error('[MyTask] Fetch error:', err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        'Failed to load tasks. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const fetchCreatedTasks = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getMyCreatedTasks(employeeId);
      setCreatedTasks(Array.isArray(res) ? res : res.tasks || []);
    } catch (err) {
      console.error('[MyTask] Fetch created tasks error:', err);
      setError('Failed to load created tasks');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const fetchMyIssues = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getMyReportedIssues(employeeId);
      console.log('My issues response:', res);
      let issuesData = [];
      if (Array.isArray(res)) {
        issuesData = res;
      } else if (res.issues && Array.isArray(res.issues)) {
        issuesData = res.issues;
      } else if (res.data && Array.isArray(res.data)) {
        issuesData = res.data;
      }
      setMyIssues(issuesData);
    } catch (err) {
      console.error('[MyTask] Fetch my issues error:', err);
      setError('Failed to load my issues');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (taskTab === 'assigned') {
      fetchTasks();
    } else if (taskTab === 'created') {
      fetchCreatedTasks();
    } else if (taskTab === 'issues') {
      fetchMyIssues();
    }
  }, [taskTab, fetchTasks, fetchCreatedTasks, fetchMyIssues]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleUpdateClick = (task) => {
    setSelectedTask(task);
    setUpdateData({
      updateText: '',
      progress: task.progress || 0,
      remark: '',
      expenses: []
    });
    setAttachments([]);
    setShowUpdateModal(true);
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
      // Refresh tasks to show updated issues
      if (taskTab === 'assigned') {
        fetchTasks();
      } else if (taskTab === 'created') {
        fetchCreatedTasks();
      } else if (taskTab === 'issues') {
        fetchMyIssues();
      }
    } catch (err) {
      setError('Failed to report issue');
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    try {
      // Use the employeeId that's already extracted in the useEffect
      console.log('Using employeeId from state:', employeeId);

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

      console.log('Creating task with data:', taskData);
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
      fetchCreatedTasks();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create task';
      setError(errorMessage);
      console.error('Create task error:', err.response?.data || err);
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Filter ──
  const currentTasks = taskTab === 'assigned' ? tasks : taskTab === 'created' ? createdTasks : myIssues;
  const filtered = currentTasks.filter((t) => {
    if (taskTab === 'issues') {
      // Filter issues - handle both employee (flat) and admin (nested) structures
      const isEmployeeIssues = t.issueId !== undefined;
      const issueStatus = isEmployeeIssues ? t.issueStatus : t.issue?.status;
      const issueTitle = isEmployeeIssues ? t.issueTitle : t.issue?.issueTitle;
      const issueDescription = isEmployeeIssues ? t.issueDescription : t.issue?.issueDescription;
      
      const matchStatus = filterStatus === 'ALL' || issueStatus === filterStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (issueTitle || '').toLowerCase().includes(q) ||
        (issueDescription || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    } else {
      // Filter tasks
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (t.title || t.taskName || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    }
  });

  // ── Status counts ──
  const counts = {
    ALL:          currentTasks.length,
    Pending:      currentTasks.filter((t) => t.status === 'Pending').length,
    'In Progress':currentTasks.filter((t) => t.status === 'In Progress').length,
    Completed:    currentTasks.filter((t) => t.status === 'Completed').length,
    Overdue:      currentTasks.filter((t) => t.status === 'Overdue').length,
    Rejected:     currentTasks.filter((t) => t.status === 'Rejected').length,
    Open:         currentTasks.filter((t) => t.issueId !== undefined ? t.issueStatus === 'Open' : t.issue?.status === 'Open').length,
    Resolved:     currentTasks.filter((t) => t.issueId !== undefined ? t.issueStatus === 'Resolved' : t.issue?.status === 'Resolved').length,
  };

  return (
    <div className="mt-root">
      <EmployeeSidebar employeeName={employeeName} onLogout={handleLogout} />

      <main className="mt-main">

        {/* ── Top Bar ── */}
        <header className="mt-topbar">
          <div className="mt-topbar-left">
            <h1 className="mt-topbar-title">📋 My Tasks</h1>
            <span className="mt-topbar-sub">
              {currentTasks.length} {taskTab === 'issues' ? 'issue' : 'task'}{currentTasks.length !== 1 ? 's' : ''} {taskTab === 'assigned' ? 'assigned' : taskTab === 'created' ? 'created' : 'reported'}
            </span>
          </div>
          <div className="mt-topbar-right">
            <div className="mt-tab-switcher">
              <button
                className={`mt-tab-btn ${taskTab === 'assigned' ? 'mt-tab-active' : ''}`}
                onClick={() => setTaskTab('assigned')}
              >
                Assigned
              </button>
              <button
                className={`mt-tab-btn ${taskTab === 'created' ? 'mt-tab-active' : ''}`}
                onClick={() => setTaskTab('created')}
              >
                Created
              </button>
              <button
                className={`mt-tab-btn ${taskTab === 'issues' ? 'mt-tab-active' : ''}`}
                onClick={() => setTaskTab('issues')}
              >
                Issues
              </button>
            </div>
            {taskTab === 'created' && (
              <button
                className="mt-create-btn"
                onClick={() => setShowCreateModal(true)}
                title="Create Self Task"
              >
                + Create Task
              </button>
            )}
            <button className="mt-refresh-btn" onClick={() => taskTab === 'assigned' ? fetchTasks() : taskTab === 'created' ? fetchCreatedTasks() : fetchMyIssues()} title="Refresh">
              ↻ Refresh
            </button>
            <div className="mt-topbar-avatar">{getInitials(employeeName)}</div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="mt-content">

          {/* Toolbar */}
          <div className="mt-toolbar">
            <input
              className="mt-search"
              placeholder={taskTab === 'issues' ? '🔍 Search issues…' : '🔍 Search tasks…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-filter-tabs">
              {taskTab === 'issues' ? (
                // Issue status filters
                ['ALL', 'Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                  <button
                    key={s}
                    className={`mt-filter-tab${filterStatus === s ? ' mt-active' : ''}`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s === 'ALL' ? '📌 All' : `${issueStatusMeta[s]?.icon || ''} ${s}`}
                    <span className="mt-filter-count">{counts[s]}</span>
                  </button>
                ))
              ) : (
                // Task status filters
                ['ALL', 'Pending', 'In Progress', 'Completed', 'Overdue', 'Rejected'].map((s) => (
                  <button
                    key={s}
                    className={`mt-filter-tab${filterStatus === s ? ' mt-active' : ''}`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s === 'ALL' ? '📌 All' : `${statusMeta[s]?.icon || ''} ${s}`}
                    <span className="mt-filter-count">{counts[s]}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Error */}
          {error && <div className="mt-error">{error}</div>}

          {/* Tasks/Issues Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {taskTab === 'issues' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported At</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={taskTab === 'issues' ? 5 : 7} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={taskTab === 'issues' ? 5 : 7} className="px-6 py-4 text-center text-gray-500">No {taskTab === 'issues' ? 'issues' : 'tasks'} found</td></tr>
                  ) : taskTab === 'issues' ? (
                    filtered.map((item, index) => {
                      const isEmployeeIssues = item.issueId !== undefined;
                      const issueTitle = isEmployeeIssues ? item.issueTitle : item.issue?.issueTitle;
                      const taskName = isEmployeeIssues ? item.taskName : item.taskName || item.title;
                      const priority = isEmployeeIssues ? item.issuePriority : item.issue?.priority;
                      const status = isEmployeeIssues ? item.issueStatus : item.issue?.status;
                      const reportedAt = isEmployeeIssues ? item.reportedAt : item.issue?.reportedAt;
                      const pr = priorityMeta[priority] || priorityMeta['Medium'];
                      const st = issueStatusMeta[status] || issueStatusMeta['Open'];
                      
                      return (
                        <tr key={item.issueId || item.issue?.issueId || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{issueTitle || 'No Title'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{taskName || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`} style={{ color: pr.color, background: pr.bg }}>
                              {pr.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`} style={{ color: st.color, background: st.bg }}>
                              {st.icon} {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reportedAt ? new Date(reportedAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    filtered.map((t) => {
                      const st = statusMeta[t.status] || statusMeta['Pending'];
                      const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
                      return (
                        <tr key={t._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.taskName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`} style={{ color: pr.color, background: pr.bg }}>
                              {pr.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`} style={{ color: st.color, background: st.bg }}>
                              {st.icon} {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${t.progress || 0}%` }}></div>
                            </div>
                            <span className="text-xs">{t.progress || 0}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => handleUpdateClick(t)} className="text-blue-600 hover:text-blue-900 mr-3">Update</button>
                            <button onClick={() => handleReportIssueClick(t)} className="text-orange-600 hover:text-orange-900">Issue</button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Update Progress Modal */}
        {showUpdateModal && selectedTask && (
          <div className="mt-modal-overlay" onClick={() => setShowUpdateModal(false)}>
            <div className="mt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="mt-modal-header">
                <h3>Update Task Progress</h3>
                <button 
                  className="mt-modal-close"
                  onClick={() => setShowUpdateModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdateSubmit} className="mt-modal-body">
                <div className="mt-form-group">
                  <label>Task</label>
                  <input 
                    type="text" 
                    value={selectedTask.title || selectedTask.taskName}
                    disabled
                    className="mt-form-input mt-form-input-disabled"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Update Text *</label>
                  <textarea
                    required
                    value={updateData.updateText}
                    onChange={(e) => setUpdateData({...updateData, updateText: e.target.value})}
                    placeholder="Describe your progress..."
                    rows="3"
                    className="mt-form-input"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Progress: {updateData.progress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={updateData.progress}
                    onChange={(e) => setUpdateData({...updateData, progress: parseInt(e.target.value)})}
                    className="mt-form-range"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Remark</label>
                  <textarea
                    value={updateData.remark}
                    onChange={(e) => setUpdateData({...updateData, remark: e.target.value})}
                    placeholder="Any additional remarks..."
                    rows="2"
                    className="mt-form-input"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Attachments (Optional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="mt-form-input"
                  />
                  {attachments.length > 0 && (
                    <p className="mt-file-count">{attachments.length} file(s) selected</p>
                  )}
                </div>

                <div className="mt-modal-footer">
                  <button 
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="mt-btn mt-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={updateLoading}
                    className="mt-btn mt-btn-primary"
                  >
                    {updateLoading ? 'Updating...' : 'Update Progress'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Self Task Modal */}
        {showCreateModal && (
          <div className="mt-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="mt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="mt-modal-header">
                <h3>Create Self Task</h3>
                <button 
                  className="mt-modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateTask} className="mt-modal-body">
                <div className="mt-form-group">
                  <label>Task Name *</label>
                  <input
                    type="text"
                    required
                    value={createData.taskName}
                    onChange={(e) => setCreateData({...createData, taskName: e.target.value})}
                    placeholder="Enter task name"
                    className="mt-form-input"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={createData.title}
                    onChange={(e) => setCreateData({...createData, title: e.target.value})}
                    placeholder="Enter task title"
                    className="mt-form-input"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Description *</label>
                  <textarea
                    required
                    value={createData.description}
                    onChange={(e) => setCreateData({...createData, description: e.target.value})}
                    placeholder="Describe the task..."
                    rows="3"
                    className="mt-form-input"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Priority</label>
                  <select
                    value={createData.priority}
                    onChange={(e) => setCreateData({...createData, priority: e.target.value})}
                    className="mt-form-input"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="mt-form-group">
                  <label>Deadline Type</label>
                  <select
                    value={createData.deadlineType}
                    onChange={(e) => setCreateData({...createData, deadlineType: e.target.value})}
                    className="mt-form-input"
                  >
                    <option value="Days">Days</option>
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                  </select>
                </div>

                <div className="mt-form-group">
                  <label>Deadline Value</label>
                  <input
                    type="number"
                    min="1"
                    value={createData.deadlineValue}
                    onChange={(e) => setCreateData({...createData, deadlineValue: parseInt(e.target.value)})}
                    className="mt-form-input"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Remark</label>
                  <textarea
                    value={createData.remark}
                    onChange={(e) => setCreateData({...createData, remark: e.target.value})}
                    placeholder="Any additional remarks..."
                    rows="2"
                    className="mt-form-input"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Voice Note (Optional)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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

                <div className="mt-modal-footer">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="mt-btn mt-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createLoading}
                    className="mt-btn mt-btn-primary"
                  >
                    {createLoading ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Issue Modal */}
        {showReportModal && selectedTaskForReport && (
          <div className="mt-modal-overlay" onClick={() => setShowReportModal(false)}>
            <div className="mt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="mt-modal-header">
                <h3>Report Issue</h3>
                <button 
                  className="mt-modal-close"
                  onClick={() => setShowReportModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleReportSubmit} className="mt-modal-body">
                <div className="mt-form-group">
                  <label>Task</label>
                  <input 
                    type="text" 
                    value={selectedTaskForReport.title || selectedTaskForReport.taskName}
                    disabled
                    className="mt-form-input mt-form-input-disabled"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Issue Title *</label>
                  <input
                    type="text"
                    required
                    value={reportData.issueTitle}
                    onChange={(e) => setReportData({...reportData, issueTitle: e.target.value})}
                    placeholder="Brief title of the issue"
                    className="mt-form-input"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Issue Description *</label>
                  <textarea
                    required
                    value={reportData.issueDescription}
                    onChange={(e) => setReportData({...reportData, issueDescription: e.target.value})}
                    placeholder="Describe the issue in detail..."
                    rows="3"
                    className="mt-form-input"
                  />
                </div>

                <div className="mt-form-group">
                  <label>Priority</label>
                  <select
                    value={reportData.priority}
                    onChange={(e) => setReportData({...reportData, priority: e.target.value})}
                    className="mt-form-input"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="mt-modal-footer">
                  <button 
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="mt-btn mt-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={reportLoading}
                    className="mt-btn mt-btn-primary"
                  >
                    {reportLoading ? 'Submitting...' : 'Report Issue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyTask;