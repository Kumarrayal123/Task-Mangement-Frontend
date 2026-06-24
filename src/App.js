import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import Staff from './Staff';
import MyTask from './pages/MyTask';
import './App.css';
import Task from './pages/Task';
import Issues from './pages/Issues';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/task" element={<Task />} />
          <Route path="/my-task" element={<MyTask />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
