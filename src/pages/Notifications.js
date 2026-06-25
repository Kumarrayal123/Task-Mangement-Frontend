import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiX, FiEye, FiTrash2, FiRefreshCw, FiFilter, 
  FiAlertCircle, FiClock, FiUser, FiBriefcase, FiCalendar, 
  FiFlag, FiCheckCircle, FiPlus, FiMoreVertical, FiMail, 
  FiHash, FiAlertTriangle, FiCheck, FiCircle, FiInfo,
  FiStar, FiBarChart2, FiList, FiTool, FiLogOut, FiBell,
  FiMessageSquare, FiSend, FiTrash, FiMenu,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { FaTasks, FaRocket } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import '../Sidebar.css';

const NOTIFICATIONS_API = 'http://localhost:5001/api/tasks/notifications';

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
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function Notifications() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewNotification, setViewNotification] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ─── NEW: Selection State ───
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  // ─── Fetch All Notifications ───
  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(NOTIFICATIONS_API);
      console.log('Notifications Response:', response.data);
      
      if (response.data.success) {
        const data = response.data.notifications || [];
        setNotifications(data);
        setTotalNotifications(response.data.total || data.length);
      } else {
        setNotifications([]);
        setTotalNotifications(0);
      }
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Fetch notifications error:', err);
      setNotifications([]);
      setTotalNotifications(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ─── Reset Selection ───
  useEffect(() => {
    setSelectedNotifications([]);
    setSelectAll(false);
  }, [filterType]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ─── Delete Single Notification ───
  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5001/api/tasks/notifications/${notificationId}`);
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
    
    if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) return;
    
    setLoading(true);
    try {
      for (const notifId of selectedNotifications) {
        await axios.delete(`http://localhost:5001/api/tasks/notifications/${notifId}`);
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
        await axios.delete(`http://localhost:5001/api/tasks/notifications/${notif._id}`);
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

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ─── Filters ───
  const filtered = notifications.filter((item) => {
    const matchType = filterType === 'ALL' || item.type === filterType;
    return matchType;
  });

  const counts = {
    ALL: notifications.length,
    task_assigned: notifications.filter((n) => n.type === 'task_assigned').length,
    task_updated: notifications.filter((n) => n.type === 'task_updated').length,
    task_completed: notifications.filter((n) => n.type === 'task_completed').length,
    task_overdue: notifications.filter((n) => n.type === 'task_overdue').length,
  };

  // ─── Pagination ───
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = filtered.slice(startIndex, endIndex);

  // ─── View Notification Modal ───
  const ViewNotificationModal = ({ notification, onClose }) => {
    if (!notification) return null;

    const getTypeIcon = (type) => {
      const icons = {
        'task_assigned': <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
        'task_updated': <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
        'task_completed': <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />,
        'task_overdue': <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />,
      };
      return icons[type] || <FiBell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
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

    const getTypeLabel = (type) => {
      const labels = {
        'task_assigned': 'Task Assigned',
        'task_updated': 'Task Updated',
        'task_completed': 'Task Completed',
        'task_overdue': 'Task Overdue',
      };
      return labels[type] || type;
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 animate-slideDown">
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100/50 flex justify-between items-center">
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
              <FiBell className="w-4 h-4 sm:w-6 sm:h-6" />
              Notification Details
            </h2>
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
            </button>
          </div>
          <div className="px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-4">
              <div className="w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  {getTypeIcon(notification.type)}
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getTypeColor(notification.type)}`}>
                    {getTypeLabel(notification.type)}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-gray-800">{notification.message}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Recipient
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">
                  {notification.recipient?.name || 'N/A'}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500">{notification.recipient?.email || ''}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">{notification.recipient?.employeeId || ''}</p>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  <FiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Sent At
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800">
                  {formatDate(notification.createdAt)}
                </p>
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
              <button
                onClick={() => {
                  onClose();
                  handleDeleteNotification(notification._id);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
              >
                <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                Delete
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
                  <FiBell className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block">
                  Notifications
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Notifs
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
                  <FiBell className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-indigo-500" />
                  All Notifications
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">View and manage all system notifications</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* ─── Delete Selected Button ─── */}
                {selectedNotifications.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-[10px] sm:text-sm font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
                  >
                    <FiTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Delete Selected</span>
                    <span className="xs:hidden">{selectedNotifications.length}</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAllNotifications}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[10px] sm:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
                  >
                    <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Delete All</span>
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 text-gray-700 font-medium hover:bg-white/60 transition-all flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm"
                >
                  <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Refresh</span>
                </button>
              </div>
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
              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer" onClick={() => setFilterType('ALL')}>
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <FiBarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
                    <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{counts.ALL}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer" onClick={() => setFilterType('task_assigned')}>
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</p>
                    <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{counts.task_assigned}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer" onClick={() => setFilterType('task_updated')}>
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-amber-100 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</p>
                    <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{counts.task_updated}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer" onClick={() => setFilterType('task_completed')}>
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-emerald-100 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
                    <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{counts.task_completed}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer" onClick={() => setFilterType('task_overdue')}>
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-rose-100 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <FiAlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</p>
                    <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{counts.task_overdue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 min-w-[120px] sm:min-w-[200px]">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 px-2 sm:px-4 py-1.5 sm:py-2">
                  <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-[10px] sm:text-sm text-gray-700 min-w-0"
                  >
                    <option value="ALL">All Types</option>
                    <option value="task_assigned">Task Assigned</option>
                    <option value="task_updated">Task Updated</option>
                    <option value="task_completed">Task Completed</option>
                    <option value="task_overdue">Task Overdue</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Type Tabs - Mobile Scrollable */}
            <div className="flex flex-nowrap overflow-x-auto gap-1.5 sm:gap-2 mb-4 sm:mb-6 pb-1 sm:pb-2 scrollbar-hide">
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
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/40 backdrop-blur-sm border border-white/30 text-gray-600 hover:bg-white/60'
                    }`}
                  >
                    <span className="inline sm:hidden">{typeIcons[type]}</span>
                    <span className="hidden sm:inline">{typeIcons[type]}</span>
                    <span className="ml-0.5 sm:ml-1.5">{typeLabels[type] || type} ({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Notifications Table with Checkbox */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : currentNotifications.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <FiBell className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700">No notifications found</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">All notifications are cleared or none sent</p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] sm:min-w-[800px]">
                    <thead className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
                      <tr>
                        {/* ─── Checkbox Column ─── */}
                        <th className="px-2 sm:px-4 py-2 sm:py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectAll && currentNotifications.length > 0}
                            onChange={handleSelectAll}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Recipient</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Sent At</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-4 text-right text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {currentNotifications.map((item, index) => {
                        const getTypeColor = (type) => {
                          const colors = {
                            'task_assigned': 'bg-blue-100 text-blue-700',
                            'task_updated': 'bg-amber-100 text-amber-700',
                            'task_completed': 'bg-emerald-100 text-emerald-700',
                            'task_overdue': 'bg-rose-100 text-rose-700',
                          };
                          return colors[type] || 'bg-gray-100 text-gray-700';
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

                        const getTypeIcon = (type) => {
                          const icons = {
                            'task_assigned': '📋',
                            'task_updated': '🔄',
                            'task_completed': '✅',
                            'task_overdue': '⚠️',
                          };
                          return icons[type] || '📬';
                        };

                        const isSelected = selectedNotifications.includes(item._id);

                        return (
                          <tr
                            key={item._id}
                            className={`hover:bg-white/30 transition-all duration-200 cursor-pointer ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}
                            onClick={() => openViewModal(item)}
                          >
                            {/* ─── Checkbox ─── */}
                            <td className="px-2 sm:px-4 py-2 sm:py-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOne(item._id)}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${getTypeColor(item.type)}`}>
                                {getTypeIcon(item.type)}
                                <span className="hidden sm:inline">{getTypeLabel(item.type)}</span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4">
                              <div className="text-[10px] sm:text-sm text-gray-800 truncate max-w-[80px] sm:max-w-[300px]">{item.message}</div>
                              {item.taskId && (
                                <div className="text-[8px] sm:text-xs text-gray-500 truncate max-w-[60px] sm:max-w-[300px]">
                                  Task: {item.taskId.taskName || 'N/A'}
                                </div>
                              )}
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4 hidden md:table-cell">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[8px] sm:text-xs font-bold">
                                  {getInitials(item.recipient?.name || 'U')}
                                </div>
                                <div className="hidden lg:block">
                                  <div className="text-[10px] sm:text-sm font-medium text-gray-700">{item.recipient?.name || 'N/A'}</div>
                                  <div className="text-[8px] sm:text-xs text-gray-500">{item.recipient?.employeeId || ''}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4 hidden lg:table-cell">
                              <div className="text-[10px] sm:text-sm text-gray-600">{formatDate(item.createdAt)}</div>
                            </td>
                            <td className="px-2 sm:px-6 py-2 sm:py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
                                <button
                                  onClick={() => openViewModal(item)}
                                  className="p-1 sm:p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-indigo-50 transition-all group"
                                  title="View Notification"
                                >
                                  <FiEye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNotification(item._id)}
                                  className="p-1 sm:p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-rose-50 transition-all group"
                                  title="Delete Notification"
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
                      Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} notifications
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

      {/* View Modal */}
      {showViewModal && viewNotification && (
        <ViewNotificationModal 
          notification={viewNotification} 
          onClose={() => { setShowViewModal(false); setViewNotification(null); }} 
        />
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

export default Notifications;