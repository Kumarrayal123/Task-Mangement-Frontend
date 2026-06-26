import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUsers, FiSearch, FiRefreshCw, FiMail, FiBriefcase, 
  FiUser, FiCheckCircle, FiClock, FiAlertCircle, FiBarChart2, 
  FiChevronLeft, FiChevronRight, FiX, FiMenu, FiLogOut
} from 'react-icons/fi';
import { FaTasks } from 'react-icons/fa';
import Sidebar from './Sidebar';
import './Staff.css';

const BASE_URL = 'http://62.72.29.27:5001/api';

function Staff() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const userRole = localStorage.getItem('userRole') || 'admin';
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      
      // Try multiple possible field names for the user's name
      const name = parsedData.name || 
                   parsedData.adminName || 
                   parsedData.username || 
                   parsedData.fullName || 
                   parsedData.firstName || 
                   parsedData.user?.name ||
                   parsedData.data?.name ||
                   parsedData.data?.adminName ||
                   'Admin';
      
      setAdminName(name);
    } else {
      // If no user data, redirect to login
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

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${BASE_URL}/employees/get-employees`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Employees API response:', response.data);
        const allEmployees = response.data.data || response.data || [];
        // Filter to show only active employees
        const activeEmployees = allEmployees.filter(emp => 
          emp.status === 'active' || 
          emp.isActive === true || 
          emp.status === true
        );
        setEmployees(activeEmployees);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to fetch employees. Please try again.');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => {
    const search = searchTerm.toLowerCase();
    const name = (emp.name || emp.employeeName || emp.fullName || emp.firstName || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const role = (emp.role || emp.position || emp.designation || '').toLowerCase();
    const department = (emp.department || '').toLowerCase();
    
    return name.includes(search) || 
           email.includes(search) || 
           role.includes(search) || 
           department.includes(search);
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get unique departments for stats
  const departments = [...new Set(employees.map(emp => emp.department || 'Other'))];
  
  // Get unique roles for stats
  const roles = [...new Set(employees.map(emp => emp.role || 'Employee'))];

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
          <Sidebar userRole={userRole} />
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
                  Staff Management
                </h2>
                <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent xs:hidden">
                  Staff
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
                  <FiUsers className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-indigo-500" />
                  Staff Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">View and manage your team members</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 text-gray-700 font-medium hover:bg-white/60 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Refresh
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 lg:mb-8">
              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <FiUsers className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Staff</p>
                    <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{employees.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <FiBriefcase className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Departments</p>
                    <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{departments.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <FiBarChart2 className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</p>
                    <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{roles.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <FiCheckCircle className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
                    <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-800">{employees.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4 sm:mb-6">
              <div className="max-w-full sm:max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-8 sm:pl-10 bg-white/40 backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm"
                  />
                  <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-xl flex items-center gap-2 sm:gap-3 text-rose-700 text-xs sm:text-sm">
                <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm text-gray-500">Loading employees...</p>
              </div>
            )}

            {/* No Employees */}
            {!loading && !error && employees.length === 0 && (
              <div className="text-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <FiUsers className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700">No employees found</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">No staff members available</p>
              </div>
            )}

            {/* No Results for Search */}
            {!loading && !error && employees.length > 0 && filteredEmployees.length === 0 && (
              <div className="text-center py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <FiSearch className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700">No matching employees</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
              </div>
            )}

            {/* Employee Table */}
            {!loading && !error && employees.length > 0 && filteredEmployees.length > 0 && (
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] sm:min-w-[800px]">
                    <thead className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FiUser className="w-3 h-3" />
                            Employee
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FiMail className="w-3 h-3" />
                            Email
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FiBriefcase className="w-3 h-3" />
                            Role
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FiUsers className="w-3 h-3" />
                            Department
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FiCheckCircle className="w-3 h-3" />
                            Status
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {currentEmployees.map((employee, index) => {
                        const name = employee.name || employee.employeeName || employee.fullName || employee.firstName || 'Unknown';
                        const email = employee.email || 'No email';
                        const role = employee.role || employee.position || employee.designation || employee.jobTitle || 'Employee';
                        const department = employee.department || employee.departmentName || 'N/A';
                        const status = employee.status || employee.isActive || 'active';
                        const isActive = status === 'active' || status === true;

                        return (
                          <tr
                            key={index}
                            className={`hover:bg-white/30 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}
                          >
                            <td className="px-3 sm:px-6 py-2 sm:py-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-sm shadow-lg shadow-indigo-500/25 flex-shrink-0">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[10px] sm:text-sm font-semibold text-gray-800 truncate max-w-[80px] sm:max-w-[150px]">{name}</div>
                                  {employee.employeeId && (
                                    <div className="text-[8px] sm:text-xs text-gray-400 truncate max-w-[60px] sm:max-w-[100px]">ID: {employee.employeeId}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                              <div className="text-[10px] sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-[200px]">{email}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4">
                              <span className="inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-[8px] sm:text-xs font-semibold border border-indigo-200/50">
                                <FiBriefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="truncate max-w-[50px] sm:max-w-[100px]">{role}</span>
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 hidden md:table-cell">
                              <span className="inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-[8px] sm:text-xs font-semibold border border-blue-200/50">
                                <FiUsers className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="truncate max-w-[60px] sm:max-w-[120px]">{department}</span>
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${
                                isActive 
                                  ? 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/50' 
                                  : 'bg-gray-50/80 text-gray-600 border border-gray-200/50'
                              }`}>
                                {isActive ? <FiCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <FiClock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                                <span className="hidden xs:inline">{isActive ? 'Active' : 'Inactive'}</span>
                              </span>
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
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
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

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }

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

export default Staff;