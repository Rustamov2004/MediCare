import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import './index.css';
import { ToastProvider } from "./components/ToastContext";
import { Eye, EyeOff, User, Sun, Moon, Menu, Users, UserCheck, Syringe, Package, Wallet, BarChart2, Landmark, BriefcaseMedical, CalendarDays, Wrench, DollarSign, ClipboardList, FolderOpen, Calendar, Settings, Monitor, LogOut } from 'lucide-react';

import Admin from './pages/Admin';
import Doctor from './pages/Doctor';
import UserSchedule from './pages/UserSchedule';
import Reception from './pages/Reception';
import Monitoring from './pages/Monitoring';
import Medsestra from './pages/Medsestra';

import SuperAdmin from './pages/SuperAdmin';
import { AuthAPI } from './api';
import NotificationBell from './components/NotificationBell';

// ── CREDENTIAL CONFIG ──────────────────────────────────────────────────────────
const ROLE_ICONS = {
    SUPER_ADMIN: '⭐',
    ADMIN:       '🏥',
    DOCTOR:      '🧑‍⚕️',
    RECEPTION:   '🗂️',
    MONITORING:  '📺',
    MEDSESTRA:   '💉',
};
const getRoleIcon = (role) => ROLE_ICONS[role] || <User size={16} />;

