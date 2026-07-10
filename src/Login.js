// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import { FiMail, FiLock, FiLogIn, FiUser, FiZap, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
// import './Login.css';

// const BASE_URL = 'https://api.timelyhealth.in/api';

// function Login() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const loginButtonRef = useRef(null);
  
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(false);
//   const [userName, setUserName] = useState('');
//   const [userRole, setUserRole] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
  
//   // ─── Popup states ───
//   const [showPopup, setShowPopup] = useState(false);
//   const [popupStatus, setPopupStatus] = useState('⏳ Fetching...');
//   const [employeeData, setEmployeeData] = useState(null);

//   // ─── Auto-login from URL ───
//   useEffect(() => {
//     const urlParams = new URLSearchParams(location.search);
//     const employeeId = urlParams.get('employeeId');
    
//     console.log('🔍 URL Params:', { employeeId });
    
//     if (employeeId) {
//       // ─── Show popup ───
//       setShowPopup(true);
//       setPopupStatus('⏳ Fetching employee data from API...');
      
//       // ─── API call - Get employee by employeeId (TH029) ───
//       axios.get(`${BASE_URL}/employees/get-employee?employeeId=${employeeId}`)
//         .then(response => {
//           console.log('✅ API Response:', response.data);
          
//           if (response.data.success) {
//             const employee = response.data.data;
            
//             console.log('👤 Employee Data:', employee);
//             console.log('📧 Email:', employee.email);
//             console.log('🔑 Password:', employee.password);
//             console.log('🆔 Employee ID:', employee.employeeId);
            
//             // ─── Store employee data ───
//             setEmployeeData(employee);
            
//             // ─── Auto-fill form ───
//             setFormData({
//               email: employee.email || '',
//               password: employee.password || ''
//             });
            
//             setPopupStatus('✅ Employee found! Auto-login in progress...');
            
//             // ─── 2 sec baad auto-click login ───
//             setTimeout(() => {
//               setPopupStatus('🚀 Logging in...');
//               if (loginButtonRef.current) {
//                 loginButtonRef.current.click();
//               }
//             }, 2500);
            
//           } else {
//             setPopupStatus('❌ Failed to fetch employee data');
//             setTimeout(() => setShowPopup(false), 3000);
//           }
//         })
//         .catch(error => {
//           console.error('❌ API Error:', error);
//           setPopupStatus('❌ API Error: ' + (error.response?.data?.message || error.message));
//           setTimeout(() => setShowPopup(false), 3000);
//         });
//     }
//   }, [location]);

//   // ─── Voice Welcome ───
//   const speakWelcome = (name, role) => {
//     if ('speechSynthesis' in window) {
//       const message = `Welcome ${name}! You are logged in as ${role}. Have a great day!`;
//       const utterance = new SpeechSynthesisUtterance(message);
//       utterance.lang = 'en-US';
//       utterance.rate = 0.9;
//       utterance.pitch = 1;
//       utterance.volume = 1;
//       window.speechSynthesis.speak(utterance);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const employeeResponse = await axios.post(
//         `${BASE_URL}/employees/login`,
//         { email: formData.email, password: formData.password }
//       );

//       const responseData = employeeResponse.data;
//       const employee = responseData.employee || {};
//       const name = employee.name || responseData.name || 'Employee';
//       const role = employee.role || 'Employee';
//       const employeeId = employee.employeeId || employee.id || '';
//       const email = employee.email || formData.email;
      
//       const userData = {
//         _id: employee.id || employee._id || '',
//         id: employee.id || employee._id || '',
//         name: name,
//         fullName: name,
//         employeeName: name,
//         firstName: name.split(' ')[0] || name,
//         email: email,
//         employeeId: employeeId,
//         role: role,
//         department: employee.department || '',
//         joinDate: employee.joinDate || '',
//         permissions: employee.permissions || [],
//         profileImage: employee.profileImage || employee.profile_image || employee.image || '',
//         employee: employee
//       };
      
//       localStorage.setItem("userData", JSON.stringify(userData));
//       localStorage.setItem("employeeData", JSON.stringify(userData));
//       localStorage.setItem("employeeId", employeeId);
//       localStorage.setItem("employeeEmail", email);
//       localStorage.setItem("employeeName", name);
//       localStorage.setItem("employeeMongoId", employee._id || '');
      
//       if (responseData.token) localStorage.setItem("token", responseData.token);
//       localStorage.setItem("userRole", "employee");

//       setUserName(name);
//       setUserRole(role);
//       setShowWelcome(true);
//       setShowPopup(false);
//       speakWelcome(name, role);
      
//       setTimeout(() => {
//         navigate("/employee-dashboard", { replace: true });
//       }, 2500);

//     } catch (err) {
//       // ─── Admin login fallback ───
//       try {
//         const adminResponse = await axios.post(
//           `${BASE_URL}/admin/login`,
//           { email: formData.email, password: formData.password }
//         );

//         const admin = adminResponse.data.admin || adminResponse.data.data || {};
//         const name = admin.name || adminResponse.data.name || 'Admin';
        
//         const userData = {
//           _id: admin.id || admin._id || '',
//           id: admin.id || admin._id || '',
//           name: name,
//           fullName: name,
//           adminName: name,
//           email: admin.email || formData.email,
//           role: 'Admin',
//           admin: admin
//         };
        
//         localStorage.setItem("userData", JSON.stringify(userData));
//         localStorage.setItem("employeeData", JSON.stringify(userData));
//         localStorage.setItem("adminId", admin.id || admin._id || '');
//         localStorage.setItem("adminEmail", admin.email || formData.email);
//         localStorage.setItem("adminName", name);
//         localStorage.setItem("userRole", "admin");

