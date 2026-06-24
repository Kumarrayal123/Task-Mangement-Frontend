import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EmployeeDashboard.css';
import EmployeeSidebar from './components/EmployeeSidebar';

const TASK_API = 'http://localhost:5001/api/tasks';

// ── Helpers ──────────────────────────────────────────────────────────────────
const priorityMeta = {
  Critical: { color: '#ef4444', bg: '#fef2f2', label: 'Critical' },
  High:     { color: '#f97316', bg: '#fff7ed', label: 'High' },
  Medium:   { color: '#eab308', bg: '#fefce8', label: 'Medium' },
  Low:      { color: '#22c55e', bg: '#f0fdf4', label: 'Low' },
};

const statusMeta = {
  Pending:     { color: '#6366f1', bg: '#eef2ff', icon: '⏳' },
  'In Progress':{ color: '#3b82f6', bg: '#eff6ff', icon: '🔄' },
  Completed:   { color: '#10b981', bg: '#ecfdf5', icon: '✅' },
  Rejected:    { color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  Overdue:     { color: '#f97316', bg: '#fff7ed', icon: '⚠️' },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}


// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="emp-stat-card" style={{ '--accent': color, '--accent-bg': bg }}>
      <div className="emp-stat-icon">{icon}</div>
      <div className="emp-stat-info">
        <span className="emp-stat-value">{value}</span>
        <span className="emp-stat-label">{label}</span>
      </div>
    </div>
  );
}