// ── LOGIN PAGE ─────────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleLogin = async () => {
        setError('');
        if (!username.trim() || !password.trim()) {
            return setError('Login va parolni kiriting!');
        }
        setLoading(true);
        try {
            const response = await AuthAPI.login({ userName: username.trim(), password: password.trim() });
            localStorage.setItem('token', response.token);
            
            const role = response.role;
            const icon = ROLE_ICONS[role] || <User size={18} />;
            const userObj = { username: response.fullName || response.username, role: role, clinicName: response.clinicName };
            
            localStorage.setItem('user', JSON.stringify(userObj));
            onLogin({ ...userObj, icon });
            
            if (role === 'SUPER_ADMIN') {
                navigate('/super-admin');
            } else {
                navigate(`/${role.toLowerCase()}`);
            }
        } catch (err) {
            if (err.message && err.message.includes('SUBSCRIPTION_EXPIRED')) {
                setError(err.message.replace('SUBSCRIPTION_EXPIRED:', '').trim());
            } else {
                setError("Login yoki parol noto'g'ri!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin(); };

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="login-logo">
                    <span className="login-logo-icon">🏥</span>
                    <h1>MediCare</h1>
                    <p>Klinika boshqaruv tizimi</p>
                </div>

                <div className="login-form">
                    <div className="login-field">
                        <label>Foydalanuvchi nomi</label>
                        <input
                            id="login-username"
                            placeholder="admin / doctor / reception / monitoring"
                            value={username}
                            onChange={e => { setUsername(e.target.value); setError(''); }}
                            onKeyDown={handleKeyDown}
                            autoComplete="username"
                        />
                    </div>

                    <div className="login-field">
                        <label>Parol</label>
                        <div className="login-pass-wrap">
                            <input
                                id="login-password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                onKeyDown={handleKeyDown}
                                autoComplete="current-password"
                            />
                            <span onClick={() => setShowPass(!showPass)} className="login-eye">
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>

                    {error && <div className="login-error">⚠️ {error}</div>}

                    <button id="login-submit" className="login-btn" onClick={handleLogin} disabled={loading}>
                        {loading ? <span className="login-spinner">⟳</span> : 'Kirish →'}
                    </button>
                </div>


            </div>
        </div>
    );
};

// ── SIDEBAR CONFIG ─────────────────────────────────────────────────────────────
const ADMIN_MENU = [
    { to: '/admin/settings', label: 'Shaxsiy Kabinet',  icon: <User size={18} /> },
    { to: '/admin/doctors',  label: 'Xodimlar',    icon: <Users size={18} /> },
    { to: '/admin/patients', label: 'Bemorlar',    icon: <UserCheck size={18} /> },
    { to: '/admin/muolaja',  label: 'Muolaja',     icon: <Syringe size={18} /> },
    { 
        label: 'Omborxona', 
        icon: <Package size={18} />,
        subItems: [
            { to: '/admin/omborxona', label: 'Kategoriyalar', icon: <FolderOpen size={15} /> }
        ]
    },
    { 
        label: 'Moliya', 
        icon: <Wallet size={18} />,
        subItems: [
            { to: '/admin/stats', label: 'Statistika', icon: <BarChart2 size={15} /> },
            { to: '/admin/moliya-kassa', label: 'Kassa', icon: <Landmark size={15} /> },
            { to: '/admin/moliya-maosh', label: 'Oylik va maosh', icon: <DollarSign size={15} /> },
            { to: '/admin/moliya-bonus', label: 'Bonus va Jarima', icon: <Wrench size={15} /> },
            { to: '/admin/moliya-jadval', label: 'Ish Jadvali', icon: <CalendarDays size={15} /> }
        ]
    },
    { to: '/admin/services', label: 'Xizmatlar',   icon: <DollarSign size={18} /> },
];

const DOCTOR_MENU = [
    { to: '/doctor/profile', label: 'Shaxsiy Kabinet',  icon: <User size={18} /> },
    { to: '/doctor/queue',   label: 'Navbat',  icon: <ClipboardList size={18} /> },
    { to: '/doctor/history', label: 'Tarix',   icon: <FolderOpen size={18} /> },
    { to: '/doctor/schedule',label: 'Jadvalim',icon: <Calendar size={18} /> },
];

const RECEPTION_MENU = [
    { to: '/reception/profile', label: 'Shaxsiy Kabinet', icon: <User size={18} /> },
    { to: '/reception/main', label: 'Asosiy Oyna', icon: <BriefcaseMedical size={18} /> },
    { to: '/reception/schedule', label: 'Jadvalim', icon: <Calendar size={18} /> },
];

const MEDSESTRA_MENU = [
    { to: '/medsestra/profile', label: 'Shaxsiy Kabinet', icon: <User size={18} /> },
    { to: '/medsestra/main', label: 'Muolajalar', icon: <Syringe size={18} /> },
    { to: '/medsestra/schedule', label: 'Jadvalim', icon: <Calendar size={18} /> },
];

const SUPER_ADMIN_MENU = [
    { to: '/super-admin/admins', label: 'Adminlar', icon: <Settings size={18} /> }
];

const ROLE_COLORS = {
    ADMIN:      '#2563eb',
    DOCTOR:     '#0d9488',
    RECEPTION:  '#d97706',
    MONITORING: '#7c3aed',
    MEDSESTRA:  '#e11d48',
};

// ── LAYOUT ─────────────────────────────────────────────────────────────────────
const Layout = ({ user, onLogout, theme, toggleTheme }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const isAdmin  = user.role === 'ADMIN';
    const isDoctor = user.role === 'DOCTOR';
    const isReception = user.role === 'RECEPTION';
    const isMedsestra = user.role === 'MEDSESTRA';
    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const roleColor = ROLE_COLORS[user.role] || 'var(--muted)';
    const navigate = useNavigate();
    const [expandedMenus, setExpandedMenus] = useState({});

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
        navigate('/');
    };

    const toggleMenu = (label) => {
        setExpandedMenus(prev => ({...prev, [label]: !prev[label]}));
    };

    const renderSidebar = (menu, title, icon) => (
        <aside className="sidebar" style={{ width: isSidebarOpen ? 240 : 72, transition: 'width 0.3s ease', overflow: 'hidden' }}>
            <div className="sidebar-logo" style={{ 
                flexDirection: isSidebarOpen ? 'row' : 'column',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                padding: isSidebarOpen ? '24px 20px 22px' : '24px 0',
                gap: 12,
                transition: 'all 0.3s'
            }}>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Menyuni qisqartirish/kengaytirish"
                >
                    <Menu size={24} />
                </button>
                {isSidebarOpen && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                        <div>
                            <h2 style={{ fontSize: 18, margin: 0, color: '#fff' }}>{title}</h2>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{user.icon} {user.username}</p>
                        </div>
                    </div>
                )}
            </div>
            <nav className="sidebar-nav" style={{ padding: isSidebarOpen ? '16px 12px' : '16px 8px' }}>
                {menu.map(m => {
                    if (m.subItems) {
                        return (
                            <div key={m.label}>
                                <div 
                                    className="nav-item"
                                    onClick={() => {
                                        if (!isSidebarOpen) setIsSidebarOpen(true);
                                        toggleMenu(m.label);
                                    }}
                                    style={{ 
                                        justifyContent: isSidebarOpen ? 'flex-start' : 'center', 
                                        padding: isSidebarOpen ? '11px 14px' : '11px 0',
                                        cursor: 'pointer'
                                    }} 
                                    title={!isSidebarOpen ? m.label : ''}
                                >
                                    <span style={{ fontSize: 18 }}>{m.icon}</span>
                                    {isSidebarOpen && <span style={{ marginLeft: 12, whiteSpace: 'nowrap', flex: 1 }}>{m.label}</span>}
                                    {isSidebarOpen && <span style={{ fontSize: 10, opacity: 0.6 }}>{expandedMenus[m.label] ? '▼' : '▶'}</span>}
                                </div>
                                {isSidebarOpen && expandedMenus[m.label] && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                                        {m.subItems.map(sub => (
                                            <NavLink 
                                                key={sub.to} 
                                                to={sub.to} 
                                                className="nav-item" 
                                                style={{ padding: '8px 14px', paddingLeft: '36px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
                                            >
                                                {sub.icon && <span style={{ opacity: 0.8, display: 'flex', alignItems: 'center' }}>{sub.icon}</span>}
                                                <span>{sub.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return (
                        <NavLink 
                            key={m.to} 
                            to={m.to} 
                            className="nav-item" 
                            style={{ 
                                justifyContent: isSidebarOpen ? 'flex-start' : 'center', 
                                padding: isSidebarOpen ? '11px 14px' : '11px 0' 
                            }} 
                            title={!isSidebarOpen ? m.label : ''}
                        >
                            <span style={{ fontSize: 18 }}>{m.icon}</span> 
                            {isSidebarOpen && <span style={{ marginLeft: 12, whiteSpace: 'nowrap' }}>{m.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );

    return (
        <div className="app-layout">
            {isSuperAdmin && renderSidebar(SUPER_ADMIN_MENU, 'Super Admin', '⭐')}
            {isAdmin  && renderSidebar(ADMIN_MENU,  user.clinicName || 'MediCare', '🏥')}
            {isDoctor && renderSidebar(DOCTOR_MENU, user.clinicName || 'MediCare', '🏥')}
            {isReception && renderSidebar(RECEPTION_MENU, user.clinicName || 'MediCare', '🏥')}
            {isMedsestra && renderSidebar(MEDSESTRA_MENU, 'Hamshira', '💉')}

            {/* CONTENT COLUMN */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>

                {/* TOP HEADER — barcha rollar uchun */}
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 28px',
                    height: 60,
                    background: 'var(--surface)',
                    borderBottom: '1px solid var(--border)',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    flexShrink: 0,
                }}>
                    {/* Chap: Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22 }}>🏥</span>
                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{user.clinicName || 'MediCare'}</span>
                    </div>

                    {/* O'ng: Foydalanuvchi badge + Chiqish tugmasi */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button 
                            onClick={toggleTheme}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 5 }}
                            title="Tungi/Kunduzgi rejim"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        
                        {/* Bildirishnomalar */}
                        <NotificationBell user={user} />
                        
                        {/* Rol badge */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            padding: '5px 14px',
                            background: `${roleColor}18`,
                            border: `1px solid ${roleColor}50`,
                            borderRadius: 20,
                        }}>
                            <span style={{ fontSize: 15 }}>{user.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: roleColor }}>
                                {user.username}
                            </span>
                        </div>

                        {/* Chiqish tugmasi */}
                        <button
                            id="logout-btn"
                            onClick={handleLogout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 18px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                border: 'none',
                                borderRadius: 8,
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.transform = 'translateY(-1.5px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.25)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                            }}
                        >
                            <LogOut size={16} /> Chiqish
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="main-content" style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/super-admin"    element={<Navigate to="/super-admin/admins" replace />} />
                        <Route path="/super-admin/:tab" element={<SuperAdmin />} />
                        <Route path="/admin"          element={<Navigate to="/admin/stats" replace />} />
                        <Route path="/admin/:tab"     element={<Admin />} />
                        <Route path="/doctor"         element={<Navigate to="/doctor/queue" replace />} />
                        <Route path="/doctor/schedule" element={<UserSchedule />} />
                        <Route path="/doctor/:tab"    element={<Doctor />} />
                        <Route path="/reception"      element={<Navigate to="/reception/main" replace />} />
                        <Route path="/reception/schedule" element={<UserSchedule />} />
                        <Route path="/reception/:tab" element={<Reception />} />
                        <Route path="/medsestra"      element={<Navigate to="/medsestra/main" replace />} />
                        <Route path="/medsestra/schedule" element={<UserSchedule />} />
                        <Route path="/medsestra/:tab" element={<Medsestra />} />
                        <Route path="/monitoring"     element={<Monitoring />} />
                        <Route path="*"               element={<Navigate to={`/${user.role.toLowerCase().replace('_', '-')}`} replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

// ── APP ROOT ───────────────────────────────────────────────────────────────────
const App = () => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (savedUser && token) {
            try {
                const parsed = JSON.parse(savedUser);
                parsed.icon = ROLE_ICONS[parsed.role] || <User size={18} />;
                return parsed;
            } catch (e) {
                localStorage.removeItem('user');
                return null;
            }
        }
        return null;
    });
    const [theme, setTheme] = useState('light');

    // Foydalanuvchi kirganida uning roliga mos temani yuklash
    useEffect(() => {
        if (user) {
            const savedRoleTheme = localStorage.getItem(`theme_${user.role}`) || 'light';
            setTheme(savedRoleTheme);
        } else {
            setTheme('light'); // Login sahifasi uchun standart
        }
    }, [user]);

    // Temani o'rnatish va joriy rol uchun saqlash
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (user) {
            localStorage.setItem(`theme_${user.role}`, theme);
        }
    }, [theme, user]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <Router>
            <ToastProvider>
                {user
                    ? <Layout user={user} onLogout={() => setUser(null)} theme={theme} toggleTheme={toggleTheme} />
                    : <LoginPage onLogin={setUser} />}
            </ToastProvider>
        </Router>
    );
};

export default App;