//         setUserName(name);
//         setUserRole('Admin');
//         setShowWelcome(true);
//         setShowPopup(false);
//         speakWelcome(name, 'Admin');
        
//         setTimeout(() => {
//           navigate("/admin-dashboard", { replace: true });
//         }, 2500);

//       } catch (adminErr) {
//         setError(adminErr.response?.data?.message || "Invalid email or password");
//         setLoading(false);
//         setShowPopup(false);
//       }
//     } finally {
//       if (!showWelcome) setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       {/* ─── Background ─── */}
//       <div className="bg-animation">
//         <div className="circle circle-1"></div>
//         <div className="circle circle-2"></div>
//         <div className="circle circle-3"></div>
//         <div className="circle circle-4"></div>
//         <div className="circle circle-5"></div>
//       </div>

//       {/* ─── POPUP - Show Employee Data ─── */}
//       {showPopup && (
//         <div className="popup-overlay">
//           <div className="popup-card">
//             <div className="popup-icon">
//               {popupStatus.includes('⏳') && <FiZap className="w-12 h-12 text-indigo-400 animate-pulse" />}
//               {popupStatus.includes('✅') && <FiCheckCircle className="w-12 h-12 text-emerald-400" />}
//               {popupStatus.includes('🚀') && <FiLogIn className="w-12 h-12 text-blue-400 animate-pulse" />}
//               {popupStatus.includes('❌') && <FiAlertCircle className="w-12 h-12 text-rose-400" />}
//             </div>
            
//             <h3 className="popup-title">
//               {popupStatus.includes('⏳') && '🔍 Fetching Employee Data'}
//               {popupStatus.includes('✅') && '✅ Employee Found!'}
//               {popupStatus.includes('🚀') && '🚀 Logging in...'}
//               {popupStatus.includes('❌') && '❌ Error'}
//             </h3>
            
//             <p className="popup-status">{popupStatus}</p>
            
//             {/* ─── Show Employee Data ─── */}
//             {employeeData && (
//               <div className="popup-details">
//                 <div className="popup-detail-row">
//                   <span className="popup-detail-label">🆔 Employee ID:</span>
//                   <span className="popup-detail-value">{employeeData.employeeId}</span>
//                 </div>
//                 <div className="popup-detail-row">
//                   <span className="popup-detail-label">👤 Name:</span>
//                   <span className="popup-detail-value">{employeeData.name}</span>
//                 </div>
//                 <div className="popup-detail-row">
//                   <span className="popup-detail-label">📧 Email:</span>
//                   <span className="popup-detail-value">{employeeData.email}</span>
//                 </div>
//                 <div className="popup-detail-row">
//                   <span className="popup-detail-label">🔑 Password:</span>
//                   <span className="popup-detail-value">{'•'.repeat(employeeData.password?.length || 8)}</span>
//                 </div>
//                 <div className="popup-detail-row">
//                   <span className="popup-detail-label">🏢 Department:</span>
//                   <span className="popup-detail-value">{employeeData.department || 'N/A'}</span>
//                 </div>
//                 <div className="popup-detail-row">
//                   <span className="popup-detail-label">💼 Role:</span>
//                   <span className="popup-detail-value">{employeeData.role || 'N/A'}</span>
//                 </div>
//               </div>
//             )}
            
//             <div className="popup-progress">
//               <div className="popup-progress-bar">
//                 <div className={`popup-progress-fill ${popupStatus.includes('❌') ? 'error' : ''}`}></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── WELCOME POPUP ─── */}
//       {showWelcome && (
//         <div className="welcome-overlay">
//           <div className="welcome-popup-glass">
//             <div className="welcome-success-icon">
//               <FiCheckCircle className="w-16 h-16 text-emerald-400" />
//             </div>
//             <div className="welcome-sparkle">✨</div>
//             <h2 className="welcome-title">Welcome, {userName}! 🎉</h2>
//             <div className="welcome-role-badge">
//               <FiUser className="w-3 h-3" />
//               <span>{userRole}</span>
//             </div>
//             <p className="welcome-message">
//               You have been successfully logged in to <strong>INGRAIN'S TMS</strong>
//             </p>
//             <div className="welcome-progress">
//               <div className="welcome-progress-bar">
//                 <div className="welcome-progress-fill"></div>
//               </div>
//               <p className="welcome-loading-text">Redirecting to dashboard...</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── LOGIN CARD ─── */}
//       <div className="login-card glass">
//         <div className="login-header">
//           <div className="logo-icon">
//             <FiZap className="w-8 h-8 text-white" />
//           </div>
//           <h1>INGRAIN'S TMS</h1>
//           <p>Welcome back! Please login to your account</p>
//         </div>

//         <form onSubmit={handleSubmit} className="login-form">
//           {error && (
//             <div className="error-message">
//               <FiAlertCircle className="w-4 h-4" />
//               {error}
//             </div>
//           )}

//           <div className="form-group">
//             <div className="input-icon">
//               <FiMail className="w-4 h-4" />
//             </div>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Email Address"
//               className="form-control"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <div className="input-icon">
//               <FiLock className="w-4 h-4" />
//             </div>
//             <input
//               type={showPassword ? "text" : "password"}
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Password"
//               className="form-control"
//               required
//             />
//             <button
//               type="button"
//               className="password-toggle"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
//             </button>
//           </div>

