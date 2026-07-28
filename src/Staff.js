import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUsers, FiSearch, FiRefreshCw, FiMail, FiBriefcase, 
  FiUser, FiCheckCircle, FiClock, FiAlertCircle, FiBarChart2, 
  FiChevronLeft, FiChevronRight, FiCalendar
} from 'react-icons/fi';
import Navbar from './Navbar';
import './AdminDashboard.css';

const BASE_URL = 'https://api.timelyhealth.in/api';

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
  const [currentDateTime, setCurrentDateTime] = useState('');

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

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
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
      navigate('/');
    }
  }, [navigate]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get(`${BASE_URL}/employees/get-employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const allEmployees = response.data.data || response.data || [];
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

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

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const departments = [...new Set(employees.map(emp => emp.department || 'Other'))];
  const roles = [...new Set(employees.map(emp => emp.role || 'Employee'))];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ─── Horizontal Top Navbar ─── */}
      <Navbar userRole={userRole} onLogout={handleLogout} />

      {/* ─── Main Content Area (Full Width Layout) ─── */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="admin-dash">

          {/* Header Section */}
          <div className="admin-dash__header">
            <div>
              <h1 className="admin-dash__greeting flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-indigo-600" /> Staff & Workforce <span>Directory</span>
              </h1>
              <p className="admin-dash__subtitle">
                Manage team members, department assignments, and active staff personnel.
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-700 font-semibold text-xs">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDateTime}</span>
              </div>
              
              <button
                onClick={fetchEmployees}
                disabled={loading}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-sm"
                title="Refresh Staff"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="space-y-6">

            {/* Error Message */}
            {error && (
              <div className="p-3 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 sm:gap-3 text-rose-700 text-xs sm:text-sm">
                <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {error}
              </div>
            )}

            {/* 4 KPI Summary Stat Cards */}
            <div className="admin-dash__stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="admin-dash__stat">
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Total Employees</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--indigo">
                    <FiUsers />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{employees.length}</div>
                <div className="admin-dash__stat-meta">active team members</div>
              </div>

              <div className="admin-dash__stat">
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Departments</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--emerald">
                    <FiBriefcase />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{departments.length}</div>
                <div className="admin-dash__stat-meta">active units</div>
              </div>

              <div className="admin-dash__stat">
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Designated Roles</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--cyan">
                    <FiBarChart2 />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{roles.length}</div>
                <div className="admin-dash__stat-meta">job positions</div>
              </div>

              <div className="admin-dash__stat">
                <div className="admin-dash__stat-top">
                  <span className="admin-dash__stat-label">Active Status</span>
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                    <FiCheckCircle />
                  </div>
                </div>
                <div className="admin-dash__stat-value">{employees.length}</div>
                <div className="admin-dash__stat-meta">verified personnel</div>
              </div>

            </div>

            {/* Main Content Card Container */}
            <div className="admin-dash__card">
              <div className="admin-dash__card-header">
                <div>
                  <h3 className="admin-dash__card-title">Staff Directory</h3>
                  <p className="admin-dash__card-desc">Search and view active employee personnel details</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {filteredEmployees.length} Staff Members
                  </span>
                </div>
              </div>

              <div className="admin-dash__card-body space-y-4">
                
                {/* Search Bar */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px] relative">
                    <input
                      type="text"
                      placeholder="Search employees by name, email, role, or department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm text-slate-700"
                    />
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                    >
                      Clear Search
                    </button>
                  )}
                </div>

                {/* Loading State */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-slate-500">Loading employees...</p>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-16 sm:py-20 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-3 sm:mb-4 border border-indigo-100">
                      <FiUsers className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" />
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold text-slate-700">No employees found</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">No employee personnel records available</p>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-16 sm:py-20 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-3 sm:mb-4 border border-amber-100">
                      <FiSearch className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold text-slate-700">No matching employees</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[750px] border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-3.5 px-4 sm:px-6">Employee</th>
                            <th className="py-3.5 px-4 sm:px-6">Email</th>
                            <th className="py-3.5 px-4 sm:px-6">Role</th>
                            <th className="py-3.5 px-4 sm:px-6">Department</th>
                            <th className="py-3.5 px-4 sm:px-6">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
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
                                className="hover:bg-slate-50/80 transition-colors duration-150"
                              >
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0">
                                      {name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-[160px]">{name}</div>
                                      {employee.employeeId && (
                                        <div className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">ID: {employee.employeeId}</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                    <FiMail className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate max-w-[180px]">{email}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
                                    <FiBriefcase className="w-3 h-3 text-indigo-500" />
                                    <span className="truncate max-w-[120px]">{role}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-semibold border border-sky-100">
                                    <FiUsers className="w-3 h-3 text-sky-500" />
                                    <span className="truncate max-w-[120px]">{department}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 sm:px-6">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                    isActive 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}>
                                    {isActive ? <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <FiClock className="w-3.5 h-3.5 text-slate-400" />}
                                    <span>{isActive ? 'Active' : 'Inactive'}</span>
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200">
                        <div className="text-xs font-medium text-slate-600">
                          Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredEmployees.length)}</span> of <span className="font-semibold text-slate-800">{filteredEmployees.length}</span> employees
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiChevronLeft className="w-4 h-4" />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                currentPage === page
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          </div>
        </div>
      </main>
    </div>
  );
}

export default Staff;