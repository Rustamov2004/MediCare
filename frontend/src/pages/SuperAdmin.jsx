import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SuperAdminAPI } from '../api';
import { useToast } from '../components/ToastContext';
import { formatPhone } from '../utils';
import { Eye, EyeOff } from 'lucide-react';

export default function SuperAdmin() {
    const { tab } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        if (!['admins'].includes(tab)) {
            navigate('/super-admin/admins', { replace: true });
        }
    }, [tab, navigate]);

    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ marginBottom: 20 }}>Super Admin Paneli</h1>
            {tab === 'admins' && <AdminsTab toast={toast} />}
        </div>
    );
}

function AdminsTab({ toast }) {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState({});

    const [form, setForm] = useState({ fullName: '', phone: '+998', address: '', clinicName: '', subscriptionEndDate: '', isSubscriptionActive: true, password: '' });
    const [createdCredentials, setCreatedCredentials] = useState(null);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = () => {
        setLoading(true);
        SuperAdminAPI.getAdmins()
            .then(res => {
                setAdmins(res);
                setLoading(false);
            })
            .catch(err => {
                toast("Adminlarni yuklashda xatolik yuz berdi", "error");
                setLoading(false);
            });
    };

    const openCreate = () => {
        setEditingAdmin(null);
        setForm({ fullName: '', phone: '+998', address: '', clinicName: '', subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], isSubscriptionActive: true, password: '' });
        setCreatedCredentials(null);
        setShowModal(true);
    };

    const openEdit = (admin) => {
        setEditingAdmin(admin);
        setForm({ fullName: admin.fullName, phone: admin.phone, address: admin.address, clinicName: admin.clinicName || '', subscriptionEndDate: admin.subscriptionEndDate || '', isSubscriptionActive: admin.isSubscriptionActive !== false, password: '' });
        setCreatedCredentials(null);
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingAdmin) {
            SuperAdminAPI.updateAdmin(editingAdmin.id, form)
                .then(res => {
                    toast("Admin ma'lumotlari yangilandi!", "success");
                    setShowModal(false);
                    loadAdmins();
                })
                .catch(err => toast("Xatolik yuz berdi!", "error"));
        } else {
            SuperAdminAPI.createAdmin(form)
                .then(res => {
                    toast("Yangi Kichik Admin yaratildi!", "success");
                    setCreatedCredentials({ username: res.username, password: res.password });
                    setShowPassword(true);
                    loadAdmins();
                })
                .catch(err => {
                    toast("Xatolik yuz berdi!", "error");
                });
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm("Adminni o'chirishni tasdiqlaysizmi?")) return;
        SuperAdminAPI.deleteAdmin(id)
            .then(() => {
                toast("Admin o'chirildi!", "success");
                loadAdmins();
            })
            .catch(err => toast("Xatolik yuz berdi!", "error"));
    };

    const togglePassword = (id) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Kichik Adminlar ro'yxati</h2>
                <button 
                    onClick={openCreate}
                    className="btn btn-success"
                    style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Yangi Kichik Admin
                </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ flex: 1, position: 'relative', maxWidth: '300px' }}>
                    <input 
                        type="text" 
                        placeholder="Ism yoki familiya orqali qidiruv..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', paddingLeft: '36px', borderRadius: 8, border: '1px solid var(--border)', outline: 'none' }}
                    />
                    <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }}>🔍</span>
                </div>
            </div>

            {loading ? <p>Yuklanmoqda...</p> : (
                <table className="med-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>T/r</th>
                            <th>Klinika</th>
                            <th>F.I.SH</th>
                            <th>Telefon</th>
                            <th>Obuna muddati</th>
                            <th>Holati</th>
                            <th>Login</th>
                            <th>Parol</th>
                            <th style={{ width: 140 }}>Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.filter(a => (a.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())).map((a, index) => (
                            <tr key={a.id}>
                                <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{index + 1}</td>
                                <td><b>{a.clinicName || a.address}</b></td>
                                <td>{a.fullName}</td>
                                <td>{a.phone}</td>
                                <td>
                                    {a.subscriptionEndDate ? new Date(a.subscriptionEndDate).toLocaleDateString('ru-RU') : 'Mavjud emas'}
                                </td>
                                <td>
                                    {a.isSubscriptionActive ? 
                                        <span style={{color: '#16a34a', fontWeight: 'bold'}}>Faol</span> : 
                                        <span style={{color: '#dc2626', fontWeight: 'bold'}}>Bloklangan</span>}
                                </td>
                                <td><b>{a.username}</b></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontFamily: 'monospace' }}>
                                            {visiblePasswords[a.id] ? (a.password || 'Mavjud emas') : '••••••••'}
                                        </span>
                                        <button 
                                            onClick={() => togglePassword(a.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                                            title="Parolni ko'rish/yashirish"
                                        >
                                            {visiblePasswords[a.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button 
                                            onClick={() => openEdit(a)}
                                            className="btn btn-sm btn-ghost">
                                            Tahrirlash
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(a.id)}
                                            className="btn btn-sm btn-danger">
                                            O'chirish
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {admins.length === 0 && (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: 20 }}>
                                    Hozircha adminlar yo'q
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 450 }}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>{editingAdmin ? 'Adminni Tahrirlash' : 'Yangi Kichik Admin yaratish'}</h3>
                            <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
                        </div>
                        <div className="modal-body">
                        
                        {createdCredentials ? (
                            <div style={{ padding: 20, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                                <h4 style={{ color: '#166534', marginBottom: 15 }}>✅ Muvaffaqiyatli yaratildi</h4>
                                <p style={{ marginBottom: 10 }}>Kichik admin uchun tizimga kirish ma'lumotlari (nusxalab oling):</p>
                                <div style={{ background: 'var(--surface)', padding: 15, borderRadius: 6, border: '1px dashed #4ade80' }}>
                                    <p style={{ margin: '0 0 12px 0' }}><b>Login:</b> {createdCredentials.username}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: 6 }}>
                                        <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 16 }}>
                                            <b>Parol:</b> {showPassword ? createdCredentials.password : '••••••••'}
                                        </p>
                                        <button onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }} title="Parolni ko'rsatish/yashirish">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    style={{ marginTop: 20, width: '100%', padding: 10, background: 'var(--primary)', color: 'var(--surface)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                                    Yopish
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSave}>
                                <div style={{ marginBottom: 15 }}>
                                    <label style={{ display: 'block', marginBottom: 5 }}>F.I.SH</label>
                                    <input 
                                        required 
                                        className="form-input" 
                                        value={form.fullName} 
                                        onChange={e => setForm({...form, fullName: e.target.value})} 
                                        placeholder="Ali Valiyev"
                                    />
                                </div>
                                <div style={{ marginBottom: 15 }}>
                                    <label style={{ display: 'block', marginBottom: 5 }}>Telefon</label>
                                    <input 
                                        required 
                                        className="form-input" 
                                        value={form.phone} 
                                        onChange={e => setForm({...form, phone: formatPhone(e.target.value)})} 
                                        placeholder="+998"
                                    />
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', marginBottom: 5 }}>Manzil</label>
                                    <input 
                                        required 
                                        className="form-input" 
                                        value={form.address} 
                                        onChange={e => setForm({...form, address: e.target.value})} 
                                        placeholder="Toshkent sh., Yunusobod t."
                                    />
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', marginBottom: 5 }}>Klinika nomi</label>
                                    <input 
                                        required 
                                        className="form-input" 
                                        value={form.clinicName} 
                                        onChange={e => setForm({...form, clinicName: e.target.value})} 
                                        placeholder="Shifo Nur Klinikasi"
                                    />
                                </div>
                                <div style={{ marginBottom: 20, display: 'flex', gap: 15 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 5 }}>Obuna tugash sanasi</label>
                                        <input 
                                            type="date"
                                            required 
                                            className="form-input" 
                                            value={form.subscriptionEndDate} 
                                            onChange={e => setForm({...form, subscriptionEndDate: e.target.value})} 
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 5 }}>Holati</label>
                                        <select 
                                            className="form-input" 
                                            value={form.isSubscriptionActive ? "true" : "false"}
                                            onChange={e => setForm({...form, isSubscriptionActive: e.target.value === "true"})}
                                        >
                                            <option value="true">Faol</option>
                                            <option value="false">Bloklangan</option>
                                        </select>
                                    </div>
                                </div>
                                {editingAdmin && (
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 5 }}>Yangi Parol (ixtiyoriy)</label>
                                        <input 
                                            className="form-input" 
                                            value={form.password || ''} 
                                            onChange={e => setForm({...form, password: e.target.value})} 
                                            placeholder="Faqat o'zgartirish uchun yozing..."
                                        />
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '15px', width: '100%' }}>{editingAdmin ? 'Saqlash' : 'Yaratish'}</button>
                                </div>
                            </form>
                        )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