//           <div className="form-options">
//             <label className="remember-me">
//               <input type="checkbox" />
//               <span>Remember me</span>
//             </label>
//             <a href="#" className="forgot-link">Forgot Password?</a>
//           </div>

//           <button 
//             ref={loginButtonRef}
//             type="submit" 
//             className="login-button" 
//             disabled={loading}
//           >
//             {loading ? (
//               <span className="loading-spinner">
//                 <span className="spinner"></span>
//                 Logging in...
//               </span>
//             ) : (
//               <>
//                 <FiLogIn className="w-4 h-4" />
//                 Sign In
//               </>
//             )}
//           </button>

//           <div className="login-footer">
//             <p>Don't have an account? <span className="highlight">Contact Admin</span></p>
//           </div>
//         </form>
//       </div>

//       <style jsx>{`
//         .login-container {
//           min-height: 100vh;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
//           position: relative;
//           overflow: hidden;
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//         }

//         .bg-animation {
//           position: absolute;
//           inset: 0;
//           overflow: hidden;
//           z-index: 0;
//         }

//         .circle {
//           position: absolute;
//           border-radius: 50%;
//           animation: float 20s infinite ease-in-out;
//         }

//         .circle-1 {
//           width: 600px;
//           height: 600px;
//           background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
//           top: -200px;
//           right: -200px;
//           animation-delay: 0s;
//         }

//         .circle-2 {
//           width: 500px;
//           height: 500px;
//           background: radial-gradient(circle, rgba(168, 85, 247, 0.12), transparent 70%);
//           bottom: -150px;
//           left: -150px;
//           animation-delay: -3s;
//         }

//         .circle-3 {
//           width: 300px;
//           height: 300px;
//           background: radial-gradient(circle, rgba(236, 72, 153, 0.08), transparent 70%);
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           animation-delay: -6s;
//         }

//         .circle-4 {
//           width: 200px;
//           height: 200px;
//           background: radial-gradient(circle, rgba(52, 211, 153, 0.08), transparent 70%);
//           top: 10%;
//           left: 10%;
//           animation-delay: -9s;
//         }

//         .circle-5 {
//           width: 250px;
//           height: 250px;
//           background: radial-gradient(circle, rgba(251, 191, 36, 0.06), transparent 70%);
//           bottom: 20%;
//           right: 15%;
//           animation-delay: -12s;
//         }

//         @keyframes float {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           25% { transform: translate(30px, -30px) scale(1.05); }
//           50% { transform: translate(-20px, 20px) scale(0.95); }
//           75% { transform: translate(40px, 10px) scale(1.02); }
//         }

//         .login-card {
//           position: relative;
//           z-index: 1;
//           width: 100%;
//           max-width: 420px;
//           padding: 45px 40px;
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(20px);
//           -webkit-backdrop-filter: blur(20px);
//           border-radius: 30px;
//           border: 1px solid rgba(255, 255, 255, 0.15);
//           box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
//           animation: slideIn 0.6s ease-out;
//         }

//         @keyframes slideIn {
//           from { opacity: 0; transform: translateY(30px) scale(0.95); }
//           to { opacity: 1; transform: translateY(0) scale(1); }
//         }

//         .login-header {
//           text-align: center;
//           margin-bottom: 35px;
//         }

//         .logo-icon {
//           width: 60px;
//           height: 60px;
//           margin: 0 auto 15px;
//           background: linear-gradient(135deg, #6366f1, #8b5cf6);
//           border-radius: 18px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
//           animation: pulse-glow 3s infinite;
//         }

//         @keyframes pulse-glow {
//           0%, 100% { box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4); }
//           50% { box-shadow: 0 10px 50px rgba(99, 102, 241, 0.6); }
//         }

//         .login-header h1 {
//           font-size: 26px;
//           font-weight: 700;
//           color: #ffffff;
//           letter-spacing: 1px;
//           margin-bottom: 8px;
//           background: linear-gradient(135deg, #818cf8, #c084fc);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }

//         .login-header p {
//           font-size: 14px;
//           color: rgba(255, 255, 255, 0.6);
//           -webkit-text-fill-color: rgba(255, 255, 255, 0.6);
//         }

//         .login-form {
//           display: flex;
//           flex-direction: column;
//           gap: 18px;
//         }

//         .form-group {
//           position: relative;
//         }

//         .input-icon {
//           position: absolute;
//           left: 14px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: rgba(255, 255, 255, 0.4);
//           pointer-events: none;
//         }

//         .form-control {
//           width: 100%;
//           padding: 14px 45px 14px 42px;
//           background: rgba(255, 255, 255, 0.06);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           border-radius: 14px;
//           font-size: 14px;
//           color: #ffffff;
//           transition: all 0.3s ease;
//           outline: none;
//         }

//         .form-control::placeholder {
//           color: rgba(255, 255, 255, 0.35);
//         }

//         .form-control:focus {
//           border-color: rgba(99, 102, 241, 0.5);
//           background: rgba(255, 255, 255, 0.08);
//           box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
//         }

//         .password-toggle {
//           position: absolute;
//           right: 14px;
//           top: 50%;
//           transform: translateY(-50%);
//           background: none;
//           border: none;
//           color: rgba(255, 255, 255, 0.4);
//           cursor: pointer;
//           padding: 4px;
//           transition: color 0.3s;
//         }

//         .password-toggle:hover {
//           color: rgba(255, 255, 255, 0.7);
//         }

//         .form-options {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           font-size: 13px;
//           color: rgba(255, 255, 255, 0.6);
//         }

//         .remember-me {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           cursor: pointer;
//         }

//         .remember-me input[type="checkbox"] {
//           width: 16px;
//           height: 16px;
//           accent-color: #6366f1;
//           border-radius: 4px;
//           cursor: pointer;
//         }

//         .forgot-link {
//           color: rgba(255, 255, 255, 0.6);
//           text-decoration: none;
//           transition: color 0.3s;
//         }

//         .forgot-link:hover {
//           color: #818cf8;
//         }

//         .login-button {
//           width: 100%;
//           padding: 14px;
//           background: linear-gradient(135deg, #6366f1, #8b5cf6);
//           border: none;
//           border-radius: 14px;
//           font-size: 15px;
//           font-weight: 600;
//           color: white;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 10px;
//           position: relative;
//           overflow: hidden;
//         }

//         .login-button::before {
//           content: '';
//           position: absolute;
//           inset: 0;
//           background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
//           opacity: 0;
//           transition: opacity 0.3s;
//         }

//         .login-button:hover:not(:disabled)::before {
//           opacity: 1;
//         }

//         .login-button:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
//         }

//         .login-button:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         .loading-spinner {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//         }

//         .spinner {
//           width: 18px;
//           height: 18px;
//           border: 2px solid rgba(255,255,255,0.3);
//           border-top-color: white;
//           border-radius: 50%;
//           animation: spin 0.8s linear infinite;
//         }

//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }

//         .login-footer {
//           text-align: center;
//           font-size: 13px;
//           color: rgba(255, 255, 255, 0.5);
//           margin-top: 8px;
//         }

//         .login-footer .highlight {
//           color: #818cf8;
//           font-weight: 500;
//         }

//         .error-message {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 12px 16px;
//           background: rgba(239, 68, 68, 0.15);
//           border: 1px solid rgba(239, 68, 68, 0.25);
//           border-radius: 12px;
//           font-size: 13px;
//           color: #fca5a5;
//         }

//         /* ─── POPUP STYLES ─── */
//         .popup-overlay {
//           position: fixed;
//           inset: 0;
//           background: rgba(0, 0, 0, 0.6);
//           backdrop-filter: blur(12px);
//           -webkit-backdrop-filter: blur(12px);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 9998;
//           animation: fadeIn 0.4s ease-out;
//         }

//         .popup-card {
//           background: rgba(255, 255, 255, 0.06);
//           backdrop-filter: blur(30px);
//           -webkit-backdrop-filter: blur(30px);
//           padding: 30px 35px 25px;
//           border-radius: 24px;
//           text-align: center;
//           max-width: 420px;
//           width: 90%;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
//           animation: welcomeSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
//         }

//         .popup-icon {
//           width: 60px;
//           height: 60px;
//           margin: 0 auto 10px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .popup-title {
//           font-size: 18px;
//           font-weight: 700;
//           color: #ffffff;
//           margin-bottom: 4px;
//         }

//         .popup-status {
//           color: rgba(255, 255, 255, 0.6);
//           font-size: 12px;
//           margin-bottom: 14px;
//         }

//         .popup-details {
//           background: rgba(255, 255, 255, 0.04);
//           padding: 10px 14px;
//           border-radius: 10px;
//           margin-bottom: 14px;
//           border: 1px solid rgba(255, 255, 255, 0.05);
//           text-align: left;
//         }

//         .popup-detail-row {
//           display: flex;
//           justify-content: space-between;
//           font-size: 11px;
//           padding: 3px 0;
//           color: rgba(255, 255, 255, 0.5);
//         }

//         .popup-detail-row .popup-detail-value {
//           color: rgba(255, 255, 255, 0.9);
//           font-weight: 500;
//         }

//         .popup-progress {
//           width: 100%;
//         }

//         .popup-progress-bar {
//           width: 100%;
//           height: 3px;
//           background: rgba(255, 255, 255, 0.06);
//           border-radius: 10px;
//           overflow: hidden;
//         }

//         .popup-progress-fill {
//           height: 100%;
//           width: 0%;
//           background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa);
//           border-radius: 10px;
//           animation: progressFill 2.5s ease-in-out forwards;
//         }

//         .popup-progress-fill.error {
//           background: linear-gradient(90deg, #ef4444, #dc2626);
//           animation-duration: 0.5s;
//         }

//         /* ─── WELCOME STYLES ─── */
//         .welcome-overlay {
//           position: fixed;
//           inset: 0;
//           background: rgba(0, 0, 0, 0.5);
//           backdrop-filter: blur(16px);
//           -webkit-backdrop-filter: blur(16px);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 9999;
//           animation: fadeIn 0.5s ease-out;
//         }

//         .welcome-popup-glass {
//           position: relative;
//           background: rgba(255, 255, 255, 0.06);
//           backdrop-filter: blur(30px);
//           -webkit-backdrop-filter: blur(30px);
//           padding: 40px 45px 35px;
//           border-radius: 32px;
//           text-align: center;
//           max-width: 440px;
//           width: 90%;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
//           animation: welcomeSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
//         }

//         .welcome-success-icon {
//           width: 72px;
//           height: 72px;
//           margin: 0 auto 12px;
//           background: linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.05));
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border: 2px solid rgba(52, 211, 153, 0.3);
//           animation: successPulse 2s ease-in-out infinite;
//         }

//         @keyframes successPulse {
//           0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.2); transform: scale(1); }
//           50% { box-shadow: 0 0 40px 10px rgba(52, 211, 153, 0.1); transform: scale(1.02); }
//         }

