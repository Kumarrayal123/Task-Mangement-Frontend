import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Staff.css';

const BASE_URL = 'https://api.timelyhealth.in/api';

function Staff() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const userRole = localStorage.getItem('userRole') || 'admin';
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="staff-container">
      <Sidebar userRole={userRole} />
      <div className="main-content">
        <nav className="dashboard-navbar">
          <div className="navbar-brand">
            <h2>Task Management System</h2>
          </div>
          <div className="navbar-user">
            <span className="user-name">Welcome, {adminName}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </nav>

        <div className="staff-content">
          <div className="staff-header">
            <h1>Staff Management</h1>
            <p>Manage your team members and their roles</p>
          </div>

          <div className="staff-actions">
            <button className="add-staff-button">+ Add New Staff</button>
          </div>

          {loading && (
            <div className="loading-message">
              <p>Loading employees...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && employees.length === 0 && (
            <div className="no-employees">
              <p>No employees found. Add new staff members to get started.</p>
            </div>
          )}

          {!loading && !error && employees.length > 0 && (
            <div className="staff-table-container">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role/Position</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr key={index}>
                      <td>
                        {employee.name || 
                         employee.employeeName || 
                         employee.fullName || 
                         employee.firstName || 
                         'Unknown'}
                      </td>
                      <td>{employee.email || 'No email'}</td>
                      <td>
                        {employee.role || 
                         employee.position || 
                         employee.designation || 
                         employee.jobTitle || 
                         'Employee'}
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
  );
}

export default Staff;