// ── Task Row ──────────────────────────────────────────────────────────────────
function TaskRow({ task }) {
  const st = statusMeta[task.status] || statusMeta['Pending'];
  const pr = priorityMeta[task.priority] || priorityMeta['Medium'];

  return (
    <div className="emp-task-row">
      <div className="emp-task-main">
        <div className="emp-task-title">{task.title || task.taskName}</div>
        <div className="emp-task-desc">{task.description}</div>
        <div className="emp-task-meta">
          <span className="emp-task-due">📅 {formatDate(task.dueDate)}</span>
          {task.projectId?.projectName && (
            <span className="emp-task-project">📁 {task.projectId.projectName}</span>
          )}
        </div>
      </div>
      <div className="emp-task-badges">
        <span className="emp-badge" style={{ color: pr.color, background: pr.bg }}>
          {pr.label}
        </span>
        <span className="emp-badge" style={{ color: st.color, background: st.bg }}>
          {st.icon} {task.status}
        </span>
      </div>
      <div className="emp-task-progress">
        <div className="emp-progress-bar">
          <div
            className="emp-progress-fill"
            style={{ width: `${task.progress || 0}%`, background: pr.color }}
          />
        </div>
        <span className="emp-progress-pct">{task.progress || 0}%</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employeeName, setName]     = useState('');
  const [employeeId, setEmpId]      = useState('');
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // ── Load user from localStorage ──
  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) { navigate('/'); return; }
    const d = JSON.parse(raw);
    const name = d.fullName || d.name || d.employeeName || d.username ||
                 d.firstName || d.user?.name || d.data?.name || 'Employee';
    const id   = d._id || d.id || d.employeeId || d.userId ||
                 d.user?._id || d.data?._id || '';
    setName(name);
    setEmpId(id);
  }, [navigate]);

  // ── Fetch tasks for this employee ──
  const fetchTasks = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${TASK_API}/my-assigned-tasks/${employeeId}`);
      const data = res.data;
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  // ── Derived stats ──
  const stats = {
    total:      tasks.length,
    pending:    tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
    overdue:    tasks.filter(t => t.status === 'Overdue').length,
  };

  // ── Upcoming (non-completed, nearest due date) ──
  const upcoming = [...tasks]
    .filter(t => t.dueDate && t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const recentCompleted = [...tasks]
    .filter(t => t.status === 'Completed')
    .slice(0, 5);

  // ── Render ──
  return (
    <div className="emp-root">
      <EmployeeSidebar
        employeeName={employeeName}
        onLogout={handleLogout}
      />

      <main className="emp-main">

        {/* ── Top Bar ── */}
        <header className="emp-topbar">
          <div className="emp-topbar-left">
            <h1 className="emp-topbar-title">
              👋 Welcome back,
              <span className="emp-topbar-name"> {employeeName}</span>
            </h1>
          </div>
          <div className="emp-topbar-right">
            <button className="emp-refresh-btn" onClick={fetchTasks} title="Refresh tasks">↻ Refresh</button>
            <div className="emp-topbar-avatar">{getInitials(employeeName)}</div>
          </div>
        </header>

        {/* ── DASHBOARD VIEW ── */}
        <div className="emp-content">

            {/* Stat Cards */}
            <div className="emp-stats-grid">
              <StatCard label="Total Tasks"   value={stats.total}      icon="📌" color="#6366f1" bg="#eef2ff" />
              <StatCard label="In Progress"   value={stats.inProgress} icon="🔄" color="#3b82f6" bg="#eff6ff" />
              <StatCard label="Completed"     value={stats.completed}  icon="✅" color="#10b981" bg="#ecfdf5" />
              <StatCard label="Pending"       value={stats.pending}    icon="⏳" color="#f59e0b" bg="#fffbeb" />
              <StatCard label="Overdue"       value={stats.overdue}    icon="⚠️" color="#ef4444" bg="#fef2f2" />
            </div>

            {/* Two columns */}
            <div className="emp-dashboard-cols">

              {/* Upcoming tasks */}
              <section className="emp-card">
                <div className="emp-card-header">
                  <span className="emp-card-title">⏰ Upcoming Deadlines</span>
                  <button className="emp-card-link" onClick={() => navigate('/my-task')}>View All →</button>
                </div>
                {loading ? (
                  <div className="emp-loading">Loading…</div>
                ) : upcoming.length === 0 ? (
                  <div className="emp-empty">🎉 No upcoming tasks!</div>
                ) : (
                  <div className="emp-mini-list">
                    {upcoming.map(t => {
                      const st = statusMeta[t.status] || statusMeta['Pending'];
                      const pr = priorityMeta[t.priority] || priorityMeta['Medium'];
                      return (
                        <div key={t._id} className="emp-mini-row">
                          <div className="emp-mini-dot" style={{ background: pr.color }} />
                          <div className="emp-mini-info">
                            <span className="emp-mini-title">{t.title || t.taskName}</span>
                            <span className="emp-mini-date">Due {formatDate(t.dueDate)}</span>
                          </div>
                          <span className="emp-badge" style={{ color: st.color, background: st.bg, fontSize: '11px' }}>
                            {t.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Recently Completed */}
              <section className="emp-card">
                <div className="emp-card-header">
                  <span className="emp-card-title">✅ Recently Completed</span>
                </div>
                {recentCompleted.length === 0 ? (
                  <div className="emp-empty">No completed tasks yet.</div>
                ) : (
                  <div className="emp-mini-list">
                    {recentCompleted.map(t => (
                      <div key={t._id} className="emp-mini-row">
                        <div className="emp-mini-dot" style={{ background: '#10b981' }} />
                        <div className="emp-mini-info">
                          <span className="emp-mini-title">{t.title || t.taskName}</span>
                          <span className="emp-mini-date">Completed</span>
                        </div>
                        <span className="emp-badge" style={{ color: '#10b981', background: '#ecfdf5', fontSize: '11px' }}>
                          ✅ Done
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>

            {/* Priority breakdown */}
            <section className="emp-card">
              <div className="emp-card-header">
                <span className="emp-card-title">📊 Priority Breakdown</span>
              </div>
              <div className="emp-priority-grid">
                {Object.entries(priorityMeta).map(([key, m]) => {
                  const cnt = tasks.filter(t => t.priority === key).length;
                  const pct = stats.total ? Math.round((cnt / stats.total) * 100) : 0;
                  return (
                    <div key={key} className="emp-priority-item">
                      <div className="emp-priority-top">
                        <span style={{ color: m.color, fontWeight: 700 }}>{key}</span>
                        <span style={{ color: m.color }}>{cnt}</span>
                      </div>
                      <div className="emp-progress-bar" style={{ height: '6px' }}>
                        <div className="emp-progress-fill" style={{ width: `${pct}%`, background: m.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

      </main>
    </div>
  );
}

export default EmployeeDashboard;
