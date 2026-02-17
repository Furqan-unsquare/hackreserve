import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Users,
    FileText,
    User,
    LogOut,
    LayoutDashboard
} from 'lucide-react';

const Sidebar = () => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        // In a real app, clear tokens here
        console.log('Logging out...');
        navigate('/login');
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <LayoutDashboard size={24} />
                    <span>CA Dashboard</span>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/dashboard/client-profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        <span>Client Profile</span>
                    </NavLink>
                    <NavLink to="/dashboard/billing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FileText size={20} />
                        <span>Billing Process</span>
                    </NavLink>
                    <NavLink to="/dashboard/admin-profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <User size={20} />
                        <span>Admin Profile</span>
                    </NavLink>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="nav-link logout btn-link"
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'inherit', fontSize: 'inherit' }}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Logout</h3>
                        <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Are you sure you want to log out?</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn" style={{ background: '#e2e8f0' }} onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const DashboardLayout = () => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
