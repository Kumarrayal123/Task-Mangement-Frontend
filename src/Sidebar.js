import React from 'react';
import Navbar from './Navbar';

function Sidebar({ userRole, onLogout }) {
  return <Navbar userRole={userRole} onLogout={onLogout} />;
}

export default Sidebar;