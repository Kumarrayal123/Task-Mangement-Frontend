import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiLogIn, FiUser, FiBriefcase, FiZap, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
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
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Voice Welcome Function ──
  const speakWelcome = (name, role) => {
    if ('speechSynthesis' in window) {
      const message = `Welcome ${name}! You are logged in as ${role}. Have a great day!`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const maleVoice = voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('Google UK') ||
        voice.name.includes('Daniel')
      );
      if (maleVoice) {
        utterance.voice = maleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const employeeResponse = await axios.post(
        `${BASE_URL}/employees/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      const userData = employeeResponse.data;
      const name = userData.employee?.name || userData.name || userData.fullName || 'Employee';
      const role = 'Employee';
      
      localStorage.setItem("userData", JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem("token", userData.token);
      }
      localStorage.setItem("userRole", "employee");

      setUserName(name);
      setUserRole(role);
      setShowWelcome(true);
      speakWelcome(name, role);
      
      setTimeout(() => {
        navigate("/employee-dashboard", { replace: true });
      }, 2500);

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

        const userData = adminResponse.data;
        const name = userData.admin?.name || userData.name || userData.fullName || 'Admin';
        const role = 'Admin';
        
        localStorage.setItem("userData", JSON.stringify(userData));
        if (adminResponse.data.token) {
          localStorage.setItem("token", adminResponse.data.token);
        }
        localStorage.setItem("userRole", "admin");

        setUserName(name);
        setUserRole(role);
        setShowWelcome(true);
        speakWelcome(name, role);
        
        setTimeout(() => {
          navigate("/admin-dashboard", { replace: true });
        }, 2500);

      } catch (adminErr) {
        console.error(adminErr);
        setError(
          adminErr.response?.data?.message ||
          "Invalid email or password"
        );
        setLoading(false);
      }
    } finally {
      if (!showWelcome) {
        setLoading(false);
      }
    }
  };

  // ── Load voices ──
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="circle circle-4"></div>
        <div className="circle circle-5"></div>
      </div>

      {/* Welcome Popup - Attractive Glass Version */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-popup-glass">
            <div className="welcome-success-icon">
              <FiCheckCircle className="w-16 h-16 text-emerald-400" />
            </div>
            <div className="welcome-sparkle">✨</div>
            <h2 className="welcome-title">Welcome, {userName}! 🎉</h2>
            <div className="welcome-role-badge">
              <FiUser className="w-3 h-3" />
              <span>{userRole}</span>
            </div>
            <p className="welcome-message">
              You have been successfully logged in to <strong>INGRAIN'S TMS</strong>
            </p>
            <div className="welcome-progress">
              <div className="welcome-progress-bar">
                <div className="welcome-progress-fill"></div>
              </div>
              <p className="welcome-loading-text">Redirecting to dashboard...</p>
            </div>
            <div className="welcome-particles">
              <span className="particle p1">✦</span>
              <span className="particle p2">✦</span>
              <span className="particle p3">✦</span>
              <span className="particle p4">✦</span>
              <span className="particle p5">✦</span>
              <span className="particle p6">✦</span>
            </div>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="login-card glass">
        <div className="login-header">
          <div className="logo-icon">
            <FiZap className="w-8 h-8 text-white" />
          </div>
          <h1>INGRAIN'S TMS</h1>
          <p>Welcome back! Please login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <FiAlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="form-group">
            <div className="input-icon">
              <FiMail className="w-4 h-4" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FiLock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="form-control"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FiEyeOff className="w-4 h-4" />
              ) : (
                <FiEye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                Logging in...
              </span>
            ) : (
              <>
                <FiLogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>

          <div className="login-footer">
            <p>Don't have an account? <span className="highlight">Contact Admin</span></p>
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ── Animated Background ── */
        .bg-animation {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          animation: float 20s infinite ease-in-out;
        }

        .circle-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
          top: -200px;
          right: -200px;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.12), transparent 70%);
          bottom: -150px;
          left: -150px;
          animation-delay: -3s;
        }

        .circle-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.08), transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -6s;
        }

        .circle-4 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(52, 211, 153, 0.08), transparent 70%);
          top: 10%;
          left: 10%;
          animation-delay: -9s;
        }

        .circle-5 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.06), transparent 70%);
          bottom: 20%;
          right: 15%;
          animation-delay: -12s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(40px, 10px) scale(1.02); }
        }

        /* ── Glass Card ── */
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: 45px 40px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: slideIn 0.6s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* ── Header ── */
        .login-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .logo-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
          animation: pulse-glow 3s infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 10px 50px rgba(99, 102, 241, 0.6); }
        }

        .login-header h1 {
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 1px;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-header p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          -webkit-text-fill-color: rgba(255, 255, 255, 0.6);
        }

        /* ── Form ── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }

        .form-control {
          width: 100%;
          padding: 14px 45px 14px 42px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          font-size: 14px;
          color: #ffffff;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .form-control:focus {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s;
        }

        .password-toggle:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        /* ── Options ── */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .remember-me input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #6366f1;
          border-radius: 4px;
          cursor: pointer;
        }

        .forgot-link {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: color 0.3s;
        }

        .forgot-link:hover {
          color: #818cf8;
        }

        /* ── Button ── */
        .login-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .login-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .login-button:hover:not(:disabled)::before {
          opacity: 1;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Footer ── */
        .login-footer {
          text-align: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 8px;
        }

        .login-footer .highlight {
          color: #818cf8;
          font-weight: 500;
        }

        /* ── Error ── */
        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          font-size: 13px;
          color: #fca5a5;
        }

        /* ── Welcome Popup ── ATTRACTIVE GLASS VERSION ── */
        .welcome-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.5s ease-out;
        }

        .welcome-popup-glass {
          position: relative;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          padding: 50px 55px 45px;
          border-radius: 32px;
          text-align: center;
          max-width: 440px;
          width: 90%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: welcomeSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        .welcome-popup-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.1), transparent 60%);
          pointer-events: none;
        }

        .welcome-success-icon {
          position: relative;
          z-index: 1;
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.05));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(52, 211, 153, 0.3);
          animation: successPulse 2s ease-in-out infinite;
        }

        @keyframes successPulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.2);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 40px 10px rgba(52, 211, 153, 0.1);
            transform: scale(1.02);
          }
        }

        .welcome-sparkle {
          position: absolute;
          top: 20px;
          right: 30px;
          font-size: 24px;
          animation: sparkleFloat 3s ease-in-out infinite;
        }

        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(20deg); }
        }

        .welcome-title {
          position: relative;
          z-index: 1;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #e0e7ff, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-role-badge {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 16px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 20px;
          color: #a5b4fc;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .welcome-message {
          position: relative;
          z-index: 1;
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .welcome-message strong {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }

        .welcome-progress {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .welcome-progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
        }

        .welcome-progress-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa);
          border-radius: 10px;
          animation: progressFill 2.5s ease-in-out forwards;
        }

        @keyframes progressFill {
          0% { width: 0%; }
          30% { width: 35%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }

        .welcome-loading-text {
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
          margin-top: 10px;
          animation: textPulse 1.5s ease-in-out infinite;
        }

        @keyframes textPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        /* ── Floating Particles ── */
        .welcome-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          color: rgba(255, 255, 255, 0.08);
          font-size: 20px;
          animation: particleFloat 8s ease-in-out infinite;
        }

        .p1 { top: 10%; left: 5%; animation-delay: 0s; }
        .p2 { top: 20%; right: 8%; animation-delay: -1s; }
        .p3 { bottom: 30%; left: 10%; animation-delay: -2s; }
        .p4 { bottom: 20%; right: 5%; animation-delay: -3s; }
        .p5 { top: 50%; left: 3%; animation-delay: -4s; }
        .p6 { top: 40%; right: 3%; animation-delay: -5s; }

        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes welcomeSlideUp {
          from { 
            opacity: 0; 
            transform: translateY(40px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .login-card {
            padding: 30px 24px;
            margin: 20px;
            border-radius: 24px;
          }

          .login-header h1 {
            font-size: 22px;
          }

          .welcome-popup-glass {
            padding: 35px 25px 30px;
            margin: 20px;
          }

          .welcome-title {
            font-size: 24px;
          }

          .welcome-success-icon {
            width: 64px;
            height: 64px;
          }

          .welcome-success-icon svg {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;