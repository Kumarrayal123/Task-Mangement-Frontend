import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiX, FiEye, FiEdit2, FiTrash2, FiRefreshCw, FiFilter, 
  FiAlertCircle, FiClock, FiUser, FiBriefcase, FiCalendar, 
  FiFlag, FiCheckCircle, FiPlus, FiMoreVertical, FiMail, 
  FiHash, FiAlertTriangle, FiCheck, FiCircle, FiInfo,
  FiStar, FiBarChart2, FiList, FiTool, FiLogOut, FiMenu,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { FaTasks, FaRocket } from 'react-icons/fa';
import Navbar from '../Navbar';
import '../AdminDashboard.css';
import { getAllReportedIssues, updateReportedIssue, deleteReportedIssue } from '../services/taskService';

const priorityMeta = {
  Critical: { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiAlertCircle className="w-4 h-4" /> },
  High:     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiFlag className="w-4 h-4" /> },
  Medium:   { color: '#eab308', bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-200/50', icon: <FiStar className="w-4 h-4" /> },
  Low:      { color: '#22c55e', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheck className="w-4 h-4" /> },
};

const statusMeta = {
  'Open':        { color: '#6366f1', bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-200/50', icon: <FiCircle className="w-4 h-4" /> },
  'In Progress': { color: '#3b82f6', bg: 'bg-blue-50/80', text: 'text-blue-600', border: 'border-blue-200/50', icon: <FiRefreshCw className="w-4 h-4" /> },
  'Resolved':    { color: '#10b981', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-4 h-4" /> },
  'Closed':      { color: '#6b7280', bg: 'bg-gray-50/80', text: 'text-gray-600', border: 'border-gray-200/50', icon: <FiX className="w-4 h-4" /> },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function Issues() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewIssue, setViewIssue] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentDateTime, setCurrentDateTime] = useState('');

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
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        const name = parsed.adminName || parsed.name || parsed.fullName || 'Admin';
        setAdminName(name);
      } catch (err) {
        console.error('Failed to parse userData:', err);
      }
    }
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllReportedIssues();
      let issuesData = [];
      if (Array.isArray(response)) {
        issuesData = response;
      } else if (response.issues && Array.isArray(response.issues)) {
        issuesData = response.issues;
      } else if (response.data && Array.isArray(response.data)) {
        issuesData = response.data;
      }
      setIssues(issuesData);
    } catch (err) {
      setError('Failed to load issues');
      console.error('Fetch issues error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const taskId = selectedIssue.taskId;
      const issueId = selectedIssue.issue.issueId;
      const updateData = {
        status: editStatus,
        priority: editPriority
      };
      await updateReportedIssue(taskId, issueId, updateData);
      setShowEditModal(false);
      setSelectedIssue(null);
      fetchIssues();
      showToastMessage('Issue updated successfully!', 'success');
    } catch (err) {
      setError('Failed to update issue');
      showToastMessage('Failed to update issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIssue = async (taskId, issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    setLoading(true);
    try {
      await deleteReportedIssue(taskId, issueId);
      fetchIssues();
      showToastMessage('Issue deleted successfully!', 'success');
    } catch (err) {
      setError('Failed to delete issue');
      showToastMessage('Failed to delete issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setSelectedIssue(item);
    setEditStatus(item.issue.status || 'Open');
    setEditPriority(item.issue.priority || 'Medium');
    setShowEditModal(true);
  };

  const openViewModal = (item) => {
    setViewIssue(item);
    setShowViewModal(true);
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filtered = issues.filter((item) => {
    const issue = item.issue || {};
    const matchStatus = filterStatus === 'ALL' || issue.status === filterStatus;
    const matchPriority = filterPriority === 'ALL' || issue.priority === filterPriority;
    return matchStatus && matchPriority;
  });

  const counts = {
    ALL: issues.length,
    Open: issues.filter((i) => i.issue?.status === 'Open').length,
    'In Progress': issues.filter((i) => i.issue?.status === 'In Progress').length,
    Resolved: issues.filter((i) => i.issue?.status === 'Resolved').length,
    Closed: issues.filter((i) => i.issue?.status === 'Closed').length,
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIssues = filtered.slice(startIndex, endIndex);

  // View Issue Modal
  const ViewIssueModal = ({ issue, onClose }) => {
    if (!issue) return null;
    const pr = priorityMeta[issue.issue.priority] || priorityMeta['Medium'];
    const st = statusMeta[issue.issue.status] || statusMeta['Open'];

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
              <FiAlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
              Issue Details
            </h2>
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
            </button>
          </div>
          <div className="px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-4">
              <div className="w-full sm:w-auto">
                <h3 className="text-base sm:text-xl font-bold text-gray-800">{issue.issue.issueTitle}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Task: {issue.taskName}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
                  {pr.icon}
                  {issue.issue.priority}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                  {st.icon}
                  {issue.issue.status}
                </span>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <FiInfo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Description
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                {issue.issue.issueDescription || 'No description provided'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Employee
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">
                  {issue.issue.employee?.employeeId || 'N/A'}
                </p>
                {issue.issue.employee?.email && (
                  <p className="text-[10px] sm:text-xs text-gray-500">{issue.issue.employee.email}</p>
                )}
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  <FiCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Reported At
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">
                  {formatDate(issue.issue.reportedAt)}
                </p>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  <FiBriefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Task Priority
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">{issue.priority || 'N/A'}</p>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  <FiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Task Due Date
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">
                  {issue.dueDate ? formatDate(issue.dueDate) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50">
              <button onClick={onClose} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-xs sm:text-sm text-gray-700 font-medium hover:bg-gray-200 transition-all">
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  openEditModal(issue);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
              >
                <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                Edit Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ─── Horizontal Top Navbar ─── */}
      <Navbar userRole="admin" onLogout={handleLogout} />

      {/* ─── Main Content Area (Full Width Layout) ─── */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="admin-dash">

          {/* Header Section */}
          <div className="admin-dash__header">
            <div>
              <h1 className="admin-dash__greeting flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5 text-indigo-600" /> Reported <span>Issues</span>
              </h1>
              <p className="admin-dash__subtitle">
                Track, review, and manage all workforce reported task issues in one place.
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-700 font-semibold text-xs">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDateTime}</span>
              </div>
              
              <button
                onClick={fetchIssues}
                disabled={loading}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-sm"
                title="Refresh Issues"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="space-y-6">

            {/* Error Message */}
            {error && (
              <div className="p-3 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 sm:gap-3 text-rose-700 text-xs sm:text-sm">
                <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {error}
              </div>
            )}

            {/* 5 KPI Summary Stat Cards */}
            <div className="admin-dash__stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div className="admin-dash__stat cursor-pointer" onClick={() => setFilterStatus('ALL')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Total Issues</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                    <FiBarChart2 />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.ALL}</div>
                <div className="admin-dash__stat-meta">all reported issues</div>
              </div>

              <div className="admin-dash__stat cursor-pointer" onClick={() => setFilterStatus('Open')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Open</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                    <FiCircle />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.Open}</div>
                <div className="admin-dash__stat-meta">needs investigation</div>
              </div>

              <div className="admin-dash__stat cursor-pointer" onClick={() => setFilterStatus('In Progress')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">In Progress</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                    <FiRefreshCw />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts['In Progress']}</div>
                <div className="admin-dash__stat-meta">being addressed</div>
              </div>

              <div className="admin-dash__stat cursor-pointer" onClick={() => setFilterStatus('Resolved')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Resolved</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                    <FiCheckCircle />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.Resolved}</div>
                <div className="admin-dash__stat-meta">successfully solved</div>
              </div>

              <div className="admin-dash__stat cursor-pointer" onClick={() => setFilterStatus('Closed')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Closed</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
                    <FiX />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.Closed}</div>
                <div className="admin-dash__stat-meta">archived issues</div>
              </div>

            </div>

            {/* Main Content Card Container */}
            <div className="admin-dash__card">
              <div className="admin-dash__card-header">
                <div>
                  <h3 className="admin-dash__card-title">Issue Directory</h3>
                  <p className="admin-dash__card-desc">Filter, review, and resolve task issues reported by employees</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {filtered.length} Issues Found
                  </span>
                </div>
              </div>

              <div className="admin-dash__card-body space-y-4">
                
                {/* Search & Filters */}
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <div className="flex-1 min-w-[140px] sm:min-w-[200px] relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                    >
                      <option value="ALL">All Status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[140px] sm:min-w-[200px] relative">
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                    >
                      <option value="ALL">All Priority</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <button
                    onClick={() => { setFilterStatus('ALL'); setFilterPriority('ALL'); }}
                    className="px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-1.5"
                  >
                    <FiRefreshCw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 scrollbar-hide">
                  {Object.entries(counts).map(([status, count]) => {
                    const st = statusMeta[status] || statusMeta['Open'];
                    const isActive = filterStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {status !== 'ALL' && st.icon}
                        <span>{status === 'ALL' ? `All (${count})` : `${status} (${count})`}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Issues Table */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-slate-500">Loading issues...</p>
                  </div>
                ) : currentIssues.length === 0 ? (
                  <div className="text-center py-16 sm:py-20 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-3 sm:mb-4 border border-indigo-100">
                      <FiAlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" />
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold text-slate-700">No issues found</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">All issues are resolved or none match your criteria</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[850px] border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-3.5 px-4 sm:px-6">Issue Details</th>
                            <th className="py-3.5 px-4 sm:px-6">Task Name</th>
                            <th className="py-3.5 px-4 sm:px-6">Priority</th>
                            <th className="py-3.5 px-4 sm:px-6">Status</th>
                            <th className="py-3.5 px-4 sm:px-6">Reported By</th>
                            <th className="py-3.5 px-4 sm:px-6">Reported At</th>
                            <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentIssues.map((item, index) => {
                            const issue = item.issue || {};
                            const pr = priorityMeta[issue.priority] || priorityMeta['Medium'];
                            const st = statusMeta[issue.status] || statusMeta['Open'];
                            const employeeId = issue.employee?.employeeId || 'N/A';
                            const employeeEmail = issue.employee?.email || 'N/A';

                            return (
                              <tr
                                key={issue.issueId || index}
                                className="hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer"
                                onClick={() => openViewModal(item)}
                              >
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs flex-shrink-0">
                                      <FiAlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-[160px] sm:max-w-[200px]">{issue.issueTitle || 'No Title'}</div>
                                      <div className="text-[11px] text-slate-500 truncate max-w-[140px] sm:max-w-[180px]">{issue.issueDescription || 'No description'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="text-xs sm:text-sm font-semibold text-slate-700 truncate max-w-[140px]">{item.taskName || 'N/A'}</div>
                                  <div className="text-[11px] text-slate-500 truncate max-w-[120px]">{item.title || ''}</div>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
                                    {pr.icon}
                                    {issue.priority || 'Medium'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                                    {st.icon}
                                    {issue.status || 'Open'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                                      {employeeId.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[90px]">{employeeId}</span>
                                      <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{employeeEmail}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                    <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                                    {formatDate(issue.reportedAt)}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button onClick={() => openViewModal(item)} className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all" title="View Issue Details">
                                      <FiEye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => openEditModal(item)} className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-lg border border-slate-200 hover:border-amber-200 transition-all" title="Edit Issue">
                                      <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteIssue(item.taskId, issue.issueId)} className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg border border-slate-200 hover:border-rose-200 transition-all" title="Delete Issue">
                                      <FiTrash2 className="w-4 h-4" />
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
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200">
                        <div className="text-xs font-medium text-slate-600">
                          Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(endIndex, filtered.length)}</span> of <span className="font-semibold text-slate-800">{filtered.length}</span> issues
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiChevronLeft className="w-4 h-4" />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                currentPage === page
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      </main>

      {/* Edit Modal */}
      {showEditModal && selectedIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-white/30 animate-slideDown">
            <div className="px-4 sm:px-6 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
              <h2 className="text-base sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Edit Issue
              </h2>
              <button onClick={() => { setShowEditModal(false); setSelectedIssue(null); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateIssue} className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                  <FiFlag className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
                  <FiCircle className="inline mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedIssue(null); }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  {loading ? (
                    <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Updating...</>
                  ) : (
                    <><FiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Update Issue</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewIssue && (
        <ViewIssueModal issue={viewIssue} onClose={() => { setShowViewModal(false); setViewIssue(null); }} />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-3 sm:bottom-4 md:bottom-8 right-3 sm:right-4 md:right-8 z-[200] animate-slideUp">
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
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        
        /* Hide scrollbar for status tabs */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

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

export default Issues;