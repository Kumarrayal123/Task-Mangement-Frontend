import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiCircle,
  FiEye,
  FiFlag,
  FiMessageSquare,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiUser,
  FiX,
} from 'react-icons/fi';
import Navbar from '../Navbar';
import { getMyReportedIssues } from '../services/taskService';
import './DummyDashboard.css';

const priorityMeta = {
  Critical: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />,
  },
  High: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: <FiFlag className="w-3.5 h-3.5 text-orange-600" />,
  },
  Medium: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: <FiStar className="w-3.5 h-3.5 text-amber-600" />,
  },
  Low: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
  },
};

const issueStatusMeta = {
  Open: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: <FiCircle className="w-3.5 h-3.5 text-indigo-600" />,
  },
  'In Progress': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <FiRefreshCw className="w-3.5 h-3.5 text-blue-600" />,
  },
  Resolved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
  },
  Closed: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: <FiX className="w-3.5 h-3.5 text-slate-500" />,
  },
};

const statusOptions = ['ALL', 'Open', 'In Progress', 'Resolved', 'Closed'];

function formatDate(dateValue) {
  if (!dateValue) return '—';

  return new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) return '—';

  return new Date(dateValue).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeIssue(item) {
  const isFlatIssue = item?.issueId !== undefined;

  return {
    id: item?.issueId || item?.issue?.issueId || item?._id || item?.issue?._id,
    title: isFlatIssue ? item?.issueTitle : item?.issue?.issueTitle,
    description: isFlatIssue ? item?.issueDescription : item?.issue?.issueDescription,
    taskName: isFlatIssue ? item?.taskName : item?.taskName || item?.title,
    priority: isFlatIssue ? item?.issuePriority : item?.issue?.priority,
    status: isFlatIssue ? item?.issueStatus : item?.issue?.status,
    reportedAt: isFlatIssue ? item?.reportedAt : item?.issue?.reportedAt,
    reportedBy: item?.reportedBy || item?.employeeId || item?.userId,
    raw: item,
  };
}

