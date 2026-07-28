import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiX, FiEye, FiTrash2, FiRefreshCw, FiSearch,
  FiAlertCircle, FiClock, FiUser, FiCalendar, 
  FiCheckCircle, FiBell, FiTrash, FiChevronLeft, FiChevronRight,
  FiInbox
} from 'react-icons/fi';
import { FaTasks } from 'react-icons/fa';
import Navbar from '../Navbar';
import '../AdminDashboard.css';

const NOTIFICATIONS_API = 'https://api.timelyhealth.in/api/tasks/notifications';

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
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getTypeConfig(type) {
  switch (type) {
    case 'task_assigned':
      return {
        label: 'Task Assigned',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badgeColor: 'bg-blue-500',
        icon: <FiUser className="w-3.5 h-3.5 text-blue-600" />
      };
    case 'task_updated':
      return {
        label: 'Task Updated',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badgeColor: 'bg-amber-500',
        icon: <FiRefreshCw className="w-3.5 h-3.5 text-amber-600" />
      };
    case 'task_completed':
      return {
        label: 'Task Completed',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badgeColor: 'bg-emerald-500',
        icon: <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
      };
    case 'task_overdue':
      return {
        label: 'Task Overdue',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        badgeColor: 'bg-rose-500',
        icon: <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />
      };
    default:
      return {
        label: type || 'Notification',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        badgeColor: 'bg-slate-500',
        icon: <FiBell className="w-3.5 h-3.5 text-slate-600" />
      };
  }
}

