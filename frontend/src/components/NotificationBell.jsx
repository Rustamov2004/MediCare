import React, { useState, useEffect } from 'react';
import { NotificationAPI, ReceptionAPI } from '../api';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell({ user }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const [unpaidProcedures, setUnpaidProcedures] = useState([]);

    useEffect(() => {
        const loadAll = () => {
            loadNotifications();
            if (user?.role === 'RECEPTION') {
                loadUnpaidProcedures();
            }
        };
        
        loadAll();
        // Har 8 sekundda yangilab turish (oddiy polling)
        const interval = setInterval(loadAll, 8000);
        return () => clearInterval(interval);
    }, [user]);

    const loadUnpaidProcedures = () => {
        ReceptionAPI.getUnpaidProcedures()
            .then(res => setUnpaidProcedures(res || []))
            .catch(() => {});
    };

    const handleApprovePayment = async (id) => {
        try {
            await ReceptionAPI.approvePayment(id);
            alert("To'lov qabul qilindi va bemor muolaja navbatiga tushdi!");
            loadUnpaidProcedures();
            window.dispatchEvent(new Event('reception-update'));
        } catch {
            alert("Xatolik yuz berdi!");
        }
    };

    const handleRejectPayment = async (id) => {
        if (!window.confirm("Bemor muolajani rad etdimi? Ushbu to'lov bekor qilinadi.")) return;
        try {
            await ReceptionAPI.rejectPayment(id);
            alert("Muolaja bekor qilindi!");
            loadUnpaidProcedures();
            window.dispatchEvent(new Event('reception-update'));
        } catch {
            alert("Xatolik yuz berdi!");
        }
    };

    const loadNotifications = () => {
        NotificationAPI.getNotifications()
            .then(res => setNotifications(res || []))
            .catch(err => console.error("Xabarlarni yuklashda xatolik:", err));
    };

    const handleNotificationClick = async (n) => {
        // UI dan darhol o'chiramiz
        setNotifications(notifications.filter(item => item.id !== n.id));
        setIsOpen(false);
        
        try {
            await NotificationAPI.markAsRead(n.id);
        } catch(e) {
            console.error("Xabarni o'chirishda xatolik", e);
        }
        
        // Agar xabar jadvalga tegishli bo'lsa va foydalanuvchi roli bo'lsa
        if (n.message.toLowerCase().includes('jadval') || n.message.toLowerCase().includes('kuni')) {
            if (user && user.role) {
                const rolePath = user.role.toLowerCase().replace('_', '-');
                navigate(`/${rolePath}/schedule`);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length + unpaidProcedures.length;

    return (
        <div style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    position: 'relative',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text)'
                }}
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#ef4444',
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        border: '2px solid white'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: 300,
                    background: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    borderRadius: 8,
                    zIndex: 50,
                    maxHeight: 400,
                    overflowY: 'auto',
                    border: '1px solid var(--border)',
                    marginTop: 8
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>
                        Bildirishnomalar
                    </div>
                    
                    {user?.role === 'RECEPTION' && unpaidProcedures.length > 0 && (
                        <div>
                            <div style={{ padding: '8px 16px', background: '#fee2e2', color: '#b91c1c', fontSize: 12, fontWeight: 'bold' }}>
                                TO'LANMAGAN MUOLAJALAR ({unpaidProcedures.length})
                            </div>
                            {unpaidProcedures.map(v => (
                                <div key={'up-'+v.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{v.patientName}</div>
                                    <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                                        {v.serviceTitle || v.serviceName} - <strong style={{ color: '#10b981' }}>{v.price?.toLocaleString()} so'm</strong>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-success" style={{ flex: 1, padding: '6px', fontSize: 13, background: '#10b981', color: 'white', border: 'none', borderRadius: 4 }} onClick={() => handleApprovePayment(v.id)}>Tasdiqlash</button>
                                        <button className="btn btn-danger" style={{ flex: 1, padding: '6px', fontSize: 13, background: '#ef4444', color: 'white', border: 'none', borderRadius: 4 }} onClick={() => handleRejectPayment(v.id)}>Rad etish</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {notifications.length > 0 && (
                        <div style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', fontSize: 12, fontWeight: 'bold' }}>
                            TIZIM XABARLARI
                        </div>
                    )}
                    
                    {notifications.length === 0 && unpaidProcedures.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
                            Xabarlar yo'q
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                style={{ 
                                    padding: '12px 16px', 
                                    borderBottom: '1px solid var(--border)',
                                    background: n.read ? 'white' : '#f0fdf4',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleNotificationClick(n)}
                            >
                                <div style={{ fontSize: 13, color: 'var(--text)' }}>{n.message}</div>
                                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                                    {new Date(n.createdAt).toLocaleString('uz-UZ')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
