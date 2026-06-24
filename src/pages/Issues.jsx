import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import '../Sidebar.css';
import './Issues.css';
import { getAllReportedIssues } from '../services/taskService';

const priorityMeta = {
  Critical: { color: '#ef4444', bg: '#fef2f2', label: 'Critical' },
  High:     { color: '#f97316', bg: '#fff7ed', label: 'High'     },
  Medium:   { color: '#eab308', bg: '#fefce8', label: 'Medium'   },
  Low:      { color: '#22c55e', bg: '#f0fdf4', label: 'Low'      },
};

const statusMeta = {
  Open:        { color: '#6366f1', bg: '#eef2ff', icon: '🔵' },
  'In Progress': { color: '#3b82f6', bg: '#eff6ff', icon: '🔄' },
  Resolved:    { color: '#10b981', bg: '#ecfdf5', icon: '✅' },
  Closed:      { color: '#6b7280', bg: '#f3f4f6', icon: '🔒' },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function Issues() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

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

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllReportedIssues();
      console.log('Issues response:', response);
      // Backend returns array of objects with { taskId, taskName, title, issue: {...} }
      let issuesData = [];
      if (Array.isArray(response)) {
        issuesData = response;
      } else if (response.issues && Array.isArray(response.issues)) {
        issuesData = response.issues;
      } else if (response.data && Array.isArray(response.data)) {
        issuesData = response.data;
      }
      console.log('Parsed issues:', issuesData);
      setIssues(issuesData);
    } catch (err) {
      setError('Failed to load issues');
      console.error('Fetch issues error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const filtered = issues.filter((item) => {
    const issue = item.issue || {};
    const matchStatus = filterStatus === 'ALL' || issue.status === filterStatus;
    const matchPriority = filterPriority === 'ALL' || issue.priority === filterPriority;
    return matchStatus && matchPriority;
  });

  const counts = {
    ALL: issues.length,
    Open: issues.filter((i) => i.issue?.status === 'Open').length,
    'In Progress': issues.filter((i) => i.issue?.status === 'In Progress').length,
    Resolved: issues.filter((i) => i.issue?.status === 'Resolved').length,
    Closed: issues.filter((i) => i.issue?.status === 'Closed').length,
  };

  return (
    <div className="dashboard-container">
      <Sidebar userRole="admin" />
      <div className="main-content">
        <nav className="dashboard-navbar">
          <div className="navbar-brand">
            <h2>Task Management System</h2>
          </div>
          <div className="navbar-user">
            <span>Welcome, {adminName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </nav>

        <div className="dashboard-content">
          <div className="content-header">
            <h1>Reported Issues</h1>
            <button onClick={fetchIssues} className="refresh-btn">Refresh</button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="filters">
            <div className="filter-group">
              <label>Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="ALL">All</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Priority:</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="ALL">All</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="status-tabs">
            {Object.entries(counts).map(([status, count]) => (
              <button
                key={status}
                className={`status-tab ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {statusMeta[status]?.icon || ''} {status} ({count})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-state">Loading issues...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No issues found</div>
          ) : (
            <div className="issues-list">
              {filtered.map((item, index) => {
                console.log(`Issue ${index}:`, item);
                console.log(`Issue ${index} employee:`, item.issue?.employee);
                // Backend returns { taskId, taskName, title, issue: {...} }
                const issue = item.issue || {};
                const pr = priorityMeta[issue.priority] || priorityMeta['Medium'];
                const st = statusMeta[issue.status] || statusMeta['Open'];

                // Task details
                const taskName = item.taskName || item.title || 'N/A';

                // Employee details - show employee ID instead of name
                const employeeId = issue.employee?.employeeId || issue.employeeId?.employeeId || 'N/A';

                // Issue details
                const issueTitle = issue.issueTitle || 'No Title';
                const description = issue.issueDescription || 'No description provided';
                const reportedDate = issue.reportedAt || new Date();

                return (
                  <div key={item.issue?.issueId || index} className="issue-card">
                    <div className="issue-header">
                      <div className="issue-title">{issueTitle}</div>
                      <div className="issue-badges">
                        <span className="badge" style={{ color: pr.color, background: pr.bg }}>
                          {pr.label}
                        </span>
                        <span className="badge" style={{ color: st.color, background: st.bg }}>
                          {st.icon} {issue.status}
                        </span>
                      </div>
                    </div>
                    <div className="issue-description">{description}</div>
                    <div className="issue-meta">
                      <span>Task: {taskName}</span>
                      <span>Employee ID: {employeeId}</span>
                      <span>Reported: {formatDate(reportedDate)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Issues;
