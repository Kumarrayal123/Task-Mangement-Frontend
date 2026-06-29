import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiRefreshCw, FiCheckCircle, FiClock, FiAlertCircle, FiBarChart2,
  FiList, FiLogOut, FiUser, FiFlag, FiStar, FiX, FiEye,
  FiSearch, FiMessageSquare, FiAlertTriangle, FiCircle
} from 'react-icons/fi';
import { FaTasks } from 'react-icons/fa';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { getMyReportedIssues } from '../services/taskService';
import './MyTask.css';

const priorityMeta = {
  Critical: { color: '#ef4444', bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-200/50', icon: <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
  High:     { color: '#f97316', bg: 'bg-orange-50/80', text: 'text-orange-600', border: 'border-orange-200/50', icon: <FiFlag className="w-3 h-3 sm:w-4 sm:h-4" /> },
  Medium:   { color: '#eab308', bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-200/50', icon: <FiStar className="w-3 h-3 sm:w-4 sm:h-4" /> },
  Low:      { color: '#22c55e', bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-200/50', icon: <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> },
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
    <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-lg ${gradient}`}>
          <span className="text-white text-xs sm:text-sm lg:text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-[6px] sm:text-[8px] lg:text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        </div>
      </div>
    </div>
  );
}

function MyIssues() {
  const navigate = useNavigate();
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewIssue, setViewIssue] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ─── Toast State ───
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // ─── Handle sidebar collapse state ───
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // ─── Toast Message ───
  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) { navigate('/'); return; }

    try {
      const d = JSON.parse(raw);
      const name = d.fullName || d.name || d.employeeName || d.username || d.firstName || 'Employee';
      
      const id = d.employee?._id || 
                 d.employee?.id || 
                 d._id || 
                 d.id || 
                 d.userId || 
                 d.employee?.employeeId || 
                 d.employeeId || 
                 '';
      
      setName(name);
      setEmpId(id);
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
      } else if (res.issues && Array.isArray(res.issues)) {
        issuesData = res.issues;
      } else if (res.data && Array.isArray(res.data)) {
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
  }, [employeeId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleViewIssue = (issue) => {
    setViewIssue(issue);
    setShowViewModal(true);
  };

  // ─── Handle Issue Click - Navigate to Employee Profile ───
  const handleIssueClick = (issue) => {
    // Get employeeId from issue
    const reportedBy = issue.reportedBy || issue.employeeId || issue.userId || employeeId;
    navigate(`/employee-profile/${reportedBy}`);
  };

  const filtered = issues.filter((item) => {
    const isEmployeeIssues = item.issueId !== undefined;
    const issueStatus = isEmployeeIssues ? item.issueStatus : item.issue?.status;
    const issueTitle = isEmployeeIssues ? item.issueTitle : item.issue?.issueTitle;
    const issueDescription = isEmployeeIssues ? item.issueDescription : item.issue?.issueDescription;
    
    const matchStatus = filterStatus === 'ALL' || issueStatus === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || (issueTitle || '').toLowerCase().includes(q) || (issueDescription || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    ALL: issues.length,
    Open: issues.filter((i) => {
      const status = i.issueId !== undefined ? i.issueStatus : i.issue?.status;
      return status === 'Open';
    }).length,
    'In Progress': issues.filter((i) => {
      const status = i.issueId !== undefined ? i.issueStatus : i.issue?.status;
      return status === 'In Progress';
    }).length,
    Resolved: issues.filter((i) => {
      const status = i.issueId !== undefined ? i.issueStatus : i.issue?.status;
      return status === 'Resolved';
    }).length,
    Closed: issues.filter((i) => {
      const status = i.issueId !== undefined ? i.issueStatus : i.issue?.status;
      return status === 'Closed';
    }).length,
  };

  // ─── Dynamic padding based on sidebar state ───
  const mainContentPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex">
      <EmployeeSidebar 
        employeeName={employeeName} 
        onLogout={handleLogout}
        onCollapseChange={handleSidebarToggle}
      />

      <div className={`flex-1 min-h-screen w-full ${mainContentPadding} overflow-y-auto pb-20 lg:pb-0 transition-all duration-300 ease-in-out`}>
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm">
          <div className="flex flex-wrap items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-4 gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30 flex-shrink-0">
                <FiAlertTriangle className="text-white w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-base md:text-xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent hidden xs:block truncate">
                  My Reported Issues
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent xs:hidden">
                  My Issues
                </h2>
                <p className="text-[6px] sm:text-[10px] text-gray-500 hidden xs:block truncate max-w-[100px] sm:max-w-[200px]">
                  {issues.length} issues reported
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-wrap">
              <button onClick={fetchIssues} className="p-1 sm:p-2 lg:p-2.5 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 transition-all hover:scale-105">
                <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <button onClick={handleLogout} className="px-1.5 sm:px-3 lg:px-4 py-0.5 sm:py-1.5 lg:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[8px] sm:text-xs lg:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-0.5 sm:gap-2">
                <FiLogOut className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xs:inline">Logout</span>
              </button>
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-[8px] sm:text-xs lg:text-sm shadow-lg shadow-rose-500/30 flex-shrink-0">
                {getInitials(employeeName)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="space-y-3 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <StatCard label="Total Issues" value={counts.ALL} icon={<FiAlertTriangle className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-indigo-500/30" />
              <StatCard label="Open" value={counts.Open} icon={<FiCircle className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-500/30" />
              <StatCard label="In Progress" value={counts['In Progress']} icon={<FiRefreshCw className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-500/30" />
              <StatCard label="Resolved" value={counts.Resolved} icon={<FiCheckCircle className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/30" />
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="flex-1 min-w-[80px] sm:min-w-[200px] relative">
                <input
                  className="w-full px-1.5 sm:px-4 py-1 sm:py-2.5 pl-5 sm:pl-10 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[8px] sm:text-sm"
                  placeholder="Search issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FiSearch className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-nowrap overflow-x-auto gap-0.5 sm:gap-2 pb-0.5 sm:pb-2 scrollbar-hide">
              {['ALL', 'Open', 'In Progress', 'Resolved', 'Closed'].map((s) => {
                const st = issueStatusMeta[s] || issueStatusMeta['Open'];
                const isActive = filterStatus === s;
                const count = counts[s] || 0;
                return (
                  <button
                    key={s}
                    className={`px-1 sm:px-4 py-0.5 sm:py-2 rounded-full text-[7px] sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-0.5 sm:gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-white/40 backdrop-blur-sm border border-white/30 text-gray-600 hover:bg-white/60'
                    }`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s !== 'ALL' && <span className="text-[8px] sm:text-sm">{st.icon}</span>}
                    <span className="hidden xs:inline">{s}</span>
                    <span className="xs:hidden">{s.charAt(0)}</span>
                    <span className={`text-[5px] sm:text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>({count})</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="p-1.5 sm:p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-xl flex items-center gap-1.5 sm:gap-3 text-rose-700 text-[10px] sm:text-sm">
                <FiAlertCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
                <p className="mt-1.5 sm:mt-3 lg:mt-4 text-[10px] sm:text-sm text-gray-500">Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-r from-rose-100 to-orange-100 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                  <FiAlertTriangle className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-rose-400" />
                </div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-700">No issues found</h3>
                <p className="text-[10px] sm:text-sm text-gray-400 mt-0.5 sm:mt-1">You haven't reported any issues yet</p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                {/* ─── TABLE WITH VERTICAL SCROLL ON MOBILE ─── */}
                <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-none">
                  <table className="w-full min-w-[700px] sm:min-w-full">
                    <thead className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 backdrop-blur-sm sticky top-0 z-10">
                      <tr>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Reported</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {filtered.map((item, index) => {
                        const isEmployeeIssues = item.issueId !== undefined;
                        const issueTitle = isEmployeeIssues ? item.issueTitle : item.issue?.issueTitle;
                        const taskName = isEmployeeIssues ? item.taskName : item.taskName || item.title;
                        const priority = isEmployeeIssues ? item.issuePriority : item.issue?.priority;
                        const status = isEmployeeIssues ? item.issueStatus : item.issue?.status;
                        const reportedAt = isEmployeeIssues ? item.reportedAt : item.issue?.reportedAt;
                        const pr = priorityMeta[priority] || priorityMeta['Medium'];
                        const st = issueStatusMeta[status] || issueStatusMeta['Open'];
                        
                        return (
                          <tr key={item.issueId || item.issue?.issueId || index} className={`hover:bg-white/30 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <div className="text-[8px] sm:text-sm font-semibold text-gray-800 truncate max-w-[60px] sm:max-w-[200px]">{issueTitle || 'No Title'}</div>
                              <div className="text-[6px] sm:text-xs text-gray-500 truncate max-w-[50px] sm:max-w-[200px]">{item.issueDescription || item.issue?.issueDescription || ''}</div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <div className="text-[8px] sm:text-sm font-medium text-gray-700 truncate max-w-[50px] sm:max-w-[150px]">{taskName || 'N/A'}</div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[6px] sm:text-xs font-semibold ${pr.bg} ${pr.text} border ${pr.border}`}>
                                {pr.icon}
                                <span className="hidden xs:inline">{priority}</span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[6px] sm:text-xs font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                                {st.icon}
                                <span className="hidden xs:inline">{status}</span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <div className="text-[8px] sm:text-sm text-gray-600">{reportedAt ? formatDate(reportedAt) : 'N/A'}</div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4 text-right">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                {/* ─── View Button ─── */}
                                <button
                                  onClick={() => handleViewIssue(item)}
                                  className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-all group"
                                  title="View Issue"
                                >
                                  <FiEye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                                </button>
                                {/* ─── Circle/Profile Button - Navigate to Employee Profile ─── */}
                                <button
                                  onClick={() => handleIssueClick(item)}
                                  className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-indigo-50 transition-all group"
                                  title="View Employee Profile"
                                >
                                  <FiCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
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

      {/* View Issue Modal */}
      {showViewModal && viewIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100/50 flex justify-between items-center">
              <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                Issue Details
              </h3>
              <button className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => { setShowViewModal(false); setViewIssue(null); }}>
                <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="w-full sm:w-auto">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                    {viewIssue.issueId !== undefined ? viewIssue.issueTitle : viewIssue.issue?.issueTitle || 'No Title'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    Task: {viewIssue.taskName || viewIssue.title || 'N/A'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-semibold ${priorityMeta[viewIssue.issueId !== undefined ? viewIssue.issuePriority : viewIssue.issue?.priority]?.bg || 'bg-gray-100'} ${priorityMeta[viewIssue.issueId !== undefined ? viewIssue.issuePriority : viewIssue.issue?.priority]?.text || 'text-gray-600'} border ${priorityMeta[viewIssue.issueId !== undefined ? viewIssue.issuePriority : viewIssue.issue?.priority]?.border || 'border-gray-200'}`}>
                    {priorityMeta[viewIssue.issueId !== undefined ? viewIssue.issuePriority : viewIssue.issue?.priority]?.icon}
                    <span className="hidden xs:inline">{viewIssue.issueId !== undefined ? viewIssue.issuePriority : viewIssue.issue?.priority}</span>
                  </span>
                  <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-semibold ${issueStatusMeta[viewIssue.issueId !== undefined ? viewIssue.issueStatus : viewIssue.issue?.status]?.bg || 'bg-gray-100'} ${issueStatusMeta[viewIssue.issueId !== undefined ? viewIssue.issueStatus : viewIssue.issue?.status]?.text || 'text-gray-600'} border ${issueStatusMeta[viewIssue.issueId !== undefined ? viewIssue.issueStatus : viewIssue.issue?.status]?.border || 'border-gray-200'}`}>
                    {issueStatusMeta[viewIssue.issueId !== undefined ? viewIssue.issueStatus : viewIssue.issue?.status]?.icon}
                    <span className="hidden xs:inline">{viewIssue.issueId !== undefined ? viewIssue.issueStatus : viewIssue.issue?.status}</span>
                  </span>
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
                  <FiMessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                  {viewIssue.issueId !== undefined ? viewIssue.issueDescription : viewIssue.issue?.issueDescription || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5 sm:p-4 border border-white/30">
                  <p className="text-[8px] sm:text-xs text-gray-500">Reported At</p>
                  <p className="text-[10px] sm:text-sm font-semibold text-gray-800">
                    {formatDateTime(viewIssue.issueId !== undefined ? viewIssue.reportedAt : viewIssue.issue?.reportedAt)}
                  </p>
                </div>
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5 sm:p-4 border border-white/30">
                  <p className="text-[8px] sm:text-xs text-gray-500">Task</p>
                  <p className="text-[10px] sm:text-sm font-semibold text-gray-800">{viewIssue.taskName || viewIssue.title || 'N/A'}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleIssueClick(viewIssue);
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
                >
                  <FiCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  View Profile
                </button>
                <button onClick={() => { setShowViewModal(false); setViewIssue(null); }} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 sm:bottom-4 md:bottom-8 right-3 sm:right-4 md:right-8 z-[200] animate-slideUp">
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }

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

export default MyIssues;