//         .welcome-sparkle {
//           position: absolute;
//           top: 16px;
//           right: 24px;
//           font-size: 20px;
//           animation: sparkleFloat 3s ease-in-out infinite;
//         }

//         @keyframes sparkleFloat {
//           0%, 100% { transform: translateY(0) rotate(0deg); }
//           50% { transform: translateY(-6px) rotate(20deg); }
//         }

//         .welcome-title {
//           font-size: 24px;
//           font-weight: 700;
//           color: #ffffff;
//           margin-bottom: 8px;
//           background: linear-gradient(135deg, #e0e7ff, #c4b5fd);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }

//         .welcome-role-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 4px 14px;
//           background: rgba(99, 102, 241, 0.12);
//           border: 1px solid rgba(99, 102, 241, 0.15);
//           border-radius: 20px;
//           color: #a5b4fc;
//           font-size: 11px;
//           font-weight: 500;
//           margin-bottom: 12px;
//         }

//         .welcome-message {
//           color: rgba(255, 255, 255, 0.7);
//           font-size: 14px;
//           line-height: 1.6;
//           margin-bottom: 16px;
//         }

//         .welcome-message strong {
//           color: rgba(255, 255, 255, 0.9);
//         }

//         .welcome-progress {
//           width: 100%;
//         }

//         .welcome-progress-bar {
//           width: 100%;
//           height: 3px;
//           background: rgba(255, 255, 255, 0.06);
//           border-radius: 10px;
//           overflow: hidden;
//         }

//         .welcome-progress-fill {
//           height: 100%;
//           width: 0%;
//           background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa);
//           border-radius: 10px;
//           animation: progressFill 2.5s ease-in-out forwards;
//         }

//         @keyframes progressFill {
//           0% { width: 0%; }
//           30% { width: 35%; }
//           60% { width: 70%; }
//           100% { width: 100%; }
//         }

//         .welcome-loading-text {
//           color: rgba(255, 255, 255, 0.35);
//           font-size: 11px;
//           margin-top: 8px;
//           animation: textPulse 1.5s ease-in-out infinite;
//         }

//         @keyframes textPulse {
//           0%, 100% { opacity: 0.4; }
//           50% { opacity: 0.8; }
//         }

//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }

//         @keyframes welcomeSlideUp {
//           from { opacity: 0; transform: translateY(40px) scale(0.9); }
//           to { opacity: 1; transform: translateY(0) scale(1); }
//         }

//         @media (max-width: 480px) {
//           .login-card { padding: 30px 24px; margin: 20px; border-radius: 24px; }
//           .login-header h1 { font-size: 22px; }
//           .popup-card { padding: 25px 20px; margin: 20px; }
//           .popup-title { font-size: 16px; }
//           .popup-detail-row { font-size: 10px; }
//           .welcome-popup-glass { padding: 30px 20px 25px; margin: 20px; }
//           .welcome-title { font-size: 20px; }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default Login;



// src/components/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiLogIn, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Logo from './images/iglogo.png';

