import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MonitoringAPI } from '../api';
import { useToast } from "../components/ToastContext";
import ProfileCabinet from '../components/ProfileCabinet';
import { User } from 'lucide-react';

const Medsestra = () => {
    const toast = useToast();
    const { tab = 'main' } = useParams();
    const [queue, setQueue] = useState([]);
    const [modalRecord, setModalRecord] = useState(null);
    const [vitalsForm, setVitalsForm] = useState({}); // { visitId: { bloodPressure, temperature, weight } }
    const [savingVitals, setSavingVitals] = useState({});
    const [showVitalsFor, setShowVitalsFor] = useState(null); // visit ID

    const loadQueue = useCallback(async () => {
        try {
            const res = await MonitoringAPI.getQueue();
            setQueue(res || []);
        } catch {
            setQueue([]);
        }
    }, []);

    useEffect(() => {
        loadQueue();
        const t = setInterval(loadQueue, 5000);
        return () => clearInterval(t);
    }, [loadQueue]);

    const handleAction = async (id, status) => {
        if (status === 'REJECTED' && !window.confirm('Navbatni rad etasizmi?')) return;
        try {
            if (status === 'COMPLETED') {
                await MonitoringAPI.complete(id);
            } else {
                await MonitoringAPI.reject(id);
            }
            toast(status === 'COMPLETED' ? 'Muolaja yakunlandi!' : 'Navbat rad etildi!');
            loadQueue();
        } catch {
            toast('Xato yuz berdi!', 'error');
        }
    };

    const openModal = async (v) => {
        try {
            if (v.doctorName !== 'Biriktirilmagan') {
                const rec = await MonitoringAPI.getRecord(v.id);
                setModalRecord({ ...rec, patientName: v.patientName, doctorName: v.doctorName, serviceTitle: v.serviceTitle });
            } else {
                setModalRecord({
                    patientName: v.patientName,
                    doctorName: 'Biriktirilmagan',
                    serviceTitle: v.serviceTitle || v.serviceName,
                    diagnosis: null,
                    procedure: null,
                    treatment: null
                });
            }
        } catch {
            toast('Ma\'lumotlarni yuklashda xato!', 'error');
        }
    };

    const handleVitalsChange = (visitId, field, value) => {
        setVitalsForm(prev => ({
            ...prev,
            [visitId]: { ...(prev[visitId] || {}), [field]: value }
        }));
    };

    const handleSaveVitals = async (visitId) => {
        const data = vitalsForm[visitId] || {};
        if (!data.bloodPressure && !data.temperature && !data.weight) {
            return toast('Kamida bitta ma\'lumot kiriting!', 'error');
        }
        setSavingVitals(prev => ({ ...prev, [visitId]: true }));
        try {
            await MonitoringAPI.saveVitals(visitId, {
                bloodPressure: data.bloodPressure || null,
                temperature: data.temperature ? parseFloat(data.temperature) : null,
                weight: data.weight ? parseFloat(data.weight) : null,
            });
            toast('Vital ko\'rsatkichlar saqlandi! ✓');
            setShowVitalsFor(null);
            setVitalsForm(prev => ({ ...prev, [visitId]: {} }));
            loadQueue();
        } catch {
            toast('Saqlashda xato yuz berdi!', 'error');
        } finally {
            setSavingVitals(prev => ({ ...prev, [visitId]: false }));
        }
    };

    return (
        <div>
            <div className="page-header" style={{ marginBottom: 24, display: tab === 'profile' ? 'none' : 'block' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {tab === 'profile' ? <><User size={28} /> Shaxsiy Kabinet</> : '💉 Muolaja Xonasi Navbati'}
                </h1>
                {tab !== 'profile' && <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>Tasdiqlangan muolajalar va shifokor ko'rsatmalari ro'yxati</p>}
            </div>

            {tab === 'main' && (
                <>
                    {queue.length === 0 ? (
                        <div className="card"><p>Muolaja uchun kutayotganlar yo'q</p></div>
                    ) : (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {queue.map((v, index) => (
                                <div key={v.id} style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', overflow: 'hidden' }}>
                                    {/* Bemor asosiy ma'lumotlari */}
                                    <div style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
                                                    color: 'var(--surface)', fontSize: 14, fontWeight: 'bold'
                                                }}>
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: 18 }}>{v.patientName}</h3>
                                                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{v.serviceTitle || v.serviceName}</div>
                                                </div>
                                            </div>

                                            {/* Vital ko'rsatkichlar (avval kiritilgan bo'lsa) */}
                                            {(v.bloodPressure || v.temperature) && (
                                                <div style={{ display: 'flex', gap: 6, fontSize: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                    {v.bloodPressure && <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>🩸 {v.bloodPressure}</span>}
                                                    {v.temperature && <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>🌡️ {v.temperature}°C</span>}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <button className="btn btn-ghost" onClick={() => openModal(v)} style={{ padding: '6px 14px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', fontSize: 13, fontWeight: 600, borderRadius: 8 }}>
                                                👁️ Ko'rish
                                            </button>
                                            <button
                                                onClick={() => setShowVitalsFor(showVitalsFor === v.id ? null : v.id)}
                                                style={{
                                                    padding: '6px 14px',
                                                    background: showVitalsFor === v.id ? '#7c3aed' : 'rgba(124,58,237,0.1)',
                                                    color: showVitalsFor === v.id ? '#fff' : '#7c3aed',
                                                    fontSize: 13, fontWeight: 600, borderRadius: 8,
                                                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                🌡️ Vitals
                                            </button>
                                            <button className="btn btn-success" onClick={() => handleAction(v.id, 'COMPLETED')}>✓ Yakunlash</button>
                                            <button className="btn btn-danger" onClick={() => handleAction(v.id, 'REJECTED')}>✕ Rad etish</button>
                                        </div>
                                    </div>

                                    {/* Vitals kiritish paneli — accordion */}
                                    {showVitalsFor === v.id && (
                                        <div style={{ padding: '14px 20px', background: 'rgba(124,58,237,0.04)', borderTop: '1px solid rgba(124,58,237,0.15)' }}>
                                            <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#7c3aed', fontSize: 13 }}>🌡️ Dastlabki Ko'rik Ma'lumotlari</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 15 }}>
                                                <div>
                                                    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Qon bosimi</label>
                                                    <input
                                                        placeholder="120/80"
                                                        value={vitalsForm[v.id]?.bloodPressure || ''}
                                                        onChange={e => handleVitalsChange(v.id, 'bloodPressure', e.target.value)}
                                                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Harorat (°C)</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="36.6"
                                                        value={vitalsForm[v.id]?.temperature || ''}
                                                        onChange={e => handleVitalsChange(v.id, 'temperature', e.target.value)}
                                                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)' }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSaveVitals(v.id)}
                                                disabled={savingVitals[v.id]}
                                                style={{ marginTop: 10, padding: '8px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, opacity: savingVitals[v.id] ? 0.7 : 1 }}
                                            >
                                                {savingVitals[v.id] ? 'Saqlanmoqda...' : '✓ Saqlash'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {modalRecord && (
                        <div className="modal-overlay" onClick={() => setModalRecord(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div className="modal" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', padding: 28, borderRadius: 14, width: 440, boxShadow: '0 20px 50px rgba(0,0,0,0.18)' }}>
                                <h2 style={{ marginBottom: 20, fontSize: 18, color: 'var(--text)' }}>🩺 Anketa: {modalRecord.patientName}</h2>

                                <div style={{ background: 'var(--surface2)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                                    {modalRecord.doctorName !== 'Biriktirilmagan' && (
                                        <div style={{ marginBottom: 4 }}>
                                            Buyurgan shifokor: <strong style={{ color: 'var(--primary)' }}>{modalRecord.doctorName}</strong>
                                        </div>
                                    )}
                                    <div>
                                        Xizmat turi: <strong style={{ color: 'var(--text)' }}>{modalRecord.serviceTitle || modalRecord.serviceName || 'Muolaja'}</strong>
                                    </div>
                                </div>

                                {modalRecord.doctorName !== 'Biriktirilmagan' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                                        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '14px 16px', borderLeft: '4px solid var(--primary)' }}>
                                            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Shifokor Tashxisi</p>
                                            <p style={{ margin: 0, fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>{modalRecord.diagnosis || '—'}</p>
                                        </div>
                                        <div style={{ background: '#f5f3ff', borderRadius: 10, padding: '14px 16px', borderLeft: '4px solid #7c3aed' }}>
                                            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Buyurilgan Muolaja Ko'rsatmasi</p>
                                            <p style={{ margin: 0, fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>{modalRecord.procedure || modalRecord.treatment || '—'}</p>
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: modalRecord.doctorName === 'Biriktirilmagan' ? 24 : 0 }}>
                                    <button
                                        onClick={() => setModalRecord(null)}
                                        style={{ padding: '11px 40px', background: 'var(--primary)', color: 'var(--surface)', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'var(--primary-d)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
                                    >
                                        ✕ Yopish
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {tab === 'profile' && <ProfileCabinet />}
        </div>
    );
};

export default Medsestra;
