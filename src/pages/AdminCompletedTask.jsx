import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiClock, FiAlertCircle, FiRefreshCw, FiSearch,
  FiCalendar, FiFlag, FiEye, FiEdit2, FiCheckCircle,
  FiX, FiFileText, FiPaperclip, FiStar, FiPlus, 
  FiBarChart2, FiBell, FiChevronLeft, FiChevronRight, FiCheck
} from 'react-icons/fi';
import Navbar from '../Navbar';
import '../AdminDashboard.css';

const API_BASE_URL = 'https://api.timelyhealth.in/api/tasks';

const getPriorityStyles = (priority) => {
  const styles = {
    'Critical': 'bg-rose-50 text-rose-700 border-rose-200',
    'High': 'bg-orange-50 text-orange-700 border-orange-200',
    'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
    'Low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return styles[priority] || 'bg-slate-100 text-slate-700 border-slate-200';
};

const getStatusStyles = (status) => {
  const styles = {
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
    'Overdue': 'bg-red-50 text-red-700 border-red-200',
  };
  return styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
};

const getStatusIcon = (status) => {
  const icons = {
    'Completed': <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
    'In Progress': <FiRefreshCw className="w-3.5 h-3.5 text-blue-600" />,
    'Pending': <FiClock className="w-3.5 h-3.5 text-amber-600" />,
    'Rejected': <FiX className="w-3.5 h-3.5 text-rose-600" />,
    'Overdue': <FiAlertCircle className="w-3.5 h-3.5 text-red-600" />,
  };
  return icons[status] || <FiFileText className="w-3.5 h-3.5 text-slate-600" />;
};

const getPriorityIcon = (priority) => {
  const icons = {
    'Critical': <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />,
    'High': <FiFlag className="w-3.5 h-3.5 text-orange-600" />,
    'Medium': <FiStar className="w-3.5 h-3.5 text-amber-600" />,
    'Low': <FiCheck className="w-3.5 h-3.5 text-emerald-600" />,
  };
  return icons[priority] || <FiFlag className="w-3.5 h-3.5 text-slate-600" />;
};

function AdminCompletedTask() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'admin';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState('');

  // ─── Live Clock Header Pill ───
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

  const fetchCompletedTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/getalltasks`, { 
        params: { status: 'Completed' } 
      });
      const data = response.data;
      const tasksData = Array.isArray(data) ? data : data.tasks || [];
      setTasks(tasksData);
    } catch (err) {
      console.error('Fetch completed tasks error:', err);
      setError(err.response?.data?.message || 'Failed to load completed tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedTasks();
  }, [fetchCompletedTasks]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  const getFilteredTasks = () => {
    let filtered = tasks.filter(t => t.status === 'Completed');
    
    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPriority]);

  const priorityCounts = {
    ALL: tasks.filter(t => t.status === 'Completed').length,
    Low: tasks.filter(t => t.status === 'Completed' && t.priority === 'Low').length,
    Medium: tasks.filter(t => t.status === 'Completed' && t.priority === 'Medium').length,
    High: tasks.filter(t => t.status === 'Completed' && t.priority === 'High').length,
    Critical: tasks.filter(t => t.status === 'Completed' && t.priority === 'Critical').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ─── Horizontal Top Navbar ─── */}
      <Navbar userRole={userRole} onLogout={handleLogout} />

      {/* ─── Main Content Area (Full Width Layout) ─── */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="admin-dash">

          {/* Header Section */}
          <div className="admin-dash__header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="admin-dash__greeting flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                <FiCheckCircle className="w-7 h-7 text-emerald-600" /> Completed <span>Tasks</span>
              </h1>
              <p className="admin-dash__subtitle text-xs sm:text-sm text-slate-500 mt-1">
                View, review, and audit all finished and completed workforce tasks.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-xs text-slate-700 font-semibold text-xs">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDateTime}</span>
              </div>
              
              <button
                onClick={fetchCompletedTasks}
                disabled={loading}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-xs"
                title="Refresh Completed Tasks"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => navigateTo('/task')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 transition shadow-md"
              >
                <FiPlus size={16} />
                Create Task
              </button>
            </div>
          </div>

          <div className="space-y-6">

            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold shadow-xs">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* 5 KPI Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div 
                onClick={() => setFilterPriority('all')}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                  filterPriority === 'all' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{priorityCounts.ALL}</div>
                <div className="text-xs text-slate-400 mt-1">all finished tasks</div>
              </div>

              <div 
                onClick={() => setFilterPriority('Low')}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                  filterPriority === 'Low' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Priority</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <FiCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{priorityCounts.Low}</div>
                <div className="text-xs text-slate-400 mt-1">routine completed tasks</div>
              </div>

              <div 
                onClick={() => setFilterPriority('Medium')}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                  filterPriority === 'Medium' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medium</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <FiStar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{priorityCounts.Medium}</div>
                <div className="text-xs text-slate-400 mt-1">standard completed tasks</div>
              </div>

              <div 
                onClick={() => setFilterPriority('High')}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                  filterPriority === 'High' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High</span>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <FiFlag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{priorityCounts.High}</div>
                <div className="text-xs text-slate-400 mt-1">important completed tasks</div>
              </div>

              <div 
                onClick={() => setFilterPriority('Critical')}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                  filterPriority === 'Critical' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical</span>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <FiAlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{priorityCounts.Critical}</div>
                <div className="text-xs text-slate-400 mt-1">critical completed tasks</div>
              </div>

            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search completed tasks by name or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Priority Selector & Reset */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="all">All Priorities</option>
                    <option value="Critical">Critical Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>

                  {(searchTerm || filterPriority !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterPriority('all');
                      }}
                      className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold transition"
                    >
                      Reset
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Table Container */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-3 text-xs font-semibold text-slate-500">Loading completed tasks...</p>
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                  <FiCheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No completed tasks found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchTerm || filterPriority !== 'all'
                    ? 'No completed tasks matching your search filters.'
                    : 'Completed tasks will show up here once finished.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4 sm:px-6">Task</th>
                        <th className="py-3.5 px-4 sm:px-6">Priority</th>
                        <th className="py-3.5 px-4 sm:px-6">Status</th>
                        <th className="py-3.5 px-4 sm:px-6">Progress</th>
                        <th className="py-3.5 px-4 sm:px-6">Submit Date</th>
                        <th className="py-3.5 px-4 sm:px-6">Assigned To</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {currentTasks.map((task) => (
                        <tr
                          key={task._id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => navigateTo('/task')}
                        >
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="font-semibold text-slate-800 truncate max-w-[200px]">{task.taskName}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{task.title}</div>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getPriorityStyles(task.priority)}`}>
                              {getPriorityIcon(task.priority)}
                              {task.priority}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyles(task.status)}`}>
                              {getStatusIcon(task.status)}
                              {task.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress || 100}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700">{task.progress || 100}%</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600 font-medium">
                            <div className="flex items-center gap-1.5">
                              <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                              {task.submitDate ? new Date(task.submitDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            {task.assignedTo && task.assignedTo.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <div className="flex -space-x-1.5">
                                  {task.assignedTo.slice(0, 3).map((user, idx) => (
                                    <div key={idx} className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
                                      {typeof user === 'object' ? user.name?.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                  ))}
                                  {task.assignedTo.length > 3 && (
                                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center border-2 border-white">
                                      +{task.assignedTo.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-medium">Unassigned</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => { setSelectedTask(task); setShowViewModal(true); }} 
                                className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition shadow-2xs" 
                                title="View Task Details"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => navigateTo('/task')} 
                                className="p-2 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-xl transition shadow-2xs" 
                                title="Edit Task"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <div>
                      Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{' '}
                      <span className="font-bold text-slate-800">{Math.min(endIndex, filteredTasks.length)}</span> of{' '}
                      <span className="font-bold text-slate-800">{filteredTasks.length}</span> tasks
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg font-bold transition text-xs ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
      </main>

      {/* View Task Modal */}
      {showViewModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 animate-slideDown flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Completed Task Details</h2>
                  <p className="text-xs text-slate-500">Full information for task #{selectedTask._id?.slice(-6)}</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowViewModal(false); setSelectedTask(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Task Name</label>
                  <p className="text-sm font-bold text-slate-800">{selectedTask.taskName || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Title</label>
                  <p className="text-sm font-semibold text-slate-700">{selectedTask.title || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Priority & Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityStyles(selectedTask.priority)}`}>
                      {getPriorityIcon(selectedTask.priority)} {selectedTask.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(selectedTask.status)}`}>
                      {getStatusIcon(selectedTask.status)} {selectedTask.status}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Progress & Submit Date</label>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {selectedTask.progress || 100}% · {selectedTask.submitDate ? new Date(selectedTask.submitDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Description</label>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedTask.description || 'No description provided.'}</p>
              </div>

              {selectedTask.assignedTo && selectedTask.assignedTo.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-2">Assigned Personnel</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.assignedTo.map((emp, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                        {emp.name || emp.fullName || emp.email || 'Employee'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-2">Attachments</label>
                  <div className="space-y-2">
                    {selectedTask.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FiPaperclip className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700 truncate">{attachment.fileName}</span>
                        </div>
                        <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => { setShowViewModal(false); setSelectedTask(null); }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCompletedTask;