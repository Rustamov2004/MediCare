import React, { useState, useEffect } from 'react';
import { ProfileAPI } from '../api';
import { useToast } from './ToastContext';
import { Eye, EyeOff, User, Phone, Lock, Shield, Edit3, Camera } from 'lucide-react';

const ProfileCabinet = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        username: '',
        password: '',
    });
    const [visiblePass, setVisiblePass] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [originalUser, setOriginalUser] = useState(null);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await ProfileAPI.getMe();
                setOriginalUser(res);
                setForm({
                    fullName: res.fullName || '',
                    phone: res.phone || '',
                    username: res.username || '',
                    password: '' // Parolni ko'rsatmaymiz
                });
            } catch (err) {
                toast('Shaxsiy ma\'lumotlarni yuklashda xatolik yuz berdi!', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, [toast]);

    const handleSave = async () => {
        if (!form.fullName || !form.username) {
            return toast("Ism va Login bo'sh bo'lishi mumkin emas!", "error");
        }

        const isCredentialsChanged = form.username !== originalUser.username || form.password;

        setSaving(true);
        try {
            await ProfileAPI.updateProfile({
                fullName: form.fullName,
                phone: form.phone,
                username: form.username,
                password: form.password || undefined
            });

            toast("Ma'lumotlar muvaffaqiyatli saqlandi!", "success");

            if (isCredentialsChanged) {
                toast("Login yoki Parol o'zgargani sababli, iltimos qayta kiring!", "success");
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/'; // Logout
                }, 2000);
            } else {
                // Yangilangan ma'lumotni darhol ko'rsatish
                const res = await ProfileAPI.getMe();
                setOriginalUser(res);
                setForm({
                    fullName: res.fullName || '',
                    phone: res.phone || '',
                    username: res.username || '',
                    password: ''
                });
                setIsEditing(false); // Saqlangandan keyin tahrirlash rejimini yopamiz
            }
        } catch (err) {
            toast(err.message || "Saqlashda xatolik yuz berdi!", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    const roleColors = {
        'SUPER_ADMIN': { bg: '#4f46e5', text: '#fff', label: 'Super Admin' },
        'ADMIN': { bg: '#ef4444', text: '#fff', label: 'Boshqaruvchi' },
        'DOCTOR': { bg: '#06b6d4', text: '#fff', label: 'Shifokor' },
        'RECEPTION': { bg: '#8b5cf6', text: '#fff', label: 'Qabulxona xodimi' },
        'MEDSESTRA': { bg: '#ec4899', text: '#fff', label: 'Hamshira' },
    };

    const roleInfo = roleColors[originalUser?.role] || { bg: '#64748b', text: '#fff', label: originalUser?.role || 'Foydalanuvchi' };
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div style={{ 
            maxWidth: 900, 
            margin: '-28px 0 0 -28px', // Tepaga va chapga to'liq taqab qo'yish
            background: 'var(--surface)', 
            borderRadius: 16, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            animation: 'fadeIn 0.4s ease'
        }}>
            {/* Header/Cover */}
            <div style={{ 
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                position: 'relative',
                padding: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: 20
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%', right: 30,
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 14px',
                    borderRadius: 20,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                }}>
                    <Shield size={16} /> {roleInfo.label}
                </div>

                <div style={{
                    width: 76, height: 76, 
                    background: '#fff',
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#1e40af',
                    position: 'relative',
                    flexShrink: 0
                }}>
                    {getInitials(form.fullName)}
                    <button style={{
                        position: 'absolute', bottom: -4, right: -4,
                        width: 26, height: 26,
                        background: '#3b82f6', color: '#fff',
                        borderRadius: '50%', border: '2px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }} title="Rasm yuklash (Tez kunda)">
                        <Camera size={12} />
                    </button>
                </div>
                
                <div>
                    <h2 style={{ margin: 0, fontSize: 22, color: '#ffffff', fontWeight: 700, letterSpacing: '-0.3px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                        {originalUser?.fullName || 'Foydalanuvchi'}
                    </h2>
                    <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                        @{originalUser?.username}
                    </p>
                </div>
            </div>

            <div style={{ padding: '30px' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: 24 
                }}>
                    {/* Chap Ustun - Shaxsiy */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h4 style={{ margin: 0, color: 'var(--text)', fontSize: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={16} color="#3b82f6" /> Shaxsiy ma'lumotlar
                        </h4>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#64748b' }}>F.I.SH *</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input 
                                    type="text" 
                                    value={form.fullName} 
                                    disabled={!isEditing}
                                    onChange={e => setForm({...form, fullName: e.target.value})}
                                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, color: 'var(--text)', transition: 'all 0.2s', outline: 'none', backgroundColor: isEditing ? '#fff' : '#f8fafc', cursor: isEditing ? 'text' : 'not-allowed', opacity: isEditing ? 1 : 0.8 }}
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#64748b' }}>Telefon raqami</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input 
                                    type="text" 
                                    placeholder="+998-90-123-45-67"
                                    value={form.phone} 
                                    disabled={!isEditing}
                                    onChange={e => setForm({...form, phone: e.target.value})}
                                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, color: 'var(--text)', transition: 'all 0.2s', outline: 'none', backgroundColor: isEditing ? '#fff' : '#f8fafc', cursor: isEditing ? 'text' : 'not-allowed', opacity: isEditing ? 1 : 0.8 }}
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* O'ng Ustun - Tizim */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h4 style={{ margin: 0, color: 'var(--text)', fontSize: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Lock size={16} color="#8b5cf6" /> Tizimga kirish
                        </h4>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#64748b' }}>Login *</label>
                            <div style={{ position: 'relative' }}>
                                <Shield size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input 
                                    type="text" 
                                    value={form.username} 
                                    disabled={!isEditing}
                                    onChange={e => setForm({...form, username: e.target.value})}
                                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, color: 'var(--text)', transition: 'all 0.2s', outline: 'none', backgroundColor: isEditing ? '#fff' : '#f8fafc', cursor: isEditing ? 'text' : 'not-allowed', opacity: isEditing ? 1 : 0.8 }}
                                    onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#64748b' }}>Yangi Parol</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input 
                                    type={visiblePass ? "text" : "password"} 
                                    placeholder={isEditing ? "Yangi parol (ixtiyoriy)" : "Parol o'zgartirilmagan"}
                                    value={form.password} 
                                    disabled={!isEditing}
                                    onChange={e => setForm({...form, password: e.target.value})}
                                    style={{ width: '100%', padding: '10px 36px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, color: 'var(--text)', transition: 'all 0.2s', outline: 'none', backgroundColor: isEditing ? '#fff' : '#f8fafc', cursor: isEditing ? 'text' : 'not-allowed', opacity: isEditing ? 1 : 0.8 }}
                                    onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                                {isEditing && (
                                    <button 
                                        onClick={() => setVisiblePass(!visiblePass)}
                                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {visiblePass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                )}
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, lineHeight: 1.3 }}>
                                * O'zgartirmasangiz, bu joyni bo'sh qoldiring.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)} 
                            style={{
                                padding: '10px 24px', 
                                background: 'var(--surface2)', 
                                color: 'var(--text)', 
                                border: '1px solid var(--border)', 
                                borderRadius: 8, 
                                fontSize: 14, 
                                fontWeight: 600, 
                                cursor: 'pointer', 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Edit3 size={16} color="var(--primary)" /> Tahrirlash
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setForm({
                                        fullName: originalUser?.fullName || '',
                                        phone: originalUser?.phone || '',
                                        username: originalUser?.username || '',
                                        password: ''
                                    });
                                }} 
                                disabled={saving}
                                style={{
                                    padding: '10px 24px', 
                                    background: '#fef2f2', 
                                    color: '#ef4444', 
                                    border: '1px solid #fca5a5', 
                                    borderRadius: 8, 
                                    fontSize: 14, 
                                    fontWeight: 600, 
                                    cursor: saving ? 'not-allowed' : 'pointer', 
                                    opacity: saving ? 0.7 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Bekor qilish
                            </button>
                            <button 
                                onClick={handleSave} 
                                disabled={saving}
                                style={{
                                    padding: '10px 24px', 
                                    background: 'linear-gradient(to right, #3b82f6, #2563eb)', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: 8, 
                                    fontSize: 14, 
                                    fontWeight: 600, 
                                    cursor: saving ? 'not-allowed' : 'pointer', 
                                    opacity: saving ? 0.8 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {saving ? (
                                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                ) : <Edit3 size={16} />}
                                {saving ? 'Saqlanmoqda...' : "Saqlash"}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
};

export default ProfileCabinet;
