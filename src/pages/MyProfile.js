import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, 
  FiClock, FiDollarSign, FiAward, FiLogOut, FiEdit2, FiX,
  FiRefreshCw, FiCreditCard, FiHome, FiHash, FiFlag,
  FiCheckCircle, FiInfo, FiBookmark, FiUserCheck, FiUsers,
  FiStar, FiTrendingUp, FiTrendingDown
} from 'react-icons/fi';
import { FaTasks, FaRocket } from 'react-icons/fa';
import EmployeeSidebar from '../components/EmployeeSidebar';

const BASE_URL = 'http://62.72.29.27:5001/api';

function MyProfile() {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ─── Handle sidebar collapse state ───
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // ─── Get employeeId from localStorage ───
  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) { 
      navigate('/'); 
      return; 
    }

    try {
      const d = JSON.parse(raw);
      const name = d.fullName || d.name || d.employeeName || d.username || d.firstName || 'Employee';
      
      const id = d.employeeId || 
                 d.employee?.employeeId || 
                 d.employee?.id || 
                 d.employee?._id || 
                 d.id || 
                 d._id || 
                 d.userId || 
                 '';
      
      console.log('🔍 Retrieved employeeId:', id);
      
      setEmployeeName(name);
      setEmployeeId(id);
    } catch (err) {
      console.error('Error parsing userData:', err);
      navigate('/');
    }
  }, [navigate]);

  // ─── Fetch Employee Profile ───
  const fetchEmployeeProfile = async () => {
    if (!employeeId) {
      setError('Employee ID not found. Please login again.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${BASE_URL}/employees/get-employee?employeeId=${employeeId}`);
      
      console.log('📡 API Response:', response.data);
      
      if (response.data.success) {
        setEmployeeData(response.data.data);
        if (response.data.data.name) {
          setEmployeeName(response.data.data.name);
        }
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      console.error('Error fetching employee profile:', err);
      
      if (err.response?.status === 404) {
        setError('Employee not found. Please check your employee ID.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeProfile();
    }
  }, [employeeId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ─── Format Date ───
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // ─── Get Initials ───
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // ─── Status Badge ───
  const StatusBadge = ({ status }) => {
    const isActive = status === 'active' || status === true;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
        isActive 
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}>
        {isActive ? <FiCheckCircle className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // ─── Info Card ───
  const InfoCard = ({ icon, label, value, className = '' }) => {
    if (!value) return null;
    return (
      <div className={`bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:shadow-lg transition-all ${className}`}>
        <div className="flex items-start gap-3">
          <div className="text-indigo-500 mt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  // ─── Stat Card ───
  const StatCard = ({ label, value, icon, gradient }) => {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg ${gradient}`}>
            <span className="text-white text-sm sm:text-base lg:text-lg">{icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm lg:text-base font-bold text-gray-800 truncate">{value}</p>
            <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider truncate">{label}</p>
          </div>
        </div>
      </div>
    );
  };

  // ─── Dynamic padding based on sidebar state ───
  const mainContentPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]';

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/30">
          <div className="w-16 h-16 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <FiX className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Profile</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchEmployeeProfile}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/30">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <FiUser className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Profile Data</h3>
          <p className="text-gray-500 text-sm">Unable to load profile data. Please try again.</p>
        </div>
      </div>
    );
  }

  const data = employeeData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex">
      {/* ─── Sidebar ─── */}
      <EmployeeSidebar 
        employeeName={employeeName} 
        onLogout={handleLogout}
        onCollapseChange={handleSidebarToggle}
      />

      {/* ─── Main Content ─── */}
      <div className={`flex-1 min-h-screen w-full ${mainContentPadding} flex flex-col transition-all duration-300 ease-in-out`}>
        {/* ─── Fixed Header ─── */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <FaTasks className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block truncate">
                  My Profile
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Profile
                </h2>
                <p className="text-[8px] sm:text-[10px] text-gray-500 hidden xs:block truncate max-w-[120px] sm:max-w-[200px]">
                  {data.employeeId} · {data.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
              <button
                onClick={fetchEmployeeProfile}
                className="p-1.5 sm:p-2 lg:p-2.5 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 transition-all hover:scale-105"
                title="Refresh"
              >
                <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[10px] sm:text-xs lg:text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 flex items-center gap-1 sm:gap-2"
              >
                <FiLogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xs:inline">Logout</span>
              </button>
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs lg:text-sm shadow-lg shadow-indigo-500/30 flex-shrink-0">
                {getInitials(data.name)}
              </div>
            </div>
          </div>
        </header>

        {/* ─── Scrollable Content ─── */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {/* ─── Profile Header ─── */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/30 shadow-lg mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl sm:text-3xl lg:text-4xl font-bold shadow-xl shadow-indigo-500/30 flex-shrink-0">
                {getInitials(data.name)}
              </div>
              
              {/* Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]">
                    {data.name}
                  </h1>
                  <StatusBadge status={data.status} />
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-1">{data.role || 'Employee'}</p>
                <p className="text-xs sm:text-sm text-gray-500">{data.employeeId}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/40 backdrop-blur-sm rounded-full text-xs text-gray-600 border border-white/30">
                    <FiMail className="w-3 h-3" />
                    {data.email}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/40 backdrop-blur-sm rounded-full text-xs text-gray-600 border border-white/30">
                    <FiBriefcase className="w-3 h-3" />
                    {data.department || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Stats Cards ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <StatCard 
              label="Employee ID" 
              value={data.employeeId || 'N/A'} 
              icon={<FiHash className="w-4 h-4 sm:w-5 sm:h-5" />}
              gradient="bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-indigo-500/30"
            />
            <StatCard 
              label="Department" 
              value={data.department || 'N/A'} 
              icon={<FiBriefcase className="w-4 h-4 sm:w-5 sm:h-5" />}
              gradient="bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-500/30"
            />
            <StatCard 
              label="Role" 
              value={data.role || 'N/A'} 
              icon={<FiUserCheck className="w-4 h-4 sm:w-5 sm:h-5" />}
              gradient="bg-gradient-to-r from-purple-400 to-purple-500 shadow-purple-500/30"
            />
            <StatCard 
              label="Status" 
              value={data.status === 'active' ? 'Active' : 'Inactive'} 
              icon={<FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
              gradient="bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/30"
            />
          </div>

          {/* ─── Personal Information ─── */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <InfoCard 
                icon={<FiUser className="w-4 h-4" />} 
                label="Full Name" 
                value={data.name} 
              />
              <InfoCard 
                icon={<FiMail className="w-4 h-4" />} 
                label="Email" 
                value={data.email} 
              />
              <InfoCard 
                icon={<FiPhone className="w-4 h-4" />} 
                label="Phone" 
                value={data.phone || 'N/A'} 
              />
              <InfoCard 
                icon={<FiCalendar className="w-4 h-4" />} 
                label="Date of Birth" 
                value={formatDate(data.dob)} 
              />
              <InfoCard 
                icon={<FiCalendar className="w-4 h-4" />} 
                label="Join Date" 
                value={formatDate(data.joinDate)} 
              />
              <InfoCard 
                icon={<FiClock className="w-4 h-4" />} 
                label="Shift Type" 
                value={data.shiftType || 'N/A'} 
              />
            </div>
          </div>

          {/* ─── Address Information ─── */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <InfoCard 
                icon={<FiHome className="w-4 h-4" />} 
                label="Address Line 1" 
                value={data.addressLine1 || 'N/A'} 
              />
              <InfoCard 
                icon={<FiHome className="w-4 h-4" />} 
                label="Address Line 2" 
                value={data.addressLine2 || 'N/A'} 
              />
              <InfoCard 
                icon={<FiMapPin className="w-4 h-4" />} 
                label="City" 
                value={data.city || 'N/A'} 
              />
              <InfoCard 
                icon={<FiMapPin className="w-4 h-4" />} 
                label="State" 
                value={data.state || 'N/A'} 
              />
              <InfoCard 
                icon={<FiMapPin className="w-4 h-4" />} 
                label="Country" 
                value={data.country || 'N/A'} 
              />
              <InfoCard 
                icon={<FiHash className="w-4 h-4" />} 
                label="Pin Code" 
                value={data.pinCode || 'N/A'} 
              />
            </div>
          </div>

          {/* ─── Employment Details ─── */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiBriefcase className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              Employment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <InfoCard 
                icon={<FiClock className="w-4 h-4" />} 
                label="Shift Hours" 
                value={data.shiftHours ? `${data.shiftHours} hrs` : 'N/A'} 
              />
              <InfoCard 
                icon={<FiCalendar className="w-4 h-4" />} 
                label="Week Off Per Month" 
                value={data.weekOffPerMonth || 'N/A'} 
              />
              <InfoCard 
                icon={<FiUser className="w-4 h-4" />} 
                label="Week Off Type" 
                value={data.weekOffType || 'N/A'} 
              />
              <InfoCard 
                icon={<FiAward className="w-4 h-4" />} 
                label="Assigned Working Days" 
                value={data.assignedWorkingDays || 'N/A'} 
              />
            </div>
          </div>

          {/* ─── Salary Details ─── */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              Salary Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <InfoCard 
                icon={<FiDollarSign className="w-4 h-4" />} 
                label="Salary Per Month" 
                value={data.salaryPerMonth ? `₹${data.salaryPerMonth.toLocaleString()}` : 'N/A'} 
              />
              <InfoCard 
                icon={<FiDollarSign className="w-4 h-4" />} 
                label="Basic Pay" 
                value={data.basicPay ? `₹${data.basicPay.toLocaleString()}` : 'N/A'} 
              />
              <InfoCard 
                icon={<FiDollarSign className="w-4 h-4" />} 
                label="HRA" 
                value={data.hra ? `₹${data.hra.toLocaleString()}` : 'N/A'} 
              />
              <InfoCard 
                icon={<FiTrendingUp className="w-4 h-4" />} 
                label="Conveyance Allowance" 
                value={data.conveyanceAllowance ? `₹${data.conveyanceAllowance.toLocaleString()}` : 'N/A'} 
              />
              <InfoCard 
                icon={<FiTrendingUp className="w-4 h-4" />} 
                label="Medical Allowance" 
                value={data.medicalAllowance ? `₹${data.medicalAllowance.toLocaleString()}` : 'N/A'} 
              />
              <InfoCard 
                icon={<FiTrendingUp className="w-4 h-4" />} 
                label="Performance Allowance" 
                value={data.performanceAllowance ? `₹${data.performanceAllowance.toLocaleString()}` : 'N/A'} 
              />
            </div>
          </div>

          {/* ─── Bank Details ─── */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              Bank Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <InfoCard 
                icon={<FiCreditCard className="w-4 h-4" />} 
                label="Bank Name" 
                value={data.bankName || 'N/A'} 
              />
              <InfoCard 
                icon={<FiCreditCard className="w-4 h-4" />} 
                label="Account Number" 
                value={data.bankAccountNo || 'N/A'} 
              />
              <InfoCard 
                icon={<FiHash className="w-4 h-4" />} 
                label="IFSC Code" 
                value={data.ifscCode || 'N/A'} 
              />
              <InfoCard 
                icon={<FiHash className="w-4 h-4" />} 
                label="PAN Number" 
                value={data.panNumber || 'N/A'} 
              />
              <InfoCard 
                icon={<FiHash className="w-4 h-4" />} 
                label="PF Number" 
                value={data.pfNumber || 'N/A'} 
              />
              <InfoCard 
                icon={<FiHash className="w-4 h-4" />} 
                label="UAN Number" 
                value={data.uanNumber || 'N/A'} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;