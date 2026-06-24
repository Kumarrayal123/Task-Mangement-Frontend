import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const BASE_URL = 'https://api.timelyhealth.in/api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');

  //   // Basic validation
  //   if (!formData.email || !formData.password) {
  //     setError('Please fill in all fields');
  //     return;
  //   }

  //   // Email validation
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(formData.email)) {
  //     setError('Please enter a valid email');
  //     return;
  //   }

  //   // Password validation
  //   if (formData.password.length < 6) {
  //     setError('Password must be at least 6 characters');
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // Try employee login first (most users are employees)
  //     console.log('Attempting employee login with:', formData.email);
  //     try {
  //       const employeeResponse = await axios.post(`${BASE_URL}/employees/login`, {
  //         email: formData.email,
  //         password: formData.password
  //       });

  //       // Employee login successful
  //       console.log('Employee login successful:', employeeResponse.data);
  //       console.log('Employee login response structure:', JSON.stringify(employeeResponse.data, null, 2));
        
  //       if (employeeResponse.data.token) {
  //         localStorage.setItem('token', employeeResponse.data.token);
  //         localStorage.setItem('userRole', 'employee');
  //         localStorage.setItem('userData', JSON.stringify(employeeResponse.data));
  //       }

  //       alert('Login successful as Employee!');
  //       console.log('Navigating to /employee-dashboard...');
  //       navigate('/employee-dashboard');
  //       // Fallback: use window.location if navigate doesn't work
  //       setTimeout(() => {
  //         window.location.href = '/employee-dashboard';
  //       }, 100);
  //       return;
  //     } catch (employeeErr) {
  //       console.log('Employee login failed, trying admin login...');
  //       // Don't throw error here, continue to try admin login
  //     }
      
  //     // If employee login fails, try admin login
  //     console.log('Attempting admin login with:', formData.email);
  //     try {
  //       const adminResponse = await axios.post(`${BASE_URL}/admin/login`, {
  //         email: formData.email,
  //         password: formData.password
  //       });

  //       // Admin login successful
  //       console.log('Admin login successful:', adminResponse.data);
  //       console.log('Admin login response structure:', JSON.stringify(adminResponse.data, null, 2));
        
  //       if (adminResponse.data.token) {
  //         localStorage.setItem('token', adminResponse.data.token);
  //         localStorage.setItem('userRole', 'admin');
  //         localStorage.setItem('userData', JSON.stringify(adminResponse.data));
  //       }

  //       alert('Login successful as Admin!');
  //       navigate('/admin-dashboard');
  //       return;
  //     } catch (adminErr) {
  //       // Admin login failed - this is the real error
  //       console.error('Admin login failed:', adminErr);
  //       console.error('Admin login error details:', adminErr.response?.data);
  //       console.error('Admin login error status:', adminErr.response?.status);
  //       throw adminErr;
  //     }

  //   } catch (err) {
  //     console.error('Login error:', err);
  //     if (err.response) {
  //       // Server responded with error
  //       setError(err.response.data.message || 'Invalid credentials. Please check your email and password.');
  //     } else if (err.request) {
  //       // Request made but no response
  //       setError('Network error. Please check your connection.');
  //     } else {
  //       // Other error
  //       setError('An error occurred. Please try again.');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };
   

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // Employee Login
    const employeeResponse = await axios.post(
      `${BASE_URL}/employees/login`,
      {
        email: formData.email,
        password: formData.password,
      }
    );

    console.log("Employee Login Success:", employeeResponse.data);

    localStorage.setItem(
      "userData",
      JSON.stringify(employeeResponse.data)
    );

    if (employeeResponse.data.token) {
      localStorage.setItem(
        "token",
        employeeResponse.data.token
      );
    }

    localStorage.setItem("userRole", "employee");

    navigate("/employee-dashboard", { replace: true });

  } catch (employeeErr) {
    console.log("Employee login failed, trying admin login...");

    try {
      const adminResponse = await axios.post(
        `${BASE_URL}/admin/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      console.log("Admin Login Success:", adminResponse.data);

      localStorage.setItem(
        "userData",
        JSON.stringify(adminResponse.data)
      );

      if (adminResponse.data.token) {
        localStorage.setItem(
          "token",
          adminResponse.data.token
        );
      }

      localStorage.setItem("userRole", "admin");

      navigate("/admin-dashboard", { replace: true });

    } catch (adminErr) {
      console.error(adminErr);

      setError(
        adminErr.response?.data?.message ||
        "Invalid email or password"
      );
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Task Management System</h1>
          <p>Welcome! Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="login-footer">
            <p>Forgot password?</p>
            <p>Don't have an account? Contact Admin</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
