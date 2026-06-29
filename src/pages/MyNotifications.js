import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiRefreshCw, FiCheckCircle, FiClock, FiAlertCircle, FiBarChart2,
  FiList, FiLogOut, FiUser, FiFlag, FiStar, FiEye, FiTrash2,
  FiSearch, FiMessageSquare, FiBell, FiCircle, FiMail,
  FiCalendar, FiBriefcase, FiX, FiTrash
} from 'react-icons/fi';
import { FaTasks } from 'react-icons/fa';
import EmployeeSidebar from '../components/EmployeeSidebar';
import './MyTask.css';

const NOTIFICATIONS_API = 'https://api.timelyhealth.in/api/tasks/employeenotifications';
const DELETE_NOTIFICATION_API = 'https://api.timelyhealth.in/api/tasks/notifications';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
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

function MyNotifications() {
  const navigate = useNavigate();
  const [employeeName, setName] = useState('');
  const [employeeId, setEmpId] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewNotification, setViewNotification] = useState(null);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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
      setName(name);
      setEmpId(id);
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  }, [navigate]);

  const fetchNotifications = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${NOTIFICATIONS_API}/${employeeId}`);
      console.log('Notifications Response:', res.data);
      
      if (res.data.success) {
        const data = res.data.notifications || [];
        setNotifications(data);
        setTotalNotifications(res.data.total || data.length);
      } else {
        setNotifications([]);
        setTotalNotifications(0);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load notifications');
      setNotifications([]);
      setTotalNotifications(0);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setSelectedNotifications([]);
    setSelectAll(false);
  }, [filterType]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    setLoading(true);
    try {
      await axios.delete(`${DELETE_NOTIFICATION_API}/${notificationId}`);
      fetchNotifications();
      setSelectedNotifications([]);
      setSelectAll(false);
      showToastMessage('Notification deleted successfully!', 'success');
    } catch (err) {
      setError('Failed to delete notification');
      showToastMessage('Failed to delete notification', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) {
      showToastMessage('Please select notifications to delete', 'error');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) return;
    
    setLoading(true);
    try {
      for (const notifId of selectedNotifications) {
        await axios.delete(`${DELETE_NOTIFICATION_API}/${notifId}`);
      }
      fetchNotifications();
      setSelectedNotifications([]);
      setSelectAll(false);
      showToastMessage(`${selectedNotifications.length} notification(s) deleted successfully!`, 'success');
    } catch (err) {
      setError('Failed to delete notifications');
      showToastMessage('Failed to delete notifications', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) {
      showToastMessage('No notifications to delete', 'error');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete ALL notifications?')) return;
    
    setLoading(true);
    try {
      for (const notif of notifications) {
        await axios.delete(`${DELETE_NOTIFICATION_API}/${notif._id}`);
      }
      fetchNotifications();
      setSelectedNotifications([]);
      setSelectAll(false);
      showToastMessage('All notifications deleted successfully!', 'success');
    } catch (err) {
      setError('Failed to delete all notifications');
      showToastMessage('Failed to delete all notifications', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      const ids = filtered.map(n => n._id);
      setSelectedNotifications(ids);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const handleViewNotification = (notification) => {
    setViewNotification(notification);
    setShowViewModal(true);
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getTypeLabel = (type) => {
    const labels = {
      'task_assigned': 'Assigned',
      'task_updated': 'Updated',
      'task_completed': 'Completed',
      'task_overdue': 'Overdue',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'task_assigned': 'bg-blue-100 text-blue-700 border-blue-200',
      'task_updated': 'bg-amber-100 text-amber-700 border-amber-200',
      'task_completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'task_overdue': 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'task_assigned': '📋',
      'task_updated': '🔄',
      'task_completed': '✅',
      'task_overdue': '⚠️',
    };
    return icons[type] || '📬';
  };

  const filtered = notifications.filter((n) => {
    const matchType = filterType === 'ALL' || n.type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q || 
      n.message?.toLowerCase().includes(q) ||
      n.taskId?.taskName?.toLowerCase().includes(q) ||
      n.taskId?.title?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const counts = {
    ALL: notifications.length,
    task_assigned: notifications.filter((n) => n.type === 'task_assigned').length,
    task_updated: notifications.filter((n) => n.type === 'task_updated').length,
    task_completed: notifications.filter((n) => n.type === 'task_completed').length,
    task_overdue: notifications.filter((n) => n.type === 'task_overdue').length,
  };

  const mainContentPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]';

  const ViewNotificationModal = ({ notification, onClose }) => {
    if (!notification) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
              <FiBell className="w-4 h-4 sm:w-6 sm:h-6" />
              Notification Details
            </h3>
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
            </button>
          </div>
          <div className="px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3 sm:mb-4">
              <div className="w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                    {getTypeLabel(notification.type)}
                  </span>
                </div>
                <p className="text-sm sm:text-lg font-medium text-gray-800">{notification.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  <FiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Received At
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Recipient
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">{employeeName}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{employeeId}</p>
              </div>
            </div>

            {notification.taskId && (
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                  <FaTasks className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Task Details
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Task Name</p>
                    <p className="text-[10px] sm:text-sm font-medium text-gray-800">{notification.taskId.taskName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Title</p>
                    <p className="text-[10px] sm:text-sm font-medium text-gray-800">{notification.taskId.title || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Priority</p>
                    <p className="text-[10px] sm:text-sm font-medium text-gray-800">{notification.taskId.priority || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Status</p>
                    <p className="text-[10px] sm:text-sm font-medium text-gray-800">{notification.taskId.status || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50">
              <button onClick={onClose} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100/80 backdrop-blur-sm rounded-full text-xs sm:text-sm text-gray-700 font-medium hover:bg-gray-200 transition-all">
                Close
              </button>
              {notification.taskId && (
                <button
                  onClick={() => {
                    onClose();
                    navigate('/my-task', { state: { task: notification.taskId } });
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
                >
                  <FiEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  View Task
                </button>
              )}
              <button
                onClick={() => {
                  onClose();
                  handleDeleteNotification(notification._id);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
              >
                <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <FiBell className="text-white w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block truncate">
                  My Notifications
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Notifications
                </h2>
                <p className="text-[6px] sm:text-[10px] text-gray-500 hidden xs:block truncate max-w-[100px] sm:max-w-[200px]">
                  {notifications.length} notifications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-wrap">
              {selectedNotifications.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-1.5 sm:px-4 py-0.5 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-[8px] sm:text-sm font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105 flex items-center gap-0.5 sm:gap-2"
                >
                  <FiTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Delete Selected</span>
                  <span className="xs:hidden">{selectedNotifications.length}</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAllNotifications}
                  className="px-1.5 sm:px-4 py-0.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[8px] sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-0.5 sm:gap-2"
                >
                  <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Delete All</span>
                </button>
              )}
              <button onClick={fetchNotifications} className="p-1 sm:p-2 lg:p-2.5 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 transition-all hover:scale-105">
                <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <button onClick={handleLogout} className="px-1.5 sm:px-3 lg:px-4 py-0.5 sm:py-1.5 lg:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[8px] sm:text-xs lg:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-0.5 sm:gap-2">
                <FiLogOut className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xs:inline">Logout</span>
              </button>
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[8px] sm:text-xs lg:text-sm shadow-lg shadow-indigo-500/30 flex-shrink-0">
                {getInitials(employeeName)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="space-y-3 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              <StatCard label="Total" value={counts.ALL} icon={<FiBarChart2 className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-indigo-500/30" />
              <StatCard label="Assigned" value={counts.task_assigned} icon={<FiUser className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-500/30" />
              <StatCard label="Updated" value={counts.task_updated} icon={<FiRefreshCw className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-500/30" />
              <StatCard label="Completed" value={counts.task_completed} icon={<FiCheckCircle className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/30" />
              <StatCard label="Overdue" value={counts.task_overdue} icon={<FiAlertCircle className="w-3 h-3 sm:w-5 sm:h-5" />} gradient="bg-gradient-to-r from-rose-400 to-rose-500 shadow-rose-500/30" />
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="flex-1 min-w-[100px] sm:min-w-[200px] relative">
                <input
                  className="w-full px-2 sm:px-4 py-1 sm:py-2.5 pl-6 sm:pl-10 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[8px] sm:text-sm"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FiSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-nowrap overflow-x-auto gap-1 sm:gap-2 pb-1 sm:pb-2 scrollbar-hide">
              {Object.entries(counts).map(([type, count]) => {
                const isActive = filterType === type;
                const typeLabels = {
                  'ALL': 'All',
                  'task_assigned': 'Assigned',
                  'task_updated': 'Updated',
                  'task_completed': 'Completed',
                  'task_overdue': 'Overdue'
                };
                const typeIcons = {
                  'ALL': '📊',
                  'task_assigned': '📋',
                  'task_updated': '🔄',
                  'task_completed': '✅',
                  'task_overdue': '⚠️'
                };
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-[8px] sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-0.5 sm:gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/40 backdrop-blur-sm border border-white/30 text-gray-600 hover:bg-white/60'
                    }`}
                  >
                    <span className="inline sm:hidden">{typeIcons[type]}</span>
                    <span className="hidden sm:inline">{typeIcons[type]}</span>
                    <span className="hidden xs:inline">{typeLabels[type] || type}</span>
                    <span className={`text-[6px] sm:text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>({count})</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="p-2 sm:p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-xl flex items-center gap-1.5 sm:gap-3 text-rose-700 text-[10px] sm:text-sm">
                <FiAlertCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="mt-1.5 sm:mt-3 lg:mt-4 text-[10px] sm:text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                  <FiBell className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-400" />
                </div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-700">No notifications found</h3>
                <p className="text-[10px] sm:text-sm text-gray-400 mt-0.5 sm:mt-1">You haven't received any notifications yet</p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                {/* ─── TABLE WITH VERTICAL SCROLL ON MOBILE ─── */}
                <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-none">
                  <table className="w-full min-w-[700px] sm:min-w-full">
                    <thead className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm sticky top-0 z-10">
                      <tr>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectAll && filtered.length > 0}
                            onChange={handleSelectAll}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Received</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-[8px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {filtered.map((n, index) => {
                        const isSelected = selectedNotifications.includes(n._id);
                        return (
                          <tr
                            key={n._id}
                            className={`hover:bg-white/30 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}
                          >
                            <td className="px-2 sm:px-6 py-2 sm:py-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOne(n._id)}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4" onClick={() => handleViewNotification(n)}>
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[6px] sm:text-xs font-semibold ${getTypeColor(n.type)}`}>
                                {getTypeIcon(n.type)}
                                <span className="hidden xs:inline">{getTypeLabel(n.type)}</span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4" onClick={() => handleViewNotification(n)}>
                              <div className="text-[8px] sm:text-sm text-gray-800 truncate max-w-[80px] sm:max-w-[250px]">{n.message}</div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4" onClick={() => handleViewNotification(n)}>
                              {n.taskId ? (
                                <div className="text-[8px] sm:text-sm font-medium text-gray-700 truncate max-w-[60px] sm:max-w-[150px]">{n.taskId.taskName || n.taskId.title || 'N/A'}</div>
                              ) : (
                                <span className="text-[8px] sm:text-sm text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4" onClick={() => handleViewNotification(n)}>
                              <div className="text-[8px] sm:text-sm text-gray-600">{formatDate(n.createdAt)}</div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
                                <button
                                  onClick={() => handleViewNotification(n)}
                                  className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-indigo-50 transition-all group"
                                  title="View Details"
                                >
                                  <FiEye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                                </button>
                                {n.taskId && (
                                  <button
                                    onClick={() => {
                                      navigate('/my-task', { state: { task: n.taskId } });
                                    }}
                                    className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-emerald-50 transition-all group"
                                    title="View Task"
                                  >
                                    <FaTasks className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteNotification(n._id)}
                                  className="p-0.5 sm:p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-all group"
                                  title="Delete"
                                >
                                  <FiTrash2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
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

      {showViewModal && viewNotification && (
        <ViewNotificationModal
          notification={viewNotification}
          onClose={() => { setShowViewModal(false); setViewNotification(null); }}
        />
      )}

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

export default MyNotifications;