import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiClock, FiAlertCircle, FiRefreshCw, FiSearch, FiFilter,
  FiUser, FiCalendar, FiBriefcase, FiFlag, FiEye, FiEdit2,
  FiCheckCircle, FiX, FiLoader, FiFileText, FiMapPin,
  FiDollarSign, FiPaperclip, FiDownload, FiImage, FiFile,
  FiChevronDown, FiChevronUp, FiThumbsUp, FiTrendingUp,
  FiStar, FiMenu, FiPlus, FiLogOut, FiBarChart2, FiBell,
  FiChevronLeft, FiChevronRight, FiTrash2, FiCheck
} from 'react-icons/fi';
import Sidebar from '../Sidebar';
import '../Sidebar.css';

const API_BASE_URL = 'https://api.timelyhealth.in/api/tasks';
const BASE_URL = 'https://api.timelyhealth.in';

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

function AdminProgressTask() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      const name = parsedData.name || 
                   parsedData.adminName || 
                   parsedData.username || 
                   parsedData.fullName || 
                   parsedData.firstName || 
                   'Admin';
      setAdminName(name);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchProgressTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/getalltasks`, { 
        params: { status: 'In Progress' } 
      });
      const data = response.data;
      const tasksData = Array.isArray(data) ? data : data.tasks || [];
      setTasks(tasksData);
    } catch (err) {
      console.error('Fetch progress tasks error:', err);
      setError(err.response?.data?.message || 'Failed to load progress tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgressTasks();
  }, [fetchProgressTasks]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navigateTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getFilteredTasks = () => {
    let filtered = tasks.filter(t => t.status === 'In Progress');
    
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
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  const priorityCounts = {
    ALL: tasks.filter(t => t.status === 'In Progress').length,
    Low: tasks.filter(t => t.status === 'In Progress' && t.priority === 'Low').length,
    Medium: tasks.filter(t => t.status === 'In Progress' && t.priority === 'Medium').length,
    High: tasks.filter(t => t.status === 'In Progress' && t.priority === 'High').length,
    Critical: tasks.filter(t => t.status === 'In Progress' && t.priority === 'Critical').length,
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
          <Sidebar userRole="admin" />
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                  <FiRefreshCw className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden xs:block">
                  Progress Tasks
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent xs:hidden">
                  Progress
                </h2>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-wrap">
                <button
                  onClick={fetchProgressTasks}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
                >
                  <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Refresh</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
                >
                  <FiLogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Logout</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-sm shadow-lg shadow-blue-500/30">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 lg:mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Progress Tasks
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Manage and track all in-progress tasks efficiently</p>
              </div>
              <button
                onClick={() => navigateTo('/task')}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Create New Task
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 lg:mb-8">
              {[
                { label: 'Total', value: priorityCounts.ALL, icon: <FiBarChart2 className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-blue-400 to-indigo-500' },
                { label: 'Low', value: priorityCounts.Low, icon: <FiCheck className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-emerald-400 to-emerald-500' },
                { label: 'Medium', value: priorityCounts.Medium, icon: <FiStar className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-amber-400 to-amber-500' },
                { label: 'High', value: priorityCounts.High, icon: <FiFlag className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-orange-400 to-orange-500' },
                { label: 'Critical', value: priorityCounts.Critical, icon: <FiAlertCircle className="text-white w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-rose-400 to-rose-500' },
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

            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 min-w-[150px] sm:min-w-[200px] relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 pl-8 sm:pl-9 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs sm:text-sm"
                />
                <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs sm:text-sm min-w-[100px] sm:min-w-[130px]"
              >
                <option value="all">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterPriority('all');
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

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">Loading tasks...</p>
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <FiFileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-gray-700">No in-progress tasks found</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Create your first task to get started!</p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] sm:min-w-[800px]">
                    <thead className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Submit Date</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {currentTasks.map((task, index) => {
                        const isUpcoming = task.submitDate && task.status !== 'Completed' && task.status !== 'Rejected';
                        const daysLeft = isUpcoming ? Math.ceil((new Date(task.submitDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                        
                        return (
                          <tr
                            key={task._id}
                            className={`hover:bg-white/30 transition-all duration-200 cursor-pointer ${
                              index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'
                            } ${isUpcoming && daysLeft <= 3 ? 'border-l-4 border-l-amber-400' : ''}`}
                            onClick={() => navigateTo('/task')}
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
                                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
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
                              {task.assignedTo && task.assignedTo.length > 0 ? (
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  <div className="flex -space-x-1 sm:-space-x-2">
                                    {task.assignedTo.slice(0, 3).map((user, idx) => (
                                      <div key={idx} className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white text-[8px] sm:text-xs font-bold border-2 border-white/50 shadow-sm">
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
                                <button onClick={() => { setSelectedTask(task); setShowViewModal(true); }} className="p-1 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-blue-50 transition-all group" title="View Task">
                                  <FiEye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={() => navigateTo('/task')} className="p-1 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-amber-50 transition-all group" title="Edit Task">
                                  <FiEdit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
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
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
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

      {/* View Task Modal */}
      {showViewModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slideDown">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Task Details</h2>
              <button 
                onClick={() => { setShowViewModal(false); setSelectedTask(null); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Task Name</label>
                  <p className="text-sm font-medium text-gray-800">{selectedTask.taskName || selectedTask.title || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(selectedTask.status)}`}>
                    {getStatusIcon(selectedTask.status)} {selectedTask.status}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Priority</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityStyles(selectedTask.priority)}`}>
                    {getPriorityIcon(selectedTask.priority)} {selectedTask.priority}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Progress</label>
                  <p className="text-sm font-medium text-gray-800">{selectedTask.progress || 0}%</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Submit Date</label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedTask.submitDate ? new Date(selectedTask.submitDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Created By</label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedTask.createdBy?.name || selectedTask.createdBy?.fullName || 'Admin'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                <p className="text-sm text-gray-700 mt-1">{selectedTask.description || 'No description'}</p>
              </div>

              {selectedTask.assignedTo && selectedTask.assignedTo.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Assigned To</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTask.assignedTo.map((emp, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                        {emp.name || emp.fullName || emp.email || 'Employee'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.expenses && selectedTask.expenses.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Expenses</label>
                  <div className="mt-2 space-y-2">
                    {selectedTask.expenses.map((expense, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-800">{expense.description || 'No description'}</span>
                          <span className="text-sm font-bold text-emerald-600">₹{expense.expenseAmount || 0}</span>
                        </div>
                        {expense.location?.address && (
                          <p className="text-xs text-gray-500 mt-1">📍 {expense.location.address}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Attachments</label>
                  <div className="mt-2 space-y-2">
                    {selectedTask.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <FiPaperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment.fileName}</span>
                        <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs">
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => { setShowViewModal(false); setSelectedTask(null); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
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

export default AdminProgressTask