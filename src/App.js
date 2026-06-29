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
import MyCreatedTasks from './pages/MyCreatedTasks';
import MyIssues from './pages/MyIssues';
import Notifications from './pages/Notifications';
import MyNotifications from './pages/MyNotifications';
import MyProfile from './pages/MyProfile';
import CreateTask from './pages/CreateTask';
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
          <Route path="/my-createdtask" element={<MyCreatedTasks />} />
          <Route path="/create-task" element={<CreateTask />} />
          <Route path="/my-issues" element={<MyIssues />} />
           <Route path="/my-notifications" element={<MyNotifications />} />
          <Route path="/employee-profile" element={<MyProfile />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