const BASE_URL = 'https://api.timelyhealth.in/api';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginButtonRef = useRef(null);
  const autoLoginAttempted = useRef(false);
  
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
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupStatus, setPopupStatus] = useState('⏳ Fetching...');
  const [employeeData, setEmployeeData] = useState(null);
  const [coords, setCoords] = useState({ latitude: undefined, longitude: undefined });

  // ─── GEOLOCATION CAPTURE ───
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation request failed or denied:", error.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // ─── SPEECH SYNTHESIS ───
  const speakWelcome = (name, role) => {
    console.log('🔊 Attempting to speak:', name, role);
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const trySpeak = (message, voiceIndex = 0) => {
      if (!window.speechSynthesis) return false;
      
      try {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const femaleVoices = voices.filter(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('victoria') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('zira')
        );
        
        const maleVoices = voices.filter(v => 
          v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('david') ||
          v.name.toLowerCase().includes('alex')
        );
        
        let selectedVoice = null;
        if (voiceIndex < femaleVoices.length) {
          selectedVoice = femaleVoices[voiceIndex];
        } else if (voiceIndex - femaleVoices.length < maleVoices.length) {
          selectedVoice = maleVoices[voiceIndex - femaleVoices.length];
        } else if (voices.length > 0) {
          selectedVoice = voices[voiceIndex % voices.length];
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('🎤 Using voice:', selectedVoice.name);
        }
        
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (err) {
        console.log('❌ Speech error:', err);
        return false;
      }
    };

    const speakWithRetry = (attempt = 0) => {
      const message = `Welcome ${name}! You are logged in as ${role}. Have a great day!`;
      const success = trySpeak(message, attempt);
      if (!success && attempt < 5) {
        setTimeout(() => speakWithRetry(attempt + 1), 500);
      }
    };

    const initSpeech = () => {
      if (window.speechSynthesis.getVoices().length > 0) {
        speakWithRetry(0);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          speakWithRetry(0);
        };
        setTimeout(() => {
          if (window.speechSynthesis.getVoices().length > 0) {
            speakWithRetry(0);
          } else {
            try {
              const utterance = new SpeechSynthesisUtterance(`Welcome ${name}!`);
              utterance.volume = 1.0;
              utterance.rate = 0.9;
              utterance.pitch = 1;
              window.speechSynthesis.speak(utterance);
            } catch (err) {
              console.log('❌ Force speak failed:', err);
            }
          }
        }, 1000);
      }
    };

    setTimeout(initSpeech, 300);
  };

  // ─── AUTO-LOGIN FROM URL PARAMS ───
  const handleAutoLogin = async (email, password, role) => {
    console.log('🚀 Auto-login triggered with:', { email, password, role });
    
    if (autoLoginAttempted.current) {
      console.log('⚠️ Auto-login already attempted, skipping...');
      return;
    }
    autoLoginAttempted.current = true;
    
    setLoading(true);
    setFormData({ email, password });

    try {
      // Try employee login first
      const employeeResponse = await axios.post(
        `${BASE_URL}/employees/login`,
        { 
          email, 
          password,
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      );

      const responseData = employeeResponse.data;
      const employee = responseData.employee || {};
      const name = employee.name || responseData.name || 'Employee';
      const userRole = employee.role || 'Employee';
      const employeeId = employee.employeeId || employee.id || '';
      
      const userData = {
        _id: employee.id || employee._id || '',
        id: employee.id || employee._id || '',
        name: name,
        fullName: name,
        employeeName: name,
        firstName: name.split(' ')[0] || name,
        email: email,
        employeeId: employeeId,
        role: userRole,
        department: employee.department || '',
        joinDate: employee.joinDate || '',
        permissions: employee.permissions || [],
        profileImage: employee.profileImage || employee.profile_image || employee.image || '',
        employee: employee
      };
      
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("employeeData", JSON.stringify(userData));
      localStorage.setItem("employeeId", employeeId);
      localStorage.setItem("employeeEmail", email);
      localStorage.setItem("employeeName", name);
      localStorage.setItem("employeeMongoId", employee._id || '');
      
      if (responseData.token) localStorage.setItem("token", responseData.token);
      localStorage.setItem("userRole", "employee");

      setUserName(name);
      setUserRole(userRole);
      setShowWelcome(true);
      setShowPopup(false);
      
      setTimeout(() => speakWelcome(name, userRole), 1000);
      setTimeout(() => navigate("/employee-dashboard", { replace: true }), 3000);

    } catch (err) {
      try {
        // Try admin login
        const adminResponse = await axios.post(
          `${BASE_URL}/admin/login`,
          { email, password }
        );

        const admin = adminResponse.data.admin || adminResponse.data.data || {};
        const name = admin.name || adminResponse.data.name || 'Admin';
        
        const userData = {
          _id: admin.id || admin._id || '',
          id: admin.id || admin._id || '',
          name: name,
          fullName: name,
          adminName: name,
          email: admin.email || email,
          role: 'Admin',
          admin: admin
        };
        
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("employeeData", JSON.stringify(userData));
        localStorage.setItem("adminId", admin.id || admin._id || '');
        localStorage.setItem("adminEmail", admin.email || email);
        localStorage.setItem("adminName", name);
        localStorage.setItem("userRole", "admin");

        setUserName(name);
        setUserRole('Admin');
        setShowWelcome(true);
        setShowPopup(false);
        
        setTimeout(() => speakWelcome(name, 'Admin'), 1000);
        setTimeout(() => navigate("/admin-dashboard", { replace: true }), 3000);

      } catch (adminErr) {
        console.error('❌ Auto-login failed:', adminErr);
        setError(adminErr.response?.data?.message || "Auto-login failed. Please try manually.");
        setLoading(false);
        setShowPopup(false);
        autoLoginAttempted.current = false;
      }
    }
  };

  // ─── EFFECT: Check for URL params ───
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    
    // ─── CHECK FOR AUTO-LOGIN PARAMS ───
    const email = urlParams.get('email');
    const password = urlParams.get('password');
    const autoLogin = urlParams.get('autoLogin');
    const role = urlParams.get('role') || 'employee';

    console.log('🔍 URL Params:', { email, password, autoLogin, role });

    if (autoLogin === 'true' && email && password) {
      console.log('✅ Auto-login params found!');
      
      // Show popup with employee data
      setShowPopup(true);
      setPopupStatus('🔐 Auto-login in progress...');
      
      // Show employee data in popup
      setEmployeeData({
        email: email,
        password: password,
        name: 'Loading...',
        role: role
      });

      // Small delay to show popup then login
      setTimeout(() => {
        handleAutoLogin(email, password, role);
      }, 500);
      
      return;
    }

    // ─── CHECK FOR employeeId PARAM (Legacy support) ───
    const employeeId = urlParams.get('employeeId');
    if (employeeId) {
      setShowPopup(true);
      setPopupStatus('⏳ Fetching employee data from API...');
      
      axios.get(`${BASE_URL}/employees/get-employee?employeeId=${employeeId}`)
        .then(response => {
          if (response.data.success) {
            const employee = response.data.data;
            setEmployeeData(employee);
            setFormData({
              email: employee.email || '',
              password: employee.password || ''
            });
            setPopupStatus('✅ Employee found! Auto-login in progress...');
            setTimeout(() => {
              setPopupStatus('🚀 Logging in...');
              if (loginButtonRef.current) {
                loginButtonRef.current.click();
              }
            }, 2500);
          } else {
            setPopupStatus('❌ Failed to fetch employee data');
            setTimeout(() => setShowPopup(false), 3000);
          }
        })
        .catch(error => {
          setPopupStatus('❌ API Error: ' + (error.response?.data?.message || error.message));
          setTimeout(() => setShowPopup(false), 3000);
        });
    }
  }, [location]);

  // ─── MANUAL LOGIN HANDLER ───
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      );

      const responseData = employeeResponse.data;
      const employee = responseData.employee || {};
      const name = employee.name || responseData.name || 'Employee';
      const role = employee.role || 'Employee';
      const employeeId = employee.employeeId || employee.id || '';
      const email = employee.email || formData.email;
      
      const userData = {
        _id: employee.id || employee._id || '',
        id: employee.id || employee._id || '',
        name: name,
        fullName: name,
        employeeName: name,
        firstName: name.split(' ')[0] || name,
        email: email,
        employeeId: employeeId,
        role: role,
        department: employee.department || '',
        joinDate: employee.joinDate || '',
        permissions: employee.permissions || [],
        profileImage: employee.profileImage || employee.profile_image || employee.image || '',
        employee: employee
      };
      
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("employeeData", JSON.stringify(userData));
      localStorage.setItem("employeeId", employeeId);
      localStorage.setItem("employeeEmail", email);
      localStorage.setItem("employeeName", name);
      localStorage.setItem("employeeMongoId", employee._id || '');
      
      if (responseData.token) localStorage.setItem("token", responseData.token);
      localStorage.setItem("userRole", "employee");

      setUserName(name);
      setUserRole(role);
      setShowWelcome(true);
      setShowPopup(false);
      
      setTimeout(() => speakWelcome(name, role), 1000);
      setTimeout(() => navigate("/employee-dashboard", { replace: true }), 3000);

    } catch (err) {
      try {
        const adminResponse = await axios.post(
          `${BASE_URL}/admin/login`,
          { email: formData.email, password: formData.password }
        );

        const admin = adminResponse.data.admin || adminResponse.data.data || {};
        const name = admin.name || adminResponse.data.name || 'Admin';
        
        const userData = {
          _id: admin.id || admin._id || '',
          id: admin.id || admin._id || '',
          name: name,
          fullName: name,
          adminName: name,
          email: admin.email || formData.email,
          role: 'Admin',
          admin: admin
        };
        
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("employeeData", JSON.stringify(userData));
        localStorage.setItem("adminId", admin.id || admin._id || '');
        localStorage.setItem("adminEmail", admin.email || formData.email);
        localStorage.setItem("adminName", name);
        localStorage.setItem("userRole", "admin");

        setUserName(name);
        setUserRole('Admin');
        setShowWelcome(true);
        setShowPopup(false);
        
        setTimeout(() => speakWelcome(name, 'Admin'), 1000);
        setTimeout(() => navigate("/admin-dashboard", { replace: true }), 3000);

      } catch (adminErr) {
        setError(adminErr.response?.data?.message || "Invalid email or password");
        setLoading(false);
        setShowPopup(false);
      }
    } finally {
      if (!showWelcome) setLoading(false);
    }
  };

  // ─── TEST SPEECH ───
  const testSpeech = () => {
    console.log('🔊 Testing speech synthesis...');
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('Hello! This is a test. Can you hear me?');
      utterance.volume = 1.0;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('samantha')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Background Animations */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(ellipse at 30% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
          animation: 'rotateShine 30s linear infinite',
          pointerEvents: 'none'
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(ellipse at 70% 30%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)',
          animation: 'rotateShine 25s linear infinite reverse',
          pointerEvents: 'none'
        }}></div>

        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 70%)',
          top: '-200px',
          right: '-200px',
          borderRadius: '50%',
          animation: 'float 20s infinite ease-in-out, shimmer 3s ease-in-out infinite'
        }}></div>
        
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.10), transparent 70%)',
          bottom: '-150px',
          left: '-150px',
          borderRadius: '50%',
          animation: 'float 20s infinite ease-in-out',
          animationDelay: '-3s'
        }}></div>
      </div>

      {/* Employee Data Popup */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          animation: 'fadeIn 0.4s ease-out'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            padding: '30px 35px 25px',
            borderRadius: '24px',
            textAlign: 'center',
            maxWidth: '420px',
            width: '90%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
            animation: 'welcomeSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {popupStatus.includes('⏳') && <span style={{ fontSize: '32px' }}>⏳</span>}
              {popupStatus.includes('✅') && <FiCheckCircle size={32} color="#34d399" />}
              {popupStatus.includes('🚀') && <span style={{ fontSize: '32px' }}>🚀</span>}
              {popupStatus.includes('❌') && <FiAlertCircle size={32} color="#f87171" />}
              {popupStatus.includes('🔐') && <span style={{ fontSize: '32px' }}>🔐</span>}
            </div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 700, 
              color: '#ffffff', 
              marginBottom: '4px'
            }}>
              {popupStatus.includes('⏳') && '🔍 Fetching Employee Data'}
              {popupStatus.includes('✅') && '✅ Employee Found!'}
              {popupStatus.includes('🚀') && '🚀 Logging in...'}
              {popupStatus.includes('❌') && '❌ Error'}
              {popupStatus.includes('🔐') && '🔐 Auto-login in progress...'}
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '12px', 
              marginBottom: '14px' 
            }}>
              {popupStatus}
            </p>
            {employeeData && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '14px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'left'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '11px', 
                  padding: '3px 0', 
                  color: 'rgba(255, 255, 255, 0.5)' 
                }}>
                  <span>📧 Email:</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                    {employeeData.email}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '11px', 
                  padding: '3px 0', 
                  color: 'rgba(255, 255, 255, 0.5)' 
                }}>
                  <span>🔑 Password:</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                    {'•'.repeat(employeeData.password?.length || 8)}
                  </span>
                </div>
                {employeeData.name && employeeData.name !== 'Loading...' && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '11px', 
                    padding: '3px 0', 
                    color: 'rgba(255, 255, 255, 0.5)' 
                  }}>
                    <span>👤 Name:</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                      {employeeData.name}
                    </span>
                  </div>
                )}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '11px', 
                  padding: '3px 0', 
                  color: 'rgba(255, 255, 255, 0.5)' 
                }}>
                  <span>💼 Role:</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                    {employeeData.role || 'Employee'}
                  </span>
                </div>
              </div>
            )}
            <div style={{ width: '100%' }}>
              <div style={{ 
                width: '100%', 
                height: '3px', 
                background: 'rgba(255, 255, 255, 0.06)', 
                borderRadius: '10px', 
                overflow: 'hidden' 
              }}>
                <div style={{
                  height: '100%',
                  width: '0%',
                  background: popupStatus.includes('❌') 
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)' 
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                  borderRadius: '10px',
                  animation: popupStatus.includes('❌') 
                    ? 'progressFillError 0.5s ease-in-out forwards' 
                    : 'progressFill 2.5s ease-in-out forwards'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Popup */}
      {showWelcome && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            padding: '40px 45px 35px',
            borderRadius: '32px',
            textAlign: 'center',
            maxWidth: '440px',
            width: '90%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
            animation: 'welcomeSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 12px',
              background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.05))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(52, 211, 153, 0.3)',
              animation: 'successPulse 2s ease-in-out infinite'
            }}>
              <FiCheckCircle size={40} color="#34d399" />
            </div>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '24px',
              fontSize: '20px',
              animation: 'sparkleFloat 3s ease-in-out infinite'
            }}>
              ✨
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #e0e7ff, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome, {userName}! 🎉
            </h2>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: '20px',
              color: '#a5b4fc',
              fontSize: '11px',
              fontWeight: 500,
              marginBottom: '12px'
            }}>
              <FiUser size={12} />
              <span>{userRole}</span>
            </div>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '14px', 
              lineHeight: 1.6, 
              marginBottom: '16px' 
            }}>
              You have been successfully logged in to{' '}
              <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>INGRAIN'S TMS</strong>
            </p>
            
            <div style={{ width: '100%' }}>
              <div style={{ 
                width: '100%', 
                height: '3px', 
                background: 'rgba(255, 255, 255, 0.06)', 
                borderRadius: '10px', 
                overflow: 'hidden' 
              }}>
                <div style={{
                  height: '100%',
                  width: '0%',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                  borderRadius: '10px',
                  animation: 'progressFill 2.5s ease-in-out forwards'
                }}></div>
              </div>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.35)', 
                fontSize: '11px', 
                marginTop: '8px',
                animation: 'textPulse 1.5s ease-in-out infinite'
              }}>
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '420px',
        padding: '45px 40px',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        animation: 'slideIn 0.6s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 15px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '10px',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
            animation: 'pulseGlow 3s infinite'
          }}>
            <img 
              src={Logo} 
              alt="INGRAIN Logo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%'
              }}
            />
          </div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '1px',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            INGRAIN'S TMS
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: 'rgba(255, 255, 255, 0.6)',
            WebkitTextFillColor: 'rgba(255, 255, 255, 0.6)'
          }}>
            Welcome back! Please login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '18px' 
        }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '12px',
              fontSize: '13px',
              color: '#fca5a5'
            }}>
              <FiAlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.4)',
              pointerEvents: 'none',
              zIndex: 2
            }}>
              <FiMail size={18} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              style={{
                width: '100%',
                padding: '14px 45px 14px 42px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                fontSize: '14px',
                color: '#ffffff',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxSizing: 'border-box',
                height: '52px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '52px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            boxSizing: 'border-box',
            transition: 'all 0.3s ease'
          }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: '14px',
              color: 'rgba(255, 255, 255, 0.4)',
              pointerEvents: 'none',
              flexShrink: 0
            }}>
              <FiLock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                padding: '0 8px 0 12px',
                background: 'transparent',
                border: 'none',
                fontSize: '14px',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                padding: '6px',
                marginRight: '8px',
                borderRadius: '6px',
                flexShrink: 0,
                transition: 'all 0.3s ease',
                transform: 'translateY(-10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginTop: '4px'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer' 
            }}>
              <input 
                type="checkbox" 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  accentColor: '#6366f1', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }} 
              />
              <span>Remember me</span>
            </label>
            <a 
              href="#" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                textDecoration: 'none', 
                transition: 'color 0.3s' 
              }}
              onMouseEnter={(e) => e.target.style.color = '#818cf8'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Forgot Password?
            </a>
          </div>

          <button
            ref={loginButtonRef}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              height: '52px',
              opacity: loading ? 0.6 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></span>
                Logging in...
              </span>
            ) : (
              <>
                <FiLogIn size={18} />
                Sign In
              </>
            )}
          </button>

          <div style={{ 
            textAlign: 'center', 
            fontSize: '13px', 
            color: 'rgba(255, 255, 255, 0.5)', 
            marginTop: '8px'
          }}>
            Don't have an account?{' '}
            <span style={{ 
              color: '#818cf8', 
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}>
              Contact Admin
            </span>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(40px, 10px) scale(1.02); }
        }
        
        @keyframes rotateShine {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes progressFill {
          0% { width: 0%; }
          30% { width: 35%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
        
        @keyframes progressFillError {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 10px 50px rgba(99, 102, 241, 0.6); }
        }
        
        @keyframes successPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.2); transform: scale(1); }
          50% { box-shadow: 0 0 40px 10px rgba(52, 211, 153, 0.1); transform: scale(1.02); }
        }
        
        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(20deg); }
        }
        
        @keyframes textPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes welcomeSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Login;