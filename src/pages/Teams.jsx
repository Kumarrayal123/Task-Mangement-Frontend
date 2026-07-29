// import React, { useState, useEffect } from 'react'
// import './Teams.css'

// function Teams() {
//   const [teams, setTeams] = useState([])
//   const [employees, setEmployees] = useState([])
//   const [showCreateForm, setShowCreateForm] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
  
//   const [formData, setFormData] = useState({
//     teamName: '',
//     description: '',
//     teamLead: '',
//     members: []
//   })

//   // Fetch all teams
//   const fetchTeams = async () => {
//     try {
//       const response = await fetch('https://api.timelyhealth.in/api/teams/all')
//       const data = await response.json()
//       if (data.success) {
//         setTeams(data.data)
//       }
//     } catch (error) {
//       console.error('Error fetching teams:', error)
//       setError('Failed to fetch teams')
//     }
//   }

//   // Fetch all employees for dropdown
//   const fetchEmployees = async () => {
//     try {
//       const response = await fetch('https://api.timelyhealth.in/api/teams/employees/list')
//       const data = await response.json()
//       if (data.success) {
//         setEmployees(data.data)
//       }
//     } catch (error) {
//       console.error('Error fetching employees:', error)
//     }
//   }

//   useEffect(() => {
//     fetchTeams()
//     fetchEmployees()
//   }, [])

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleMemberSelection = (e) => {
//     const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value)
//     setFormData(prev => ({
//       ...prev,
//       members: selectedOptions
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       const response = await fetch('https://api.timelyhealth.in/api/teams/create', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//       })

//       const data = await response.json()

//       if (data.success) {
//         setFormData({
//           teamName: '',
//           description: '',
//           teamLead: '',
//           members: []
//         })
//         setShowCreateForm(false)
//         fetchTeams()
//       } else {
//         setError(data.message || 'Failed to create team')
//       }
//     } catch (error) {
//       console.error('Error creating team:', error)
//       setError('Failed to create team')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="teams-container">
//       <div className="teams-header">
//         <h1>Teams</h1>
//         <button 
//           className="create-team-btn"
//           onClick={() => setShowCreateForm(!showCreateForm)}
//         >
//           {showCreateForm ? 'Cancel' : 'Create Team'}
//         </button>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {showCreateForm && (
//         <div className="create-team-form">
//           <h2>Create New Team</h2>
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label htmlFor="teamName">Team Name *</label>
//               <input
//                 type="text"
//                 id="teamName"
//                 name="teamName"
//                 value={formData.teamName}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter team name"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="description">Description</label>
//               <textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Enter team description"
//                 rows="3"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="teamLead">Team Lead</label>
//               <select
//                 id="teamLead"
//                 name="teamLead"
//                 value={formData.teamLead}
//                 onChange={handleInputChange}
//               >
//                 <option value="">Select Team Lead</option>
//                 {employees.map(emp => (
//                   <option key={emp._id} value={emp._id}>
//                     {emp.name} ({emp.employeeId})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label htmlFor="members">Team Members</label>
//               <select
//                 id="members"
//                 name="members"
//                 multiple
//                 value={formData.members}
//                 onChange={handleMemberSelection}
//                 className="multi-select"
//               >
//                 {employees.map(emp => (
//                   <option key={emp._id} value={emp._id}>
//                     {emp.name} ({emp.employeeId})
//                   </option>
//                 ))}
//               </select>
//               <small>Hold Ctrl/Cmd to select multiple employees</small>
//             </div>

//             <div className="form-actions">
//               <button type="submit" disabled={loading}>
//                 {loading ? 'Creating...' : 'Create Team'}
//               </button>
//               <button type="button" onClick={() => setShowCreateForm(false)}>
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="teams-list">
//         <h2>All Teams ({teams.length})</h2>
//         {teams.length === 0 ? (
//           <p className="no-teams">No teams created yet</p>
//         ) : (
//           <div className="teams-grid">
//             {teams.map(team => (
//               <div key={team._id} className="team-card">
//                 <div className="team-card-header">
//                   <h3>{team.teamName}</h3>
//                   <span className={`status-badge ${team.status}`}>{team.status}</span>
//                 </div>
//                 {team.description && (
//                   <p className="team-description">{team.description}</p>
//                 )}
//                 <div className="team-info">
//                   {team.teamLead && (
//                     <div className="info-item">
//                       <strong>Team Lead:</strong>
//                       <span>{team.teamLead.name} ({team.teamLead.employeeId})</span>
//                     </div>
//                   )}
//                   <div className="info-item">
//                     <strong>Members:</strong>
//                     <span>{team.members.length} employee(s)</span>
//                   </div>
//                   {team.department && (
//                     <div className="info-item">
//                       <strong>Department:</strong>
//                       <span>{team.department.name}</span>
//                     </div>
//                   )}
//                 </div>
//                 {team.members.length > 0 && (
//                   <div className="team-members">
//                     <strong>Team Members:</strong>
//                     <ul>
//                       {team.members.map(member => (
//                         <li key={member._id}>{member.name} ({member.employeeId})</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//                 <div className="team-footer">
//                   <small>Created: {new Date(team.createdAt).toLocaleDateString()}</small>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Teams

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiUsers, FiUserPlus, FiUser, FiPlus, FiX, FiChevronDown, FiChevronUp,
  FiBriefcase, FiCalendar, FiClock, FiEdit2, FiTrash2, FiCheckCircle,
  FiAlertCircle, FiInfo, FiArrowLeft, FiRefreshCw, FiSearch,
  FiFilter, FiStar, FiFlag, FiMessageSquare, FiMoreVertical
} from 'react-icons/fi';
import { FaTasks, FaUsers, FaUserFriends } from 'react-icons/fa';
import Navbar from '../Navbar';

function Teams() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'admin';
  
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({
    teamName: '',
    description: '',
    teamLead: '',
    members: []
  });

  // ─── Live Clock ───
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

  // Fetch all teams
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.timelyhealth.in/api/teams/all');
      const data = await response.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees for dropdown
  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://api.timelyhealth.in/api/employees/get-employees');
      const employeesData = Array.isArray(response.data) ? response.data : response.data.employees || [];
      const activeEmployees = employeesData.filter(emp => emp.status === 'active');
      setEmployees(activeEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberToggle = (employeeId) => {
    setFormData(prev => {
      const members = prev.members.includes(employeeId)
        ? prev.members.filter(id => id !== employeeId)
        : [...prev.members, employeeId];
      return { ...prev, members };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = editingTeam 
        ? `https://api.timelyhealth.in/api/teams/update/${editingTeam._id}`
        : 'https://api.timelyhealth.in/api/teams/create';
      const method = editingTeam ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          teamName: '',
          description: '',
          teamLead: '',
          members: []
        });
        setShowCreateForm(false);
        setEditingTeam(null);
        fetchTeams();
      } else {
        setError(data.message || 'Failed to save team');
      }
    } catch (error) {
      console.error('Error saving team:', error);
      setError('Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      teamName: team.teamName,
      description: team.description || '',
      teamLead: team.teamLead?._id || team.teamLead || '',
      members: team.members?.map(m => m._id) || []
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.timelyhealth.in/api/teams/delete/${teamId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchTeams();
      } else {
        setError(data.message || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setFormData({
      teamName: '',
      description: '',
      teamLead: '',
      members: []
    });
    setShowCreateForm(false);
  };

  // ─── Get Initials ───
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // ─── Handle Logout ───
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ─── Filter Teams ───
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || team.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ─── Horizontal Top Navbar ─── */}
      <Navbar userRole={userRole} onLogout={handleLogout} />

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="admin-dash">

          {/* Header Section */}
          <div className="admin-dash__header">
            <div>
              <h1 className="admin-dash__greeting flex items-center gap-2">
                <FaUsers className="w-5 h-5 text-indigo-600" /> 
                <span>Team Management</span>
              </h1>
              <p className="admin-dash__subtitle">
                Create and manage teams for better collaboration
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {/* ─── Live Date & Time ─── */}
              <div className="admin-dash__date-pill flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-700 font-semibold text-xs">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDateTime}</span>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-sm"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* ─── Stats Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="admin-dash__stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Teams</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{teams.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FaUsers className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="admin-dash__stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Teams</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {teams.filter(t => t.status === 'active').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FiCheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="admin-dash__stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Members</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {teams.reduce((acc, team) => acc + (team.members?.length || 0), 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <FaUserFriends className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Actions Bar ─── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={() => showCreateForm ? handleCancelEdit() : setShowCreateForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 text-sm whitespace-nowrap"
              >
                {showCreateForm ? (
                  <><FiX className="w-4 h-4" /> Cancel</>
                ) : (
                  <><FiPlus className="w-4 h-4" /> Create Team</>
                )}
              </button>
            </div>

            {/* ─── Error ─── */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm shadow-sm">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  className="ml-auto p-1 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ─── Create Team Form ─── */}
            {showCreateForm && (
              <div className="admin-dash__card border-2 border-indigo-200/50 shadow-lg shadow-indigo-100/50">
                <div className="admin-dash__card-header">
                  <div>
                    <h3 className="admin-dash__card-title flex items-center gap-2">
                      <FiUserPlus className="w-4 h-4 text-indigo-600" />
                      {editingTeam ? 'Edit Team' : 'Create New Team'}
                    </h3>
                    <p className="admin-dash__card-desc">
                      {editingTeam ? 'Update the team details below' : 'Fill in the details to create a new team'}
                    </p>
                  </div>
                </div>

                <div className="admin-dash__card-body">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ─── Team Name ─── */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                        <FiUsers className="inline mr-1.5 w-4 h-4" />
                        Team Name *
                      </label>
                      <input
                        type="text"
                        id="teamName"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
                        placeholder="Enter team name..."
                      />
                    </div>

                    {/* ─── Description ─── */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                        <FiMessageSquare className="inline mr-1.5 w-4 h-4" />
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm resize-none"
                        placeholder="Describe the team's purpose..."
                      />
                    </div>

                    {/* ─── Team Lead ─── */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                        <FiUser className="inline mr-1.5 w-4 h-4" />
                        Team Lead
                      </label>
                      <select
                        id="teamLead"
                        name="teamLead"
                        value={formData.teamLead}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
                      >
                        <option value="">Select Team Lead</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name || emp.fullName} ({emp.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ─── Team Members ─── */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                        <FaUserFriends className="inline mr-1.5 w-4 h-4" />
                        Team Members
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          ({formData.members.length} selected)
                        </span>
                      </label>
                      
                      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white">
                        {employees.length === 0 ? (
                          <div className="text-sm text-gray-500 p-3 text-center">
                            No employees available
                          </div>
                        ) : (
                          employees.map((emp) => (
                            <label
                              key={emp._id}
                              className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={formData.members.includes(emp._id)}
                                onChange={() => handleMemberToggle(emp._id)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                              />
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {getInitials(emp.name || emp.fullName)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800 truncate">
                                  {emp.name || emp.fullName}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {emp.employeeId} {emp.department && `• ${emp.department}`}
                                </div>
                              </div>
                              {formData.members.includes(emp._id) && (
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                  <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                              )}
                            </label>
                          ))
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-gray-400">
                        Select team members to add them to this team
                      </p>
                    </div>

                    {/* ─── Form Actions ─── */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !formData.teamName.trim()}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {editingTeam ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <FiPlus className="w-4 h-4" />
                            {editingTeam ? 'Update Team' : 'Create Team'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ─── Teams List ─── */}
            <div className="admin-dash__card">
              <div className="admin-dash__card-header">
                <div>
                  <h3 className="admin-dash__card-title flex items-center gap-2">
                    <FaUsers className="w-4 h-4 text-indigo-600" />
                    All Teams
                    <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {filteredTeams.length}
                    </span>
                  </h3>
                  <p className="admin-dash__card-desc">
                    {filteredTeams.length === 0 ? 'No teams found' : `${filteredTeams.length} team(s) available`}
                  </p>
                </div>
                <button
                  onClick={fetchTeams}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Refresh teams"
                >
                  <FiRefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="admin-dash__card-body">
                {loading && teams.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500 text-sm">Loading teams...</p>
                    </div>
                  </div>
                ) : filteredTeams.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <FaUsers className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No teams found</h4>
                    <p className="text-sm text-gray-500">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'Try adjusting your search or filters' 
                        : 'Create your first team to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Team Name</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Team Lead</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Members</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Date</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTeams.map((team) => (
                          <tr key={team._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-indigo-500/30">
                                  {getInitials(team.teamName)}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800 text-sm">{team.teamName}</div>
                                  {team.description && (
                                    <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{team.description}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {team.teamLead ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs">
                                    {getInitials(team.teamLead.name || team.teamLead.fullName)}
                                  </div>
                                  <span className="text-sm text-gray-700">{team.teamLead.name || team.teamLead.fullName}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">Not assigned</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <FaUserFriends className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                team.status === 'active' 
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                                {team.status || 'active'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-500">
                                {new Date(team.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(team)}
                                  className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-500 transition-colors"
                                  title="Edit team"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(team._id)}
                                  className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors"
                                  title="Delete team"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .admin-dash {
          max-width: 1400px;
          margin: 0 auto;
        }

        .admin-dash__header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .admin-dash__greeting {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.025em;
        }

        .admin-dash__greeting span {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-dash__subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 0.125rem;
        }

        .admin-dash__date-pill {
          font-size: 0.75rem;
        }

        .admin-dash__stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.25rem 1.5rem;
          transition: all 0.2s;
        }

        .admin-dash__stat-card:hover {
          border-color: #c7d2fe;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
        }

        .admin-dash__card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          overflow: hidden;
          transition: all 0.2s;
        }

        .admin-dash__card:hover {-
          border-color: #c7d2fe;
        }

        .admin-dash__card-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .admin-dash__card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-dash__card-desc {
          font-size: 0.813rem;
          color: #64748b;
          margin-top: 0.125rem;
        }

        .admin-dash__card-body {
          padding: 1.5rem;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 640px) {
          .admin-dash__header {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          
          .admin-dash__greeting {
            font-size: 1.25rem;
          }
          
          .admin-dash__card-header {
            padding: 1rem 1.25rem;
          }
          
          .admin-dash__card-body {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Teams;