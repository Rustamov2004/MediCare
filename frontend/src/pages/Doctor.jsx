import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DoctorAPI, ReceptionAPI, AdminAPI } from '../api';
import { useToast } from "../components/ToastContext";
import { useParams } from 'react-router-dom';
import ProfileCabinet from '../components/ProfileCabinet';
import { User } from 'lucide-react';

const Doctor = () => {
    const toast = useToast();
    const { tab = 'queue' } = useParams();

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [queue, setQueue] = useState([]);
    const [history, setHistory] = useState([]);
    const [profile, setProfile] = useState(null);

    const [searchQueue, setSearchQueue] = useState('');
    const [searchHistory, setSearchHistory] = useState('');

    const [selected, setSelected] = useState(null);
    const [historySelected, setHistorySelected] = useState(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [procedure, setProcedure] = useState('');
    const [procedureServiceId, setProcedureServiceId] = useState('');
    const [sendToMonitoring, setSendToMonitoring] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [services, setServices] = useState([]);

    // Bemor tibbiy tarixi modali
    const [patientHistoryModal, setPatientHistoryModal] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Barcha shifokorlarni yuklash (tanlash uchun)
    useEffect(() => {
        ReceptionAPI.getDoctors().then(res => {
            setDoctors(res || []);
            if (res && res.length > 0) {
                setSelectedDoctorId(res[0].id);
            }
        });
        AdminAPI.getAllServices().then(res => {
            if (res) setServices(res.filter(s => !s.isCheckup));
        }).catch(err => console.log(err));
    }, []);

    const loadQueue = useCallback(async () => {
        if (!selectedDoctorId) return;
        try {
            const res = await DoctorAPI.getQueue(selectedDoctorId);
            setQueue(Array.isArray(res) ? res : []);
        } catch (err) {
            setQueue([]);
        }
    }, [selectedDoctorId]);

    const loadHistory = useCallback(async () => {
        if (!selectedDoctorId) return;
        try {
            const res = await DoctorAPI.getHistory(selectedDoctorId);
            setHistory(Array.isArray(res) ? res : []);
        } catch (err) {
            setHistory([]);
        }
    }, [selectedDoctorId]);

    const loadProfile = useCallback(async () => {
        if (!selectedDoctorId) return;
        try {
            const res = await DoctorAPI.getProfile(selectedDoctorId);
            setProfile(res);
        } catch (err) {
            setProfile(null);
        }
    }, [selectedDoctorId]);

    useEffect(() => {
        if (tab === 'queue') loadQueue();
        if (tab === 'history') loadHistory();
        if (tab === 'profile') loadProfile();
    }, [tab, selectedDoctorId, loadQueue, loadHistory, loadProfile]);

    useEffect(() => {
        const t = setInterval(() => {
            if (tab === 'queue') loadQueue();
        }, 8000);
        return () => clearInterval(t);
    }, [tab, loadQueue]);

    const filteredQueue = useMemo(() => queue.filter(v => v.patientName?.toLowerCase().includes(searchQueue.toLowerCase())), [queue, searchQueue]);
    const filteredHistory = useMemo(() => history.filter(v => v.patientName?.toLowerCase().includes(searchHistory.toLowerCase())), [history, searchHistory]);

    const handleSelect = (v) => {
        setSelected(v);
        setDiagnosis('');
        setProcedure('');
        setProcedureServiceId('');
        setSendToMonitoring(false);
    };

    const openPatientHistory = async (v) => {
        if (!v.patientId) return toast('Bemor ID topilmadi!', 'error');
        setLoadingHistory(true);
        try {
            const visits = await DoctorAPI.getPatientHistory(v.patientId);
            setPatientHistoryModal({ patientName: v.patientName, visits: visits || [] });
        } catch {
            toast('Tibbiy tarixi yuklanmadi!', 'error');
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async () => {
        if (!diagnosis.trim()) return toast('Tashxis yozish majburiy!', 'error');
        if (sendToMonitoring && (!procedureServiceId || !procedure.trim())) return toast('Muolaja turi va ko\'rsatma yozish majburiy!', 'error');

        setSubmitting(true);
        try {
            await DoctorAPI.submitDiagnosis({
                visitId: selected.id,
                diagnosis,
                procedureServiceId: sendToMonitoring ? Number(procedureServiceId) : null,
                procedure: sendToMonitoring ? procedure : null,
                sendToMonitoring
            });
            toast('Ko\'rik muvaffaqiyatli yakunlandi!');
            setSelected(null);
            loadQueue();
        } catch {
            toast('Xato yuz berdi!', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ display: tab === 'profile' ? 'none' : 'block' }}>
                    { tab === 'queue'   && '🩺 Navbat' }
                    { tab === 'history' && '📋 Bugungi bemorlar' }
                </h1>
                {tab !== 'profile' && (
                    <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14 }}
                    >
                        <option value="">-- Shifokorni tanlang --</option>
                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.fullName} {d.specialization ? `(${d.specialization})` : ''}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {tab === 'queue' && (
                <div className="grid-2">
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <h3 style={{ margin: 0 }}>Navbatdagi bemorlar ({filteredQueue.length})</h3>
                        </div>
                        <input
                            type="text"
                            placeholder="Ism yoki familiya orqali izlash..."
                            value={searchQueue}
                            onChange={e => setSearchQueue(e.target.value)}
                            style={{ marginBottom: 15, width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}
                        />
                        {filteredQueue.length > 0 ? (
                            filteredQueue.map((v, i) => (
                                <div key={v.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, marginBottom: 6,
                                    background: selected?.id === v.id ? 'rgba(59,130,246,0.1)' : 'var(--surface)',
                                    border: selected?.id === v.id ? '1px solid var(--primary)' : '1px solid var(--border)'
                                }}>
                                    <div className="mon-num" onClick={() => handleSelect(v)} style={{ cursor: 'pointer' }}>{i + 1}</div>
                                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleSelect(v)}>
                                        <strong>{v.patientName}</strong>
                                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{v.serviceName}</div>
                                        {/* Hamshira kiritgan vitals */}
                                        {(v.bloodPressure || v.temperature) && (
                                            <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                                                {v.bloodPressure && <span style={{ fontSize: 11, background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: 10 }}>🩸 {v.bloodPressure}</span>}
                                                {v.temperature && <span style={{ fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '1px 6px', borderRadius: 10 }}>🌡️ {v.temperature}°C</span>}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openPatientHistory(v); }}
                                        disabled={loadingHistory}
                                        title="Tibbiy tarix"
                                        style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.1)', color: '#059669', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}
                                    >
                                        📋 Tarix
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p style={{ padding: 12, color: 'var(--muted)' }}>Navbatda bemorlar yo'q.</p>
                        )}
                    </div>

                    <div className="card">
                        {selected ? (
                            <div className="form-group">
                                <h3>Bemor: {selected.patientName}</h3>
                                <p><strong>Sabab:</strong> {selected.reason || '—'}</p>

                                {/* Hamshira kiritgan vitals ko'rsatish */}
                                {(selected.bloodPressure || selected.temperature) && (
                                    <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'rgba(16,185,129,0.06)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', flexWrap: 'wrap', marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', width: '100%' }}>🌡️ Hamshira o'lchovi:</span>
                                        {selected.bloodPressure && <span style={{ fontSize: 13, color: '#dc2626' }}>🩸 Bosim: <strong>{selected.bloodPressure}</strong></span>}
                                        {selected.temperature && <span style={{ fontSize: 13, color: '#d97706' }}>🌡️ Harorat: <strong>{selected.temperature}°C</strong></span>}
                                    </div>
                                )}

                                <div>
                                    <label>Tashxis *</label>
                                    <textarea rows={4} placeholder="Tashxis matni..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={sendToMonitoring} onChange={e => setSendToMonitoring(e.target.checked)} style={{ width: 'auto' }} />
                                    <span>Bemorni muolaja xonasiga (Monitoring) yuborish</span>
                                </label>
                                {sendToMonitoring && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                                        <div>
                                            <label>Xizmatni tanlang (Tushum uchun) *</label>
                                            <select
                                                value={procedureServiceId}
                                                onChange={e => setProcedureServiceId(e.target.value)}
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '15px' }}
                                            >
                                                <option value="">-- Xizmatlar ro'yxati --</option>
                                                {services.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} - {s.price?.toLocaleString()} so'm</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label>Shifokor ko'rsatmasi (Izoh) *</label>
                                            <input placeholder="Masalan: 3 mahal ukol qilish..." value={procedure} onChange={e => setProcedure(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                                <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? 'Saqlanmoqda...' : '✓ Ko\'rikni yakunlash'}
                                </button>
                            </div>
                        ) : <div className="empty"><p>Bemor tanlang</p></div>}
                    </div>
                </div>
            )}

            {tab === 'history' && (
                <div className="grid-2">
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <h3 style={{ margin: 0 }}>Bugun ko'rilgan bemorlar ({filteredHistory.length})</h3>
                        </div>
                        <input
                            type="text"
                            placeholder="Ism yoki familiya orqali izlash..."
                            value={searchHistory}
                            onChange={e => setSearchHistory(e.target.value)}
                            style={{ marginBottom: 15, width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}
                        />
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((v, i) => (
                                <div key={v.id} onClick={() => setHistorySelected(v)} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, cursor: 'pointer', marginBottom: 6,
                                    background: historySelected?.id === v.id ? 'rgba(16,185,129,0.1)' : 'var(--surface)',
                                    border: historySelected?.id === v.id ? '1px solid #10b981' : '1px solid var(--border)'
                                }}>
                                    <div className="mon-num" style={{ background: '#10b981' }}>{i + 1}</div>
                                    <div style={{ flex: 1 }}>
                                        <strong>{v.patientName}</strong>
                                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Vaxt: {new Date(v.time).toLocaleTimeString()}</div>
                                    </div>
                                    <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, background: 'var(--surface2)', color: 'var(--text)' }}>Ko'rilgan</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ padding: 12, color: 'var(--muted)' }}>Tarix bo'sh.</p>
                        )}
                    </div>

                    <div className="card">
                        {historySelected ? (
                            <div>
                                <h3>Anketa: {historySelected.patientName}</h3>
                                <div style={{ background: 'var(--surface2)', padding: '15px', borderRadius: '10px', marginTop: '15px' }}>
                                    <p style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--primary)' }}>Tashxis:</strong></p>
                                    <p style={{ whiteSpace: 'pre-wrap', marginBottom: '20px', lineHeight: '1.5' }}>{historySelected.diagnosis || 'Kiritilmagan'}</p>

                                    <p style={{ marginBottom: '10px' }}><strong style={{ color: '#7c3aed' }}>Buyurilgan muolaja:</strong></p>
                                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{historySelected.procedure || 'Muolaja yozilmagan'}</p>
                                </div>
                            </div>
                        ) : <div className="empty"><p>Tafsilotlarni ko'rish uchun bemorni tanlang</p></div>}
                    </div>
                </div>
            )}

            {tab === 'profile' && <ProfileCabinet />}

            {/* Bemor tibbiy tarixi modali */}
            {patientHistoryModal && (
                <div onClick={() => setPatientHistoryModal(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', padding: 28, borderRadius: 14, width: 560, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 18 }}>📋 Tibbiy Tarix: {patientHistoryModal.patientName}</h2>
                            <button onClick={() => setPatientHistoryModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
                        </div>
                        {patientHistoryModal.visits.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>
                                <p style={{ fontSize: 32 }}>📭</p>
                                <p>Bu bemor uchun tarix topilmadi</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {patientHistoryModal.visits.map((visit, idx) => (
                                    <div key={visit.id} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                                        <div style={{ padding: '10px 14px', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, fontSize: 14 }}>
                                                #{idx + 1} — {visit.serviceTitle || 'Ko\'rik'}
                                            </span>
                                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                                                {visit.time ? new Date(visit.time).toLocaleDateString('uz-UZ') : '—'}
                                            </span>
                                        </div>
                                        <div style={{ padding: '12px 14px' }}>
                                            {visit.diagnosis && (
                                                <div style={{ marginBottom: 8 }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>Tashxis: </span>
                                                    <span style={{ fontSize: 13, lineHeight: 1.5 }}>{visit.diagnosis}</span>
                                                </div>
                                            )}
                                            {visit.procedure && (
                                                <div>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>Muolaja: </span>
                                                    <span style={{ fontSize: 13, lineHeight: 1.5 }}>{visit.procedure}</span>
                                                </div>
                                            )}
                                            {!visit.diagnosis && !visit.procedure && (
                                                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Ma\'lumot kiritilmagan</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Doctor;