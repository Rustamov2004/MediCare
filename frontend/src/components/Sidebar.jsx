// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div style={{ width: '250px', height: '100vh', background: '#f4f7f6', padding: '20px' }}>
            <h2>Admin Panel</h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <NavLink to="/admin/nurses">👩‍⚕️ Medsestralar</NavLink>
                <NavLink to="/admin/services">💰 Xizmatlar</NavLink>
            </nav>
        </div>
    );
};
export default Sidebar;