function Notifications() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'admin';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewNotification, setViewNotification] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentDateTime, setCurrentDateTime] = useState('');
  
  // ─── Selection State ───
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  // ─── Fetch All Notifications ───
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(NOTIFICATIONS_API);
      if (response.data && response.data.success) {
        const data = response.data.notifications || [];
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Fetch notifications error:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ─── Reset Selection when Filter changes ───
  useEffect(() => {
    setSelectedNotifications([]);
    setSelectAll(false);
    setCurrentPage(1);
  }, [filterType, searchTerm]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ─── Delete Single Notification ───
  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    setLoading(true);
    try {
      await axios.delete(`${NOTIFICATIONS_API}/${notificationId}`);
      fetchNotifications();
      showToastMessage('Notification deleted successfully!', 'success');
    } catch (err) {
      setError('Failed to delete notification');
      showToastMessage('Failed to delete notification', 'error');
      console.error('Delete notification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete Selected Notifications ───
  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) {
      showToastMessage('Please select notifications to delete', 'error');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} selected notification(s)?`)) return;
    
    setLoading(true);
    try {
      for (const notifId of selectedNotifications) {
        await axios.delete(`${NOTIFICATIONS_API}/${notifId}`);
      }
      fetchNotifications();
      setSelectedNotifications([]);
      setSelectAll(false);
      showToastMessage(`${selectedNotifications.length} notification(s) deleted successfully!`, 'success');
    } catch (err) {
      setError('Failed to delete notifications');
      showToastMessage('Failed to delete notifications', 'error');
      console.error('Delete selected notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete All Notifications ───
  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) {
      showToastMessage('No notifications to delete', 'error');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete ALL notifications?')) return;
    
    setLoading(true);
    try {
      for (const notif of notifications) {
        await axios.delete(`${NOTIFICATIONS_API}/${notif._id}`);
      }
      fetchNotifications();
      setSelectedNotifications([]);
      setSelectAll(false);
      showToastMessage('All notifications deleted successfully!', 'success');
    } catch (err) {
      setError('Failed to delete all notifications');
      showToastMessage('Failed to delete all notifications', 'error');
      console.error('Delete all notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Filters & Search ───
  const filtered = notifications.filter((item) => {
    const matchType = filterType === 'ALL' || item.type === filterType;
    const query = searchTerm.toLowerCase().trim();
    if (!query) return matchType;
    
    const msg = (item.message || '').toLowerCase();
    const recipientName = (item.recipient?.name || '').toLowerCase();
    const recipientEmail = (item.recipient?.email || '').toLowerCase();
    const taskName = (item.taskId?.taskName || item.taskId?.title || '').toLowerCase();

    return matchType && (
      msg.includes(query) || 
      recipientName.includes(query) || 
      recipientEmail.includes(query) || 
      taskName.includes(query)
    );
  });

  const counts = {
    ALL: notifications.length,
    task_assigned: notifications.filter((n) => n.type === 'task_assigned').length,
    task_updated: notifications.filter((n) => n.type === 'task_updated').length,
    task_completed: notifications.filter((n) => n.type === 'task_completed').length,
    task_overdue: notifications.filter((n) => n.type === 'task_overdue').length,
  };

  // ─── Pagination ───
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = filtered.slice(startIndex, endIndex);

  // ─── Toggle Select All ───
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      const ids = currentNotifications.map(n => n._id);
      setSelectedNotifications(ids);
    }
    setSelectAll(!selectAll);
  };

  // ─── Toggle Single Selection ───
  const handleSelectOne = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const openViewModal = (notification) => {
    setViewNotification(notification);
    setShowViewModal(true);
  };

  // ─── View Notification Modal ───
  const ViewNotificationModal = ({ notification, onClose }) => {
    if (!notification) return null;
    const config = getTypeConfig(notification.type);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 animate-slideDown flex flex-col">
          {/* Modal Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
                <FiBell className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Notification Details</h2>
                <p className="text-xs text-slate-500">System Notification & Details</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Header Badge & Message */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                  {config.icon}
                  {config.label}
                </span>
                <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                  <FiClock className="w-3.5 h-3.5" />
                  {formatDate(notification.createdAt)}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">{notification.message}</h3>
            </div>

            {/* Recipient & Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                  <FiUser className="w-4 h-4 text-indigo-600" />
                  Recipient Info
                </div>
                <p className="text-sm font-bold text-slate-800">{notification.recipient?.name || 'N/A'}</p>
                {notification.recipient?.email && (
                  <p className="text-xs text-slate-500 mt-0.5">{notification.recipient?.email}</p>
                )}
                {notification.recipient?.employeeId && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                    ID: {notification.recipient?.employeeId}
                  </span>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                  <FiClock className="w-4 h-4 text-indigo-600" />
                  Time & Date
                </div>
                <p className="text-sm font-bold text-slate-800">{formatDate(notification.createdAt)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Automated System Alert</p>
              </div>
            </div>

            {/* Linked Task Details if present */}
            {notification.taskId && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-3">
                  <FaTasks className="w-4 h-4 text-indigo-600" />
                  Associated Task Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Task Name</span>
                    <span className="font-bold text-slate-800">{notification.taskId.taskName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Task Title</span>
                    <span className="font-medium text-slate-700">{notification.taskId.title || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Status</span>
                    <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded text-[11px] mt-0.5">
                      {notification.taskId.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                handleDeleteNotification(notification._id);
              }}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition shadow-sm flex items-center gap-1.5"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete Notification
            </button>
          </div>
        </div>
      </div>
    );
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
                <FiBell className="w-7 h-7 text-indigo-600" /> Notifications <span>Center</span>
              </h1>
              <p className="admin-dash__subtitle text-xs sm:text-sm text-slate-500 mt-1">
                View, filter, and manage system notifications and team updates.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* ─── Live Date & Time Display ─── */}
              <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-xs text-slate-700 font-semibold text-xs">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDateTime}</span>
              </div>
              
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-xs"
                title="Refresh Notifications"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {selectedNotifications.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold text-xs hover:bg-amber-700 transition shadow-md"
                >
                  <FiTrash className="w-4 h-4" />
                  Delete Selected ({selectedNotifications.length})
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAllNotifications}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-semibold text-xs hover:bg-rose-700 transition shadow-md"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete All
                </button>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold shadow-xs">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 5 KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            
            <div 
              onClick={() => setFilterType('ALL')}
              className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                filterType === 'ALL' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Notifs</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FiInbox className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{counts.ALL}</div>
              <div className="text-xs text-slate-400 mt-1">all received notifications</div>
            </div>

            <div 
              onClick={() => setFilterType('task_assigned')}
              className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                filterType === 'task_assigned' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FiUser className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{counts.task_assigned}</div>
              <div className="text-xs text-slate-400 mt-1">task assignments</div>
            </div>

            <div 
              onClick={() => setFilterType('task_updated')}
              className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                filterType === 'task_updated' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FiRefreshCw className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{counts.task_updated}</div>
              <div className="text-xs text-slate-400 mt-1">status & task updates</div>
            </div>

            <div 
              onClick={() => setFilterType('task_completed')}
              className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                filterType === 'task_completed' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{counts.task_completed}</div>
              <div className="text-xs text-slate-400 mt-1">completed tasks</div>
            </div>

            <div 
              onClick={() => setFilterType('task_overdue')}
              className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                filterType === 'task_overdue' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue</span>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <FiAlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{counts.task_overdue}</div>
              <div className="text-xs text-slate-400 mt-1">deadline alerts</div>
            </div>

          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Type Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {[
                  { id: 'ALL', label: 'All Types', count: counts.ALL, icon: <FiInbox className="w-4 h-4" /> },
                  { id: 'task_assigned', label: 'Assigned', count: counts.task_assigned, icon: <FiUser className="w-4 h-4 text-blue-500" /> },
                  { id: 'task_updated', label: 'Updated', count: counts.task_updated, icon: <FiRefreshCw className="w-4 h-4 text-amber-500" /> },
                  { id: 'task_completed', label: 'Completed', count: counts.task_completed, icon: <FiCheckCircle className="w-4 h-4 text-emerald-500" /> },
                  { id: 'task_overdue', label: 'Overdue', count: counts.task_overdue, icon: <FiAlertCircle className="w-4 h-4 text-rose-500" /> },
                ].map((tab) => {
                  const active = filterType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFilterType(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                        active 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notification or recipient..."
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

            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-3 text-xs font-semibold text-slate-500">Loading notifications...</p>
            </div>
          ) : currentNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                <FiBell className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No notifications found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchTerm 
                  ? `No notifications matching "${searchTerm}". Try clearing search filters.`
                  : 'You have no notifications in this view.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectAll && currentNotifications.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Notification Message</th>
                      <th className="py-3.5 px-4 hidden md:table-cell">Recipient</th>
                      <th className="py-3.5 px-4 hidden lg:table-cell">Sent Date & Time</th>
                      <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {currentNotifications.map((item) => {
                      const config = getTypeConfig(item.type);
                      const isSelected = selectedNotifications.includes(item._id);

                      return (
                        <tr
                          key={item._id}
                          onClick={() => openViewModal(item)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/40 hover:bg-indigo-50/60' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(item._id)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>

                          {/* Type Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                              {config.icon}
                              <span>{config.label}</span>
                            </span>
                          </td>

                          {/* Message & Associated Task */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 line-clamp-1 max-w-md">{item.message}</div>
                            {item.taskId && (
                              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <FaTasks className="w-3 h-3 text-slate-400" />
                                <span>Task: <strong className="text-slate-600 font-medium">{item.taskId.taskName || item.taskId.title || 'N/A'}</strong></span>
                              </div>
                            )}
                          </td>

                          {/* Recipient Info */}
                          <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                {getInitials(item.recipient?.name)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 leading-tight">{item.recipient?.name || 'N/A'}</p>
                                <p className="text-[10px] text-slate-400">{item.recipient?.employeeId || item.recipient?.email || ''}</p>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap text-slate-600 font-medium">
                            {formatDate(item.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openViewModal(item)}
                                className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition shadow-2xs"
                                title="View Notification"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteNotification(item._id)}
                                className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition shadow-2xs"
                                title="Delete Notification"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
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
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                  <div>
                    Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{' '}
                    <span className="font-bold text-slate-800">{Math.min(endIndex, filtered.length)}</span> of{' '}
                    <span className="font-bold text-slate-800">{filtered.length}</span> notifications
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
      </main>

      {/* View Modal */}
      {showViewModal && viewNotification && (
        <ViewNotificationModal 
          notification={viewNotification} 
          onClose={() => { setShowViewModal(false); setViewNotification(null); }} 
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideDown">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
            toastType === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {toastType === 'success' ? <FiCheckCircle className="w-4 h-4 text-emerald-600" /> : <FiAlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}

export default Notifications;