function MyIssues() {
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewIssue, setViewIssue] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const userRole = localStorage.getItem('userRole') || 'employee';

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const showToastMessage = useCallback((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) {
      navigate('/');
      return;
    }

    try {
      const data = JSON.parse(raw);
      const name =
        data.fullName ||
        data.name ||
        data.employeeName ||
        data.username ||
        data.firstName ||
        'Employee';

      const id =
        data.employee?._id ||
        data.employee?.id ||
        data._id ||
        data.id ||
        data.userId ||
        data.employee?.employeeId ||
        data.employeeId ||
        '';

      setEmployeeName(name);
      setEmployeeId(id);
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  }, [navigate]);

  const fetchIssues = useCallback(async () => {
    if (!employeeId) return;

    setLoading(true);
    setError('');

    try {
      const res = await getMyReportedIssues(employeeId);
      let issuesData = [];

      if (Array.isArray(res)) {
        issuesData = res;
      } else if (Array.isArray(res?.issues)) {
        issuesData = res.issues;
      } else if (Array.isArray(res?.data)) {
        issuesData = res.data;
      }

      setIssues(issuesData);
    } catch (err) {
      console.error(err);
      setError('Failed to load issues');
      showToastMessage('Failed to load issues', 'error');
    } finally {
      setLoading(false);
    }
  }, [employeeId, showToastMessage]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const normalizedIssues = useMemo(() => issues.map(normalizeIssue), [issues]);

  const counts = useMemo(
    () => ({
      ALL: normalizedIssues.length,
      Open: normalizedIssues.filter((issue) => issue.status === 'Open').length,
      'In Progress': normalizedIssues.filter((issue) => issue.status === 'In Progress').length,
      Resolved: normalizedIssues.filter((issue) => issue.status === 'Resolved').length,
      Closed: normalizedIssues.filter((issue) => issue.status === 'Closed').length,
    }),
    [normalizedIssues]
  );

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedIssues.filter((issue) => {
      const matchesStatus = filterStatus === 'ALL' || issue.status === filterStatus;
      const matchesSearch =
        !query ||
        (issue.title || '').toLowerCase().includes(query) ||
        (issue.description || '').toLowerCase().includes(query) ||
        (issue.taskName || '').toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, normalizedIssues, search]);

  const hasActiveFilters = Boolean(search) || filterStatus !== 'ALL';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleViewIssue = (issue) => {
    setViewIssue(issue);
    setShowViewModal(true);
  };

  const handleIssueClick = (issue) => {
    const normalized = normalizeIssue(issue);
    const reportedBy = normalized.reportedBy || employeeId;
    if (!reportedBy) return;

    navigate(`/employee-profile/${reportedBy}`);
  };

  const modalIssue = viewIssue ? normalizeIssue(viewIssue) : null;
  const modalPriority = modalIssue ? priorityMeta[modalIssue.priority] || priorityMeta.Medium : null;
  const modalStatus = modalIssue ? issueStatusMeta[modalIssue.status] || issueStatusMeta.Open : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userRole={userRole} onLogout={handleLogout} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="admin-dash">
          <div className="admin-dash__header">
            <div>
              <h1 className="admin-dash__greeting flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5 text-rose-600" /> My Reported <span>Issues</span>
              </h1>
              <p className="admin-dash__subtitle">
                Welcome back, {employeeName}. Review, search, and track every issue you have reported.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-700 font-semibold text-xs">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDateTime}</span>
              </div>

              <button
                onClick={fetchIssues}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-sm"
                title="Refresh Issues"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="admin-dash__stats">
              <div className="admin-dash__stat" onClick={() => setFilterStatus('ALL')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Total Issues</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                    <FiAlertTriangle />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.ALL}</div>
                <div className="admin-dash__stat-meta">all reported issues</div>
              </div>

              <div className="admin-dash__stat" onClick={() => setFilterStatus('Open')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Open</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                    <FiCircle />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.Open}</div>
                <div className="admin-dash__stat-meta">awaiting resolution</div>
              </div>

              <div className="admin-dash__stat" onClick={() => setFilterStatus('In Progress')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">In Progress</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                    <FiRefreshCw />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts['In Progress']}</div>
                <div className="admin-dash__stat-meta">currently being handled</div>
              </div>

              <div className="admin-dash__stat" onClick={() => setFilterStatus('Resolved')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Resolved</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                    <FiCheckCircle />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.Resolved}</div>
                <div className="admin-dash__stat-meta">successfully resolved</div>
              </div>

              <div className="admin-dash__stat" onClick={() => setFilterStatus('Closed')}>
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Closed</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--rose">
                    <FiX />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{counts.Closed}</div>
                <div className="admin-dash__stat-meta">finished and archived</div>
              </div>
            </div>

            <div className="admin-dash__card">
              <div className="admin-dash__card-header">
                <div>
                  <h3 className="admin-dash__card-title">Issue Directory</h3>
                  <p className="admin-dash__card-desc">Search, filter, and review the issues you have reported</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {filteredIssues.length} Issues Found
                  </span>
                </div>
              </div>

              <div className="admin-dash__card-body space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
                      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search issues, descriptions, or tasks..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
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

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {statusOptions.map((status) => {
                        const isActive = filterStatus === status;
                        const meta = issueStatusMeta[status];
                        const count = counts[status] || 0;

                        return (
                          <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {status !== 'ALL' && meta?.icon}
                            <span>{status}</span>
                            <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                              ({count})
                            </span>
                          </button>
                        );
                      })}

                      {hasActiveFilters && (
                        <button
                          onClick={() => {
                            setSearch('');
                            setFilterStatus('ALL');
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
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold shadow-sm">
                    <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-3 text-xs font-semibold text-slate-500">Loading issues...</p>
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="w-16 h-16 mx-auto bg-rose-50 rounded-2xl flex items-center justify-center mb-3">
                      <FiAlertTriangle className="w-8 h-8 text-rose-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No issues found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {hasActiveFilters
                        ? 'No issues match the current search or status filter.'
                        : 'You have not reported any issues yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-3.5 px-4 sm:px-6">Issue</th>
                            <th className="py-3.5 px-4 sm:px-6">Task</th>
                            <th className="py-3.5 px-4 sm:px-6">Priority</th>
                            <th className="py-3.5 px-4 sm:px-6">Status</th>
                            <th className="py-3.5 px-4 sm:px-6">Reported Date</th>
                            <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredIssues.map((issue, index) => {
                            const priority = priorityMeta[issue.priority] || priorityMeta.Medium;
                            const status = issueStatusMeta[issue.status] || issueStatusMeta.Open;

                            return (
                              <tr key={issue.id || index} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="font-semibold text-slate-800 truncate max-w-[220px]">
                                    {issue.title || 'Untitled issue'}
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                                    {issue.description || 'No description provided'}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                                    {issue.taskName || 'N/A'}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${priority.bg} ${priority.text} ${priority.border}`}>
                                    {priority.icon}
                                    {issue.priority || 'Medium'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                                    {status.icon}
                                    {issue.status || 'Open'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600 font-medium">
                                  <div className="flex items-center gap-1.5">
                                    <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                                    {formatDate(issue.reportedAt)}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleViewIssue(issue.raw)}
                                      className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-all group"
                                      title="View Issue"
                                    >
                                      <FiEye className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button
                                      onClick={() => handleIssueClick(issue.raw)}
                                      className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                                      title="View Employee Profile"
                                    >
                                      <FiUser className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
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
            </div>
          </div>
        </div>
      </main>

      {showViewModal && modalIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideDown border border-slate-200">
            <div className="sticky top-0 bg-white/95 backdrop-blur rounded-t-3xl px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5 text-rose-500" />
                Issue Details
              </h3>
              <button
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => {
                  setShowViewModal(false);
                  setViewIssue(null);
                }}
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="w-full sm:w-auto">
                  <h2 className="text-2xl font-bold text-gray-800">{modalIssue.title || 'Untitled issue'}</h2>
                  <p className="text-sm text-gray-500 mt-1">Task: {modalIssue.taskName || 'N/A'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${modalPriority.bg} ${modalPriority.text} ${modalPriority.border}`}>
                    {modalPriority.icon}
                    {modalIssue.priority || 'Medium'}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${modalStatus.bg} ${modalStatus.text} ${modalStatus.border}`}>
                    {modalStatus.icon}
                    {modalIssue.status || 'Open'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4" />
                  Description
                </h4>
                <p className="text-sm text-gray-600 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  {modalIssue.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-gray-500">Reported At</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDateTime(modalIssue.reportedAt)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-gray-500">Task</p>
                  <p className="text-sm font-semibold text-gray-800">{modalIssue.taskName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleIssueClick(viewIssue);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <FiUser className="w-4 h-4" />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewIssue(null);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-all text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 z-[200] animate-slideUp">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-sm ${
              toastType === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toastType === 'success' ? (
              <FiCheckCircle className="w-5 h-5" />
            ) : (
              <FiAlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default MyIssues;
