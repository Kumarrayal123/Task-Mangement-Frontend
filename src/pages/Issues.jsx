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
import Sidebar from '../Sidebar';
import '../Sidebar.css';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <div className="flex flex-col lg:flex-row">
        {/* ─── Mobile Menu Toggle ─── */}
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

        {/* ─── Mobile Overlay ─── */}
        <div 
          className={`
            fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden
            ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `} 
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* ─── Sidebar ─── */}
        <div 
          className={`
            fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:fixed
          `}
          style={{ width: '280px' }}
        >
          <Sidebar userRole="admin" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute top-2 right-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <FiX className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ─── Main Content ─── */}
        <div className="flex-1 min-h-screen w-full lg:pl-[280px] overflow-y-auto">
          {/* Navbar */}
          <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm">
            <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 ml-10 lg:ml-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                  <FaTasks className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block">
                  Issue Management
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Issues
                </h2>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-wrap">
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

          {/* Main Content */}
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 lg:mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  <FiAlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-indigo-500" />
                  Reported Issues
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Track and manage all reported issues</p>
              </div>
              <button
                onClick={fetchIssues}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 text-gray-700 font-medium hover:bg-white/60 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Refresh
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-xl flex items-center gap-2 sm:gap-3 text-rose-700 text-xs sm:text-sm">
                <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {error}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 lg:mb-8">
              {Object.entries(counts).map(([status, count]) => {
                const st = statusMeta[status] || statusMeta['Open'];
                const isAll = status === 'ALL';
                return (
                  <div key={status} className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer" onClick={() => setFilterStatus(status)}>
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center ${isAll ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : st.bg} shadow-lg ${isAll ? 'shadow-indigo-500/30' : 'shadow-gray-500/20'}`}>
                        {isAll ? <FiBarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" /> : st.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider truncate">{isAll ? 'Total' : status}</p>
                        <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{count}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 min-w-[120px] sm:min-w-[200px]">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 px-2 sm:px-4 py-1.5 sm:py-2">
                  <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-[10px] sm:text-sm text-gray-700 min-w-0"
                  >
                    <option value="ALL">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 min-w-[120px] sm:min-w-[200px]">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 px-2 sm:px-4 py-1.5 sm:py-2">
                  <FiFlag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-[10px] sm:text-sm text-gray-700 min-w-0"
                  >
                    <option value="ALL">All Priority</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status Tabs - Mobile Scrollable */}
            <div className="flex flex-nowrap overflow-x-auto gap-1.5 sm:gap-2 mb-4 sm:mb-6 pb-1 sm:pb-2 scrollbar-hide">
              {Object.entries(counts).map(([status, count]) => {
                const st = statusMeta[status] || statusMeta['Open'];
                const isActive = filterStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/40 backdrop-blur-sm border border-white/30 text-gray-600 hover:bg-white/60'
                    }`}
                  >
                    {status !== 'ALL' && <span className="inline sm:hidden">{st.icon}</span>}
                    <span className="hidden sm:inline">{status !== 'ALL' && st.icon}</span>
                    <span className="ml-0.5 sm:ml-1.5">{status !== 'ALL' ? count : `All (${count})`}</span>
                  </button>
                );
              })}
            </div>

            {/* Issues Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm text-gray-500">Loading issues...</p>
              </div>
            ) : currentIssues.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <FiAlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700">No issues found</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">All issues are resolved or none reported</p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] sm:min-w-[800px]">
                    <thead className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Employee</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Reported</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {currentIssues.map((item, index) => {
                        const issue = item.issue || {};
                        const pr = priorityMeta[issue.priority] || priorityMeta['Medium'];
                        const st = statusMeta[issue.status] || statusMeta['Open'];
                        const employeeId = issue.employee?.employeeId || 'N/A';
                        const employeeEmail = issue.employee?.email || 'N/A';

                        return (
                          <tr
                            key={issue.issueId || index}
                            className={`hover:bg-white/30 transition-all duration-200 cursor-pointer ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}
                            onClick={() => openViewModal(item)}
                          >
                            <td className="px-3 sm:px-6 py-2 sm:py-4">
                              <div className="text-[10px] sm:text-sm font-semibold text-gray-800 truncate max-w-[80px] sm:max-w-[200px]">{issue.issueTitle || 'No Title'}</div>
                              <div className="text-[8px] sm:text-xs text-gray-500 truncate max-w-[60px] sm:max-w-[200px]">{issue.issueDescription || 'No description'}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4">
                              <div className="text-[10px] sm:text-sm font-medium text-gray-700 truncate max-w-[60px] sm:max-w-[150px]">{item.taskName || 'N/A'}</div>
                              <div className="text-[8px] sm:text-xs text-gray-500 truncate max-w-[50px] sm:max-w-[150px]">{item.title || ''}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
                                {pr.icon}
                                <span className="hidden sm:inline">{issue.priority || 'Medium'}</span>
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                                {st.icon}
                                <span className="hidden sm:inline">{issue.status || 'Open'}</span>
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 hidden md:table-cell">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[8px] sm:text-xs font-bold">
                                  {employeeId.charAt(0) || 'U'}
                                </div>
                                <div className="hidden lg:block">
                                  <div className="text-[10px] sm:text-sm font-medium text-gray-700">{employeeId}</div>
                                  <div className="text-[8px] sm:text-xs text-gray-500 truncate max-w-[80px] sm:max-w-[120px]">{employeeEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 hidden lg:table-cell">
                              <div className="text-[10px] sm:text-sm text-gray-600">{formatDate(issue.reportedAt)}</div>
                              {item.dueDate && (
                                <div className="text-[8px] sm:text-xs text-gray-400">Due: {formatDate(item.dueDate)}</div>
                              )}
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
                                <button
                                  onClick={() => openViewModal(item)}
                                  className="p-1 sm:p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-indigo-50 transition-all group"
                                  title="View Issue"
                                >
                                  <FiEye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-1 sm:p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-amber-50 transition-all group"
                                  title="Edit Issue"
                                >
                                  <FiEdit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() => handleDeleteIssue(item.taskId, issue.issueId)}
                                  className="p-1 sm:p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-all group"
                                  title="Delete Issue"
                                >
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 bg-white/20 backdrop-blur-sm border-t border-gray-200/50">
                    <div className="text-[10px] sm:text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} issues
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
          </div>
        </div>
      </div>

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